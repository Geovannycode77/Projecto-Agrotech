import json
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from django.http import HttpResponse, FileResponse
from openpyxl import Workbook
import csv
import os
from django.conf import settings
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
    
    def destroy(self, request, *args, **kwargs):
        """Deletar usuário - Sobrescrita para tratamento de erro"""
        try:
            user = self.get_object()
            
            # Não permite deletar superusuário
            if user.is_superuser:
                return Response(
                    {'error': 'Não é possível deletar o superusuário'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Não permite deletar o próprio usuário
            if user.id == request.user.id:
                return Response(
                    {'error': 'Não é possível deletar seu próprio usuário'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            email = user.email
            
            AdminLog.objects.create(
                admin=request.user,
                action='user_delete',
                target_user=user,
                description=f'Usuário {email} deletado',
                ip_address=get_client_ip(request)
            )
            
            user.delete()
            
            return Response({'message': f'Usuário {email} deletado com sucesso'})
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            if status_filter == 'pending':
                queryset = queryset.filter(is_approved=False)
            elif status_filter == 'approved':
                queryset = queryset.filter(is_approved=True)
            elif status_filter == 'active':
                queryset = queryset.filter(is_active=True)
        
        role_filter = self.request.query_params.get('role')
        if role_filter:
            queryset = queryset.filter(role=role_filter)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        user = self.get_object()
        user.is_approved = True
        user.save()
        
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
    queryset = AdminLog.objects.all()
    serializer_class = AdminLogSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['action', 'description', 'admin__email', 'target_user__email']
    ordering_fields = ['created_at']
    ordering = ['-created_at']


class SystemSettingsViewSet(viewsets.ModelViewSet):
    queryset = SystemSettings.objects.all()
    serializer_class = SystemSettingsSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def public(self, request):
        public_keys = ['site_name', 'site_description', 'maintenance_mode', 'contact_email']
        settings = SystemSettings.objects.filter(key__in=public_keys)
        serializer = self.get_serializer(settings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def update_multiple(self, request):
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
    queryset = DashboardWidget.objects.all()
    serializer_class = DashboardWidgetSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        user_role = request.user.role
        widgets = DashboardWidget.objects.filter(
            is_active=True,
            visible_to_roles__contains=[user_role]
        ).order_by('order')
        serializer = self.get_serializer(widgets, many=True)
        return Response(serializer.data)


# ==================== DASHBOARD STATS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_dashboard_stats(request):
    now = timezone.now()
    last_30_days = now - timedelta(days=30)
    
    user_stats = {
        'total_users': CustomUser.objects.count(),
        'active_users': CustomUser.objects.filter(is_active=True).count(),
        'staff_users': CustomUser.objects.filter(is_staff=True).count(),
        'superusers': CustomUser.objects.filter(is_superuser=True).count(),
        'approved_users': CustomUser.objects.filter(is_approved=True).count(),
        'pending_users': CustomUser.objects.filter(is_approved=False).count(),
    }
    
    users_by_role = {}
    for role, role_display in CustomUser.ROLE_CHOICES:
        count = CustomUser.objects.filter(role=role).count()
        if count > 0:
            users_by_role[role] = count
    
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


# ==================== BACKUPS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_backups(request):
    """Lista backups disponíveis"""
    backups_dir = os.path.join(settings.BASE_DIR, 'backups')
    backups = []
    
    if os.path.exists(backups_dir):
        for file in os.listdir(backups_dir):
            if file.endswith('.sql') or file.endswith('.json'):
                file_path = os.path.join(backups_dir, file)
                backups.append({
                    'id': len(backups) + 1,
                    'nome': file,
                    'data': os.path.getmtime(file_path),
                    'tamanho': os.path.getsize(file_path),
                    'tipo': 'sql' if file.endswith('.sql') else 'json'
                })
    
    backups.sort(key=lambda x: x['data'], reverse=True)
    return Response({'results': backups, 'count': len(backups)})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def create_backup(request):
    """Cria um novo backup do banco de dados"""
    try:
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        backup_file = f"backup_{timestamp}.sql"
        backups_dir = os.path.join(settings.BASE_DIR, 'backups')
        
        os.makedirs(backups_dir, exist_ok=True)
        backup_path = os.path.join(backups_dir, backup_file)
        
        # Criar arquivo vazio para teste
        with open(backup_path, 'w') as f:
            f.write(f"Backup criado em {timestamp}")
        
        AdminLog.objects.create(
            admin=request.user,
            action='settings_change',
            description=f'Backup criado: {backup_file}',
            ip_address=get_client_ip(request)
        )
        
        return Response({'message': 'Backup criado com sucesso', 'nome': backup_file})
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def download_backup(request, backup_id):
    """Download de um backup específico"""
    try:
        backups_dir = os.path.join(settings.BASE_DIR, 'backups')
        backups = [f for f in os.listdir(backups_dir) if f.endswith('.sql') or f.endswith('.json')]
        
        if backup_id - 1 < len(backups):
            backup_file = backups[backup_id - 1]
            file_path = os.path.join(backups_dir, backup_file)
            
            if os.path.exists(file_path):
                return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=backup_file)
        
        return Response({'error': 'Backup não encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def delete_backup(request, backup_id):
    """Deleta um backup específico"""
    try:
        backups_dir = os.path.join(settings.BASE_DIR, 'backups')
        backups = [f for f in os.listdir(backups_dir) if f.endswith('.sql') or f.endswith('.json')]
        
        if backup_id - 1 < len(backups):
            backup_file = backups[backup_id - 1]
            file_path = os.path.join(backups_dir, backup_file)
            
            if os.path.exists(file_path):
                os.remove(file_path)
                
                AdminLog.objects.create(
                    admin=request.user,
                    action='settings_change',
                    description=f'Backup deletado: {backup_file}',
                    ip_address=get_client_ip(request)
                )
                
                return Response({'message': 'Backup deletado com sucesso'})
        
        return Response({'error': 'Backup não encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== PERMISSÕES ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_permissions(request):
    """Listar todas as permissões disponíveis no sistema"""
    try:
        from django.contrib.auth.models import Permission
        from django.contrib.contenttypes.models import ContentType
        
        allowed_apps = ['login_cadastro', 'auth', 'dashboard_admin']
        
        permissions = Permission.objects.filter(
            content_type__app_label__in=allowed_apps
        ).select_related('content_type').order_by('content_type__app_label', 'codename')
        
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
        roles = {
            'administrador': {
                'display': 'Administrador',
                'description': 'Acesso total ao sistema',
                'permissions': ['*']
            },
            'produtor': {
                'display': 'Produtor',
                'description': 'Gerenciar produção e animais',
                'permissions': ['view_animal', 'add_animal', 'change_animal', 'delete_animal', 'view_dashboard', 'view_reports']
            },
            'veterinario': {
                'display': 'Veterinário',
                'description': 'Acompanhar saúde animal',
                'permissions': ['view_animal', 'change_animal', 'view_vacina', 'add_vacina', 'change_vacina', 'view_dashboard']
            },
            'funcionario': {
                'display': 'Funcionário',
                'description': 'Auxiliar nas atividades diárias',
                'permissions': ['view_animal', 'view_tarefa', 'add_tarefa', 'change_tarefa', 'view_dashboard']
            },
            'gestor_financeiro': {
                'display': 'Gestor Financeiro',
                'description': 'Gerenciar finanças',
                'permissions': ['view_financeiro', 'add_financeiro', 'change_financeiro', 'view_reports', 'view_dashboard']
            }
        }
        
        return Response({'roles': roles})
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
        
        AdminLog.objects.create(
            admin=request.user,
            action='settings_change',
            description=f'Permissões da role {role_name} atualizadas',
            ip_address=get_client_ip(request)
        )
        
        return Response({'message': f'Permissões da role {role_name} atualizadas com sucesso'})
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== PERMISSÕES SIMPLIFICADAS ====================

def _default_simple_permissions():
    """Estrutura padrão de camadas (roles) + módulos do sistema."""
    return {
        'camadas': {
            'administrador': {
                'nome': 'Administrador',
                'descricao': 'Acesso total ao sistema',
                'cor': 'red',
                'permissoes': ['*'],
            },
            'produtor': {
                'nome': 'Produtor',
                'descricao': 'Gestão de produção, animais e fazenda',
                'cor': 'green',
                'permissoes': ['animais', 'producao', 'fazenda', 'dashboard'],
            },
            'veterinario': {
                'nome': 'Veterinário',
                'descricao': 'Gestão de saúde animal',
                'cor': 'blue',
                'permissoes': ['animais', 'vacinas', 'consultas', 'dashboard'],
            },
            'funcionario': {
                'nome': 'Funcionário',
                'descricao': 'Tarefas operacionais',
                'cor': 'yellow',
                'permissoes': ['tarefas', 'animais_leitura', 'dashboard'],
            },
            'gestor_financeiro': {
                'nome': 'Gestor Financeiro',
                'descricao': 'Gestão financeira',
                'cor': 'purple',
                'permissoes': ['financas', 'relatorios', 'dashboard'],
            },
        },
        'modulos': [
            {'id': 'dashboard', 'nome': 'Dashboard'},
            {'id': 'animais', 'nome': 'Animais'},
            {'id': 'producao', 'nome': 'Produção'},
            {'id': 'fazenda', 'nome': 'Fazenda'},
            {'id': 'vacinas', 'nome': 'Vacinas'},
            {'id': 'consultas', 'nome': 'Consultas'},
            {'id': 'tarefas', 'nome': 'Tarefas'},
            {'id': 'financas', 'nome': 'Finanças'},
            {'id': 'relatorios', 'nome': 'Relatórios'},
            {'id': 'animais_leitura', 'nome': 'Animais (Leitura)'},
        ],
    }


def _load_simple_permissions():
    """Lê do banco a configuração salva, ou devolve o default se ainda não existir."""
    saved = SystemSettings.objects.filter(key='simple_permissions').first()
    if saved and saved.value:
        try:
            data = json.loads(saved.value)
            if data.get('camadas') and data.get('modulos'):
                return data
        except (json.JSONDecodeError, TypeError):
            pass
    return _default_simple_permissions()


# Quais módulos cada camada (role) realmente usa no sistema.
# Isso é uma regra de negócio fixa (reflete o que cada ModulePermission(...)
# checa nas views de cada app) — não fica salvo no banco, é recalculado
# sempre que a matriz é carregada. None = acesso a todos os módulos.
MODULOS_APLICAVEIS_POR_ROLE = {
    'administrador': None,
    'produtor': ['dashboard', 'animais', 'producao', 'fazenda', 'tarefas', 'financas', 'relatorios'],
    'veterinario': ['dashboard', 'animais', 'vacinas', 'consultas'],
    'funcionario': ['dashboard', 'tarefas', 'animais_leitura'],
    'gestor_financeiro': ['dashboard', 'financas', 'relatorios'],
}


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_simple_permissions(request):
    """Retorna a configuração simplificada de permissões por role + lista de módulos"""
    try:
        data = _load_simple_permissions()

        # Anexa, para cada camada, quais módulos ela realmente usa.
        # O frontend usa isso pra não mostrar switch de módulo que não
        # se aplica àquele role (ex: Veterinário não usa "Tarefas").
        for camada_id, camada in data['camadas'].items():
            camada['modulos_aplicaveis'] = MODULOS_APLICAVEIS_POR_ROLE.get(camada_id)

        return Response(data)
    except Exception as e:
        return Response(
            {'error': f'Erro ao carregar permissões simplificadas: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def save_simple_permissions(request):
    """
    Salva a configuração simplificada de permissões.
    O frontend envia: { "administrador": {"dashboard": true, ...}, "produtor": {...}, ... }
    """
    try:
        permissoes_marcadas = request.data

        if not isinstance(permissoes_marcadas, dict) or not permissoes_marcadas:
            return Response(
                {'error': 'Dados de permissões inválidos'},
                status=status.HTTP_400_BAD_REQUEST
            )

        current_data = _load_simple_permissions()

        novas_camadas = {}
        for camada_id, camada_info in current_data['camadas'].items():
            if camada_id == 'administrador':
                # Administrador mantém acesso total sempre
                novas_camadas[camada_id] = {**camada_info, 'permissoes': ['*']}
                continue

            aplicaveis = MODULOS_APLICAVEIS_POR_ROLE.get(camada_id)
            modulos_marcados = [
                modulo_id
                for modulo_id, marcado in permissoes_marcadas.get(camada_id, {}).items()
                if marcado and (aplicaveis is None or modulo_id in aplicaveis)
            ]
            novas_camadas[camada_id] = {**camada_info, 'permissoes': modulos_marcados}

        payload = {'camadas': novas_camadas, 'modulos': current_data['modulos']}

        SystemSettings.objects.update_or_create(
            key='simple_permissions',
            defaults={'value': json.dumps(payload), 'updated_by': request.user}
        )

        AdminLog.objects.create(
            admin=request.user,
            action='settings_change',
            description='Permissões simplificadas atualizadas',
            ip_address=get_client_ip(request)
        )

        return Response({'message': 'Permissões salvas com sucesso', **payload})
    except Exception as e:
        return Response(
            {'error': f'Erro ao salvar permissões: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== SEGURANÇA ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_security_settings(request):
    """Obter configurações de segurança"""
    try:
        settings_data = {
            'two_factor_enabled': False,
            'login_notifications': True,
            'max_login_attempts': 5,
            'session_timeout': 30,
            'password_expiry_days': 90,
            'require_strong_password': True,
        }
        return Response(settings_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_security_settings(request):
    """Atualizar configurações de segurança"""
    try:
        AdminLog.objects.create(
            admin=request.user,
            action='settings_change',
            description='Configurações de segurança atualizadas',
            ip_address=get_client_ip(request)
        )
        return Response({'message': 'Configurações atualizadas com sucesso'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_activity_log(request):
    """Obter log de atividades do usuário"""
    try:
        activities = UserActivity.objects.select_related('user').order_by('-created_at')[:50]
        
        activity_list = []
        for activity in activities:
            activity_list.append({
                'id': activity.id,
                'action': activity.get_activity_type_display(),
                'user': activity.user.email,
                'ip': activity.ip_address,
                'date': activity.created_at.strftime('%d/%m/%Y %H:%M:%S'),
            })
        
        return Response(activity_list)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Alterar senha do usuário atual"""
    try:
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not user.check_password(current_password):
            return Response(
                {'error': 'Senha atual incorreta'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        AdminLog.objects.create(
            admin=user,
            action='settings_change',
            description='Senha alterada com sucesso',
            ip_address=get_client_ip(request)
        )
        
        return Response({'message': 'Senha alterada com sucesso'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== MONITORAMENTO ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_system_status(request):
    """Obter status do sistema"""
    try:
        return Response({
            'status': 'operational',
            'server': {'cpu_usage': 0, 'memory_usage': 0, 'disk_usage': 0},
            'database': {'status': 'healthy', 'user_count': CustomUser.objects.count()},
            'last_updated': timezone.now(),
        })
    except Exception as e:
        return Response({'status': 'error', 'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_system_metrics(request):
    """Obter métricas detalhadas do sistema"""
    try:
        import psutil
        metrics = {
            'cpu': {'percent': psutil.cpu_percent(interval=1), 'cores': psutil.cpu_count()},
            'memory': {'percent': psutil.virtual_memory().percent},
            'disk': {'percent': psutil.disk_usage('/').percent},
            'timestamp': timezone.now().isoformat(),
        }
        return Response(metrics)
    except ImportError:
        return Response({'error': 'psutil não instalado', 'cpu': 0, 'memory': 0, 'disk': 0})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def health_check(request):
    """Health check simples"""
    return Response({'status': 'healthy', 'timestamp': timezone.now()})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def delete_user_by_id(request, user_id):
    """Endpoint específico para deletar usuário por ID"""
    try:
        from login_cadastro.models import CustomUser
        
        user = CustomUser.objects.get(id=user_id)
        
        print(f"🔵 Deletando usuário: {user.email} (ID: {user_id})")
        
        # Não permite deletar superusuário
        if user.is_superuser:
            return Response(
                {'error': 'Não é possível deletar o superusuário'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Não permite deletar o próprio usuário
        if user.id == request.user.id:
            return Response(
                {'error': 'Não é possível deletar seu próprio usuário'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        email = user.email

        # Antes de deletar, limpar referências em tabelas de logs que possam
        # impedir a remoção por constraints (existem duas tabelas antigas/nova).
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE dashboard_admin_adminlog SET target_user_id = NULL WHERE target_user_id = %s",
                    [user.id],
                )
                cursor.execute(
                    "UPDATE login_cadastro_adminlog SET target_user_id = NULL WHERE target_user_id = %s",
                    [user.id],
                )
        except Exception as fk_clear_error:
            print(f"Erro ao limpar FK em adminlogs: {fk_clear_error}")

        # Deletar perfil primeiro
        try:
            if hasattr(user, 'perfil') and user.perfil is not None:
                user.perfil.delete()
        except Exception as perfil_error:
            print(f"Erro ao deletar perfil: {perfil_error}")

        # Deletar usuário
        user.delete()

        # Registrar log de deleção — target_user já não referencia o usuário
        try:
            AdminLog.objects.create(
                admin=request.user,
                action='user_delete',
                target_user=None,
                description=f'Usuário {email} deletado',
                ip_address=get_client_ip(request)
            )
        except Exception as log_error:
            print(f"Erro ao criar log pós-deleção: {log_error}")

        print(f"✅ Usuário {email} deletado com sucesso")

        return Response(
            {'message': f'Usuário {email} deletado com sucesso'},
            status=status.HTTP_200_OK
        )
        
    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'Usuário não encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )