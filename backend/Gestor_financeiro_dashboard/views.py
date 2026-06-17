from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta, date
from django_filters.rest_framework import DjangoFilterBackend
from login_cadastro.models import CustomUser
from produtor_dashboard.models import Fazenda, Animal
from .models import (
    GestorFinanceiro, Receita, Despesa, 
    MetaFinanceira, AtividadeFinanceira, RelatorioFinanceiro, 
)
from produtor_dashboard.serializers import AnimalSerializer
from .serializers import (
    GestorFinanceiroSerializer, ReceitaSerializer, DespesaSerializer,
    MetaFinanceiraSerializer, AtividadeFinanceiraSerializer, 
    RelatorioFinanceiroSerializer
)

class IsGestorFinanceiroOrAdmin(IsAuthenticated):
    """Permissão para gestores financeiros e administradores"""
    def has_permission(self, request, view):
        return super().has_permission(request, view) and (
            request.user.role == 'gestor_financeiro' or 
            request.user.role == 'produtor' or
            request.user.role == 'administrador' or 
            request.user.is_superuser
        )

class GestorFinanceiroViewSet(viewsets.ModelViewSet):
    serializer_class = GestorFinanceiroSerializer
    permission_classes = [IsGestorFinanceiroOrAdmin]
    
    def get_queryset(self):
        if self.request.user.role == 'gestor_financeiro':
            return GestorFinanceiro.objects.filter(user=self.request.user)
        return GestorFinanceiro.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ReceitaViewSet(viewsets.ModelViewSet):
    serializer_class = ReceitaSerializer
    permission_classes = [IsGestorFinanceiroOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categoria']
    search_fields = ['descricao']
    ordering_fields = ['data', 'valor']
    ordering = ['-data']
    
    def get_queryset(self):
        if self.request.user.role == 'gestor_financeiro':
            gestor = GestorFinanceiro.objects.get(user=self.request.user)
            return Receita.objects.filter(fazenda=gestor.fazenda)
        elif self.request.user.role == 'produtor':
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            return Receita.objects.filter(fazenda=fazenda)
        return Receita.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role == 'gestor_financeiro':
            gestor = GestorFinanceiro.objects.get(user=self.request.user)
            receita = serializer.save(fazenda=gestor.fazenda, gestor=self.request.user)
        else:
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            receita = serializer.save(fazenda=fazenda)
        
        AtividadeFinanceira.objects.create(
            fazenda=receita.fazenda,
            tipo='receita',
            valor=receita.valor,
            descricao=receita.descricao,
            categoria=receita.categoria,
            usuario=self.request.user
        )

class DespesaViewSet(viewsets.ModelViewSet):
    serializer_class = DespesaSerializer
    permission_classes = [IsGestorFinanceiroOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categoria']
    search_fields = ['descricao']
    ordering_fields = ['data', 'valor']
    ordering = ['-data']
    
    def get_queryset(self):
        if self.request.user.role == 'gestor_financeiro':
            gestor = GestorFinanceiro.objects.get(user=self.request.user)
            return Despesa.objects.filter(fazenda=gestor.fazenda)
        elif self.request.user.role == 'produtor':
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            return Despesa.objects.filter(fazenda=fazenda)
        return Despesa.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role == 'gestor_financeiro':
            gestor = GestorFinanceiro.objects.get(user=self.request.user)
            despesa = serializer.save(fazenda=gestor.fazenda, gestor=self.request.user)
        else:
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            despesa = serializer.save(fazenda=fazenda)
        
        AtividadeFinanceira.objects.create(
            fazenda=despesa.fazenda,
            tipo='despesa',
            valor=despesa.valor,
            descricao=despesa.descricao,
            categoria=despesa.categoria,
            usuario=self.request.user
        )

class MetaFinanceiraViewSet(viewsets.ModelViewSet):
    serializer_class = MetaFinanceiraSerializer
    permission_classes = [IsGestorFinanceiroOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['tipo', 'periodo', 'ano']
    
    def get_queryset(self):
        if self.request.user.role == 'gestor_financeiro':
            gestor = GestorFinanceiro.objects.get(user=self.request.user)
            return MetaFinanceira.objects.filter(fazenda=gestor.fazenda)
        elif self.request.user.role == 'produtor':
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            return MetaFinanceira.objects.filter(fazenda=fazenda)
        return MetaFinanceira.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role == 'gestor_financeiro':
            gestor = GestorFinanceiro.objects.get(user=self.request.user)
            serializer.save(fazenda=gestor.fazenda)
        else:
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            serializer.save(fazenda=fazenda)

class AtividadeFinanceiraViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AtividadeFinanceiraSerializer
    permission_classes = [IsGestorFinanceiroOrAdmin]
    ordering = ['-data']
    
    def get_queryset(self):
        if self.request.user.role == 'gestor_financeiro':
            gestor = GestorFinanceiro.objects.get(user=self.request.user)
            return AtividadeFinanceira.objects.filter(fazenda=gestor.fazenda)
        elif self.request.user.role == 'produtor':
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            return AtividadeFinanceira.objects.filter(fazenda=fazenda)
        return AtividadeFinanceira.objects.all()
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        queryset = queryset[:50]  # ← slice só aqui, depois do filter/order
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class RelatorioFinanceiroViewSet(viewsets.ModelViewSet):
    serializer_class = RelatorioFinanceiroSerializer
    permission_classes = [IsGestorFinanceiroOrAdmin]
    
    def get_queryset(self):
        if self.request.user.role == 'gestor_financeiro':
            gestor = GestorFinanceiro.objects.get(user=self.request.user)
            return RelatorioFinanceiro.objects.filter(fazenda=gestor.fazenda)
        elif self.request.user.role == 'produtor':
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            return RelatorioFinanceiro.objects.filter(fazenda=fazenda)
        return RelatorioFinanceiro.objects.all()
    
    @action(detail=False, methods=['get'])
    def gerar(self, request):
        if self.request.user.role == 'gestor_financeiro':
            gestor = GestorFinanceiro.objects.get(user=self.request.user)
            fazenda = gestor.fazenda
        else:
            fazenda = Fazenda.objects.get(produtor=self.request.user)
        
        periodo = request.query_params.get('periodo', 'mensal')
        hoje = timezone.now().date()
        
        if periodo == 'mensal':
            data_inicio = date(hoje.year, hoje.month, 1)
            data_fim = hoje
            titulo = f"Relatório Financeiro - {hoje.strftime('%B/%Y')}"
        elif periodo == 'trimestral':
            trimestre = (hoje.month - 1) // 3 + 1
            data_inicio = date(hoje.year, 3*(trimestre-1)+1, 1)
            data_fim = hoje
            titulo = f"Relatório Financeiro - {trimestre}º Trimestre/{hoje.year}"
        elif periodo == 'anual':
            data_inicio = date(hoje.year, 1, 1)
            data_fim = hoje
            titulo = f"Relatório Financeiro Anual - {hoje.year}"
        else:
            data_inicio = date(hoje.year, hoje.month, 1)
            data_fim = hoje
            titulo = f"Relatório Financeiro - {hoje.strftime('%B/%Y')}"
        
        receitas = Receita.objects.filter(fazenda=fazenda, data__gte=data_inicio, data__lte=data_fim)
        despesas = Despesa.objects.filter(fazenda=fazenda, data__gte=data_inicio, data__lte=data_fim)
        
        total_receitas = receitas.aggregate(total=Sum('valor'))['total'] or 0
        total_despesas = despesas.aggregate(total=Sum('valor'))['total'] or 0
        lucro_liquido = total_receitas - total_despesas
        margem_lucro = (lucro_liquido / total_receitas * 100) if total_receitas > 0 else 0
        
        receitas_por_categoria = {}
        for item in receitas.values('categoria').annotate(total=Sum('valor')):
            receitas_por_categoria[item['categoria']] = float(item['total'])
        
        despesas_por_categoria = {}
        for item in despesas.values('categoria').annotate(total=Sum('valor')):
            despesas_por_categoria[item['categoria']] = float(item['total'])
        
        relatorio = RelatorioFinanceiro.objects.create(
            fazenda=fazenda,
            titulo=titulo,
            periodo_inicio=data_inicio,
            periodo_fim=data_fim,
            total_receitas=total_receitas,
            total_despesas=total_despesas,
            lucro_liquido=lucro_liquido,
            margem_lucro=margem_lucro,
            dados_json={
                'receitas_por_categoria': receitas_por_categoria,
                'despesas_por_categoria': despesas_por_categoria,
                'total_receitas': float(total_receitas),
                'total_despesas': float(total_despesas),
                'lucro_liquido': float(lucro_liquido),
                'margem_lucro': float(margem_lucro),
            }
        )
        
        serializer = self.get_serializer(relatorio)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsGestorFinanceiroOrAdmin])
def get_gestor_financeiro_dashboard(request):
    user = request.user
    
    try:
        if user.role == 'gestor_financeiro':
            gestor = GestorFinanceiro.objects.get(user=user)
            fazenda = gestor.fazenda
        else:
            fazenda = Fazenda.objects.get(produtor=user)
    except (GestorFinanceiro.DoesNotExist, Fazenda.DoesNotExist):
        return Response({
            'error': 'Gestor não vinculado a uma fazenda'
        }, status=status.HTTP_404_NOT_FOUND)
    
    hoje = timezone.now().date()
    inicio_mes = date(hoje.year, hoje.month, 1)
    inicio_ano = date(hoje.year, 1, 1)
    
    receitas_mes = Receita.objects.filter(fazenda=fazenda, data__gte=inicio_mes).aggregate(total=Sum('valor'))['total'] or 0
    despesas_mes = Despesa.objects.filter(fazenda=fazenda, data__gte=inicio_mes).aggregate(total=Sum('valor'))['total'] or 0
    lucro_mes = receitas_mes - despesas_mes
    margem_lucro = (lucro_mes / receitas_mes * 100) if receitas_mes > 0 else 0
    
    receitas_ano = Receita.objects.filter(fazenda=fazenda, data__gte=inicio_ano).aggregate(total=Sum('valor'))['total'] or 0
    despesas_ano = Despesa.objects.filter(fazenda=fazenda, data__gte=inicio_ano).aggregate(total=Sum('valor'))['total'] or 0
    lucro_ano = receitas_ano - despesas_ano
    
    ultimas_atividades_qs = AtividadeFinanceira.objects.filter(fazenda=fazenda)
    ultimas_vendas         = ultimas_atividades_qs.filter(tipo='receita').count()
    ultimas_despesas_count = ultimas_atividades_qs.filter(tipo='despesa').count()
    ultimas_atividades     = ultimas_atividades_qs.order_by('-data')[:10]
    
    metas = {'receita_meta': 0, 'despesa_meta': 0, 'lucro_meta': 0}
    
    meta_receita = MetaFinanceira.objects.filter(fazenda=fazenda, tipo='receita', periodo='mensal', ano=hoje.year, mes=hoje.month).first()
    if meta_receita:
        metas['receita_meta'] = float(meta_receita.valor_meta)
    
    meta_despesa = MetaFinanceira.objects.filter(fazenda=fazenda, tipo='despesa', periodo='mensal', ano=hoje.year, mes=hoje.month).first()
    if meta_despesa:
        metas['despesa_meta'] = float(meta_despesa.valor_meta)
    
    meta_lucro = MetaFinanceira.objects.filter(fazenda=fazenda, tipo='lucro', periodo='mensal', ano=hoje.year, mes=hoje.month).first()
    if meta_lucro:
        metas['lucro_meta'] = float(meta_lucro.valor_meta)
    
    return Response({
        'receitas_mes': float(receitas_mes),
        'despesas_mes': float(despesas_mes),
        'lucro_mes': float(lucro_mes),
        'receitas_ano': float(receitas_ano),
        'despesas_ano': float(despesas_ano),
        'lucro_ano': float(lucro_ano),
        'margem_lucro': round(float(margem_lucro), 2),
        'ultimas_vendas': ultimas_vendas,
        'ultimas_despesas': ultimas_despesas_count,
        'metas': metas,
    })

@api_view(['GET'])
@permission_classes([IsGestorFinanceiroOrAdmin])
def get_animais_gestor(request):
    try:
        gestor = GestorFinanceiro.objects.get(user=request.user)
        animais = Animal.objects.filter(fazenda=gestor.fazenda, status='ativo')
    except GestorFinanceiro.DoesNotExist:
        return Response([])
    serializer = AnimalSerializer(animais, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsGestorFinanceiroOrAdmin])
