# Gestor_financeiro_dashboard/admin.py
from django.contrib import admin
from .models import (
    GestorFinanceiro, Receita, Despesa, 
    MetaFinanceira, AtividadeFinanceira, RelatorioFinanceiro
)


@admin.register(GestorFinanceiro)
class GestorFinanceiroAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'fazenda', 'created_at')
    search_fields = ('user__email',)


@admin.register(Receita)
class ReceitaAdmin(admin.ModelAdmin):
    list_display = ('id', 'fazenda', 'categoria', 'valor', 'data', 'gestor')
    list_filter = ('categoria', 'data')
    search_fields = ('descricao', 'fazenda__nome')


@admin.register(Despesa)
class DespesaAdmin(admin.ModelAdmin):
    list_display = ('id', 'fazenda', 'categoria', 'valor', 'data', 'gestor')
    list_filter = ('categoria', 'data')
    search_fields = ('descricao', 'fazenda__nome')


@admin.register(MetaFinanceira)
class MetaFinanceiraAdmin(admin.ModelAdmin):
    list_display = ('id', 'fazenda', 'tipo', 'valor_meta', 'periodo', 'ano', 'mes')
    list_filter = ('tipo', 'periodo', 'ano')
    search_fields = ('fazenda__nome',)


@admin.register(AtividadeFinanceira)
class AtividadeFinanceiraAdmin(admin.ModelAdmin):
    list_display = ('id', 'fazenda', 'tipo', 'valor', 'data', 'usuario')
    list_filter = ('tipo', 'data')
    search_fields = ('descricao', 'fazenda__nome')


@admin.register(RelatorioFinanceiro)
class RelatorioFinanceiroAdmin(admin.ModelAdmin):
    list_display = ('id', 'fazenda', 'titulo', 'periodo_inicio', 'periodo_fim', 'created_at')
    list_filter = ('periodo_inicio', 'periodo_fim')
    search_fields = ('titulo', 'fazenda__nome')