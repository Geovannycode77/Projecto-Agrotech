# backend/produtor_dashboard/models.py

from django.db import models
from login_cadastro.models import CustomUser
from django.utils import timezone
import uuid
from decimal import Decimal


class Fazenda(models.Model):
    """Modelo da fazenda do produtor"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    produtor = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='fazenda')
    nome = models.CharField(max_length=200)
    cnpj = models.CharField(max_length=18, blank=True, null=True)
    area_total_hectares = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    area_util_hectares = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    endereco = models.TextField(blank=True)
    cidade = models.CharField(max_length=100, blank=True)
    estado = models.CharField(max_length=50, blank=True)
    cep = models.CharField(max_length=10, blank=True)
    telefone = models.CharField(max_length=20, blank=True)
    logo = models.ImageField(upload_to='fazendas/logos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Fazenda'
        verbose_name_plural = 'Fazendas'
    
    def __str__(self):
        return self.nome


class TipoRacao(models.Model):
    """Tipos de ração cadastrados pelo usuário"""
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='tipos_racao')
    nome = models.CharField(max_length=100)
    peso_por_saco = models.DecimalField(max_digits=10, decimal_places=2, default=50, verbose_name="Peso por saco (kg)")
    preco_por_saco = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="Preço por saco (AOA)")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['fazenda', 'nome']
        verbose_name = 'Tipo de Ração'
        verbose_name_plural = 'Tipos de Ração'
    
    def __str__(self):
        return self.nome


class EstoqueRacao(models.Model):
    """Estoque atual de ração"""
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='estoque_racao')
    tipo_racao = models.ForeignKey(TipoRacao, on_delete=models.CASCADE, related_name='estoque')
    quantidade_sacos = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Quantidade de sacos")
    estoque_minimo_sacos = models.DecimalField(max_digits=10, decimal_places=2, default=5, verbose_name="Estoque mínimo (sacos)")
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['fazenda', 'tipo_racao']
        verbose_name = 'Estoque de Ração'
        verbose_name_plural = 'Estoques de Ração'
    
    def __str__(self):
        return f"{self.tipo_racao.nome}: {self.quantidade_sacos} sacos"
    
    @property
    def alerta_estoque_baixo(self):
        return self.quantidade_sacos <= self.estoque_minimo_sacos
    
    @property
    def quantidade_kg(self):
        return self.quantidade_sacos * self.tipo_racao.peso_por_saco


class Animal(models.Model):
    """Modelo de animal do rebanho"""
    ESPECIE_CHOICES = (
        ('bovino', 'Bovino'),
    )
    
    SEXO_CHOICES = (
        ('M', 'Macho'),
        ('F', 'Fêmea'),
    )
    
    STATUS_CHOICES = (
        ('ativo', 'Ativo'),
        ('doente', 'Doente'),
        ('vendido', 'Vendido'),
        ('morto', 'Morto'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='animais')
    brinco = models.CharField(max_length=50, unique=True)
    nome = models.CharField(max_length=100, blank=True, null=True)
    especie = models.CharField(max_length=20, choices=ESPECIE_CHOICES)
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES)
    peso_atual = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    peso_nascimento = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    data_nascimento = models.DateField()
    idade_meses = models.IntegerField(default=0)
    raca = models.CharField(max_length=100, blank=True)
    cor = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ativo')
    observacoes = models.TextField(blank=True)
    foto = models.ImageField(upload_to='animais/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Animal'
        verbose_name_plural = 'Animais'
    
    def save(self, *args, **kwargs):
        if self.data_nascimento:
            hoje = timezone.now().date()
            idade = hoje.year - self.data_nascimento.year
            if hoje.month < self.data_nascimento.month or (hoje.month == self.data_nascimento.month and hoje.day < self.data_nascimento.day):
                idade -= 1
            self.idade_meses = idade * 12
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.brinco} - {self.nome or 'Sem nome'}"


class AnimalSaude(models.Model):
    """Registro de saúde do animal"""
    TIPO_CHOICES = (
        ('vacinacao', 'Vacinação'),
        ('medicacao', 'Medicação'),
        ('consulta', 'Consulta'),
        ('cirurgia', 'Cirurgia'),
        ('exame', 'Exame'),
    )
    
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='saude_registros')
    data_registro = models.DateField(default=timezone.now)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    descricao = models.TextField()
    medicamento = models.CharField(max_length=200, blank=True)
    dose = models.CharField(max_length=50, blank=True)
    veterinario = models.CharField(max_length=200, blank=True)
    custo = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    proxima_dose = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-data_registro']
        verbose_name = 'Registro de Saúde'
        verbose_name_plural = 'Registros de Saúde'
    
    def __str__(self):
        return f"{self.animal.brinco} - {self.tipo} - {self.data_registro}"


class AlimentacaoRegistro(models.Model):
    """Registro de alimentação"""
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='alimentacao_registros')
    tipo_racao = models.ForeignKey(TipoRacao, on_delete=models.CASCADE, related_name='alimentacoes')
    data = models.DateField(default=timezone.now)
    quantidade_sacos = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Quantidade de sacos")
    quantidade_kg = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    custo_total = models.DecimalField(max_digits=12, decimal_places=2, editable=False)
    observacoes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-data']
        verbose_name = 'Registro de Alimentação'
        verbose_name_plural = 'Registros de Alimentação'
    
    def save(self, *args, **kwargs):
        from decimal import Decimal
        quantidade = Decimal(str(self.quantidade_sacos))
        peso = Decimal(str(self.tipo_racao.peso_por_saco))
        preco = Decimal(str(self.tipo_racao.preco_por_saco))
        
        self.quantidade_kg = quantidade * peso
        self.custo_total = quantidade * preco
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.data} - {self.tipo_racao.nome} - {self.quantidade_sacos} sacos"


class CompraRacao(models.Model):
    """Registro de compra de ração para adicionar ao estoque"""
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='compras_racao')
    tipo_racao = models.ForeignKey(TipoRacao, on_delete=models.CASCADE, related_name='compras')
    data = models.DateField(default=timezone.now)
    quantidade_sacos = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Quantidade de sacos")
    quantidade_kg = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    valor_total = models.DecimalField(max_digits=12, decimal_places=2)
    nota_fiscal = models.CharField(max_length=100, blank=True)
    fornecedor = models.CharField(max_length=200, blank=True)
    observacoes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-data']
        verbose_name = 'Compra de Ração'
        verbose_name_plural = 'Compras de Ração'
    
    def save(self, *args, **kwargs):
        from decimal import Decimal
        quantidade = Decimal(str(self.quantidade_sacos))
        peso = Decimal(str(self.tipo_racao.peso_por_saco))
        self.quantidade_kg = quantidade * peso
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.data} - {self.tipo_racao.nome} - {self.quantidade_sacos} sacos"


class TransacaoFinanceira(models.Model):
    """Transações financeiras do produtor"""
    TIPO_CHOICES = (
        ('receita', 'Receita'),
        ('despesa', 'Despesa'),
    )
    
    CATEGORIA_CHOICES = (
        ('venda_animal', 'Venda de Animal'),
        ('venda_produto', 'Venda de Produto'),
        ('racao', 'Ração'),
        ('veterinario', 'Veterinário'),
        ('medicamentos', 'Medicamentos'),
        ('equipamentos', 'Equipamentos'),
        ('manutencao', 'Manutenção'),
        ('funcionarios', 'Funcionários'),
        ('outros', 'Outros'),
    )
    
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='transacoes')
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    categoria = models.CharField(max_length=50, choices=CATEGORIA_CHOICES)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    descricao = models.TextField()
    data = models.DateField(default=timezone.now)
    animal = models.ForeignKey(Animal, on_delete=models.SET_NULL, null=True, blank=True, related_name='transacoes')
    comprovante = models.FileField(upload_to='comprovantes/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-data']
        verbose_name = 'Transação Financeira'
        verbose_name_plural = 'Transações Financeiras'
    
    def __str__(self):
        return f"{self.tipo} - {self.categoria} - AOA {self.valor}"


class Alerta(models.Model):
    """Alertas e notificações do produtor"""
    PRIORIDADE_CHOICES = (
        ('alta', 'Alta'),
        ('media', 'Média'),
        ('baixa', 'Baixa'),
    )
    
    TIPO_CHOICES = (
        ('saude', 'Saúde'),
        ('alimentacao', 'Alimentação'),
        ('reproducao', 'Reprodução'),
        ('financeiro', 'Financeiro'),
        ('sistema', 'Sistema'),
    )
    
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='alertas')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    prioridade = models.CharField(max_length=10, choices=PRIORIDADE_CHOICES, default='media')
    titulo = models.CharField(max_length=200)
    mensagem = models.TextField()
    lido = models.BooleanField(default=False)
    data_limite = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Alerta'
        verbose_name_plural = 'Alertas'
    
    def __str__(self):
        return f"{self.titulo} - {self.prioridade}"


class Atividade(models.Model):
    """Atividades recentes do produtor"""
    TIPO_CHOICES = (
        ('cadastro', 'Cadastro'),
        ('saude', 'Saúde'),
        ('financeiro', 'Financeiro'),
        ('alimentacao', 'Alimentação'),
        ('venda', 'Venda'),
        ('compra', 'Compra'),
    )
    
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='atividades')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    descricao = models.TextField()
    usuario = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Atividade'
        verbose_name_plural = 'Atividades'
    
    def __str__(self):
        return f"{self.tipo} - {self.descricao[:50]}"


class RelatorioProducao(models.Model):
    """Relatórios de produção gerados"""
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='relatorios')
    periodo = models.CharField(max_length=50)
    data_inicio = models.DateField()
    data_fim = models.DateField()
    total_animais = models.IntegerField(default=0)
    nascimentos = models.IntegerField(default=0)
    mortes = models.IntegerField(default=0)
    vendas = models.IntegerField(default=0)
    peso_medio = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    taxa_mortalidade = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    natalidade = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    dados_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Relatório de Produção'
        verbose_name_plural = 'Relatórios de Produção'
    
    def __str__(self):
        return f"Relatório {self.periodo} - {self.fazenda.nome}"


class PreferenciasNotificacoes(models.Model):
    """Preferências de notificações para uma fazenda"""
    fazenda = models.OneToOneField(Fazenda, on_delete=models.CASCADE, related_name='preferencias_notificacoes')
    alertas_saude = models.BooleanField(default=True)
    alertas_estoque = models.BooleanField(default=True)
    alertas_relatorios = models.BooleanField(default=False)
    frequencia_saude = models.CharField(max_length=20, default='imediato')
    frequencia_estoque = models.CharField(max_length=20, default='imediato')
    frequencia_relatorios = models.CharField(max_length=20, default='mensal')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Preferência de Notificações'
        verbose_name_plural = 'Preferências de Notificações'

    def __str__(self):
        return f"Preferências - {self.fazenda.nome}"