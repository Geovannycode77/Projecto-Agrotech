from django.contrib import admin
from .models import (
    Fazenda, Animal, AnimalSaude, 
    TipoRacao, EstoqueRacao, 
    AlimentacaoRegistro, CompraRacao,
    TransacaoFinanceira, Alerta,
    Atividade, RelatorioProducao
)


@admin.register(Fazenda)
class FazendaAdmin(admin.ModelAdmin):
    list_display = ('id', 'produtor', 'nome', 'cidade', 'created_at')
    list_filter = ('cidade', 'estado', 'created_at')
    search_fields = ('nome', 'produtor__email', 'cnpj')


@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
    list_display = ('id', 'brinco', 'nome', 'especie', 'sexo', 'status', 'peso_atual', 'fazenda')
    list_filter = ('especie', 'sexo', 'status', 'created_at')
    search_fields = ('brinco', 'nome', 'raca')
    readonly_fields = ('idade_meses', 'created_at', 'updated_at')


@admin.register(AnimalSaude)
class AnimalSaudeAdmin(admin.ModelAdmin):
    list_display = ('id', 'animal', 'tipo', 'data_registro', 'veterinario', 'custo')
    list_filter = ('tipo', 'data_registro')
    search_fields = ('animal__brinco', 'descricao', 'veterinario')


@admin.register(TipoRacao)
class TipoRacaoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome', 'fazenda', 'peso_por_saco', 'preco_por_saco', 'created_at')
    list_filter = ('fazenda',)
    search_fields = ('nome',)


@admin.register(EstoqueRacao)
class EstoqueRacaoAdmin(admin.ModelAdmin):
    list_display = ('id', 'tipo_racao', 'fazenda', 'quantidade_sacos', 'estoque_minimo_sacos', 'updated_at')
    list_filter = ('fazenda',)
    search_fields = ('tipo_racao__nome',)


@admin.register(AlimentacaoRegistro)
class AlimentacaoRegistroAdmin(admin.ModelAdmin):
    list_display = ('id', 'fazenda', 'data', 'tipo_racao', 'quantidade_sacos', 'quantidade_kg', 'custo_total')
    list_filter = ('tipo_racao', 'data')
    search_fields = ('fazenda__nome', 'tipo_racao__nome', 'observacoes')
    readonly_fields = ('quantidade_kg', 'custo_total')


@admin.register(CompraRacao)
class CompraRacaoAdmin(admin.ModelAdmin):
    list_display = ('id', 'fazenda', 'data', 'tipo_racao', 'quantidade_sacos', 'quantidade_kg', 'valor_total', 'fornecedor')
    list_filter = ('data', 'tipo_racao', 'fornecedor')
    search_fields = ('fazenda__nome', 'tipo_racao__nome', 'fornecedor', 'nota_fiscal')
    readonly_fields = ('quantidade_kg',)


@admin.register(TransacaoFinanceira)
class TransacaoFinanceiraAdmin(admin.ModelAdmin):
    list_display = ('id', 'fazenda', 'tipo', 'categoria', 'valor', 'data', 'created_at')
    list_filter = ('tipo', 'categoria', 'data')
    search_fields = ('fazenda__nome', 'descricao')


@admin.register(Alerta)
class AlertaAdmin(admin.ModelAdmin):
    list_display = ('id', 'fazenda', 'titulo', 'tipo', 'prioridade', 'lido', 'created_at')
    list_filter = ('tipo', 'prioridade', 'lido', 'created_at')
    search_fields = ('titulo', 'mensagem')


@admin.register(Atividade)
class AtividadeAdmin(admin.ModelAdmin):
    list_display = ('id', 'fazenda', 'tipo', 'descricao', 'usuario', 'created_at')
    list_filter = ('tipo', 'created_at')
    search_fields = ('descricao', 'usuario__email')


@admin.register(RelatorioProducao)
class RelatorioProducaoAdmin(admin.ModelAdmin):
    list_display = ('id', 'fazenda', 'periodo', 'data_inicio', 'data_fim', 'created_at')
    list_filter = ('periodo', 'created_at')
    search_fields = ('fazenda__nome',)
    readonly_fields = ('created_at',)