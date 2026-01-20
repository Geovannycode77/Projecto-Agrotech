from django.db import models

from django.contrib.auth.models import AbstractUser, BaseUserManager

from django.conf import settings 
  
from phonenumber_field.modelfields import PhoneNumberField

from datetime import date

#PODER CRIAR SUPERUSER PARA ADMIN.
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('O email é obrigatório')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

#LOGIN APENAS POR EMAIL.
class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    accept_terms=models.BooleanField(default=False)
    terms_accepted_at=models.DateTimeField(null=True, blank=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []    
    PAPEL_CHOICES = [
        ("fazendeiro", "fazendeiro"),
        ("admin", "Administrador"),
    ]
    papel = models.CharField(
        max_length=20,
        choices=PAPEL_CHOICES,
        default="responsavel",
        help_text="Tipo de usuário dentro da plataforma",
    ) 

    objects = CustomUserManager()  
   

    def __str__(self):
        return self.email
class Perfil(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    nome_completo = models.CharField(max_length=100)
    data_nascimento = models.DateField(null=True, blank=True)
    telefone = PhoneNumberField(null=True, blank=True)
    endereco = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.nome_completo
