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
    funcionario_nome = serializers.SerializerMethodField()
    funcionario_email = serializers.SerializerMethodField()
    funcionario_id = serializers.PrimaryKeyRelatedField(
        source='funcionario',
        queryset=CustomUser.objects.all(),
        write_only=True,
        required=False,
    )
    animal_id = serializers.PrimaryKeyRelatedField(
        source='animal',
        queryset=Animal.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )
    
    class Meta:
        model = Tarefa
        fields = ['id', 'titulo', 'descricao', 'tipo', 'prioridade', 'status', 
                  'data_limite', 'data_conclusao', 'observacoes', 'created_at', 'updated_at',
                  'funcionario', 'funcionario_nome', 'funcionario_email', 'funcionario_id',
                  'animal', 'animal_id', 'fazenda']
        read_only_fields = ['id', 'created_at', 'updated_at', 'funcionario', 'animal', 'fazenda',
                           'funcionario_nome', 'funcionario_email']
    
    def get_funcionario_nome(self, obj):
        if obj.funcionario and hasattr(obj.funcionario, 'perfil') and obj.funcionario.perfil:
            return obj.funcionario.perfil.nome_completo
        return obj.funcionario.email.split('@')[0] if obj.funcionario else 'N/A'
    
    def get_funcionario_email(self, obj):
        return obj.funcionario.email if obj.funcionario else 'N/A'

class RegistroAlimentacaoFuncionarioSerializer(serializers.ModelSerializer):
    funcionario = serializers.StringRelatedField(read_only=True)
    fazenda = serializers.StringRelatedField(read_only=True)
    animal = serializers.StringRelatedField(read_only=True)
    animal_id = serializers.PrimaryKeyRelatedField(
        queryset=Animal.objects.all(),
        source='animal',
        write_only=True,
        required=False,
        allow_null=True
    )
    horario = serializers.DateTimeField(source='data_hora', write_only=True, required=False)
    
    class Meta:
        model = RegistroAlimentacaoFuncionario
        fields = '__all__'
        read_only_fields = ['created_at']

class OcorrenciaSerializer(serializers.ModelSerializer):
    funcionario = serializers.StringRelatedField(read_only=True)
    fazenda = serializers.StringRelatedField(read_only=True)
    animal = serializers.StringRelatedField(read_only=True)

    # ← DateTimeField em vez de DateField, para bater com o model
    local = serializers.CharField(source='titulo', required=True)
    data = serializers.DateTimeField(source='data_hora', required=False)

    animal_id = serializers.PrimaryKeyRelatedField(
        source='animal',
        queryset=Animal.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Ocorrencia
        fields = ['id', 'tipo', 'local', 'titulo', 'descricao', 'urgencia',
                  'data', 'data_hora', 'resolvido', 'data_resolucao',
                  'created_at', 'funcionario', 'fazenda', 'animal', 'animal_id']
        read_only_fields = ['created_at', 'funcionario', 'fazenda', 'animal',
                            'resolvido', 'data_resolucao', 'titulo', 'data_hora']

class AtualizacaoAnimalSerializer(serializers.ModelSerializer):
    funcionario = serializers.StringRelatedField(read_only=True)
    animal = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = AtualizacaoAnimal
        fields = [
            'id', 'animal', 'funcionario',
            'peso_anterior', 'peso_novo',
            'status_anterior', 'status_novo',
            'observacoes', 'data_hora', 'created_at'
        ]
        read_only_fields = ['created_at', 'funcionario', 'animal',
                            'peso_anterior', 'status_anterior']

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
