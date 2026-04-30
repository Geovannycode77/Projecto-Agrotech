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
    AdminStatsSerializer
)
from login_cadastro.utils import get_client_ip

class AdminUserViewSet(viewsets.ModelViewSet):
    """ViewSet para admin gerenciar usuários"""
    queryset = CustomUser.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'username', 'first_name', 'last_name']
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
            elif status_filter == 'blocked':
                queryset = queryset.filter(is_blocked=True)
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
        
        user.is_blocked = True
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
        user.is_blocked = False
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
        
        if new_role not in ['administrador', 'produtor', 'veterinario', 'funcionario', 'gestor_financeiro']:
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
        blocked_users = CustomUser.objects.filter(is_blocked=True).count()
        verified_emails = CustomUser.objects.filter(email_confirmed=True).count()
        
        users_by_role = {}
        for role, _ in CustomUser.ROLE_CHOICES:
            users_by_role[role] = CustomUser.objects.filter(role=role).count()
        
        recent_users = CustomUser.objects.order_by('-date_joined')[:10].values(
            'id', 'email', 'username', 'role', 'is_approved', 'date_joined'
        )
        
        return Response({
            'total_users': total_users,
            'pending_users': pending_users,
            'approved_users': approved_users,
            'blocked_users': blocked_users,
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
            writer.writerow(['Email', 'Nome', 'Role', 'Aprovado', 'Email Confirmado', 'Bloqueado', 'Data Cadastro'])
            
            for user in users:
                writer.writerow([
                    user.email,
                    user.username,
                    user.get_role_display(),
                    'Sim' if user.is_approved else 'Não',
                    'Sim' if user.email_confirmed else 'Não',
                    'Sim' if user.is_blocked else 'Não',
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
            
            ws.append(['Email', 'Nome', 'Role', 'Aprovado', 'Email Confirmado', 'Bloqueado', 'Data Cadastro'])
            
            for user in users:
                ws.append([
                    user.email,
                    user.username,
                    user.get_role_display(),
                    'Sim' if user.is_approved else 'Não',
                    'Sim' if user.email_confirmed else 'Não',
                    'Sim' if user.is_blocked else 'Não',
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
    last_7_days = now - timedelta(days=7)
    
    # Estatísticas de usuários
    user_stats = {
        'total': CustomUser.objects.count(),
        'pending': CustomUser.objects.filter(is_approved=False, is_superuser=False).count(),
        'approved': CustomUser.objects.filter(is_approved=True).count(),
        'blocked': CustomUser.objects.filter(is_blocked=True).count(),
        'verified_email': CustomUser.objects.filter(email_confirmed=True).count(),
        'new_last_30_days': CustomUser.objects.filter(date_joined__gte=last_30_days).count(),
        'new_last_7_days': CustomUser.objects.filter(date_joined__gte=last_7_days).count(),
    }
    
    # Usuários por role
    users_by_role = {}
    for role, role_display in CustomUser.ROLE_CHOICES:
        users_by_role[role] = {
            'count': CustomUser.objects.filter(role=role).count(),
            'display': role_display
        }
    
    # Atividades recentes
    recent_activities = UserActivity.objects.select_related('user').order_by('-created_at')[:20]
    activities_data = []
    for activity in recent_activities:
        activities_data.append({
            'id': activity.id,
            'user_email': activity.user.email,
            'user_name': activity.user.username,
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
    
    # Estatísticas de atividades por tipo
    activities_by_type = {}
    for activity_type, _ in UserActivity.ACTIVITY_TYPES:
        count = UserActivity.objects.filter(
            activity_type=activity_type,
            created_at__gte=last_30_days
        ).count()
        activities_by_type[activity_type] = count
    
    return Response({
        'users': user_stats,
        'users_by_role': users_by_role,
        'recent_activities': activities_data,
        'recent_admin_logs': admin_logs_data,
        'activities_by_type': activities_by_type,
        'last_updated': now,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def create_notification(request):
    """Criar notificação para usuários"""
    target_users = request.data.get('target_users', 'all')  # 'all', 'role', 'specific'
    role = request.data.get('role')
    user_ids = request.data.get('user_ids', [])
    title = request.data.get('title')
    message = request.data.get('message')
    
    if not title or not message:
        return Response({'error': 'Título e mensagem são obrigatórios'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Aqui você pode implementar a criação de notificações
    # Seria necessário criar um modelo Notification
    
    AdminLog.objects.create(
        admin=request.user,
        action='settings_change',
        description=f'Notificação criada: {title}',
        ip_address=get_client_ip(request)
    )
    
    return Response({'message': 'Notificação criada com sucesso'})