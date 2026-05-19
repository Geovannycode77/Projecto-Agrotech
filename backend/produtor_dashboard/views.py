from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from datetime import timedelta, date
from django_filters.rest_framework import DjangoFilterBackend
from login_cadastro.models import CustomUser
from .models import (
    Fazenda, Animal, AnimalSaude, AlimentacaoRegistro,
    EstoqueAlimentacao, TransacaoFinanceira, Alerta,
    Atividade, RelatorioProducao
)
from .serializers import (
    FazendaSerializer, AnimalSerializer, AnimalSaudeSerializer,
    AlimentacaoRegistroSerializer, EstoqueAlimentacaoSerializer,
    TransacaoFinanceiraSerializer, AlertaSerializer,
    AtividadeSerializer, RelatorioProducaoSerializer,
    DashboardProdutorSerializer
)

class IsProdutorOrAdmin(IsAuthenticated):
    """Permissão para produtores e administradores"""
    def has_permission(self, request, view):
        return super().has_permission(request, view) and (
            request.user.role == 'produtor' or 
            request.user.role == 'administrador' or 
            request.user.is_superuser
        )

class FazendaViewSet(viewsets.ModelViewSet):
    serializer_class = FazendaSerializer
    permission_classes = [IsProdutorOrAdmin]
    
    def get_queryset(self):
        if self.request.user.role == 'produtor':
            return Fazenda.objects.filter(produtor=self.request.user)
        return Fazenda.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(produtor=self.request.user)

