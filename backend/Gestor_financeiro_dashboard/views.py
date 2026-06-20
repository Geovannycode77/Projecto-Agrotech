from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
import calendar as cal_module
from django.utils import timezone
from produtor_dashboard.models import TransacaoFinanceira
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
        queryset = queryset[:50]
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

        # ── Combina dados do gestor + produtor ──
        r_gestor = Receita.objects.filter(fazenda=fazenda, data__gte=data_inicio, data__lte=data_fim)
        r_prod   = TransacaoFinanceira.objects.filter(fazenda=fazenda, tipo='receita', data__gte=data_inicio, data__lte=data_fim)
        d_gestor = Despesa.objects.filter(fazenda=fazenda, data__gte=data_inicio, data__lte=data_fim)
        d_prod   = TransacaoFinanceira.objects.filter(fazenda=fazenda, tipo='despesa', data__gte=data_inicio, data__lte=data_fim)

        total_receitas = float(r_gestor.aggregate(t=Sum('valor'))['t'] or 0) + float(r_prod.aggregate(t=Sum('valor'))['t'] or 0)
        total_despesas = float(d_gestor.aggregate(t=Sum('valor'))['t'] or 0) + float(d_prod.aggregate(t=Sum('valor'))['t'] or 0)
        lucro_liquido  = total_receitas - total_despesas
        margem_lucro   = (lucro_liquido / total_receitas * 100) if total_receitas > 0 else 0

        # Categorias combinadas
        receitas_por_categoria = {}
        for item in r_gestor.values('categoria').annotate(total=Sum('valor')):
            receitas_por_categoria[item['categoria']] = float(item['total'])
        for item in r_prod.values('categoria').annotate(total=Sum('valor')):
            cat = item['categoria']
            receitas_por_categoria[cat] = receitas_por_categoria.get(cat, 0) + float(item['total'])

        despesas_por_categoria = {}
        for item in d_gestor.values('categoria').annotate(total=Sum('valor')):
            despesas_por_categoria[item['categoria']] = float(item['total'])
        for item in d_prod.values('categoria').annotate(total=Sum('valor')):
            cat = item['categoria']
            despesas_por_categoria[cat] = despesas_por_categoria.get(cat, 0) + float(item['total'])

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
                'total_receitas': total_receitas,
                'total_despesas': total_despesas,
                'lucro_liquido':  lucro_liquido,
                'margem_lucro':   margem_lucro,
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
            'receitas_mes': 0, 'despesas_mes': 0, 'lucro_mes': 0,
            'receitas_ano': 0, 'despesas_ano': 0, 'lucro_ano': 0,
            'margem_lucro': 0, 'ultimas_vendas': 0, 'ultimas_despesas': 0,
            'metas': {'receita_meta': 0, 'despesa_meta': 0, 'lucro_meta': 0},
        })

    hoje = timezone.now().date()
    inicio_mes = date(hoje.year, hoje.month, 1)
    inicio_ano = date(hoje.year, 1, 1)

    # ── Combina gestor + produtor ──
    r_gestor_mes = Receita.objects.filter(fazenda=fazenda, data__gte=inicio_mes).aggregate(t=Sum('valor'))['t'] or 0
    r_prod_mes   = TransacaoFinanceira.objects.filter(fazenda=fazenda, tipo='receita', data__gte=inicio_mes).aggregate(t=Sum('valor'))['t'] or 0
    receitas_mes = float(r_gestor_mes) + float(r_prod_mes)

    d_gestor_mes = Despesa.objects.filter(fazenda=fazenda, data__gte=inicio_mes).aggregate(t=Sum('valor'))['t'] or 0
    d_prod_mes   = TransacaoFinanceira.objects.filter(fazenda=fazenda, tipo='despesa', data__gte=inicio_mes).aggregate(t=Sum('valor'))['t'] or 0
    despesas_mes = float(d_gestor_mes) + float(d_prod_mes)

    lucro_mes    = receitas_mes - despesas_mes
    margem_lucro = (lucro_mes / receitas_mes * 100) if receitas_mes > 0 else 0

    r_gestor_ano = Receita.objects.filter(fazenda=fazenda, data__gte=inicio_ano).aggregate(t=Sum('valor'))['t'] or 0
    r_prod_ano   = TransacaoFinanceira.objects.filter(fazenda=fazenda, tipo='receita', data__gte=inicio_ano).aggregate(t=Sum('valor'))['t'] or 0
    receitas_ano = float(r_gestor_ano) + float(r_prod_ano)

    d_gestor_ano = Despesa.objects.filter(fazenda=fazenda, data__gte=inicio_ano).aggregate(t=Sum('valor'))['t'] or 0
    d_prod_ano   = TransacaoFinanceira.objects.filter(fazenda=fazenda, tipo='despesa', data__gte=inicio_ano).aggregate(t=Sum('valor'))['t'] or 0
    despesas_ano = float(d_gestor_ano) + float(d_prod_ano)

    lucro_ano = receitas_ano - despesas_ano

    ultimas_atividades_qs = AtividadeFinanceira.objects.filter(fazenda=fazenda)
    ultimas_vendas         = ultimas_atividades_qs.filter(tipo='receita').count()
    ultimas_despesas_count = ultimas_atividades_qs.filter(tipo='despesa').count()

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
        'receitas_mes':    receitas_mes,
        'despesas_mes':    despesas_mes,
        'lucro_mes':       lucro_mes,
        'receitas_ano':    receitas_ano,
        'despesas_ano':    despesas_ano,
        'lucro_ano':       lucro_ano,
        'margem_lucro':    round(margem_lucro, 2),
        'ultimas_vendas':  ultimas_vendas,
        'ultimas_despesas': ultimas_despesas_count,
        'metas':           metas,
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
        return Response({
            'lucro_mensal': [],
            'tendencia': {'lucro': '0%', 'receita': '0%', 'despesa': '0%'},
            'projecao': {'proximo_mes': 0, 'trimestre': 0, 'ano': 0}
        })

    hoje = timezone.now().date()
    meses = 12 if periodo in ('12meses', 'ano') else 6

    lucro_mensal = []
    for i in range(meses - 1, -1, -1):
        mes_ref = hoje.month - i
        ano_ref = hoje.year
        while mes_ref <= 0:
            mes_ref += 12
            ano_ref -= 1

        ultimo_dia = cal_module.monthrange(ano_ref, mes_ref)[1]
        inicio = date(ano_ref, mes_ref, 1)
        fim    = date(ano_ref, mes_ref, ultimo_dia)

        r_gestor = Receita.objects.filter(fazenda=fazenda, data__gte=inicio, data__lte=fim).aggregate(t=Sum('valor'))['t'] or 0
        r_prod   = TransacaoFinanceira.objects.filter(fazenda=fazenda, tipo='receita', data__gte=inicio, data__lte=fim).aggregate(t=Sum('valor'))['t'] or 0
        d_gestor = Despesa.objects.filter(fazenda=fazenda, data__gte=inicio, data__lte=fim).aggregate(t=Sum('valor'))['t'] or 0
        d_prod   = TransacaoFinanceira.objects.filter(fazenda=fazenda, tipo='despesa', data__gte=inicio, data__lte=fim).aggregate(t=Sum('valor'))['t'] or 0

        receita_mes = float(r_gestor) + float(r_prod)
        despesa_mes = float(d_gestor) + float(d_prod)
        lucro_mes   = receita_mes - despesa_mes

        lucro_mensal.append({
            'mes':     inicio.strftime('%b/%Y'),
            'receita': receita_mes,
            'despesa': despesa_mes,
            'lucro':   lucro_mes,
        })

        tendencia_lucro = 'N/D'
        if len(lucro_mensal) >= 2:
            ultimo   = lucro_mensal[-1]['lucro']
            anterior = lucro_mensal[-2]['lucro']
            if abs(anterior) > 100:  # só calcula se o valor anterior for significativo
                v = ((ultimo - anterior) / abs(anterior)) * 100
                v = max(min(v, 999), -999)  # limita a ±999%
                tendencia_lucro = f"{'+' if v >= 0 else ''}{v:.1f}%"

    ultimos3 = lucro_mensal[-3:] if len(lucro_mensal) >= 3 else lucro_mensal
    media = sum(m['lucro'] for m in ultimos3) / len(ultimos3) if ultimos3 else 0

    return Response({
        'lucro_mensal': lucro_mensal,
        'tendencia': {'lucro': tendencia_lucro, 'receita': '—', 'despesa': '—'},
        'projecao': {
            'proximo_mes': round(media),
            'trimestre':   round(media * 3),
            'ano':         round(media * 12),
        }
    })

