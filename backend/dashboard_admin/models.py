from django.db import models
from login_cadastro.models import CustomUser, Perfil
from django.utils import timezone

class AdminLog(models.Model):
    """Log de ações do administrador"""
    ACTION_CHOICES = (
        ('user_approve', 'Aprovar Usuário'),
        ('user_block', 'Bloquear Usuário'),
        ('user_unblock', 'Desbloquear Usuário'),
        ('user_delete', 'Deletar Usuário'),
        ('role_change', 'Alterar Role'),
        ('settings_change', 'Alterar Configurações'),
        ('export_data', 'Exportar Dados'),
        ('import_data', 'Importar Dados'),
    )
    
    admin = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='admin_logs')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    target_user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='targeted_logs')
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.admin.email} - {self.action} - {self.created_at}"

class SystemSettings(models.Model):
    """Configurações do sistema"""
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return self.key
    
    @classmethod
    def get_setting(cls, key, default=None):
        try:
            setting = cls.objects.get(key=key)
            return setting.value
        except cls.DoesNotExist:
            return default

class DashboardWidget(models.Model):
    """Widgets personalizáveis do dashboard"""
    WIDGET_TYPES = (
        ('stats', 'Estatísticas'),
        ('chart', 'Gráfico'),
        ('table', 'Tabela'),
        ('activity', 'Atividades'),
        ('custom', 'Personalizado'),
    )
    
    title = models.CharField(max_length=100)
    widget_type = models.CharField(max_length=50, choices=WIDGET_TYPES)
    config = models.JSONField(default=dict)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    visible_to_roles = models.JSONField(default=list)  # Lista de roles que podem ver
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.title