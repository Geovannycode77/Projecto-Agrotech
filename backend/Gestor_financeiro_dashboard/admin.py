from django.contrib import admin

from .models import (
    GestorFinanceiro,
    Receita,
    Despesa,
    MetaFinanceira,
    AtividadeFinanceira,
    RelatorioFinanceiro,
)


@admin.register(GestorFinanceiro)
class GestorFinanceiroAdmin(admin.ModelAdmin):
    list_display = ('user', 'fazenda', 'departamento', 'nivel_acesso', 'ativo', 'created_at')
    list_filter = ('ativo', 'nivel_acesso', 'departamento', 'fazenda')
    search_fields = ('user__username', 'user__email', 'fazenda__nome')


@admin.register(Receita)
class ReceitaAdmin(admin.ModelAdmin):
    list_display = ('categoria', 'valor', 'descricao', 'data', 'fazenda', 'animal', 'gestor')
    list_filter = ('categoria', 'data', 'fazenda')
    search_fields = ('descricao', 'animal__brinco', 'animal__nome', 'gestor__username')


@admin.register(Despesa)
class DespesaAdmin(admin.ModelAdmin):
    list_display = ('categoria', 'valor', 'descricao', 'data', 'fazenda', 'animal', 'gestor')
    list_filter = ('categoria', 'data', 'fazenda')
    search_fields = ('descricao', 'animal__brinco', 'animal__nome', 'gestor__username')


@admin.register(MetaFinanceira)
class MetaFinanceiraAdmin(admin.ModelAdmin):
    list_display = ('fazenda', 'tipo', 'periodo', 'valor_meta', 'ano', 'mes', 'descricao')
    list_filter = ('tipo', 'periodo', 'ano', 'mes', 'fazenda')
    search_fields = ('fazenda__nome', 'descricao')


@admin.register(AtividadeFinanceira)
class AtividadeFinanceiraAdmin(admin.ModelAdmin):
    list_display = ('tipo', 'valor', 'categoria', 'descricao', 'fazenda', 'usuario', 'data', 'created_at')
    list_filter = ('tipo', 'categoria', 'data', 'fazenda')
    search_fields = ('descricao', 'usuario__username', 'fazenda__nome')


@admin.register(RelatorioFinanceiro)
class RelatorioFinanceiroAdmin(admin.ModelAdmin):
    list_display = (
        'titulo',
        'fazenda',
        'periodo_inicio',
        'periodo_fim',
        'total_receitas',
        'total_despesas',
        'lucro_liquido',
        'margem_lucro',
        'created_at',
    )
    list_filter = ('fazenda', 'periodo_inicio', 'periodo_fim')
    search_fields = ('titulo', 'fazenda__nome')

