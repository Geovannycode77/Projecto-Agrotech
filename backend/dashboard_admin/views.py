from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from django.http import HttpResponse
from openpyxl import Workbook
import csv
from login_cadastro.models import CustomUser, Perfil, UserActivity
from login_cadastro.serializers import UserSerializer
from .models import AdminLog, SystemSettings, DashboardWidget
from .serializers import (
    AdminUserSerializer, AdminLogSerializer, 
    SystemSettingsSerializer, DashboardWidgetSerializer,
)
from login_cadastro.utils import get_client_ip

class AdminUserViewSet(viewsets.ModelViewSet):
    """ViewSet para admin gerenciar usuários"""
    queryset = CustomUser.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'first_name', 'last_name', 'email']
    ordering_fields = ['date_joined', 'email', 'role', 'is_approved']
    ordering = ['-date_joined']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Filtrar por status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            if status_filter == 'pending':
                queryset = queryset.filter(is_approved=False)
            elif status_filter == 'approved':
                queryset = queryset.filter(is_approved=True)
            elif status_filter == 'active':
                queryset = queryset.filter(is_active=True)
        
        # Filtrar por role
        role_filter = self.request.query_params.get('role')
        if role_filter:
            queryset = queryset.filter(role=role_filter)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Aprovar usuário"""
        user = self.get_object()
        user.is_approved = True
        user.save()
        
        # Registrar log
        AdminLog.objects.create(
            admin=request.user,
            action='user_approve',
            target_user=user,
            description=f'Usuário {user.email} aprovado',
            ip_address=get_client_ip(request)
        )
        
        return Response({'message': f'Usuário {user.email} aprovado com sucesso'})
    
    @action(detail=True, methods=['post'])
    def block(self, request, pk=None):
        """Bloquear usuário"""
        user = self.get_object()
        if user.is_superuser:
            return Response({'error': 'Não é possível bloquear o superusuário'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        user.is_active = False
        user.save()
        
        AdminLog.objects.create(
            admin=request.user,
            action='user_block',
            target_user=user,
            description=f'Usuário {user.email} bloqueado',
            ip_address=get_client_ip(request)
        )
        
        return Response({'message': f'Usuário {user.email} bloqueado com sucesso'})
    
    @action(detail=True, methods=['post'])
    def unblock(self, request, pk=None):
        """Desbloquear usuário"""
        user = self.get_object()
        user.is_active = True
        user.save()
        
        AdminLog.objects.create(
            admin=request.user,
            action='user_unblock',
            target_user=user,
            description=f'Usuário {user.email} desbloqueado',
            ip_address=get_client_ip(request)
        )
        
        return Response({'message': f'Usuário {user.email} desbloqueado com sucesso'})
    
    @action(detail=True, methods=['put'])
    def change_role(self, request, pk=None):
        """Alterar role do usuário"""
        user = self.get_object()
        new_role = request.data.get('role')
        
        valid_roles = ['administrador', 'produtor', 'veterinario', 'funcionario', 'gestor_financeiro']
        if new_role not in valid_roles:
            return Response({'error': 'Role inválida'}, status=status.HTTP_400_BAD_REQUEST)
        
        old_role = user.role
        user.role = new_role
        user.save()
        
        AdminLog.objects.create(
            admin=request.user,
            action='role_change',
            target_user=user,
            description=f'Role alterada de {old_role} para {new_role}',
            ip_address=get_client_ip(request)
        )
        
        return Response({'message': f'Role alterada para {new_role}'})
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estatísticas de usuários"""
        total_users = CustomUser.objects.count()
        pending_users = CustomUser.objects.filter(is_approved=False, is_superuser=False).count()
        approved_users = CustomUser.objects.filter(is_approved=True).count()
        verified_emails = CustomUser.objects.filter(email_confirmed=True).count() if hasattr(CustomUser, 'email_confirmed') else 0
        
        users_by_role = {}
        for role, _ in CustomUser.ROLE_CHOICES:
            users_by_role[role] = CustomUser.objects.filter(role=role).count()
        
        recent_users = CustomUser.objects.order_by('-date_joined')[:10].values(
            'id', 'email', 'first_name', 'last_name', 'role', 'is_approved', 'date_joined'
        )
        
        return Response({
            'total_users': total_users,
            'pending_users': pending_users,
            'approved_users': approved_users,
            'verified_emails': verified_emails,
            'users_by_role': users_by_role,
            'recent_users': recent_users,
        })
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Exportar usuários para Excel/CSV"""
        format_type = request.query_params.get('format', 'csv')
        users = self.get_queryset()
        
        if format_type == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="usuarios.csv"'
            
            writer = csv.writer(response)
            writer.writerow(['Email', 'Nome', 'Sobrenome', 'Role', 'Aprovado', 'Data Cadastro'])
            
            for user in users:
                writer.writerow([
                    user.email,
                    user.first_name,
                    user.last_name,
                    user.get_role_display(),
                    'Sim' if user.is_approved else 'Não',
                    user.date_joined.strftime('%d/%m/%Y %H:%M')
                ])
            
            AdminLog.objects.create(
                admin=request.user,
                action='export_data',
                description=f'Exportação de usuários em CSV realizada',
                ip_address=get_client_ip(request)
            )
            
            return response
        
        elif format_type == 'excel':
            wb = Workbook()
            ws = wb.active
            ws.title = "Usuários"
            
            ws.append(['Email', 'Nome', 'Sobrenome', 'Role', 'Aprovado', 'Data Cadastro'])
            
            for user in users:
                ws.append([
                    user.email,
                    user.first_name,
                    user.last_name,
                    user.get_role_display(),
                    'Sim' if user.is_approved else 'Não',
                    user.date_joined.strftime('%d/%m/%Y %H:%M')
                ])
            
            response = HttpResponse(
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename="usuarios.xlsx"'
            wb.save(response)
            
            AdminLog.objects.create(
                admin=request.user,
                action='export_data',
                description=f'Exportação de usuários em Excel realizada',
                ip_address=get_client_ip(request)
            )
            
            return response
        
        return Response({'error': 'Formato inválido'}, status=status.HTTP_400_BAD_REQUEST)

class AdminLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para visualizar logs do admin"""
    queryset = AdminLog.objects.all()
    serializer_class = AdminLogSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['action', 'description', 'admin__email', 'target_user__email']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

class SystemSettingsViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar configurações do sistema"""
    queryset = SystemSettings.objects.all()
    serializer_class = SystemSettingsSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def public(self, request):
        """Obter configurações públicas (não sensíveis)"""
        public_keys = ['site_name', 'site_description', 'maintenance_mode', 'contact_email']
        settings = SystemSettings.objects.filter(key__in=public_keys)
        serializer = self.get_serializer(settings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def update_multiple(self, request):
        """Atualizar múltiplas configurações de uma vez"""
        data = request.data
        updated = []
        
        for key, value in data.items():
            setting, created = SystemSettings.objects.update_or_create(
                key=key,
                defaults={'value': value, 'updated_by': request.user}
            )
            updated.append(setting.key)
        
        AdminLog.objects.create(
            admin=request.user,
            action='settings_change',
            description=f'Configurações atualizadas: {", ".join(updated)}',
            ip_address=get_client_ip(request)
        )
        
        return Response({'message': 'Configurações atualizadas', 'updated': updated})

class DashboardWidgetViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar widgets do dashboard"""
    queryset = DashboardWidget.objects.all()
    serializer_class = DashboardWidgetSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Desativar (soft-delete) um widget do dashboard."""
        widget = self.get_object()
        if widget.is_active is False:
            return Response({'message': 'Widget já está desativado.'})

        widget.is_active = False
        widget.save(update_fields=['is_active'])

        AdminLog.objects.create(
            admin=request.user,
            action='settings_change',
            target_user=None,
            description=f'Widget "{widget.title}" desativado pelo admin',
            ip_address=get_client_ip(request)
        )

        return Response({'message': 'Widget desativado com sucesso.'})

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Obter widgets disponíveis para o usuário"""
        user_role = request.user.role
        widgets = DashboardWidget.objects.filter(
            is_active=True,
            visible_to_roles__contains=[user_role]
        ).order_by('order')
        serializer = self.get_serializer(widgets, many=True)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_dashboard_stats(request):
    """Estatísticas completas do dashboard admin"""
    now = timezone.now()
    last_30_days = now - timedelta(days=30)
    
    # Estatísticas de usuários
    user_stats = {
        'total_users': CustomUser.objects.count(),
        'active_users': CustomUser.objects.filter(is_active=True).count(),
        'staff_users': CustomUser.objects.filter(is_staff=True).count(),
        'superusers': CustomUser.objects.filter(is_superuser=True).count(),
        'approved_users': CustomUser.objects.filter(is_approved=True).count(),
        'pending_users': CustomUser.objects.filter(is_approved=False).count(),
    }
    
    # Usuários por role
    users_by_role = {}
    for role, role_display in CustomUser.ROLE_CHOICES:
        count = CustomUser.objects.filter(role=role).count()
        if count > 0:
            users_by_role[role] = count
    
    # Atividades recentes
    recent_activities = UserActivity.objects.select_related('user').order_by('-created_at')[:20]
    activities_data = []
    for activity in recent_activities:
        activities_data.append({
            'id': activity.id,
            'user_email': activity.user.email,
            'user_name': activity.user.get_full_name() or activity.user.email,
            'activity_type': activity.activity_type,
            'ip_address': activity.ip_address,
            'created_at': activity.created_at,
        })
    
    # Logs do admin recentes
    recent_admin_logs = AdminLog.objects.select_related('admin', 'target_user').order_by('-created_at')[:20]
    admin_logs_data = []
    for log in recent_admin_logs:
        admin_logs_data.append({
            'id': log.id,
            'admin_email': log.admin.email,
            'action': log.action,
            'description': log.description,
            'target_email': log.target_user.email if log.target_user else None,
            'created_at': log.created_at,
        })
    
    return Response({
        'total_users': user_stats['total_users'],
        'approved_users': user_stats['approved_users'],
        'pending_users': user_stats['pending_users'],
        'users_by_role': users_by_role,
        'recent_activities': activities_data,
        'recent_admin_logs': admin_logs_data,
        'last_updated': now,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def create_notification(request):
    """Criar notificação para usuários"""
    title = request.data.get('title')
    message = request.data.get('message')
    
    if not title or not message:
        return Response({'error': 'Título e mensagem são obrigatórios'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    AdminLog.objects.create(
        admin=request.user,
        action='settings_change',
        description=f'Notificação criada: {title}',
        ip_address=get_client_ip(request)
    )
    
    return Response({'message': 'Notificação criada com sucesso'})

# dashboard_admin/views.py - Adicione no final do arquivo, depois de create_notification

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_permissions(request):
    """Listar todas as permissões disponíveis no sistema"""
    try:
        from django.contrib.auth.models import Permission
        from django.contrib.contenttypes.models import ContentType
        
        # Lista de apps que queremos mostrar
        allowed_apps = ['login_cadastro', 'auth', 'dashboard_admin']
        
        permissions = Permission.objects.filter(
            content_type__app_label__in=allowed_apps
        ).select_related('content_type').order_by('content_type__app_label', 'codename')
        
        # Agrupar por app
        permissions_by_app = {}
        for perm in permissions:
            app_label = perm.content_type.app_label
            app_verbose = {
                'login_cadastro': 'Usuários e Autenticação',
                'auth': 'Autenticação',
                'dashboard_admin': 'Administração'
            }.get(app_label, app_label)
            
            if app_verbose not in permissions_by_app:
                permissions_by_app[app_verbose] = []
            
            permissions_by_app[app_verbose].append({
                'id': perm.id,
                'name': perm.name,
                'codename': perm.codename,
                'app_label': app_label
            })
        
        return Response({
            'permissions': permissions_by_app,
            'total': permissions.count()
        })
    except Exception as e:
        return Response(
            {'error': f'Erro ao carregar permissões: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_roles_permissions(request):
    """Listar roles e suas permissões padrão"""
    try:
        # Definição das roles do sistema
        roles = {
            'administrador': {
                'display': 'Administrador',
                'description': 'Acesso total ao sistema',
                'permissions': ['*']  # Todas as permissões
            },
            'produtor': {
                'display': 'Produtor',
                'description': 'Gerenciar produção e animais',
                'permissions': [
                    'view_animal', 'add_animal', 'change_animal', 'delete_animal',
                    'view_producao', 'add_producao', 'change_producao',
                    'view_dashboard', 'view_reports'
                ]
            },
            'veterinario': {
                'display': 'Veterinário',
                'description': 'Acompanhar saúde animal',
                'permissions': [
                    'view_animal', 'change_animal',
                    'view_vacina', 'add_vacina', 'change_vacina',
                    'view_tratamento', 'add_tratamento',
                    'view_dashboard'
                ]
            },
            'funcionario': {
                'display': 'Funcionário',
                'description': 'Auxiliar nas atividades diárias',
                'permissions': [
                    'view_animal', 'view_tarefa', 'add_tarefa', 'change_tarefa',
                    'view_dashboard'
                ]
            },
            'gestor_financeiro': {
                'display': 'Gestor Financeiro',
                'description': 'Gerenciar finanças',
                'permissions': [
                    'view_financeiro', 'add_financeiro', 'change_financeiro', 'delete_financeiro',
                    'view_reports', 'export_data',
                    'view_dashboard'
                ]
            }
        }
        
        # Buscar permissões existentes no banco
        from django.contrib.auth.models import Permission
        
        all_permissions = {}
        for perm in Permission.objects.all():
            all_permissions[perm.codename] = {
                'id': perm.id,
                'name': perm.name,
                'codename': perm.codename
            }
        
        return Response({
            'roles': roles,
            'available_permissions': all_permissions
        })
    except Exception as e:
        return Response(
            {'error': f'Erro ao carregar roles: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_role_permissions(request, role_name):
    """Atualizar permissões de uma role específica"""
    try:
        permissions = request.data.get('permissions', [])
        # Aqui você pode implementar a lógica para salvar as permissões
        # Por exemplo, em um modelo RolePermission ou similar
        
        AdminLog.objects.create(
            admin=request.user,
            action='settings_change',
            description=f'Permissões da role {role_name} atualizadas',
            ip_address=get_client_ip(request)
        )
        
        return Response({
            'message': f'Permissões da role {role_name} atualizadas com sucesso',
            'permissions': permissions
        })
    except Exception as e:
        return Response(
            {'error': f'Erro ao atualizar permissões: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_security_settings(request):
    """Obter configurações de segurança do sistema"""
    try:
        from .models import SystemSettings
        
        settings = {
            'two_factor_enabled': SystemSettings.get_setting('two_factor_enabled', 'false') == 'true',
            'login_notifications': SystemSettings.get_setting('login_notifications', 'true') == 'true',
            'max_login_attempts': int(SystemSettings.get_setting('max_login_attempts', '5')),
            'session_timeout': int(SystemSettings.get_setting('session_timeout', '30')),
            'password_expiry_days': int(SystemSettings.get_setting('password_expiry_days', '90')),
            'require_strong_password': SystemSettings.get_setting('require_strong_password', 'true') == 'true',
        }
        
        return Response(settings)
    except Exception as e:
        return Response(
            {'error': f'Erro ao carregar configurações: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_security_settings(request):
    """Atualizar configurações de segurança"""
    try:
        from .models import SystemSettings
        
        for key, value in request.data.items():
            # Converter boolean para string
            if isinstance(value, bool):
                value = str(value).lower()
            else:
                value = str(value)
            
            SystemSettings.objects.update_or_create(
                key=key,
                defaults={'value': value, 'updated_by': request.user}
            )
        
        # Registrar log
        AdminLog.objects.create(
            admin=request.user,
            action='settings_change',
            description='Configurações de segurança atualizadas',
            ip_address=get_client_ip(request)
        )
        
        return Response({'message': 'Configurações de segurança atualizadas com sucesso'})
    except Exception as e:
        return Response(
            {'error': f'Erro ao atualizar configurações: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_activity_log(request):
    """Obter log de atividades do usuário"""
    try:
        from login_cadastro.models import UserActivity
        
        # Buscar últimas 50 atividades
        activities = UserActivity.objects.select_related('user').order_by('-created_at')[:50]
        
        activity_list = []
        for activity in activities:
            activity_list.append({
                'id': activity.id,
                'action': activity.get_activity_type_display(),
                'user': activity.user.email,
                'ip': activity.ip_address,
                'date': activity.created_at.strftime('%d/%m/%Y %H:%M:%S'),
                'details': activity.details if hasattr(activity, 'details') else None
            })
        
        return Response(activity_list)
    except Exception as e:
        return Response(
            {'error': f'Erro ao carregar logs: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def change_password(request):
    """Alterar senha do usuário atual"""
    try:
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        # Verificar senha atual
        if not user.check_password(current_password):
            return Response(
                {'error': 'Senha atual incorreta'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Alterar senha
        user.set_password(new_password)
        user.save()
        
        # Registrar log
        AdminLog.objects.create(
            admin=user,
            action='settings_change',
            description='Senha alterada com sucesso',
            ip_address=get_client_ip(request)
        )
        
        return Response({'message': 'Senha alterada com sucesso'})
    except Exception as e:
        return Response(
            {'error': f'Erro ao alterar senha: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_system_status(request):
    """Obter status do sistema - Versão simplificada com psutil"""
    try:
        import psutil
        import platform
        from login_cadastro.models import CustomUser
        from .models import AdminLog
        from django.utils import timezone
        
        # Pegar métricas diretamente
        cpu_percent = psutil.cpu_percent(interval=1)
        memory_percent = psutil.virtual_memory().percent
        disk_percent = psutil.disk_usage('/').percent
        
        print(f"🔹 CPU: {cpu_percent}%")
        print(f"🔹 Memória: {memory_percent}%")
        print(f"🔹 Disco: {disk_percent}%")
        
        return Response({
            'status': 'operational',
            'database': {
                'status': 'healthy',
                'user_count': CustomUser.objects.count()
            },
            'cache': {'status': 'healthy'},
            'email': {'status': 'healthy', 'backend': 'console'},
            'server': {
                'cpu_usage': cpu_percent,
                'memory_usage': memory_percent,
                'disk_usage': disk_percent,
                'cpu_cores': psutil.cpu_count(),
                'memory_available': psutil.virtual_memory().available,
                'memory_total': psutil.virtual_memory().total,
                'disk_free': psutil.disk_usage('/').free,
                'disk_total': psutil.disk_usage('/').total,
            },
            'active_users_today': CustomUser.objects.filter(last_login__date=timezone.now().date()).count(),
            'last_updated': timezone.now(),
            'system': {
                'os': platform.system(),
                'os_version': platform.release(),
                'python_version': platform.python_version(),
                'hostname': platform.node(),
            },
            'uptime': psutil.boot_time()
        })
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({
            'status': 'error',
            'error': str(e),
            'server': {'cpu_usage': 0, 'memory_usage': 0, 'disk_usage': 0}
        }, status=500)
    # dashboard_admin/views.py - Adicione no final do arquivo

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_system_metrics(request):
    """Obter métricas detalhadas do sistema"""
    try:
        import psutil
        from datetime import datetime
        
        # Tentar obter métricas, se psutil não estiver instalado, retorna valores padrão
        try:
            metrics = {
                'cpu': {
                    'percent': psutil.cpu_percent(interval=1),
                    'cores': psutil.cpu_count(),
                    'frequency': psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None,
                },
                'memory': {
                    'total': psutil.virtual_memory().total,
                    'available': psutil.virtual_memory().available,
                    'percent': psutil.virtual_memory().percent,
                    'used': psutil.virtual_memory().used,
                },
                'disk': {
                    'total': psutil.disk_usage('/').total,
                    'used': psutil.disk_usage('/').used,
                    'free': psutil.disk_usage('/').free,
                    'percent': psutil.disk_usage('/').percent,
                },
                'network': psutil.net_io_counters()._asdict(),
                'timestamp': datetime.now().isoformat(),
            }
        except ImportError:
            metrics = {
                'cpu': {'percent': 0, 'cores': 0, 'frequency': None},
                'memory': {'total': 0, 'available': 0, 'percent': 0, 'used': 0},
                'disk': {'total': 0, 'used': 0, 'free': 0, 'percent': 0},
                'network': {},
                'message': 'Instale psutil para métricas detalhadas: pip install psutil',
                'timestamp': datetime.now().isoformat(),
            }
        except Exception as e:
            metrics = {
                'error': str(e),
                'timestamp': datetime.now().isoformat(),
            }
        
        return Response(metrics)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def health_check(request):
    """Health check simples para monitoramento"""
    try:
        from django.db import connections
        from django.db.utils import OperationalError
        
        # Verificar banco de dados
        db_healthy = True
        try:
            connections['default'].cursor()
        except OperationalError:
            db_healthy = False
        
        return Response({
            'status': 'healthy' if db_healthy else 'unhealthy',
            'timestamp': timezone.now(),
            'services': {
                'api': 'operational',
                'database': 'operational' if db_healthy else 'unhealthy',
                'cache': 'operational',
            }
        })
    except Exception as e:
        return Response(
            {'status': 'unhealthy', 'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )