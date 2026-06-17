# backend/Gestor_financeiro_dashboard/models.py

from django.db import models
from login_cadastro.models import CustomUser
from django.utils import timezone
import uuid

# NÃO importe Fazenda e Animal diretamente - use strings
class GestorFinanceiro(models.Model):
    """Modelo do gestor financeiro vinculado a uma fazenda"""
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='gestor_financeiro_perfil')
    fazenda = models.ForeignKey('produtor_dashboard.Fazenda', on_delete=models.CASCADE, related_name='gestores_financeiros')
    departamento = models.CharField(max_length=100, default='Financeiro')
    nivel_acesso = models.CharField(max_length=20, choices=(
        ('basico', 'Básico'),
        ('avancado', 'Avançado'),
        ('total', 'Total'),
    ), default='avancado')
    ativo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'gestor_financeiro'
        verbose_name = 'Gestor Financeiro'
        verbose_name_plural = 'Gestores Financeiros'
    
    def __str__(self):
        return f"{self.user.email} - {self.fazenda.nome if self.fazenda else 'Sem fazenda'}"


class Receita(models.Model):
    """Registro de receitas da fazenda"""
    CATEGORIA_CHOICES = (
        ('venda_animal', 'Venda de Animal'),
        ('venda_produto', 'Venda de Produto'),
        ('venda_leite', 'Venda de Leite'),
        ('subsidio', 'Subsídio/Governo'),
        ('emprestimo', 'Empréstimo'),
        ('outros', 'Outros'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fazenda = models.ForeignKey('produtor_dashboard.Fazenda', on_delete=models.CASCADE, related_name='receitas')
    gestor = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='receitas_registradas')
    categoria = models.CharField(max_length=50, choices=CATEGORIA_CHOICES)
    valor = models.DecimalField(max_digits=12, decimal_places=2)
    descricao = models.TextField()
    data = models.DateField(default=timezone.now)
    animal = models.ForeignKey('produtor_dashboard.Animal', on_delete=models.SET_NULL, null=True, blank=True, related_name='receitas')
    comprovante = models.FileField(upload_to='comprovantes/receitas/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'gestor_receitas'
        ordering = ['-data']
        verbose_name = 'Receita'
        verbose_name_plural = 'Receitas'
    
    def __str__(self):
        return f"{self.categoria} - AOA {self.valor} - {self.data}"


class Despesa(models.Model):
    """Registro de despesas da fazenda"""
    CATEGORIA_CHOICES = (
        ('racao', 'Ração'),
        ('veterinario', 'Veterinário'),
        ('medicamentos', 'Medicamentos'),
        ('equipamentos', 'Equipamentos'),
        ('manutencao', 'Manutenção'),
        ('funcionarios', 'Funcionários'),
        ('energia', 'Energia'),
        ('agua', 'Água'),
        ('transporte', 'Transporte'),
        ('impostos', 'Impostos'),
        ('outros', 'Outros'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fazenda = models.ForeignKey('produtor_dashboard.Fazenda', on_delete=models.CASCADE, related_name='despesas')
    gestor = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='despesas_registradas')
    categoria = models.CharField(max_length=50, choices=CATEGORIA_CHOICES)
    valor = models.DecimalField(max_digits=12, decimal_places=2)
    descricao = models.TextField()
    data = models.DateField(default=timezone.now)
    animal = models.ForeignKey('produtor_dashboard.Animal', on_delete=models.SET_NULL, null=True, blank=True, related_name='despesas')
    comprovante = models.FileField(upload_to='comprovantes/despesas/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'gestor_despesas'
        ordering = ['-data']
        verbose_name = 'Despesa'
        verbose_name_plural = 'Despesas'
    
    def __str__(self):
        return f"{self.categoria} - AOA {self.valor} - {self.data}"


class MetaFinanceira(models.Model):
    """Metas financeiras da fazenda"""
    TIPO_CHOICES = (
        ('receita', 'Receita'),
        ('despesa', 'Despesa'),
        ('lucro', 'Lucro'),
    )
    
    PERIODO_CHOICES = (
        ('mensal', 'Mensal'),
        ('trimestral', 'Trimestral'),
        ('semestral', 'Semestral'),
        ('anual', 'Anual'),
    )
    
    fazenda = models.ForeignKey('produtor_dashboard.Fazenda', on_delete=models.CASCADE, related_name='metas_financeiras')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    periodo = models.CharField(max_length=20, choices=PERIODO_CHOICES)
    valor_meta = models.DecimalField(max_digits=12, decimal_places=2)
    ano = models.IntegerField(default=timezone.now().year)
    mes = models.IntegerField(null=True, blank=True)
    descricao = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'gestor_metas'
        unique_together = ['fazenda', 'tipo', 'periodo', 'ano', 'mes']
    
    def __str__(self):
        return f"{self.tipo} - {self.periodo} - AOA {self.valor_meta}"


class AtividadeFinanceira(models.Model):
    """Registro de atividades financeiras (para o dashboard)"""
    TIPO_CHOICES = (
        ('receita', 'Receita'),
        ('despesa', 'Despesa'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fazenda = models.ForeignKey('produtor_dashboard.Fazenda', on_delete=models.CASCADE, related_name='atividades_financeiras')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    valor = models.DecimalField(max_digits=12, decimal_places=2)
    descricao = models.TextField()
    categoria = models.CharField(max_length=50)
    data = models.DateField(default=timezone.now)
    usuario = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'gestor_atividades'
        ordering = ['-data']
        verbose_name = 'Atividade Financeira'
        verbose_name_plural = 'Atividades Financeiras'
    
    def __str__(self):
        return f"{self.tipo} - {self.valor} - {self.data}"


class RelatorioFinanceiro(models.Model):
    """Relatórios financeiros gerados"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fazenda = models.ForeignKey('produtor_dashboard.Fazenda', on_delete=models.CASCADE, related_name='relatorios_financeiros')
    titulo = models.CharField(max_length=200)
    periodo_inicio = models.DateField()
    periodo_fim = models.DateField()
    total_receitas = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_despesas = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    lucro_liquido = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    margem_lucro = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    dados_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'gestor_relatorios'
        ordering = ['-created_at']
        verbose_name = 'Relatório Financeiro'
        verbose_name_plural = 'Relatórios Financeiros'
    
    def __str__(self):
        return f"{self.titulo} - {self.periodo_inicio} a {self.periodo_fim}"