@api_view(['GET'])
@permission_classes([IsGestorFinanceiroOrAdmin])
def get_todas_despesas(request):
    """Retorna despesas do gestor + transações de despesa do produtor"""
    try:
        if request.user.role == 'gestor_financeiro':
            gestor = GestorFinanceiro.objects.get(user=request.user)
            fazenda = gestor.fazenda
        else:
            fazenda = Fazenda.objects.get(produtor=request.user)
    except (GestorFinanceiro.DoesNotExist, Fazenda.DoesNotExist):
        return Response([])

    # Despesas do gestor
    despesas_gestor = list(Despesa.objects.filter(fazenda=fazenda).values(
        'id', 'categoria', 'valor', 'descricao', 'data'
    ).order_by('-data'))

    # Transações de despesa do produtor
    despesas_produtor = list(TransacaoFinanceira.objects.filter(
        fazenda=fazenda, tipo='despesa'
    ).values('id', 'categoria', 'valor', 'descricao', 'data').order_by('-data'))

    # Marca a origem
    for d in despesas_gestor:
        d['origem'] = 'gestor'
        d['id'] = str(d['id'])
        d['valor'] = float(d['valor'])
    for d in despesas_produtor:
        d['origem'] = 'produtor'
        d['id'] = str(d['id'])
        d['valor'] = float(d['valor'])

    # Combina e ordena por data
    todas = sorted(despesas_gestor + despesas_produtor, key=lambda x: x['data'], reverse=True)
    return Response(todas)