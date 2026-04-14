from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminUserViewSet, AdminLogViewSet, 
    SystemSettingsViewSet, DashboardWidgetViewSet,
    get_dashboard_stats, create_notification
)

router = DefaultRouter()
router.register(r'users', AdminUserViewSet)
router.register(r'logs', AdminLogViewSet)
router.register(r'settings', SystemSettingsViewSet)
router.register(r'widgets', DashboardWidgetViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', get_dashboard_stats, name='admin_stats'),
    path('notifications/', create_notification, name='create_notification'),
]
