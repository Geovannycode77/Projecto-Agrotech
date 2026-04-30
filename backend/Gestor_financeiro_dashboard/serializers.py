from rest_framework import serializers
from .models import (
    GestorFinanceiro, Receita, Despesa, 
    MetaFinanceira, AtividadeFinanceira, RelatorioFinanceiro
)
from produtor_dashboard.serializers import AnimalSerializer

class GestorFinanceiroSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = GestorFinanceiro
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class ReceitaSerializer(serializers.ModelSerializer):
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    gestor_nome = serializers.CharField(source='gestor.username', read_only=True)
    animal_info = AnimalSerializer(source='animal', read_only=True)
    
    class Meta:
        model = Receita
        fields = '__all__'
        read_only_fields = ['id', 'fazenda', 'created_at', 'updated_at']

class DespesaSerializer(serializers.ModelSerializer):
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    gestor_nome = serializers.CharField(source='gestor.username', read_only=True)
    animal_info = AnimalSerializer(source='animal', read_only=True)
    
    class Meta:
        model = Despesa
        fields = '__all__'
        read_only_fields = ['id', 'fazenda', 'created_at', 'updated_at']

class MetaFinanceiraSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    periodo_display = serializers.CharField(source='get_periodo_display', read_only=True)
    
    class Meta:
        model = MetaFinanceira
        fields = '__all__'
        read_only_fields = ['id', 'fazenda', 'created_at', 'updated_at']

class AtividadeFinanceiraSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)
    
    class Meta:
        model = AtividadeFinanceira
        fields = '__all__'
        read_only_fields = ['id', 'fazenda', 'created_at']

class RelatorioFinanceiroSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelatorioFinanceiro
        fields = '__all__'
        read_only_fields = ['id', 'fazenda', 'created_at']