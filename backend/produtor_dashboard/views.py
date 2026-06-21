from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from datetime import timedelta, date
from funcionario_dashboard.models import Ocorrencia
from django_filters.rest_framework import DjangoFilterBackend
from login_cadastro.models import CustomUser
from login_cadastro.permissions import ModulePermission
from .models import (
    Fazenda, Animal, AnimalSaude, 
    TipoRacao, EstoqueRacao,
    AlimentacaoRegistro, CompraRacao,
    TransacaoFinanceira, Alerta,
    Atividade, RelatorioProducao
)
from .serializers import (
    FazendaSerializer, AnimalSerializer, AnimalSaudeSerializer,
    TipoRacaoSerializer, EstoqueRacaoSerializer,
    AlimentacaoRegistroSerializer, CompraRacaoSerializer,
    TransacaoFinanceiraSerializer, AlertaSerializer,
    AtividadeSerializer, RelatorioProducaoSerializer
)
from .serializers import PreferenciasNotificacoesSerializer
from .models import PreferenciasNotificacoes

class IsProdutorOrAdmin(IsAuthenticated):
    """Permissão para produtores e administradores"""
    def has_permission(self, request, view):
        # Verificar autenticação básica
        is_authenticated = super().has_permission(request, view)
        
        print(f"\n{'='*60}")
        print(f"🔍 IsProdutorOrAdmin - Verificação de Permissão")
        print(f"{'='*60}")
        print(f"📍 View: {view.__class__.__name__}")
        print(f"👤 User Autenticado: {is_authenticated}")
        
        if is_authenticated:
            print(f"📧 Email: {request.user.email}")
            print(f"🎭 Role: {request.user.role}")
            print(f"🔑 Is Superuser: {request.user.is_superuser}")
            print(f"✅ É Produtor: {request.user.role == 'produtor'}")
            print(f"✅ É Admin: {request.user.role == 'administrador'}")
            
            has_role_permission = (
                request.user.role == 'produtor' or 
                request.user.role == 'administrador' or 
                request.user.is_superuser
            )
            print(f"🎯 Tem Permissão de Role: {has_role_permission}")
            print(f"{'='*60}\n")
            
            return has_role_permission
        else:
            print(f"❌ Usuário não autenticado!")
            print(f"{'='*60}\n")
            return False

class FazendaViewSet(viewsets.ModelViewSet):
    serializer_class = FazendaSerializer
    permission_classes = [IsProdutorOrAdmin, ModulePermission('fazenda')]
    
    def get_queryset(self):
        if self.request.user.role == 'produtor':
            return Fazenda.objects.filter(produtor=self.request.user)
        return Fazenda.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(produtor=self.request.user)

