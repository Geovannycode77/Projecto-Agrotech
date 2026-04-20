from rest_framework import serializers
from .models import (
    Veterinario, Consulta, Vacina, Tratamento, AlertaSaude, LembreteSaude
)
from produtor_dashboard.serializers import AnimalSerializer

class VeterinarioSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    especialidade_display = serializers.CharField(source='get_especialidade_display', read_only=True)
    
    class Meta:
        model = Veterinario
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class ConsultaSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    animal_info = AnimalSerializer(source='animal', read_only=True)
    veterinario_nome = serializers.CharField(source='veterinario.username', read_only=True)
    
    class Meta:
        model = Consulta
        fields = '__all__'
        read_only_fields = ['id', 'veterinario', 'fazenda', 'created_at', 'updated_at']

class VacinaSerializer(serializers.ModelSerializer):
    via_aplicacao_display = serializers.CharField(source='get_via_aplicacao_display', read_only=True)
    animal_info = AnimalSerializer(source='animal', read_only=True)
    veterinario_nome = serializers.CharField(source='veterinario.username', read_only=True)
    
    class Meta:
        model = Vacina
        fields = '__all__'
        read_only_fields = ['id', 'veterinario', 'fazenda', 'created_at']

class TratamentoSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    animal_info = AnimalSerializer(source='animal', read_only=True)
    veterinario_nome = serializers.CharField(source='veterinario.username', read_only=True)
    
    class Meta:
        model = Tratamento
        fields = '__all__'
        read_only_fields = ['id', 'veterinario', 'fazenda', 'created_at', 'updated_at']

class AlertaSaudeSerializer(serializers.ModelSerializer):
    prioridade_display = serializers.CharField(source='get_prioridade_display', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    animal_info = AnimalSerializer(source='animal', read_only=True)
    
    class Meta:
        model = AlertaSaude
        fields = '__all__'
        read_only_fields = ['id', 'veterinario', 'fazenda', 'created_at']

class LembreteSaudeSerializer(serializers.ModelSerializer):
    frequencia_display = serializers.CharField(source='get_frequencia_display', read_only=True)
    
    class Meta:
        model = LembreteSaude
        fields = '__all__'
        read_only_fields = ['id', 'veterinario', 'fazenda', 'created_at']