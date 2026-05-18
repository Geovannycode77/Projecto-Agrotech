from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *

# ========== USUÁRIOS ==========
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'nome', 'role', 'telefone', 'fazenda', 'is_active')
    list_filter = ('role', 'is_active')
    search_fields = ('username', 'email', 'nome')
    inlines = [UserProfileInline]
    
    fieldsets = UserAdmin.fieldsets + (
        ('Informações Adicionais', {'fields': ('nome', 'telefone', 'fazenda', 'role', 'avatar')}),
    )

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'cidade', 'estado', 'notificacoes_email')

# ========== ANIMAIS ==========
class PesoAnimalInline(admin.TabularInline):
    model = PesoAnimal
    extra = 1

@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
    list_display = ('brinco', 'nome', 'raca', 'sexo', 'data_nascimento', 'status', 'proprietario')
    list_filter = ('status', 'raca', 'sexo')
    search_fields = ('brinco', 'nome')
    inlines = [PesoAnimalInline]

@admin.register(PesoAnimal)
class PesoAnimalAdmin(admin.ModelAdmin):
    list_display = ('animal', 'data', 'peso')

# ========== ALIMENTAÇÃO ==========
@admin.register(Alimentacao)
class AlimentacaoAdmin(admin.ModelAdmin):
    list_display = ('animal', 'data', 'tipo', 'quantidade_kg', 'custo')
    list_filter = ('tipo', 'data')

# ========== SAÚDE ==========
@admin.register(ConsultaVeterinaria)
class ConsultaVeterinariaAdmin(admin.ModelAdmin):
    list_display = ('animal', 'data', 'veterinario', 'custo')
    list_filter = ('data',)

@admin.register(Vacina)
class VacinaAdmin(admin.ModelAdmin):
    list_display = ('animal', 'nome', 'data_aplicacao', 'data_proxima')
    list_filter = ('data_aplicacao',)

# ========== FINANCEIRO ==========
@admin.register(Transacao)
class TransacaoAdmin(admin.ModelAdmin):
    list_display = ('descricao', 'tipo', 'categoria', 'valor', 'data', 'usuario')
    list_filter = ('tipo', 'categoria', 'data')

# ========== TAREFAS ==========
@admin.register(Tarefa)
class TarefaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'responsavel', 'status', 'prioridade', 'data_limite')
    list_filter = ('status', 'prioridade')

# ========== INSUMOS ==========
@admin.register(Insumo)
class InsumoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'categoria', 'quantidade', 'unidade', 'preco_unitario')
    list_filter = ('categoria', 'unidade')

# ========== NOTIFICAÇÕES ==========
@admin.register(Notificacao)
class NotificacaoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'usuario', 'lida', 'data_criacao')
    list_filter = ('lida', 'data_criacao')
