from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta, date
from .models import (
    Fazenda, Animal, AnimalSaude, 
    TipoRacao, EstoqueRacao,
    AlimentacaoRegistro, CompraRacao,
    TransacaoFinanceira, Alerta,
    Atividade, RelatorioProducao
)
from .models import PreferenciasNotificacoes

class FazendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fazenda
        fields = '__all__'
        read_only_fields = ['id', 'produtor', 'created_at', 'updated_at']


class AnimalSerializer(serializers.ModelSerializer):
    idade_meses_display = serializers.SerializerMethodField()
    especie_display = serializers.CharField(source='get_especie_display', read_only=True)
    sexo_display = serializers.CharField(source='get_sexo_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Animal
        fields = '__all__'
        read_only_fields = ['id', 'fazenda', 'idade_meses', 'created_at', 'updated_at']
    
    def get_idade_meses_display(self, obj):
        if obj.data_nascimento:
            hoje = timezone.now().date()
            idade = hoje.year - obj.data_nascimento.year
            if hoje.month < obj.data_nascimento.month or (hoje.month == obj.data_nascimento.month and hoje.day < obj.data_nascimento.day):
                idade -= 1
            if idade > 0:
                return f"{idade} anos"
            else:
                return f"{obj.idade_meses} meses"
        return "N/A"


class AnimalSaudeSerializer(serializers.ModelSerializer):
    animal_nome = serializers.CharField(source='animal.nome', read_only=True)
    animal_brinco = serializers.CharField(source='animal.brinco', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    
    class Meta:
        model = AnimalSaude
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class TipoRacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoRacao
        fields = ['id', 'nome', 'peso_por_saco', 'preco_por_saco', 'created_at']
        read_only_fields = ['id', 'created_at']


class EstoqueRacaoSerializer(serializers.ModelSerializer):
    nome = serializers.CharField(source='tipo_racao.nome', read_only=True)
    peso_por_saco = serializers.DecimalField(source='tipo_racao.peso_por_saco', read_only=True, max_digits=10, decimal_places=2)
    preco_por_saco = serializers.DecimalField(source='tipo_racao.preco_por_saco', read_only=True, max_digits=12, decimal_places=2)
    
    class Meta:
        model = EstoqueRacao
        fields = ['id', 'tipo_racao', 'nome', 'quantidade_sacos', 'estoque_minimo_sacos', 'peso_por_saco', 'preco_por_saco', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class AlimentacaoRegistroSerializer(serializers.ModelSerializer):
    tipo_racao_nome = serializers.CharField(source='tipo_racao.nome', read_only=True)
    
    class Meta:
        model = AlimentacaoRegistro
        fields = ['id', 'fazenda', 'tipo_racao', 'tipo_racao_nome', 'data', 'quantidade_sacos', 'quantidade_kg', 'custo_total', 'observacoes', 'created_at']
        read_only_fields = ['id', 'quantidade_kg', 'custo_total', 'created_at']


class CompraRacaoSerializer(serializers.ModelSerializer):
    tipo_racao_nome = serializers.CharField(source='tipo_racao.nome', read_only=True)
    
    class Meta:
        model = CompraRacao
        fields = ['id', 'fazenda', 'tipo_racao', 'tipo_racao_nome', 'data', 'quantidade_sacos', 'quantidade_kg', 'valor_total', 'nota_fiscal', 'fornecedor', 'observacoes', 'created_at']
        read_only_fields = ['id', 'quantidade_kg', 'created_at']


class TransacaoFinanceiraSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    
    class Meta:
        model = TransacaoFinanceira
        fields = ['id', 'fazenda', 'tipo', 'categoria', 'valor', 'descricao', 'data', 'animal', 'comprovante', 'created_at', 'tipo_display', 'categoria_display']
        read_only_fields = ['id', 'fazenda', 'created_at']


class AlertaSerializer(serializers.ModelSerializer):
    prioridade_display = serializers.CharField(source='get_prioridade_display', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    
    class Meta:
        model = Alerta
        fields = '__all__'
        read_only_fields = ['id', 'fazenda', 'created_at']


class AtividadeSerializer(serializers.ModelSerializer):
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)
    
    class Meta:
        model = Atividade
        fields = '__all__'
        read_only_fields = ['id', 'fazenda', 'created_at']


class RelatorioProducaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelatorioProducao
        fields = '__all__'
        read_only_fields = ['id', 'fazenda', 'created_at']


class PreferenciasNotificacoesSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreferenciasNotificacoes
        fields = ['alertas_saude', 'alertas_estoque', 'alertas_relatorios', 'frequencia_saude', 'frequencia_estoque', 'frequencia_relatorios']


class DashboardProdutorSerializer(serializers.Serializer):
    """Serializer para dados do dashboard - compatível com o frontend"""
    rebanho = serializers.DictField()
    alimentacao = serializers.DictField()
    financeiro_resumo = serializers.DictField()
    alertas_nao_lidos = serializers.IntegerField()
    atividades_recentes = AtividadeSerializer(many=True)