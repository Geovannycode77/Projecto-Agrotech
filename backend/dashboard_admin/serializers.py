from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import AdminLog, SystemSettings, DashboardWidget

User = get_user_model()

class AdminUserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        # REMOVI 'is_blocked' da lista de fields
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'role', 'role_display',
            'is_approved', 'is_active', 'email_confirmed', 'date_joined',
            'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']

class AdminLogSerializer(serializers.ModelSerializer):
    admin_email = serializers.CharField(source='admin.email', read_only=True)
    target_email = serializers.CharField(source='target_user.email', read_only=True)
    
    class Meta:
        model = AdminLog
        fields = [
            'id', 'admin_email', 'action', 'description', 'target_email',
            'ip_address', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class SystemSettingsSerializer(serializers.ModelSerializer):
    updated_by_email = serializers.CharField(source='updated_by.email', read_only=True)
    
    class Meta:
        model = SystemSettings
        fields = ['id', 'key', 'value', 'description', 'updated_by_email', 'updated_at']
        read_only_fields = ['id', 'updated_at']

class DashboardWidgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardWidget
        fields = ['id', 'name', 'widget_type', 'config', 'order', 'is_active', 'visible_to_roles']

class AdminStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    pending_users = serializers.IntegerField()
    approved_users = serializers.IntegerField()
    verified_emails = serializers.IntegerField()
    users_by_role = serializers.DictField()
    recent_users = serializers.ListField()
    # REMOVI 'blocked_users' pois o campo não existe