class AnimalViewSet(viewsets.ModelViewSet):
    serializer_class = AnimalSerializer
    permission_classes = [IsProdutorOrAdmin, ModulePermission('animais')]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['especie', 'sexo', 'status']
    search_fields = ['brinco', 'nome', 'raca']
    ordering_fields = ['peso_atual', 'data_nascimento', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        if self.request.user.role == 'produtor':
            return Animal.objects.filter(fazenda__produtor=self.request.user)
        return Animal.objects.all()
    
    def update(self, request, *args, **kwargs):
        print("=" * 50)
        print("🔵 Atualizando animal...")
        print(f"📝 Dados recebidos: {request.data}")
        print(f"🔑 ID do animal: {kwargs.get('pk')}")
        
        data = request.data.copy()
        if 'especie' not in data or not data['especie']:
            data['especie'] = 'bovino'
            print("➕ Adicionando especie: bovino (padrão)")
        
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=data, partial=partial)
        
        if not serializer.is_valid():
            print("❌ Erros de validação:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_update(serializer)
        print("✅ Animal atualizado com sucesso!")
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        fazenda = Fazenda.objects.get(produtor=self.request.user)
        animal = serializer.save(fazenda=fazenda)
        
        Atividade.objects.create(
            fazenda=fazenda,
            tipo='cadastro',
            descricao=f'Novo animal cadastrado: {animal.brinco} - {animal.nome or "Sem nome"}',
            usuario=self.request.user
        )
    
    @action(detail=True, methods=['get'])
    def saude(self, request, pk=None):
        animal = self.get_object()
        registros = animal.saude_registros.all()
        serializer = AnimalSaudeSerializer(registros, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def registrar_saude(self, request, pk=None):
        animal = self.get_object()
        serializer = AnimalSaudeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(animal=animal)
            
            Atividade.objects.create(
                fazenda=animal.fazenda,
                tipo='saude',
                descricao=f'Registro de saúde para {animal.brinco}: {serializer.validated_data["tipo"]}',
                usuario=self.request.user
            )
            
            # Criar alerta de saúde para o produtor
            try:
                tipo_evento = serializer.validated_data.get('tipo')
                titulo = f"Alerta de Saúde: {animal.brinco}"
                mensagem = f"Registro de {tipo_evento} para o animal {animal.brinco}. Verifique o histórico de saúde."
                existe = Alerta.objects.filter(fazenda=animal.fazenda, titulo=titulo, lido=False).exists()
                if not existe:
                    prioridade = 'alta' if tipo_evento in ['vacinacao', 'medicacao'] else 'media'
                    Alerta.objects.create(
                        fazenda=animal.fazenda,
                        tipo='saude',
                        prioridade=prioridade,
                        titulo=titulo,
                        mensagem=mensagem,
                        lido=False
                    )
            except Exception as e:
                print(f"Erro ao criar alerta de saúde: {e}")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        queryset = self.get_queryset()
        
        por_especie = {}
        for especie, _ in Animal.ESPECIE_CHOICES:
            count = queryset.filter(especie=especie).count()
            if count > 0:
                por_especie[especie] = count
        
        por_status = {}
        for status, _ in Animal.STATUS_CHOICES:
            count = queryset.filter(status=status).count()
            if count > 0:
                por_status[status] = count
        
        stats = {
            'total': queryset.count(),
            'por_especie': por_especie,
            'por_status': por_status,
            'machos': queryset.filter(sexo='M').count(),
            'femeas': queryset.filter(sexo='F').count(),
            'novos_ultimo_mes': queryset.filter(
                data_nascimento__gte=timezone.now() - timedelta(days=30)
            ).count()
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def ultimos(self, request):
        limit = int(request.query_params.get('limit', 5))
        animais = self.get_queryset()[:limit]
        serializer = self.get_serializer(animais, many=True)
        return Response(serializer.data)


class TipoRacaoViewSet(viewsets.ModelViewSet):
    serializer_class = TipoRacaoSerializer
    permission_classes = [IsProdutorOrAdmin, ModulePermission('producao')]
    
    def get_queryset(self):
        if self.request.user.role == 'produtor':
            try:
                fazenda = Fazenda.objects.get(produtor=self.request.user)
                return TipoRacao.objects.filter(fazenda=fazenda)
            except Fazenda.DoesNotExist:
                return TipoRacao.objects.none()
        return TipoRacao.objects.all()
    
    def perform_create(self, serializer):
        fazenda = Fazenda.objects.get(produtor=self.request.user)
        serializer.save(fazenda=fazenda)


class EstoqueRacaoViewSet(viewsets.ModelViewSet):
    serializer_class = EstoqueRacaoSerializer
    permission_classes = [IsProdutorOrAdmin, ModulePermission('producao')]
    
    def get_queryset(self):
        if self.request.user.role == 'produtor':
            try:
                fazenda = Fazenda.objects.get(produtor=self.request.user)
                return EstoqueRacao.objects.filter(fazenda=fazenda)
            except Fazenda.DoesNotExist:
                return EstoqueRacao.objects.none()
        return EstoqueRacao.objects.all()
    
    def perform_create(self, serializer):
        fazenda = Fazenda.objects.get(produtor=self.request.user)
        serializer.save(fazenda=fazenda)
    
    def create(self, request, *args, **kwargs):
        try:
            fazenda = Fazenda.objects.get(produtor=request.user)
        except Fazenda.DoesNotExist:
            return Response(
                {'error': 'Fazenda não encontrada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = request.data.copy()
        data['fazenda'] = fazenda.id
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AlimentacaoViewSet(viewsets.ModelViewSet):
    serializer_class = AlimentacaoRegistroSerializer
    permission_classes = [IsProdutorOrAdmin, ModulePermission('producao')]
    
    def get_queryset(self):
        if self.request.user.role == 'produtor':
            try:
                fazenda = Fazenda.objects.get(produtor=self.request.user)
                return AlimentacaoRegistro.objects.filter(fazenda=fazenda)
            except Fazenda.DoesNotExist:
                return AlimentacaoRegistro.objects.none()
        return AlimentacaoRegistro.objects.all()
    
    def create(self, request, *args, **kwargs):
        from decimal import Decimal
        
        print("=" * 50)
        print("📝 Criando registro de alimentação")
        print(f"Dados recebidos: {request.data}")
        
        try:
            fazenda = Fazenda.objects.get(produtor=request.user)
            print(f"🏠 Fazenda encontrada: {fazenda.nome}")
        except Fazenda.DoesNotExist:
            print("❌ Fazenda não encontrada!")
            return Response(
                {'error': 'Fazenda não encontrada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tipo_racao_id = request.data.get('tipo_racao')
        if not tipo_racao_id:
            return Response(
                {'error': 'tipo_racao é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            tipo_racao = TipoRacao.objects.get(id=tipo_racao_id, fazenda=fazenda)
            print(f"🍽️ Tipo de ração: {tipo_racao.nome}")
        except TipoRacao.DoesNotExist:
            return Response(
                {'error': 'Tipo de ração não encontrado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        quantidade_sacos = Decimal(str(request.data.get('quantidade_sacos', 0)))
        if quantidade_sacos <= 0:
            return Response(
                {'error': 'quantidade_sacos deve ser maior que 0'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        quantidade_kg = quantidade_sacos * tipo_racao.peso_por_saco
        custo_total = quantidade_sacos * tipo_racao.preco_por_saco
        
        registro = AlimentacaoRegistro.objects.create(
            fazenda=fazenda,
            tipo_racao=tipo_racao,
            data=request.data.get('data', timezone.now().date()),
            quantidade_sacos=quantidade_sacos,
            quantidade_kg=quantidade_kg,
            custo_total=custo_total,
            observacoes=request.data.get('observacoes', '')
        )
        
        print(f"✅ Registro criado: {registro.id}")
        
        estoque, created = EstoqueRacao.objects.get_or_create(
            fazenda=fazenda,
            tipo_racao=tipo_racao,
            defaults={'estoque_minimo_sacos': Decimal('5')}
        )
        estoque.quantidade_sacos = estoque.quantidade_sacos - quantidade_sacos
        estoque.save()
        print(f"📦 Estoque atualizado: {estoque.quantidade_sacos} sacos restantes")

        # Criar alerta se o estoque ficar abaixo do limite de alerta usado pelo frontend
        try:
            if estoque.quantidade_sacos < 10:
                titulo = f"Estoque baixo: {tipo_racao.nome}"
                mensagem = f"O estoque de {tipo_racao.nome} está com {estoque.quantidade_sacos} sacos. Reabasteça o estoque."
                existe = Alerta.objects.filter(fazenda=fazenda, titulo=titulo, lido=False).exists()
                if not existe:
                    prioridade = 'alta' if float(estoque.quantidade_sacos) <= 1 else 'media'
                    Alerta.objects.create(
                        fazenda=fazenda,
                        tipo='alimentacao',
                        prioridade=prioridade,
                        titulo=titulo,
                        mensagem=mensagem,
                        lido=False
                    )
        except Exception as e:
            print(f"Erro ao criar alerta de estoque baixo: {e}")
        
        Atividade.objects.create(
            fazenda=fazenda,
            tipo='alimentacao',
            descricao=f'Registro de alimentação: {quantidade_sacos} sacos de {tipo_racao.nome}',
            usuario=request.user
        )
        
        serializer = self.get_serializer(registro)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def estoque(self, request):
        try:
            fazenda = Fazenda.objects.get(produtor=request.user)
            tipos_racao = TipoRacao.objects.filter(fazenda=fazenda)
            
            racas = []
            for tipo in tipos_racao:
                try:
                    estoque = EstoqueRacao.objects.get(fazenda=fazenda, tipo_racao=tipo)
                    quantidade_sacos = float(estoque.quantidade_sacos)
                except EstoqueRacao.DoesNotExist:
                    quantidade_sacos = 0
                
                racas.append({
                    'id': tipo.id,
                    'nome': tipo.nome,
                    'peso_por_saco': float(tipo.peso_por_saco),
                    'preco_por_saco': float(tipo.preco_por_saco),
                    'quantidade_sacos': quantidade_sacos,
                    'quantidade_kg': quantidade_sacos * float(tipo.peso_por_saco),
                    'estoque_minimo': 5
                })
            
            return Response({'racas': racas})
        except Fazenda.DoesNotExist:
            return Response({'racas': []})
    
    @action(detail=False, methods=['get'])
    def consumo_mensal(self, request):
        try:
            fazenda = Fazenda.objects.get(produtor=request.user)
            hoje = timezone.now().date()
            inicio_mes = date(hoje.year, hoje.month, 1)
            
            consumo = AlimentacaoRegistro.objects.filter(
                fazenda=fazenda,
                data__gte=inicio_mes
            ).aggregate(
                total_kg=Sum('quantidade_kg'),
                total_custo=Sum('custo_total')
            )
            
            return Response({
                'consumo_mensal': float(consumo['total_kg'] or 0),
                'custo_mensal': float(consumo['total_custo'] or 0),
                'estoque_atual': EstoqueRacao.objects.filter(fazenda=fazenda).aggregate(
                    total=Sum('quantidade_sacos')
                )['total'] or 0
            })
        except Fazenda.DoesNotExist:
            return Response({'consumo_mensal': 0, 'custo_mensal': 0, 'estoque_atual': 0})
    
    @action(detail=False, methods=['get'])
    def consumo_diario(self, request):
        try:
            fazenda = Fazenda.objects.get(produtor=request.user)
            hoje = timezone.now().date()
            consumo_hoje = AlimentacaoRegistro.objects.filter(
                fazenda=fazenda,
                data=hoje
            ).aggregate(
                total_kg=Sum('quantidade_kg'),
                total_custo=Sum('custo_total')
            )
            
            total_animais = Animal.objects.filter(fazenda=fazenda, status='ativo').count()
            
            consumo_total_kg = float(consumo_hoje['total_kg'] or 0)
            custo_total = float(consumo_hoje['total_custo'] or 0)
            
            if total_animais > 0 and consumo_total_kg > 0:
                consumo_por_animal = consumo_total_kg / total_animais
            else:
                consumo_por_animal = 0
            
            if consumo_total_kg > 0:
                sacos_por_dia = consumo_total_kg / 50
            else:
                sacos_por_dia = 0
            
            return Response({
                'total': round(consumo_total_kg, 2),
                'por_animal': round(consumo_por_animal, 2),
                'sacos_por_dia': round(sacos_por_dia, 2),
                'custo_diario': round(custo_total, 2),
                'custo_mensal': round(custo_total * 30, 2)
            })
        except Fazenda.DoesNotExist:
            return Response({
                'total': 0,
                'por_animal': 0,
                'sacos_por_dia': 0,
                'custo_diario': 0,
                'custo_mensal': 0
            })


class CompraRacaoViewSet(viewsets.ModelViewSet):
    serializer_class = CompraRacaoSerializer
    permission_classes = [IsProdutorOrAdmin, ModulePermission('producao')]
    
    def get_queryset(self):
        if self.request.user.role == 'produtor':
            try:
                fazenda = Fazenda.objects.get(produtor=self.request.user)
                return CompraRacao.objects.filter(fazenda=fazenda)
            except Fazenda.DoesNotExist:
                return CompraRacao.objects.none()
        return CompraRacao.objects.all()
    
    def create(self, request, *args, **kwargs):
        from decimal import Decimal
        
        print("=" * 40)
        print("📝 Criando compra de ração")
        print(f"Dados recebidos: {request.data}")
        
        try:
            fazenda = Fazenda.objects.get(produtor=request.user)
            print(f"🏠 Fazenda: {fazenda.nome}")
        except Fazenda.DoesNotExist:
            return Response(
                {'error': 'Fazenda não encontrada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tipo_racao_id = request.data.get('tipo_racao')
        if not tipo_racao_id:
            return Response(
                {'error': 'tipo_racao é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            tipo_racao = TipoRacao.objects.get(id=tipo_racao_id, fazenda=fazenda)
            print(f"🍽️ Tipo de ração: {tipo_racao.nome}")
        except TipoRacao.DoesNotExist:
            return Response(
                {'error': 'Tipo de ração não encontrado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        quantidade_sacos = Decimal(str(request.data.get('quantidade_sacos', 0)))
        if quantidade_sacos <= 0:
            return Response(
                {'error': 'quantidade_sacos deve ser maior que 0'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valor_total = Decimal(str(request.data.get('valor_total', 0)))
        if valor_total <= 0:
            valor_total = quantidade_sacos * tipo_racao.preco_por_saco
        
        compra = CompraRacao.objects.create(
            fazenda=fazenda,
            tipo_racao=tipo_racao,
            data=request.data.get('data', timezone.now().date()),
            quantidade_sacos=quantidade_sacos,
            valor_total=valor_total,
            fornecedor=request.data.get('fornecedor', ''),
            observacoes=request.data.get('observacoes', '')
        )
        
        print(f"✅ Compra criada: {compra.id}")
        
        estoque, created = EstoqueRacao.objects.get_or_create(
            fazenda=fazenda,
            tipo_racao=tipo_racao,
            defaults={'estoque_minimo_sacos': Decimal('5')}
        )
        estoque.quantidade_sacos = estoque.quantidade_sacos + quantidade_sacos
        estoque.save()
        print(f"📦 Estoque atualizado: {estoque.quantidade_sacos} sacos")
        
        Atividade.objects.create(
            fazenda=fazenda,
            tipo='compra',
            descricao=f'Compra de {quantidade_sacos} sacos de {tipo_racao.nome}',
            usuario=request.user
        )
        
        serializer = self.get_serializer(compra)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FinanceiroViewSet(viewsets.ModelViewSet):
    serializer_class = TransacaoFinanceiraSerializer
    permission_classes = [IsProdutorOrAdmin, ModulePermission('financas')]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['tipo', 'categoria']
    ordering_fields = ['data', 'valor']
    ordering = ['-data']
    
    def get_queryset(self):
        if self.request.user.role == 'produtor':
            return TransacaoFinanceira.objects.filter(fazenda__produtor=self.request.user)
        return TransacaoFinanceira.objects.all()
    
    def create(self, request, *args, **kwargs):
        from decimal import Decimal
        
        try:
            fazenda = Fazenda.objects.get(produtor=request.user)
        except Fazenda.DoesNotExist:
            return Response(
                {'error': 'Fazenda não encontrada. Complete seu cadastro primeiro.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            transacao = TransacaoFinanceira.objects.create(
                fazenda=fazenda,
                tipo=request.data.get('tipo'),
                categoria=request.data.get('categoria'),
                valor=Decimal(str(request.data.get('valor', 0))),
                descricao=request.data.get('descricao', ''),
                data=request.data.get('data', timezone.now().date())
            )
            
            serializer = self.get_serializer(transacao)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Erro ao criar transação: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def resumo(self, request):
        try:
            fazenda = Fazenda.objects.get(produtor=request.user)
        except Fazenda.DoesNotExist:
            return Response({
                'total_receitas': 0,
                'total_despesas': 0,
                'saldo': 0,
                'receitas_por_categoria': {},
                'despesas_por_categoria': {}
            })
        
        periodo = request.query_params.get('periodo', 'ultimo_mes')
        hoje = timezone.now().date()
        
        if periodo == 'ultimo_mes':
            data_inicio = hoje - timedelta(days=30)
        elif periodo == 'ultimo_trimestre':
            data_inicio = hoje - timedelta(days=90)
        elif periodo == 'ultimo_ano':
            data_inicio = hoje - timedelta(days=365)
        else:
            data_inicio = date(hoje.year, hoje.month, 1)
        
        transacoes = TransacaoFinanceira.objects.filter(
            fazenda=fazenda,
            data__gte=data_inicio
        )
        
        receitas = transacoes.filter(tipo='receita')
        despesas = transacoes.filter(tipo='despesa')
        
        receitas_por_categoria = {}
        for item in receitas.values('categoria').annotate(total=Sum('valor')):
            receitas_por_categoria[item['categoria']] = float(item['total'])
        
        despesas_por_categoria = {}
        for item in despesas.values('categoria').annotate(total=Sum('valor')):
            despesas_por_categoria[item['categoria']] = float(item['total'])
        
        return Response({
            'total_receitas': float(receitas.aggregate(total=Sum('valor'))['total'] or 0),
            'total_despesas': float(despesas.aggregate(total=Sum('valor'))['total'] or 0),
            'saldo': float((receitas.aggregate(total=Sum('valor'))['total'] or 0) - 
                           (despesas.aggregate(total=Sum('valor'))['total'] or 0)),
            'receitas_por_categoria': receitas_por_categoria,
            'despesas_por_categoria': despesas_por_categoria,
        })


class AlertaViewSet(viewsets.ModelViewSet):
    serializer_class = AlertaSerializer
    permission_classes = [IsProdutorOrAdmin, ModulePermission('dashboard')]
    
    def get_queryset(self):
        if self.request.user.role == 'produtor':
            return Alerta.objects.filter(fazenda__produtor=self.request.user)
        return Alerta.objects.all()
    
    @action(detail=True, methods=['post'])
    def marcar_lido(self, request, pk=None):
        alerta = self.get_object()
        alerta.lido = True
        alerta.save()
        return Response({'message': 'Alerta marcado como lido'})
    
    @action(detail=False, methods=['post'])
    def marcar_todos_lidos(self, request):
        self.get_queryset().update(lido=True)
        return Response({'message': 'Todos alertas marcados como lidos'})


class AtividadeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AtividadeSerializer
    permission_classes = [IsProdutorOrAdmin, ModulePermission('dashboard')]
    
    def get_queryset(self):
        if self.request.user.role == 'produtor':
            return Atividade.objects.filter(fazenda__produtor=self.request.user)[:50]
        return Atividade.objects.all()[:50]


class RelatorioViewSet(viewsets.ModelViewSet):
    serializer_class = RelatorioProducaoSerializer
    permission_classes = [IsProdutorOrAdmin, ModulePermission('relatorios')]
    
    def get_queryset(self):
        if self.request.user.role == 'produtor':
            return RelatorioProducao.objects.filter(fazenda__produtor=self.request.user)
        return RelatorioProducao.objects.all()
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().order_by('-created_at')[:10]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], url_path='gerar', url_name='gerar')
    def gerar(self, request):
        try:
            fazenda = Fazenda.objects.get(produtor=request.user)
            periodo = request.data.get('periodo', 'ultimo_mes')
            
            hoje = timezone.now().date()
            
            if periodo == 'ultimo_mes':
                data_inicio = hoje - timedelta(days=30)
            elif periodo == 'ultimo_trimestre':
                data_inicio = hoje - timedelta(days=90)
            else:
                data_inicio = date(hoje.year, hoje.month, 1)
            
            animais = Animal.objects.filter(fazenda=fazenda)
            animais_periodo = Animal.objects.filter(
                fazenda=fazenda,
                created_at__gte=data_inicio
            )
            
            total_animais = animais.count()
            nascimentos = animais_periodo.count()
            mortes = animais.filter(
                status='morto',
                updated_at__gte=data_inicio
            ).count()
            vendas = animais.filter(
                status='vendido',
                updated_at__gte=data_inicio
            ).count()
            
            peso_medio = animais.filter(status='ativo').aggregate(
                media=Avg('peso_atual')
            )['media'] or 0
            
            taxa_mortalidade = (mortes / total_animais * 100) if total_animais > 0 else 0
            natalidade = (nascimentos / total_animais * 100) if total_animais > 0 else 0
            
            relatorio = RelatorioProducao.objects.create(
                fazenda=fazenda,
                periodo=periodo,
                data_inicio=data_inicio,
                data_fim=hoje,
                total_animais=total_animais,
                nascimentos=nascimentos,
                mortes=mortes,
                vendas=vendas,
                peso_medio=peso_medio,
                taxa_mortalidade=taxa_mortalidade,
                natalidade=natalidade,
            )

            # Criar alerta informando que o relatório foi gerado
            try:
                titulo = f"Relatório gerado: {periodo}"
                mensagem = f"Relatório de produção ({periodo}) gerado com {total_animais} animais, {nascimentos} nascimentos."
                existe = Alerta.objects.filter(fazenda=fazenda, titulo=titulo, lido=False).exists()
                if not existe:
                    Alerta.objects.create(
                        fazenda=fazenda,
                        tipo='reproducao',
                        prioridade='baixa',
                        titulo=titulo,
                        mensagem=mensagem,
                        lido=False
                    )
            except Exception as e:
                print(f"Erro ao criar alerta de relatório: {e}")
            
            return Response({
                'id': relatorio.id,
                'periodo': periodo,
                'total_animais': total_animais,
                'nascimentos': nascimentos,
                'mortes': mortes,
                'vendas': vendas,
                'peso_medio': float(peso_medio),
                'taxa_mortalidade': round(taxa_mortalidade, 2),
                'natalidade': round(natalidade, 2),
            }, status=201)
        except Fazenda.DoesNotExist:
            return Response({'error': 'Fazenda não encontrada'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    @action(detail=True, methods=['get'], url_path='download', url_name='download')
    def download(self, request, pk=None):
        """Download do relatório em PDF"""
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.lib import colors
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import cm
            from django.http import HttpResponse
            import io
            
            relatorio = self.get_object()
            
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4)
            styles = getSampleStyleSheet()
            story = []
            
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=16,
                textColor=colors.HexColor('#1a5d1a'),
                alignment=1
            )
            story.append(Paragraph("RELATÓRIO DE PRODUÇÃO", title_style))
            story.append(Spacer(1, 0.5*cm))
            
            info_style = styles['Normal']
            story.append(Paragraph(f"<b>Período:</b> {relatorio.get_periodo_display()}", info_style))
            story.append(Paragraph(f"<b>Data Início:</b> {relatorio.data_inicio}", info_style))
            story.append(Paragraph(f"<b>Data Fim:</b> {relatorio.data_fim}", info_style))
            story.append(Paragraph(f"<b>Gerado em:</b> {timezone.now().strftime('%d/%m/%Y %H:%M:%S')}", info_style))
            story.append(Spacer(1, 0.5*cm))
            
            data = [
                ['Indicador', 'Valor'],
                ['Total de Animais', str(relatorio.total_animais)],
                ['Nascimentos', str(relatorio.nascimentos)],
                ['Mortes', str(relatorio.mortes)],
                ['Vendas', str(relatorio.vendas)],
                ['Peso Médio', f"{relatorio.peso_medio} kg"],
                ['Taxa de Mortalidade', f"{relatorio.taxa_mortalidade}%"],
                ['Taxa de Natalidade', f"{relatorio.natalidade}%"],
            ]
            
            table = Table(data, colWidths=[6*cm, 6*cm])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a5d1a')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            story.append(table)
            story.append(Spacer(1, 1*cm))
            
            footer_style = ParagraphStyle(
                'Footer',
                parent=styles['Normal'],
                fontSize=8,
                textColor=colors.grey,
                alignment=1
            )
            story.append(Paragraph("AgroTech - Sistema de Gestão de Gado", footer_style))
            
            doc.build(story)
            buffer.seek(0)
            
            response = HttpResponse(buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="relatorio_{relatorio.id}.pdf"'
            return response
        except ImportError:
            content = f"""RELATÓRIO DE PRODUÇÃO
Período: {relatorio.get_periodo_display()}
Data Início: {relatorio.data_inicio}
Data Fim: {relatorio.data_fim}

RESUMO
Total de Animais: {relatorio.total_animais}
Nascimentos: {relatorio.nascimentos}
Mortes: {relatorio.mortes}
Vendas: {relatorio.vendas}
Peso Médio: {relatorio.peso_medio} kg
Taxa de Mortalidade: {relatorio.taxa_mortalidade}%
Taxa de Natalidade: {relatorio.natalidade}%

Gerado em: {timezone.now().strftime('%d/%m/%Y %H:%M:%S')}
"""
            response = HttpResponse(content, content_type='text/plain')
            response['Content-Disposition'] = f'attachment; filename="relatorio_{relatorio.id}.txt"'
            return response
        except Exception as e:
            return Response({'error': str(e)}, status=400)


@api_view(['GET'])
@permission_classes([IsProdutorOrAdmin, ModulePermission('producao')])
def get_indicadores_producao(request):
    """Retorna indicadores de produção para o dashboard"""
    try:
        fazenda = Fazenda.objects.get(produtor=request.user)
        
        hoje = timezone.now().date()
        inicio_mes = date(hoje.year, hoje.month, 1)
        
        # Total de animais
        total_animais = Animal.objects.filter(fazenda=fazenda).count()
        
        # Nascimentos do mês (animais com data de nascimento neste mês)
        nascimentos_mes = Animal.objects.filter(
            fazenda=fazenda,
            data_nascimento__gte=inicio_mes
        ).count()
        
        # Peso médio dos animais
        peso_medio = Animal.objects.filter(fazenda=fazenda).aggregate(
            media=Avg('peso_atual')
        )['media'] or 0
        
        # Taxa de natalidade
        taxa_natalidade = (nascimentos_mes / total_animais * 100) if total_animais > 0 else 0
        
        print(f"📊 Dados - Total: {total_animais}, Nascimentos: {nascimentos_mes}, Peso médio: {peso_medio}")
        
        return Response({
            'taxa_natalidade': round(taxa_natalidade, 2),
            'taxa_mortalidade': 0,
            'peso_medio': round(float(peso_medio), 2),
            'producao_mensal': nascimentos_mes,
            'variacao_natalidade': 0,
            'variacao_mortalidade': 0,
            'variacao_peso': 0,
            'variacao_producao': 0
        })
    except Fazenda.DoesNotExist:
        return Response({
            'taxa_natalidade': 0,
            'taxa_mortalidade': 0,
            'peso_medio': 0,
            'producao_mensal': 0,
            'variacao_natalidade': 0,
            'variacao_mortalidade': 0,
            'variacao_peso': 0,
            'variacao_producao': 0
        })
    except Exception as e:
        print(f"Erro em get_indicadores_producao: {e}")
        return Response({
            'taxa_natalidade': 0,
            'taxa_mortalidade': 0,
            'peso_medio': 0,
            'producao_mensal': 0,
            'variacao_natalidade': 0,
            'variacao_mortalidade': 0,
            'variacao_peso': 0,
            'variacao_producao': 0
        })


@api_view(['GET'])
@permission_classes([IsProdutorOrAdmin])
def get_preferencias_notificacoes(request):
    try:
        fazenda = Fazenda.objects.get(produtor=request.user)
    except Fazenda.DoesNotExist:
        return Response(status=404)

    prefs, created = PreferenciasNotificacoes.objects.get_or_create(fazenda=fazenda)
    serializer = PreferenciasNotificacoesSerializer(prefs)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsProdutorOrAdmin])
def update_preferencias_notificacoes(request):
    try:
        fazenda = Fazenda.objects.get(produtor=request.user)
    except Fazenda.DoesNotExist:
        return Response(status=404)

    prefs, created = PreferenciasNotificacoes.objects.get_or_create(fazenda=fazenda)
    serializer = PreferenciasNotificacoesSerializer(prefs, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT'])
@permission_classes([IsProdutorOrAdmin])
def preferencias_notificacoes(request):
    """GET or PUT handler for preferencias/notificacoes/ to simplify routing."""
    try:
        fazenda = Fazenda.objects.get(produtor=request.user)
    except Fazenda.DoesNotExist:
        return Response(status=404)

    prefs, created = PreferenciasNotificacoes.objects.get_or_create(fazenda=fazenda)

    if request.method == 'GET':
        serializer = PreferenciasNotificacoesSerializer(prefs)
        return Response(serializer.data)

    # PUT
    serializer = PreferenciasNotificacoesSerializer(prefs, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsProdutorOrAdmin])
def get_perfil_estatisticas(request):
    try:
        try:
            fazenda = Fazenda.objects.get(produtor=request.user)
        except Fazenda.DoesNotExist:
            return Response({
                'animais': {'total': 0, 'novos_mes': 0, 'por_especie': {}},
                'saude': {'saudaveis': 0, 'doentes': 0, 'atencao': 0, 'vacinacao_em_dia': 0},
                'financeiro': {'receitas_mes': 0, 'despesas_mes': 0, 'saldo_mes': 0}
            })
        
        hoje = timezone.now().date()
        inicio_mes = date(hoje.year, hoje.month, 1)
        
        animais = Animal.objects.filter(fazenda=fazenda)
        total_animais = animais.count()
        novos_mes = animais.filter(created_at__gte=inicio_mes).count()
        
        por_especie = {}
        for especie, nome in Animal.ESPECIE_CHOICES:
            count = animais.filter(especie=especie).count()
            if count > 0:
                por_especie[especie] = count
        
        animais_doentes = animais.filter(status='doente').count()
        animais_atencao = animais.filter(status='atencao').count()
        animais_saudaveis = total_animais - (animais_doentes + animais_atencao)
        
        vacinas_em_dia = animais.filter(vacinacao='atualizada').count()
        
        transacoes_mes = TransacaoFinanceira.objects.filter(
            fazenda=fazenda,
            data__gte=inicio_mes
        )
        
        total_receitas = transacoes_mes.filter(tipo='receita').aggregate(total=Sum('valor'))['total'] or 0
        total_despesas = transacoes_mes.filter(tipo='despesa').aggregate(total=Sum('valor'))['total'] or 0
        
        return Response({
            'animais': {
                'total': total_animais,
                'novos_mes': novos_mes,
                'por_especie': por_especie
            },
            'saude': {
                'saudaveis': animais_saudaveis,
                'doentes': animais_doentes,
                'atencao': animais_atencao,
                'vacinacao_em_dia': vacinas_em_dia
            },
            'financeiro': {
                'receitas_mes': float(total_receitas),
                'despesas_mes': float(total_despesas),
                'saldo_mes': float(total_receitas - total_despesas)
            }
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    
@api_view(['GET'])
@permission_classes([IsProdutorOrAdmin, ModulePermission('dashboard')])
def get_produtor_dashboard(request):
    try:
        fazenda = Fazenda.objects.get(produtor=request.user)
    except Fazenda.DoesNotExist:
        fazenda = Fazenda.objects.create(
            produtor=request.user,
            nome=f"Fazenda de {request.user.username or request.user.email}"
        )
    
    animais = Animal.objects.filter(fazenda=fazenda)
    
    # Estatísticas por espécie
    por_especie = {}
    for especie, _ in Animal.ESPECIE_CHOICES:
        count = animais.filter(especie=especie).count()
        if count > 0:
            por_especie[especie] = count
    
    # Estatísticas por status
    por_status = {}
    for status, _ in Animal.STATUS_CHOICES:
        count = animais.filter(status=status).count()
        if count > 0:
            por_status[status] = count
    
    hoje = timezone.now().date()
    inicio_mes = date(hoje.year, hoje.month, 1)

    rebanho = {
        'total': animais.count(),
        'por_especie': por_especie,
        'por_status': por_status,
        'machos': animais.filter(sexo='M').count(),
        'femeas': animais.filter(sexo='F').count(),
        'novos_ultimo_mes': animais.filter(
            data_nascimento__gte=inicio_mes
        ).count()
    }
    
    consumo_mensal = AlimentacaoRegistro.objects.filter(
        fazenda=fazenda,
        data__gte=inicio_mes
    ).aggregate(
        total_kg=Sum('quantidade_kg'),
        total_custo=Sum('custo_total')
    )
    
    estoque_total = EstoqueRacao.objects.filter(fazenda=fazenda).aggregate(
        total=Sum('quantidade_sacos')
    )['total'] or 0
    
    alimentacao = {
        'consumo_mensal': float(consumo_mensal['total_kg'] or 0),
        'estoque_atual': float(estoque_total),
        'custo_mensal': float(consumo_mensal['total_custo'] or 0)
    }
    
    transacoes_mes = TransacaoFinanceira.objects.filter(
        fazenda=fazenda,
        data__gte=inicio_mes
    )
    
    receitas = transacoes_mes.filter(tipo='receita').aggregate(total=Sum('valor'))['total'] or 0
    despesas = transacoes_mes.filter(tipo='despesa').aggregate(total=Sum('valor'))['total'] or 0
    
    financeiro_resumo = {
        'total_receitas': float(receitas),
        'total_despesas': float(despesas),
        'saldo': float(receitas - despesas)
    }
    
    alertas_nao_lidos = Alerta.objects.filter(
        fazenda=fazenda,
        lido=False
    ).count()
    
    atividades_recentes = Atividade.objects.filter(
        fazenda=fazenda
    ).order_by('-created_at')[:5]
    
    data = {
        'rebanho': rebanho,
        'alimentacao': alimentacao,
        'financeiro_resumo': financeiro_resumo,
        'alertas_nao_lidos': alertas_nao_lidos,
        'atividades_recentes': AtividadeSerializer(atividades_recentes, many=True).data
    }
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsProdutorOrAdmin, ModulePermission('animais')])
def get_ocorrencias_fazenda(request):
    try:
        fazenda = Fazenda.objects.get(produtor=request.user)
        apenas_pendentes = request.query_params.get('pendentes')
        ocorrencias = Ocorrencia.objects.filter(fazenda=fazenda).order_by('-data_hora')
        if apenas_pendentes:
            ocorrencias = ocorrencias.filter(resolvido=False)

        data = []
        for oc in ocorrencias:
            nome_func = oc.funcionario.email.split('@')[0]
            try:
                from login_cadastro.models import Perfil
                perfil = Perfil.objects.get(user=oc.funcionario)
                if perfil.nome_completo:
                    nome_func = perfil.nome_completo
            except Exception:
                pass
            data.append({
                'id': oc.id,
                'tipo': oc.tipo,
                'titulo': oc.titulo,
                'descricao': oc.descricao,
                'urgencia': getattr(oc, 'urgencia', 'baixa'),
                'data_hora': oc.data_hora,
                'resolvido': oc.resolvido,
                'data_resolucao': oc.data_resolucao,
                'funcionario': nome_func,
                'animal': oc.animal.nome if oc.animal else None,
                'animal_brinco': oc.animal.brinco if oc.animal else None,
            })
        return Response(data)
    except Fazenda.DoesNotExist:
        return Response([])

@api_view(['POST'])
@permission_classes([IsProdutorOrAdmin, ModulePermission('animais')])
def resolver_ocorrencia_produtor(request, ocorrencia_id):
    try:
        fazenda = Fazenda.objects.get(produtor=request.user)
        ocorrencia = Ocorrencia.objects.get(id=ocorrencia_id, fazenda=fazenda)
        ocorrencia.resolvido = True
        ocorrencia.data_resolucao = timezone.now()
        ocorrencia.save()
        return Response({'message': 'Ocorrência resolvida'})
    except Exception as e:
        return Response({'error': str(e)}, status=400)
    
@api_view(['GET'])
@permission_classes([IsProdutorOrAdmin, ModulePermission('animais')])
def get_ocorrencias_fazenda(request):
    try:
        fazenda = Fazenda.objects.get(produtor=request.user)
        apenas_pendentes = request.query_params.get('pendentes')
        ocorrencias = Ocorrencia.objects.filter(fazenda=fazenda).order_by('-data_hora')
        if apenas_pendentes:
            ocorrencias = ocorrencias.filter(resolvido=False)

        data = []
        for oc in ocorrencias:
            nome_func = oc.funcionario.email.split('@')[0]
            try:
                from login_cadastro.models import Perfil
                perfil = Perfil.objects.get(user=oc.funcionario)
                if perfil.nome_completo:
                    nome_func = perfil.nome_completo
            except Exception:
                pass
            data.append({
                'id': oc.id,
                'tipo': oc.tipo,
                'titulo': oc.titulo,
                'descricao': oc.descricao,
                'urgencia': getattr(oc, 'urgencia', 'baixa'),
                'data_hora': oc.data_hora,
                'resolvido': oc.resolvido,
                'data_resolucao': oc.data_resolucao,
                'funcionario': nome_func,
                'animal': oc.animal.nome if oc.animal else None,
                'animal_brinco': oc.animal.brinco if oc.animal else None,
            })
        return Response(data)
    except Fazenda.DoesNotExist:
        return Response([])

@api_view(['POST'])
@permission_classes([IsProdutorOrAdmin, ModulePermission('animais')])
def resolver_ocorrencia_produtor(request, ocorrencia_id):
    try:
        fazenda = Fazenda.objects.get(produtor=request.user)
        ocorrencia = Ocorrencia.objects.get(id=ocorrencia_id, fazenda=fazenda)
        ocorrencia.resolvido = True
        ocorrencia.data_resolucao = timezone.now()
        ocorrencia.save()
        return Response({'message': 'Ocorrência resolvida'})
    except Exception as e:
        return Response({'error': str(e)}, status=400)