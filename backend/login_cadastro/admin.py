# login_cadastro/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Perfil

class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'email', 'role', 'is_superuser', 'is_staff', 'is_approved', 'email_confirmed')
    list_filter = ('role', 'is_superuser', 'is_approved', 'email_confirmed')
    search_fields = ('email',)
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informações Pessoais', {'fields': ('first_name', 'last_name')}),
        ('Permissões', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'is_approved', 'email_confirmed', 'groups', 'user_permissions')}),
        ('Datas Importantes', {'fields': ('last_login', 'date_joined')}),
        ('Google', {'fields': ('google_id', 'profile_picture', 'needs_password_setup')}),
        ('Tokens', {'fields': ('email_confirmation_token', 'reset_password_token')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role'),
        }),
    )
    
    readonly_fields = ('date_joined', 'last_login')

@admin.register(Perfil)
class PerfilAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'nome_completo', 'telefone', 'fazenda_nome')
    search_fields = ('nome_completo', 'user__email')
    list_filter = ('user__role',)

# Registrar o CustomUser
admin.site.register(CustomUser, CustomUserAdmin)