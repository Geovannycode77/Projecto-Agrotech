from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from login_cadastro.models import CustomUser
from produtor_dashboard.models import Fazenda, Animal
from django.utils import timezone
import uuid

class Funcionario(models.Model):
    """Modelo do funcionário vinculado a uma fazenda"""
    CARGO_CHOICES = (
        ('tratador', 'Tratador de Animais'),
        ('veterinario_assistente', 'Assistente Veterinário'),
        ('alimentador', 'Alimentador'),
        ('gerente_pecuario', 'Gerente de Pecuária'),
        ('auxiliar_geral', 'Auxiliar Geral'),
    )
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='funcionario')
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='funcionarios')
    cargo = models.CharField(max_length=50, choices=CARGO_CHOICES, default='auxiliar_geral')
    data_contratacao = models.DateField(default=timezone.now)
    salario = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    turno = models.CharField(max_length=20, choices=(
        ('manha', 'Manhã (06h-14h)'),
        ('tarde', 'Tarde (14h-22h)'),
        ('noite', 'Noite (22h-06h)'),
        ('integral', 'Integral'),
    ), default='manha')
    ativo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.fazenda.nome}"

class Tarefa(models.Model):
    """Tarefas atribuídas aos funcionários"""
    PRIORIDADE_CHOICES = (
        ('alta', 'Alta'),
        ('media', 'Média'),
        ('baixa', 'Baixa'),
    )
    
    STATUS_CHOICES = (
        ('pendente', 'Pendente'),
        ('em_andamento', 'Em Andamento'),
        ('concluida', 'Concluída'),
        ('atrasada', 'Atrasada'),
        ('cancelada', 'Cancelada'),
    )
    
    TIPO_CHOICES = (
        ('alimentacao', 'Alimentação'),
        ('saude', 'Saúde'),
        ('limpeza', 'Limpeza'),
        ('manutencao', 'Manutenção'),
        ('registro', 'Registro de Dados'),
        ('vacinacao', 'Vacinação'),
        ('observacao', 'Observação'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    funcionario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='tarefas')
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='tarefas')
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    prioridade = models.CharField(max_length=10, choices=PRIORIDADE_CHOICES, default='media')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    animal = models.ForeignKey(Animal, on_delete=models.SET_NULL, null=True, blank=True, related_name='tarefas')
    data_limite = models.DateTimeField()
    data_conclusao = models.DateTimeField(blank=True, null=True)
    observacoes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['data_limite', '-prioridade']
    
    def __str__(self):
        return f"{self.titulo} - {self.funcionario.username}"

class RegistroAlimentacaoFuncionario(models.Model):
    """Registro de alimentação feito pelo funcionário"""
    funcionario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='registros_alimentacao')
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='registros_alimentacao_func')
    animal = models.ForeignKey(Animal, on_delete=models.SET_NULL, null=True, blank=True, related_name='registros_alimentacao')
    data_hora = models.DateTimeField(default=timezone.now)
    tipo_racao = models.CharField(max_length=100)
    quantidade_kg = models.DecimalField(max_digits=8, decimal_places=2)
    observacoes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-data_hora']
    
    def __str__(self):
        return f"{self.data_hora} - {self.tipo_racao} - {self.quantidade_kg}kg"

class Ocorrencia(models.Model):
    """Registro de ocorrências (doenças, acidentes, etc)"""
    TIPO_CHOICES = (
        ('doenca', 'Doença'),
        ('acidente', 'Acidente'),
        ('fuga', 'Fuga'),
        ('nascimento', 'Nascimento'),
        ('morte', 'Morte'),
        ('outro', 'Outro'),
    )
    
    funcionario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='ocorrencias')
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='ocorrencias')
    animal = models.ForeignKey(Animal, on_delete=models.SET_NULL, null=True, blank=True, related_name='ocorrencias')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    data_hora = models.DateTimeField(default=timezone.now)
    resolvido = models.BooleanField(default=False)
    data_resolucao = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-data_hora']
    
    def __str__(self):
        return f"{self.titulo} - {self.data_hora}"

class AtualizacaoAnimal(models.Model):
    """Registro de atualizações de dados dos animais"""
    funcionario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='atualizacoes_animais')
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='atualizacoes')
    peso_anterior = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    peso_novo = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    status_anterior = models.CharField(max_length=20, blank=True, null=True)
    status_novo = models.CharField(max_length=20, blank=True, null=True)
    observacoes = models.TextField(blank=True)
    data_hora = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-data_hora']
    
    def __str__(self):
        return f"{self.animal.brinco} - {self.data_hora}"

class Nascimento(models.Model):
    """Registro de nascimentos"""
    funcionario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='nascimentos')
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='nascimentos')
    mae = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='filhos', null=True, blank=True)
    data_nascimento = models.DateField(default=timezone.now)
    quantidade = models.IntegerField(default=1)
    especie = models.CharField(max_length=50)
    observacoes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-data_nascimento']
    
    def __str__(self):
        return f"Nascimento - {self.data_nascimento} - {self.quantidade} animais"