class AnimalViewSet(viewsets.ModelViewSet):
    serializer_class = AnimalSerializer
    permission_classes = [IsProdutorOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['especie', 'sexo', 'status']
    search_fields = ['brinco', 'nome', 'raca']
    ordering_fields = ['peso_atual', 'data_nascimento', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        if self.request.user.role == 'produtor':
            return Animal.objects.filter(fazenda__produtor=self.request.user)
        return Animal.objects.all()
    
    def perform_create(self, serializer):
        fazenda = Fazenda.objects.get(produtor=self.request.user)
        animal = serializer.save(fazenda=fazenda)
        
        # Registrar atividade
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
            
            # Registrar atividade
            Atividade.objects.create(
                fazenda=animal.fazenda,
                tipo='saude',
                descricao=f'Registro de saúde para {animal.brinco}: {serializer.validated_data["tipo"]}',
                usuario=self.request.user
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estatísticas dos animais - compatível com frontend"""
        queryset = self.get_queryset()
        
        # Estatísticas por espécie
        por_especie = {}
        for especie, _ in Animal.ESPECIE_CHOICES:
            count = queryset.filter(especie=especie).count()
            if count > 0:
                por_especie[especie] = count
        
        # Estatísticas por status
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
                created_at__gte=timezone.now() - timedelta(days=30)
            ).count()
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def ultimos(self, request):
        """Últimos 5 animais - para o dashboard"""
        limit = int(request.query_params.get('limit', 5))
        animais = self.get_queryset()[:limit]
        serializer = self.get_serializer(animais, many=True)
        return Response(serializer.data)

class AlimentacaoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsProdutorOrAdmin]
    
    def get_queryset(self):
        if self.request.user.role == 'produtor':
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            return AlimentacaoRegistro.objects.filter(fazenda=fazenda)
        return AlimentacaoRegistro.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'estoque':
            return EstoqueAlimentacaoSerializer
        return AlimentacaoRegistroSerializer
    
    def perform_create(self, serializer):
        fazenda = Fazenda.objects.get(produtor=self.request.user)
        registro = serializer.save(fazenda=fazenda)
        
        # Atualizar estoque
        estoque, created = EstoqueAlimentacao.objects.get_or_create(
            fazenda=fazenda,
            tipo_racao=serializer.validated_data['tipo_racao']
        )
        estoque.quantidade_atual_kg -= serializer.validated_data['quantidade_kg']
        estoque.save()
        
        # Registrar atividade
        Atividade.objects.create(
            fazenda=fazenda,
            tipo='alimentacao',
            descricao=f'Registro de alimentação: {registro.quantidade_kg}kg de {registro.tipo_racao}',
            usuario=self.request.user
        )
    
    @action(detail=False, methods=['get'])
    def estoque(self, request):
        fazenda = Fazenda.objects.get(produtor=self.request.user)
        estoque = EstoqueAlimentacao.objects.filter(fazenda=fazenda)
        serializer = EstoqueAlimentacaoSerializer(estoque, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def consumo_mensal(self, request):
        fazenda = Fazenda.objects.get(produtor=self.request.user)
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
            'estoque_atual': EstoqueAlimentacao.objects.filter(fazenda=fazenda).aggregate(
                total=Sum('quantidade_atual_kg')
            )['total'] or 0
        })
    
    # ADICIONE ESTE MÉTODO AQUI
    @action(detail=False, methods=['get'])
    def consumo_diario(self, request):
        """Retorna o consumo diário de ração para o frontend"""
        from datetime import datetime
        
        try:
            fazenda = Fazenda.objects.get(produtor=request.user)
            
            hoje = timezone.now().date()
            inicio_dia = datetime.combine(hoje, datetime.min.time())
            fim_dia = datetime.combine(hoje, datetime.max.time())
            
            # Consumo de hoje
            consumo_hoje = AlimentacaoRegistro.objects.filter(
                fazenda=fazenda,
                created_at__gte=inicio_dia,
                created_at__lte=fim_dia
            ).aggregate(
                total_kg=Sum('quantidade_kg'),
                total_custo=Sum('custo_total')
            )
            
            # Consumo médio dos últimos 7 dias
            ultimos_7_dias = timezone.now() - timedelta(days=7)
            consumo_media = AlimentacaoRegistro.objects.filter(
                fazenda=fazenda,
                created_at__gte=ultimos_7_dias
            ).aggregate(
                media_kg=Avg('quantidade_kg'),
                media_custo=Avg('custo_total')
            )
            
            # Total de animais ativos
            total_animais = Animal.objects.filter(fazenda=fazenda, status='ativo').count()
            
            consumo_total_kg = float(consumo_hoje['total_kg'] or 0)
            custo_total = float(consumo_hoje['total_custo'] or 0)
            
            # Calcular consumo por animal
            consumo_por_animal = consumo_total_kg / total_animais if total_animais > 0 else 0
            
            return Response({
                'total': consumo_total_kg,
                'por_animal': round(consumo_por_animal, 2),
                'sacos_por_dia': round(consumo_total_kg / 50, 2),  # Assumindo 50kg por saco
                'custo_diario': custo_total,
                'custo_mensal': custo_total * 30,
            })
            
        except Fazenda.DoesNotExist:
            return Response({
                'total': 0,
                'por_animal': 0,
                'sacos_por_dia': 0,
                'custo_diario': 0,
                'custo_mensal': 0
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Erro no consumo_diario: {e}")
            return Response({
                'total': 0,
                'por_animal': 0,
                'sacos_por_dia': 0,
                'custo_diario': 0,
                'custo_mensal': 0
            }, status=status.HTTP_200_OK)

class FinanceiroViewSet(viewsets.ModelViewSet):
    serializer_class = TransacaoFinanceiraSerializer
    permission_classes = [IsProdutorOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['tipo', 'categoria']
    ordering_fields = ['data', 'valor']
    ordering = ['-data']
    
    def get_queryset(self):
        if self.request.user.role == 'produtor':
            return TransacaoFinanceira.objects.filter(fazenda__produtor=self.request.user)
        return TransacaoFinanceira.objects.all()
    
    def create(self, request, *args, **kwargs):
        """Criar uma nova transação financeira"""
        print("=" * 50)
        print("📝 Dados recebidos:", request.data)
        
        # Buscar a fazenda do produtor
        try:
            fazenda = Fazenda.objects.get(produtor=request.user)
            print(f"🏠 Fazenda: {fazenda.nome} (ID: {fazenda.id})")
        except Fazenda.DoesNotExist:
            print("❌ Fazenda não encontrada!")
            return Response(
                {'error': 'Fazenda não encontrada. Complete seu cadastro primeiro.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Criar uma cópia mutável dos dados e adicionar a fazenda
        data = request.data.copy()
        data['fazenda'] = fazenda.id
        
        print("📦 Dados processados:", data)
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            print("✅ Dados válidos")
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            print("❌ Erros de validação:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def resumo(self, request):
        """Resumo financeiro por período - compatível com frontend"""
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
    permission_classes = [IsProdutorOrAdmin]
    
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
    permission_classes = [IsProdutorOrAdmin]
    
    def get_queryset(self):
        if self.request.user.role == 'produtor':
            return Atividade.objects.filter(fazenda__produtor=self.request.user)[:50]
        return Atividade.objects.all()[:50]

class RelatorioViewSet(viewsets.ModelViewSet):
    serializer_class = RelatorioProducaoSerializer
    permission_classes = [IsProdutorOrAdmin]
    
    def get_queryset(self):
        if self.request.user.role == 'produtor':
            return RelatorioProducao.objects.filter(fazenda__produtor=self.request.user)
        return RelatorioProducao.objects.all()
    
    @action(detail=False, methods=['get'])
    def gerar(self, request):
        """Gerar relatório de produção - compatível com frontend"""
        try:
            fazenda = Fazenda.objects.get(produtor=request.user)
        except Fazenda.DoesNotExist:
            return Response({'error': 'Fazenda não encontrada'}, status=status.HTTP_404_NOT_FOUND)
        
        periodo = request.query_params.get('periodo', 'ultimo_mes')
        
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
        
        # Calcular estatísticas
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
        
        # CORRIGIDO: Não colocar 'periodo' dentro do dicionário
        # pois ele será passado como argumento direto
        relatorio_data = {
            'total_animais': total_animais,
            'nascimentos': nascimentos,
            'mortes': mortes,
            'vendas': vendas,
            'peso_medio': float(peso_medio),
            'taxa_mortalidade': round(taxa_mortalidade, 2),
            'natalidade': round(natalidade, 2),
        }
        
        # Salvar relatório - periodo é passado diretamente, não via **relatorio_data
        relatorio = RelatorioProducao.objects.create(
            fazenda=fazenda,
            periodo=periodo,
            data_inicio=data_inicio,
            data_fim=hoje,
            total_animais=relatorio_data['total_animais'],
            nascimentos=relatorio_data['nascimentos'],
            mortes=relatorio_data['mortes'],
            vendas=relatorio_data['vendas'],
            peso_medio=relatorio_data['peso_medio'],
            taxa_mortalidade=relatorio_data['taxa_mortalidade'],
            natalidade=relatorio_data['natalidade'],
        )
        
        # Retornar os dados para o frontend
        response_data = {
            'periodo': periodo,
            'total_animais': total_animais,
            'nascimentos': nascimentos,
            'mortes': mortes,
            'vendas': vendas,
            'peso_medio': float(peso_medio),
            'taxa_mortalidade': round(taxa_mortalidade, 2),
            'natalidade': round(natalidade, 2),
        }
        
        return Response(response_data, status=status.HTTP_200_OK)


# produtor_dashboard/views.py - Adicione no final do arquivo
@api_view(['GET'])
@permission_classes([IsProdutorOrAdmin])
def get_produtor_dashboard(request):
    """Dados completos do dashboard do produtor - compatível com frontend"""
    try:
        fazenda = Fazenda.objects.get(produtor=request.user)
    except Fazenda.DoesNotExist:
        # Criar fazenda automaticamente se não existir
        fazenda = Fazenda.objects.create(
            produtor=request.user,
            nome=f"Fazenda de {request.user.username or request.user.email}"
        )
    
    # Dados do rebanho
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
    
    rebanho = {
        'total': animais.count(),
        'por_especie': por_especie,
        'por_status': por_status,
        'machos': animais.filter(sexo='M').count(),
        'femeas': animais.filter(sexo='F').count(),
        'novos_ultimo_mes': animais.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        ).count()
    }
    
    # Dados de alimentação
    hoje = timezone.now().date()
    inicio_mes = date(hoje.year, hoje.month, 1)
    
    consumo_mensal = AlimentacaoRegistro.objects.filter(
        fazenda=fazenda,
        data__gte=inicio_mes
    ).aggregate(
        total_kg=Sum('quantidade_kg'),
        total_custo=Sum('custo_total')
    )
    
    estoque_total = EstoqueAlimentacao.objects.filter(fazenda=fazenda).aggregate(
        total=Sum('quantidade_atual_kg')
    )['total'] or 0
    
    alimentacao = {
        'consumo_mensal': float(consumo_mensal['total_kg'] or 0),
        'estoque_atual': float(estoque_total),
        'custo_mensal': float(consumo_mensal['total_custo'] or 0)
    }
    
    # Dados financeiros
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
    
    # Alertas não lidos
    alertas_nao_lidos = Alerta.objects.filter(
        fazenda=fazenda,
        lido=False
    ).count()
    
    # Atividades recentes
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
@permission_classes([IsProdutorOrAdmin])
def get_proximas_vacinas(request):
    """Lista vacinas programadas para os próximos 30 dias"""
    try:
        fazenda = Fazenda.objects.get(produtor=request.user)
        
        hoje = timezone.now().date()
        limite = hoje + timedelta(days=30)
        
        # Buscar vacinas do veterinário para esta fazenda
        # Assumindo que existe um relacionamento com Vacina
        from veterinario_dashboard.models import Vacina
        
        vacinas = Vacina.objects.filter(
            fazenda=fazenda,
            data_proxima_dose__isnull=False,
            data_proxima_dose__gte=hoje,
            data_proxima_dose__lte=limite
        ).order_by('data_proxima_dose')
        
        resultados = []
        for vacina in vacinas:
            dias_restantes = (vacina.data_proxima_dose - hoje).days
            resultados.append({
                'id': vacina.id,
                'nome': vacina.nome_vacina,
                'animal_nome': vacina.animal.nome if vacina.animal else 'Rebanho',
                'data_programada': vacina.data_proxima_dose,
                'dias_restantes': dias_restantes,
            })
        
        return Response({
            'results': resultados,
            'count': len(resultados)
        })
        
    except Exception as e:
        return Response({'results': [], 'count': 0}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsProdutorOrAdmin])
def get_alertas_list(request):
    """Lista todos os alertas do produtor"""
    try:
        fazenda = Fazenda.objects.get(produtor=request.user)
        
        alertas = Alerta.objects.filter(fazenda=fazenda).order_by('-created_at')
        
        resultados = []
        for alerta in alertas:
            resultados.append({
                'id': alerta.id,
                'titulo': alerta.titulo,
                'mensagem': alerta.mensagem,
                'prioridade': alerta.prioridade,
                'tipo': alerta.tipo,
                'lido': alerta.lido,
                'data_criacao': alerta.created_at,
                'animal_nome': alerta.animal.nome if hasattr(alerta, 'animal') and alerta.animal else None,
            })
        
        return Response({
            'results': resultados,
            'count': len(resultados)
        })
        
    except Exception as e:
        return Response({'results': [], 'count': 0}, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsProdutorOrAdmin])
def marcar_alerta_lido(request, alerta_id):
    """Marca um alerta como lido"""
    try:
        alerta = Alerta.objects.get(id=alerta_id)
        alerta.lido = True
        alerta.save()
        return Response({'message': 'Alerta marcado como lido', 'success': True})
    except Alerta.DoesNotExist:
        return Response({'error': 'Alerta não encontrado', 'success': False}, status=status.HTTP_404_NOT_FOUND)

        