from django.contrib.auth.models import AbstractUser
from django.db import models
from components.validators import validate_brinco, validate_telefone

# ========== USUÁRIOS ==========
class User(AbstractUser):
    ROLE_CHOICES = (
        ('produtor', 'Produtor Rural'),
        ('veterinario', 'Médico Veterinário'),
        ('funcionario', 'Funcionário'),
        ('gestor_financeiro', 'Gestor Financeiro'),
        ('administrador', 'Administrador'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='produtor')
    nome = models.CharField(max_length=255, blank=True)
    telefone = models.CharField(max_length=20, blank=True, validators=[validate_telefone])
    fazenda = models.CharField(max_length=255, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',
        blank=True
    )
    
    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"
    
    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    endereco = models.TextField(blank=True)
    cidade = models.CharField(max_length=100, blank=True)
    estado = models.CharField(max_length=50, blank=True)
    cep = models.CharField(max_length=10, blank=True)
    notificacoes_email = models.BooleanField(default=True)
    notificacoes_sms = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Perfil de {self.user.username}"
    
    class Meta:
        verbose_name = 'Perfil'
        verbose_name_plural = 'Perfis'

# ========== ANIMAIS ==========
class Animal(models.Model):
    SEXO_CHOICES = (
        ('M', 'Macho'),
        ('F', 'Fêmea'),
    )
    
    STATUS_CHOICES = (
        ('ativo', 'Ativo'),
        ('vendido', 'Vendido'),
        ('abatido', 'Abatido'),
        ('morto', 'Morto'),
    )
    
    RACA_CHOICES = (
        ('nelore', 'Nelore'),
        ('angus', 'Angus'),
        ('holandes', 'Holandês'),
        ('girolando', 'Girolando'),
        ('sindi', 'Sindi'),
        ('brahman', 'Brahman'),
        ('guzerat', 'Guzerá'),
        ('outro', 'Outro'),
    )
    
    brinco = models.CharField(max_length=20, unique=True, validators=[validate_brinco])
    nome = models.CharField(max_length=100, blank=True)
    raca = models.CharField(max_length=50, choices=RACA_CHOICES)
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES)
    data_nascimento = models.DateField()
    peso_nascimento = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    pai = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='filhos_pai')
    mae = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='filhos_mae')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ativo')
    proprietario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='animais')
    observacoes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.brinco} - {self.nome or 'Sem nome'}"
    
    def idade(self):
        from datetime import date
        hoje = date.today()
        return hoje.year - self.data_nascimento.year - (
            (hoje.month, hoje.day) < (self.data_nascimento.month, self.data_nascimento.day)
        )
    
    class Meta:
        verbose_name = 'Animal'
        verbose_name_plural = 'Animais'
        ordering = ['-created_at']

class PesoAnimal(models.Model):
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='pesagens')
    data = models.DateField(auto_now_add=True)
    peso = models.DecimalField(max_digits=6, decimal_places=2)
    observacao = models.CharField(max_length=255, blank=True)
    
    class Meta:
        verbose_name = 'Peso do Animal'
        verbose_name_plural = 'Pesagens'
        ordering = ['-data']
    
    def __str__(self):
        return f"{self.animal.brinco} - {self.peso}kg em {self.data}"

# ========== ALIMENTAÇÃO ==========
class Alimentacao(models.Model):
    TIPO_CHOICES = (
        ('concentrado', 'Concentrado'),
        ('silagem', 'Silagem'),
        ('pastagem', 'Pastagem'),
        ('suplemento', 'Suplemento Mineral'),
        ('outro', 'Outro'),
    )
    
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='alimentacoes')
    data = models.DateField(auto_now_add=True)
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)
    quantidade_kg = models.DecimalField(max_digits=6, decimal_places=2)
    custo = models.DecimalField(max_digits=8, decimal_places=2)
    observacao = models.TextField(blank=True)
    
    class Meta:
        verbose_name = 'Alimentação'
        verbose_name_plural = 'Alimentações'
        ordering = ['-data']
    
    def __str__(self):
        return f"{self.animal.brinco} - {self.tipo} - {self.quantidade_kg}kg"

# ========== SAÚDE ==========
class ConsultaVeterinaria(models.Model):
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='consultas')
    data = models.DateField()
    veterinario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, limit_choices_to={'role': 'veterinario'}, related_name='consultas')
    diagnostico = models.TextField()
    tratamento = models.TextField(blank=True)
    custo = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    observacoes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Consulta Veterinária'
        verbose_name_plural = 'Consultas Veterinárias'
        ordering = ['-data']
    
    def __str__(self):
        return f"Consulta {self.animal.brinco} - {self.data}"

