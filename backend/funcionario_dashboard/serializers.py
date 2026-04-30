from rest_framework import serializers
from .models import Funcionario, Tarefa, RegistroAlimentacaoFuncionario, Ocorrencia, AtualizacaoAnimal, Nascimento
from login_cadastro.models import CustomUser
from produtor_dashboard.models import Fazenda, Animal

class FuncionarioSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    fazenda = serializers.StringRelatedField()
    
    class Meta:
        model = Funcionario
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class TarefaSerializer(serializers.ModelSerializer):
    funcionario = serializers.StringRelatedField()
    fazenda = serializers.StringRelatedField()
    animal = serializers.StringRelatedField()
    
    class Meta:
        model = Tarefa
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class RegistroAlimentacaoFuncionarioSerializer(serializers.ModelSerializer):
    funcionario = serializers.StringRelatedField()
    fazenda = serializers.StringRelatedField()
    animal = serializers.StringRelatedField()
    
    class Meta:
        model = RegistroAlimentacaoFuncionario
        fields = '__all__'
        read_only_fields = ['created_at']

class OcorrenciaSerializer(serializers.ModelSerializer):
    funcionario = serializers.StringRelatedField()
    fazenda = serializers.StringRelatedField()
    animal = serializers.StringRelatedField()
    
    class Meta:
        model = Ocorrencia
        fields = '__all__'
        read_only_fields = ['created_at']

class AtualizacaoAnimalSerializer(serializers.ModelSerializer):
    funcionario = serializers.StringRelatedField()
    animal = serializers.StringRelatedField()
    
    class Meta:
        model = AtualizacaoAnimal
        fields = '__all__'
        read_only_fields = ['created_at']

class NascimentoSerializer(serializers.ModelSerializer):
    funcionario = serializers.StringRelatedField()
    fazenda = serializers.StringRelatedField()
    mae = serializers.StringRelatedField()
    
    class Meta:
        model = Nascimento
        fields = '__all__'
        read_only_fields = ['created_at']

class DashboardFuncionarioSerializer(serializers.Serializer):
    tarefas_hoje = serializers.IntegerField()
    tarefas_concluidas = serializers.IntegerField()
    tarefas_pendentes = serializers.IntegerField()
    tarefas_proximas = serializers.IntegerField()
    alimentacoes_registradas = serializers.IntegerField()
    animais_atualizados = serializers.IntegerField()
    nascimentos_mes = serializers.IntegerField()
    ocorrencias = serializers.IntegerField()
