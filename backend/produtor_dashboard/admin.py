from django.contrib import admin


# Register your models here.

# produtor_dashboard/admin.py
from django.contrib import admin
from .models import (
    Fazenda, Animal, AnimalSaude, AlimentacaoRegistro,
    EstoqueAlimentacao, TransacaoFinanceira, Alerta,
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


@admin.register(AlimentacaoRegistro)
class AlimentacaoRegistroAdmin(admin.ModelAdmin):
    list_display = ('id', 'fazenda', 'data', 'tipo_racao', 'quantidade_kg', 'custo_total')
    list_filter = ('tipo_racao', 'data')
    search_fields = ('fazenda__nome', 'tipo_racao', 'observacoes')


@admin.register(EstoqueAlimentacao)
class EstoqueAlimentacaoAdmin(admin.ModelAdmin):
    list_display = ('id', 'fazenda', 'tipo_racao', 'quantidade_atual_kg', 'quantidade_minima_kg', 'updated_at')
    list_filter = ('tipo_racao',)
    search_fields = ('fazenda__nome', 'tipo_racao')


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