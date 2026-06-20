import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.conf import settings
from django.core.validators import RegexValidator, MinLengthValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver


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

    # Indica se o usuário está bloqueado (adicionado para compatibilidade com DB existente)
    is_blocked = models.BooleanField(
        default=False,
        help_text="Indica se o usuário está bloqueado pelo sistema"
    )
    
    # Campos adicionais
    google_id = models.CharField(max_length=100, blank=True, null=True)
    profile_picture = models.URLField(blank=True, null=True)
    needs_password_setup = models.BooleanField(default=False)
    
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
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='perfil'
    )
    
    # Informações básicas
    nome_completo = models.CharField(
        max_length=255,
        help_text="Nome completo do usuário"
    )
    
    # Telefone usando biblioteca especializada
    telefone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Telefone no formato internacional (ex: +244912345678)"
    )
    
    endereco = models.TextField(
        null=True, 
        blank=True,
        help_text="Endereço completo"
    )
    
    data_nascimento = models.DateField(
        null=True, 
        blank=True,
        help_text="Data de nascimento (não pode ser futura)"
    )
    
    # Campos específicos por role
    fazenda_nome = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        help_text="Nome da fazenda (para Produtores)"
    )
    
    especialidade = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        help_text="Especialidade médica (para Veterinários)"
    )
    
    setor = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        help_text="Setor de trabalho (para Funcionários)"
    )
    
    area_atuacao = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        help_text="Área de atuação (para Gestores Financeiros)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Perfil'
        verbose_name_plural = 'Perfis'
    
    def clean(self):
        """Validações customizadas"""
        from datetime import date
        
        # Validação da data de nascimento (não pode ser futura)
        if self.data_nascimento and self.data_nascimento > date.today():
            raise ValidationError({
                'data_nascimento': 'A data de nascimento não pode ser futura.'
            })
        
        # Validação do nome completo (mínimo 3 caracteres)
        if self.nome_completo and len(self.nome_completo.strip()) < 3:
            raise ValidationError({
                'nome_completo': 'O nome completo deve ter pelo menos 3 caracteres.'
            })
        
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.nome_completo or self.user.email


class UserActivity(models.Model):
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('register', 'Registro'),
        ('password_change', 'Mudança de Senha'),
        ('profile_update', 'Atualização de Perfil'),
        ('admin_action', 'Ação Administrativa'),
        ('user_approve', 'Aprovação de Usuário'),
        ('user_block', 'Bloqueio de Usuário'),
        ('user_delete', 'Exclusão de Usuário'),
        ('role_change', 'Mudança de Função'),
        ('settings_change', 'Alteração de Configurações'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='activities'
    )
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Atividade de Usuário'
        verbose_name_plural = 'Atividades de Usuários'
    
    def __str__(self):
        return f"{self.user.email} - {self.get_activity_type_display()} ({self.created_at.strftime('%d/%m/%Y %H:%M')})"


# ========== SIGNALS PARA CRIAR PERFIS AUTOMATICAMENTE ==========

@receiver(post_save, sender=CustomUser)
def criar_perfil_usuario(sender, instance, created, **kwargs):
    """Criar perfis automaticamente para diferentes tipos de usuário"""
    if not created:
        return
    
    print(f"🔵 Processando criação de perfil para {instance.email} (role: {instance.role})")
    
    # Importar models aqui para evitar importação circular
    try:
        from produtor_dashboard.models import Fazenda
    except ImportError:
        print("⚠️ Não foi possível importar Fazenda")
        return
    
    # Para produtores - criar fazenda automaticamente
    if instance.role == 'produtor':
        fazenda, created = Fazenda.objects.get_or_create(
            produtor=instance,
            defaults={
                'nome': f"Fazenda de {instance.email.split('@')[0]}"
            }
        )
        if created:
            print(f"✅ Fazenda criada para {instance.email}: {fazenda.nome}")
        else:
            print(f"ℹ️ Fazenda já existia para {instance.email}")
    
    # Para funcionários - vincular à primeira fazenda disponível
    elif instance.role == 'funcionario':
        try:
            from funcionario_dashboard.models import Funcionario
            fazenda = Fazenda.objects.first()
            if fazenda:
                obj, created = Funcionario.objects.get_or_create(
                    user=instance,
                    defaults={
                        'fazenda': fazenda,
                        'cargo': 'Funcionário Rural'
                    }
                )
                if created:
                    print(f"✅ Funcionário {instance.email} vinculado à fazenda {fazenda.nome}")
                else:
                    print(f"ℹ️ Funcionário {instance.email} já estava vinculado")
            else:
                print(f"⚠️ Nenhuma fazenda encontrada para vincular o funcionário {instance.email}")
        except ImportError:
            print(f"⚠️ Modelo Funcionario não encontrado para {instance.email}")
    
    # Para veterinários - vincular à primeira fazenda disponível
    elif instance.role == 'veterinario':
        try:
            from veterinario_dashboard.models import Veterinario
            fazenda = Fazenda.objects.first()
            if fazenda:
                obj, created = Veterinario.objects.get_or_create(
                    user=instance,
                    defaults={
                        'fazenda': fazenda,
                        'especialidade': 'geral',
                        'registro_crmv': None
                    }
                )
                if created:
                    print(f"✅ Veterinário {instance.email} vinculado à fazenda {fazenda.nome}")
                else:
                    print(f"ℹ️ Veterinário {instance.email} já estava vinculado")
            else:
                print(f"⚠️ Nenhuma fazenda encontrada para vincular o veterinário {instance.email}")
        except ImportError:
            print(f"⚠️ Modelo Veterinario não encontrado para {instance.email}")
    
    # Para gestores financeiros - vincular à primeira fazenda disponível
    elif instance.role == 'gestor_financeiro':
        try:
            from Gestor_financeiro_dashboard.models import GestorFinanceiro
            fazenda = Fazenda.objects.first()
            if fazenda:
                obj, created = GestorFinanceiro.objects.get_or_create(
                    user=instance,
                    defaults={
                        'fazenda': fazenda,
                        'departamento': 'Financeiro',
                        'nivel_acesso': 'avancado',
                        'ativo': True
                    }
                )
                if created:
                    print(f"✅ Gestor Financeiro {instance.email} vinculado à fazenda {fazenda.nome}")
                else:
                    print(f"ℹ️ Gestor Financeiro {instance.email} já estava vinculado")
            else:
                print(f"⚠️ Nenhuma fazenda encontrada para vincular o gestor {instance.email}")
        except ImportError:
            print(f"⚠️ Modelo GestorFinanceiro não encontrado para {instance.email}")
    
    # Para administradores - não precisa de vínculo
    elif instance.role == 'administrador':
        print(f"✅ Administrador {instance.email} criado sem vínculo com fazenda")


# Garantir que o perfil também seja criado
@receiver(post_save, sender=CustomUser)
def criar_perfil_padrao(sender, instance, created, **kwargs):
    """Criar o perfil padrão para todo usuário"""
    if created:
        Perfil.objects.get_or_create(
            user=instance,
            defaults={
                'nome_completo': instance.email.split('@')[0]
            }
        )
        print(f"✅ Perfil padrão criado para {instance.email}")