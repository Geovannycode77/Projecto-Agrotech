from django.contrib import admin
from .models import (
    Veterinario, Consulta, Vacina, 
    Tratamento, AlertaSaude, LembreteSaude
)


@admin.register(Veterinario)
class VeterinarioAdmin(admin.ModelAdmin):
    list_display = ('user', 'registro_crmv', 'especialidade', 'ativo', 'created_at')
    list_filter = ('especialidade', 'ativo', 'created_at')
    search_fields = ('user__username', 'registro_crmv')



@admin.register(Consulta)
class ConsultaAdmin(admin.ModelAdmin):
    list_display = ('veterinario', 'animal', 'data_consulta', 'status')
    list_filter = ('status', 'data_consulta')
    search_fields = ('veterinario__crmv', 'animal__nome')


@admin.register(Vacina)
class VacinaAdmin(admin.ModelAdmin):
    list_display = ('animal', 'nome_vacina', 'data_aplicacao', 'data_proxima_dose')
    list_filter = ('data_aplicacao',)
    search_fields = ('animal__nome', 'nome_vacina')


@admin.register(Tratamento)
class TratamentoAdmin(admin.ModelAdmin):
    list_display = ('animal', 'veterinario', 'data_inicio', 'status')
    list_filter = ('status', 'data_inicio')
    search_fields = ('animal__nome', 'veterinario__username')


@admin.register(AlertaSaude)
class AlertaSaudeAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'tipo', 'prioridade', 'lido', 'created_at')
    list_filter = ('tipo', 'prioridade', 'lido')
    search_fields = ('titulo', 'mensagem')


@admin.register(LembreteSaude)
class LembreteSaudeAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'data_lembrete', 'frequencia', 'ativo')
    list_filter = ('frequencia', 'ativo', 'data_lembrete')
    search_fields = ('titulo', 'descricao')
