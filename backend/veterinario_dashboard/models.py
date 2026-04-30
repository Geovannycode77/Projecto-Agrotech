from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from login_cadastro.models import CustomUser
from produtor_dashboard.models import Fazenda, Animal
from django.utils import timezone
import uuid

class Veterinario(models.Model):
    """Modelo do veterinário vinculado a uma fazenda"""
    ESPECIALIDADE_CHOICES = (
        ('bovinos', 'Bovinos'),
        ('suinos', 'Suínos'),
        ('caprinos', 'Caprinos'),
        ('ovinos', 'Ovinos'),
        ('equinos', 'Equinos'),
        ('geral', 'Clínica Geral'),
    )
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='veterinario')
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='veterinarios')
    especialidade = models.CharField(max_length=50, choices=ESPECIALIDADE_CHOICES, default='geral')
    registro_crmv = models.CharField(max_length=50, unique=True)
    ativo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'veterinario'
        verbose_name = 'Veterinário'
        verbose_name_plural = 'Veterinários'
    
    def __str__(self):
        return f"Dr(a). {self.user.username} - CRMV: {self.registro_crmv}"

class Consulta(models.Model):
    """Registro de consultas veterinárias"""
    STATUS_CHOICES = (
        ('agendado', 'Agendado'),
        ('em_andamento', 'Em Andamento'),
        ('concluido', 'Concluído'),
        ('cancelado', 'Cancelado'),
        ('adiado', 'Adiado'),
    )
    
    TIPO_CHOICES = (
        ('rotina', 'Consulta de Rotina'),
        ('emergencia', 'Emergência'),
        ('retorno', 'Retorno'),
        ('vacina', 'Vacinação'),
        ('cirurgia', 'Cirurgia'),
        ('exame', 'Exame'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    veterinario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='consultas')
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='consultas')
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='consultas')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='agendado')
    data_consulta = models.DateField()
    horario = models.TimeField()
    descricao = models.TextField(blank=True)
    diagnostico = models.TextField(blank=True)
    prescricao = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'veterinario_consultas'
        ordering = ['data_consulta', 'horario']
    
    def __str__(self):
        return f"Consulta {self.tipo} - {self.animal.brinco} - {self.data_consulta}"

class Vacina(models.Model):
    """Registro de vacinas aplicadas"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    veterinario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='vacinas')
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='vacinas')
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='vacinas')
    nome_vacina = models.CharField(max_length=200)
    lote = models.CharField(max_length=100)
    data_aplicacao = models.DateField()
    data_proxima_dose = models.DateField(blank=True, null=True)
    dose = models.CharField(max_length=50)
    via_aplicacao = models.CharField(max_length=50, choices=(
        ('intramuscular', 'Intramuscular'),
        ('subcutanea', 'Subcutânea'),
        ('oral', 'Oral'),
        ('intravenosa', 'Intravenosa'),
    ))
    observacoes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'veterinario_vacinas'
        ordering = ['-data_aplicacao']
    
    def __str__(self):
        return f"{self.nome_vacina} - {self.animal.brinco} - {self.data_aplicacao}"

class Tratamento(models.Model):
    """Registro de tratamentos realizados"""
    STATUS_CHOICES = (
        ('em_andamento', 'Em Andamento'),
        ('concluido', 'Concluído'),
        ('interrompido', 'Interrompido'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    veterinario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='tratamentos')
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='tratamentos')
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='tratamentos')
    diagnostico = models.TextField()
    tratamento = models.TextField()
    medicamentos = models.TextField(blank=True)
    data_inicio = models.DateField()
    data_fim = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='em_andamento')
    observacoes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'veterinario_tratamentos'
        ordering = ['-data_inicio']
    
    def __str__(self):
        return f"Tratamento - {self.animal.brinco} - {self.data_inicio}"

class AlertaSaude(models.Model):
    """Alertas de saúde do rebanho"""
    PRIORIDADE_CHOICES = (
        ('alta', 'Alta'),
        ('media', 'Média'),
        ('baixa', 'Baixa'),
    )
    
    TIPO_CHOICES = (
        ('doenca', 'Doença'),
        ('vacina', 'Vacina Atrasada'),
        ('tratamento', 'Tratamento Pendente'),
        ('observacao', 'Observação'),
        ('surto', 'Surto'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    veterinario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='alertas')
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='alertas_saude')
    animal = models.ForeignKey(Animal, on_delete=models.SET_NULL, null=True, blank=True, related_name='alertas')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    prioridade = models.CharField(max_length=10, choices=PRIORIDADE_CHOICES, default='media')
    titulo = models.CharField(max_length=200)
    mensagem = models.TextField()
    lido = models.BooleanField(default=False)
    data_limite = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'veterinario_alertas'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.titulo} - {self.prioridade}"

class LembreteSaude(models.Model):
    """Lembretes de saúde programados"""
    FREQUENCIA_CHOICES = (
        ('unico', 'Único'),
        ('diario', 'Diário'),
        ('semanal', 'Semanal'),
        ('mensal', 'Mensal'),
        ('anual', 'Anual'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    veterinario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='lembretes')
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='lembretes')
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    data_lembrete = models.DateField()
    frequencia = models.CharField(max_length=20, choices=FREQUENCIA_CHOICES, default='unico')
    ativo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'veterinario_lembretes'
        ordering = ['data_lembrete']
    
    def __str__(self):
        return f"{self.titulo} - {self.data_lembrete}"