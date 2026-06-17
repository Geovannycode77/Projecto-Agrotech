# funcionario_dashboard/admin.py
from django.contrib import admin
from .models import (
    Funcionario, Tarefa, RegistroAlimentacaoFuncionario,
    Ocorrencia, AtualizacaoAnimal, Nascimento
)


@admin.register(Funcionario)
class FuncionarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'fazenda', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email',)


@admin.register(Tarefa)
class TarefaAdmin(admin.ModelAdmin):
    list_display = ('id', 'funcionario', 'titulo', 'status', 'prioridade', 'data_limite')
    list_filter = ('status', 'prioridade', 'data_limite')
    search_fields = ('titulo', 'descricao')


@admin.register(RegistroAlimentacaoFuncionario)
class RegistroAlimentacaoFuncionarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'funcionario', 'tipo_racao', 'quantidade_kg', 'data_hora')
    list_filter = ('tipo_racao', 'data_hora')
    search_fields = ('funcionario__user__email', 'observacoes')


@admin.register(Ocorrencia)
class OcorrenciaAdmin(admin.ModelAdmin):
    list_display = ('id', 'funcionario', 'tipo', 'resolvido', 'data_hora')
    list_filter = ('tipo', 'resolvido', 'data_hora')
    search_fields = ('titulo', 'descricao')


@admin.register(AtualizacaoAnimal)
class AtualizacaoAnimalAdmin(admin.ModelAdmin):
    list_display = ('id', 'funcionario', 'animal', 'data_hora')
    list_filter = ('data_hora',)
    search_fields = ('animal__brinco', 'observacoes')


@admin.register(Nascimento)
class NascimentoAdmin(admin.ModelAdmin):
    list_display = ('id', 'funcionario', 'fazenda', 'especie', 'quantidade', 'data_nascimento')
    list_filter = ('especie', 'data_nascimento')
    search_fields = ('fazenda__nome',)