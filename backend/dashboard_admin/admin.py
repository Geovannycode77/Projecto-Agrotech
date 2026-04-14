from django.contrib import admin
from .models import AdminLog, SystemSettings, DashboardWidget

@admin.register(AdminLog)
class AdminLogAdmin(admin.ModelAdmin):
    list_display = ['admin', 'action', 'target_user', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['admin__email', 'target_user__email', 'description']
    readonly_fields = ['created_at']

@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = ['key', 'value', 'updated_at']
    search_fields = ['key', 'description']

@admin.register(DashboardWidget)
class DashboardWidgetAdmin(admin.ModelAdmin):
    list_display = ['title', 'widget_type', 'order', 'is_active']
    list_filter = ['widget_type', 'is_active']
    search_fields = ['title']