def get_analise_lucros(request):
    periodo = request.query_params.get('periodo', '6meses')
    
    try:
        if request.user.role == 'gestor_financeiro':
            gestor = GestorFinanceiro.objects.get(user=request.user)
            fazenda = gestor.fazenda
        else:
            fazenda = Fazenda.objects.get(produtor=request.user)
    except (GestorFinanceiro.DoesNotExist, Fazenda.DoesNotExist):
        return Response({'lucro_mensal': [], 'tendencia': {'lucro': '0%', 'receita': '0%', 'despesa': '0%'}, 'projecao': {'proximo_mes': 0, 'trimestre': 0, 'ano': 0}})

    from datetime import date
    hoje = timezone.now().date()
    
    if periodo == '6meses':
        meses = 6
    elif periodo == '12meses':
        meses = 12
    else:  # ano
        meses = 12

    lucro_mensal = []
    for i in range(meses - 1, -1, -1):
        # Calcula início e fim de cada mês
        mes_ref = hoje.month - i
        ano_ref = hoje.year
        while mes_ref <= 0:
            mes_ref += 12
            ano_ref -= 1
        
        import calendar
        ultimo_dia = calendar.monthrange(ano_ref, mes_ref)[1]
        inicio = date(ano_ref, mes_ref, 1)
        fim    = date(ano_ref, mes_ref, ultimo_dia)

        receitas_mes = Receita.objects.filter(fazenda=fazenda, data__gte=inicio, data__lte=fim).aggregate(total=Sum('valor'))['total'] or 0
        despesas_mes = Despesa.objects.filter(fazenda=fazenda, data__gte=inicio, data__lte=fim).aggregate(total=Sum('valor'))['total'] or 0
        lucro_mes    = float(receitas_mes) - float(despesas_mes)

        lucro_mensal.append({
            'mes':     inicio.strftime('%b/%Y'),
            'receita': float(receitas_mes),
            'despesa': float(despesas_mes),
            'lucro':   lucro_mes,
        })

    # Tendência: compara último mês com penúltimo
    tendencia_lucro = '0%'
    if len(lucro_mensal) >= 2:
        ultimo  = lucro_mensal[-1]['lucro']
        anterior= lucro_mensal[-2]['lucro']
        if anterior != 0:
            variacao = ((ultimo - anterior) / abs(anterior)) * 100
            tendencia_lucro = f"{'+' if variacao >= 0 else ''}{variacao:.1f}%"

    # Projeção simples: média dos últimos 3 meses
    ultimos3 = lucro_mensal[-3:] if len(lucro_mensal) >= 3 else lucro_mensal
    media = sum(m['lucro'] for m in ultimos3) / len(ultimos3) if ultimos3 else 0

    return Response({
        'lucro_mensal': lucro_mensal,
        'tendencia': {
            'lucro':   tendencia_lucro,
            'receita': '—',
            'despesa': '—',
        },
        'projecao': {
            'proximo_mes': round(media),
            'trimestre':   round(media * 3),
            'ano':         round(media * 12),
        }
    })