class Vacina(models.Model):
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='vacinas')
    nome = models.CharField(max_length=100)
    lote = models.CharField(max_length=50, blank=True)
    data_aplicacao = models.DateField()
    data_proxima = models.DateField(null=True, blank=True)
    veterinario = models.CharField(max_length=100, blank=True)
    custo = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    observacoes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = 'Vacina'
        verbose_name_plural = 'Vacinas'
        ordering = ['-data_aplicacao']
    
    def __str__(self):
        return f"{self.animal.brinco} - {self.nome} - {self.data_aplicacao}"

# ========== FINANCEIRO ==========
class Transacao(models.Model):
    TIPO_CHOICES = (
        ('receita', 'Receita'),
        ('despesa', 'Despesa'),
    )
    
    CATEGORIA_CHOICES = (
        ('venda_animal', 'Venda de Animal'),
        ('compra_animal', 'Compra de Animal'),
        ('compra_insumo', 'Compra de Insumo'),
        ('medicamento', 'Medicamento'),
        ('alimentacao', 'Alimentação'),
        ('servico', 'Serviço'),
        ('manutencao', 'Manutenção'),
        ('salario', 'Salário'),
        ('imposto', 'Imposto'),
        ('outro', 'Outro'),
    )
    
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transacoes')
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    categoria = models.CharField(max_length=50, choices=CATEGORIA_CHOICES)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    descricao = models.CharField(max_length=255)
    data = models.DateField(auto_now_add=True)
    animal = models.ForeignKey(Animal, on_delete=models.SET_NULL, null=True, blank=True, related_name='transacoes')
    comprovante = models.FileField(upload_to='comprovantes/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Transação'
        verbose_name_plural = 'Transações'
        ordering = ['-data']
    
    def __str__(self):
        return f"{self.tipo} - {self.descricao} - R$ {self.valor}"

# ========== TAREFAS ==========
class Tarefa(models.Model):
    STATUS_CHOICES = (
        ('pendente', 'Pendente'),
        ('em_andamento', 'Em Andamento'),
        ('concluida', 'Concluída'),
        ('cancelada', 'Cancelada'),
    )
    
    PRIORIDADE_CHOICES = (
        ('baixa', 'Baixa'),
        ('media', 'Média'),
        ('alta', 'Alta'),
        ('urgente', 'Urgente'),
    )
    
    titulo = models.CharField(max_length=200)
    descricao = models.TextField(blank=True)
    responsavel = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tarefas')
    animal = models.ForeignKey(Animal, on_delete=models.SET_NULL, null=True, blank=True, related_name='tarefas')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    prioridade = models.CharField(max_length=20, choices=PRIORIDADE_CHOICES, default='media')
    data_limite = models.DateField()
    data_conclusao = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Tarefa'
        verbose_name_plural = 'Tarefas'
        ordering = ['-prioridade', 'data_limite']
    
    def __str__(self):
        return f"{self.titulo} - {self.status}"

# ========== INSUMOS ==========
class Insumo(models.Model):
    CATEGORIA_CHOICES = (
        ('racao', 'Ração'),
        ('medicamento', 'Medicamento'),
        ('vacina', 'Vacina'),
        ('ferramenta', 'Ferramenta'),
        ('equipamento', 'Equipamento'),
        ('outro', 'Outro'),
    )
    
    UNIDADE_CHOICES = (
        ('kg', 'Quilograma'),
        ('g', 'Grama'),
        ('l', 'Litro'),
        ('ml', 'Mililitro'),
        ('un', 'Unidade'),
        ('cx', 'Caixa'),
    )
    
    nome = models.CharField(max_length=100)
    categoria = models.CharField(max_length=50, choices=CATEGORIA_CHOICES)
    quantidade = models.DecimalField(max_digits=10, decimal_places=2)
    unidade = models.CharField(max_length=20, choices=UNIDADE_CHOICES)
    preco_unitario = models.DecimalField(max_digits=8, decimal_places=2)
    fornecedor = models.CharField(max_length=100, blank=True)
    estoque_minimo = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    localizacao = models.CharField(max_length=100, blank=True)
    validade = models.DateField(null=True, blank=True)
    observacoes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Insumo'
        verbose_name_plural = 'Insumos'
        ordering = ['categoria', 'nome']
    
    def __str__(self):
        return f"{self.nome} - {self.quantidade} {self.unidade}"
    
    def valor_total(self):
        return self.quantidade * self.preco_unitario

# ========== NOTIFICAÇÕES ==========
class Notificacao(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notificacoes')
    titulo = models.CharField(max_length=200)
    mensagem = models.TextField()
    lida = models.BooleanField(default=False)
    data_criacao = models.DateTimeField(auto_now_add=True)
    link = models.CharField(max_length=255, blank=True)
    
    class Meta:
        verbose_name = 'Notificação'
        verbose_name_plural = 'Notificações'
        ordering = ['-data_criacao']
    
    def __str__(self):
        return f"{self.titulo} - {self.usuario.username}"
