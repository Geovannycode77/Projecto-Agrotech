# dashboard_admin/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.AdminUserViewSet, basename='admin-users')
router.register(r'logs', views.AdminLogViewSet, basename='admin-logs')
router.register(r'settings', views.SystemSettingsViewSet, basename='system-settings')
router.register(r'widgets', views.DashboardWidgetViewSet, basename='dashboard-widgets')

urlpatterns = [
    # Rotas do router
    path('', include(router.urls)),
    
    # Rotas customizadas
    path('stats/', views.get_dashboard_stats, name='admin-stats'),
    path('notifications/', views.create_notification, name='admin-notifications'),
    
    # Rotas específicas para usuários
    path('users/stats/', views.AdminUserViewSet.as_view({'get': 'stats'}), name='admin-user-stats'),
    path('users/export/', views.AdminUserViewSet.as_view({'get': 'export'}), name='admin-user-export'),
    
    # PERMISSÕES
    path('permissions/', views.get_permissions, name='admin-permissions'),
    path('roles-permissions/', views.get_roles_permissions, name='admin-roles-permissions'),
    path('roles-permissions/<str:role_name>/', views.update_role_permissions, name='admin-update-role-permissions'),
    
    # SEGURANÇA
    path('security/settings/', views.get_security_settings, name='security-settings'),
    path('security/settings/update/', views.update_security_settings, name='update-security-settings'),
    path('activity-log/', views.get_activity_log, name='activity-log'),
    path('change-password/', views.change_password, name='change-password'),
    
    # MONITORAMENTO
    path('system/status/', views.get_system_status, name='system-status'),
    path('system/metrics/', views.get_system_metrics, name='system-metrics'),
    path('health/', views.health_check, name='health-check'),
]