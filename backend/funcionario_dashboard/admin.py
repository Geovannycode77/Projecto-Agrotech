from django.contrib import admin

from .models import (
    Funcionario,
    Tarefa,
    RegistroAlimentacaoFuncionario,
    Ocorrencia,
    AtualizacaoAnimal,
    Nascimento,
)


@admin.register(Funcionario)
class FuncionarioAdmin(admin.ModelAdmin):
    list_display = ('user', 'fazenda', 'cargo', 'ativo', 'created_at')
    list_filter = ('cargo', 'ativo', 'fazenda')
    search_fields = ('user__username', 'user__email', 'fazenda__nome')


@admin.register(Tarefa)
class TarefaAdmin(admin.ModelAdmin):
    list_display = (
        'titulo',
        'funcionario',
        'fazenda',
        'tipo',
        'prioridade',
        'status',
        'animal',
        'data_limite',
        'created_at',
    )
    list_filter = ('tipo', 'prioridade', 'status', 'fazenda')
    search_fields = ('titulo', 'funcionario__username', 'animal__brinco', 'animal__nome')


@admin.register(RegistroAlimentacaoFuncionario)
class RegistroAlimentacaoFuncionarioAdmin(admin.ModelAdmin):
    list_display = ('funcionario', 'fazenda', 'animal', 'data_hora', 'tipo_racao', 'quantidade_kg')
    list_filter = ('tipo_racao', 'fazenda', 'data_hora')
    search_fields = ('funcionario__username', 'animal__brinco', 'animal__nome')


@admin.register(Ocorrencia)
class OcorrenciaAdmin(admin.ModelAdmin):
    list_display = (
        'titulo',
        'funcionario',
        'fazenda',
        'animal',
        'tipo',
        'resolvido',
        'data_hora',
        'created_at',
    )
    list_filter = ('tipo', 'resolvido', 'fazenda', 'data_hora')
    search_fields = ('titulo', 'funcionario__username', 'animal__brinco', 'animal__nome')


@admin.register(AtualizacaoAnimal)
class AtualizacaoAnimalAdmin(admin.ModelAdmin):
    list_display = (
        'animal',
        'funcionario',
        'peso_anterior',
        'peso_novo',
        'status_anterior',
        'status_novo',
        'data_hora',
    )
    list_filter = ('data_hora',)
    search_fields = ('animal__brinco', 'funcionario__username')


@admin.register(Nascimento)
class NascimentoAdmin(admin.ModelAdmin):
    list_display = ('data_nascimento', 'quantidade', 'especie', 'funcionario', 'fazenda')
    list_filter = ('especie', 'fazenda', 'data_nascimento')
    search_fields = ('funcionario__username', 'fazenda__nome')

