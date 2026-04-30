import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.conf import settings
from phonenumber_field.modelfields import PhoneNumberField

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('O email é obrigatório')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
            user.needs_password_setup = False
        else:
            # Usuário do Google - precisa definir senha depois
            user.needs_password_setup = True
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'administrador')
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('email_confirmed', True)
        extra_fields.setdefault('is_approved', True)
        extra_fields.setdefault('needs_password_setup', False)
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    
    ROLE_CHOICES = [
        ('administrador', 'Administrador'),
        ('produtor', 'Produtor (Dono da Fazenda)'),
        ('veterinario', 'Veterinário'),
        ('funcionario', 'Funcionário da Fazenda'),
        ('gestor_financeiro', 'Gestor Financeiro'),
    ]
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='funcionario',
        help_text="Tipo de usuário na plataforma"
    )
    
    # Campos para confirmação de email
    email_confirmed = models.BooleanField(default=False)
    email_confirmation_token = models.CharField(max_length=100, blank=True, null=True)
    email_confirmation_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Campos para recuperação de senha
    reset_password_token = models.CharField(max_length=100, blank=True, null=True)
    reset_password_token_created_at = models.DateTimeField(null=True, blank=True)
    
    # Campos para status do usuário
    is_approved = models.BooleanField(
        default=False,
        help_text="Aprovado pelo administrador"
    )
    
    # Campos adicionais
    google_id = models.CharField(max_length=100, blank=True, null=True)
    profile_picture = models.URLField(blank=True, null=True)
    needs_password_setup = models.BooleanField(default=False)  # Indica se precisa definir senha
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = CustomUserManager()
    
    def generate_confirmation_token(self):
        """Gera um token único para confirmação de email"""
        token = str(uuid.uuid4())
        self.email_confirmation_token = token
        self.save(update_fields=['email_confirmation_token'])
        return token
    
    def __str__(self):
        return f"{self.email} - {self.get_role_display()}"
    
    @property
    def is_administrador(self):
        return self.role == 'administrador' or self.is_superuser
    
    class Meta:
        permissions = [
            ("can_manage_users", "Pode gerenciar usuários"),
            ("can_view_reports", "Pode visualizar relatórios"),
            ("can_manage_system", "Pode gerenciar sistema"),
            ("can_manage_backups", "Pode gerenciar backups"),
        ]

class Perfil(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    nome_completo = models.CharField(max_length=100)
    telefone = PhoneNumberField(null=True, blank=True)
    endereco = models.TextField(null=True, blank=True)
    data_nascimento = models.DateField(null=True, blank=True)
    fazenda_nome = models.CharField(max_length=100, blank=True, null=True)
    especialidade = models.CharField(max_length=100, blank=True, null=True)
    setor = models.CharField(max_length=100, blank=True, null=True)
    area_atuacao = models.CharField(max_length=100, blank=True, null=True)
    
    def __str__(self):
        return self.nome_completo


class UserActivity(models.Model):
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('register', 'Registro'),
        ('password_change', 'Mudança de Senha'),
        ('profile_update', 'Atualização de Perfil'),
        ('admin_action', 'Ação Administrativa'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    ip_address = models.GenericIPAddressField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.get_activity_type_display()} ({self.created_at})"