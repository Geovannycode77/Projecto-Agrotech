from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound
from django.core.exceptions import ValidationError
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta, date
from django_filters.rest_framework import DjangoFilterBackend
from login_cadastro.models import CustomUser, Perfil
from produtor_dashboard.models import Fazenda
from .models import (
    GestorFinanceiro, Receita, Despesa, 
    MetaFinanceira, AtividadeFinanceira, RelatorioFinanceiro
)
from .serializers import (
    GestorFinanceiroSerializer, ReceitaSerializer, DespesaSerializer,
    MetaFinanceiraSerializer, AtividadeFinanceiraSerializer, 
    RelatorioFinanceiroSerializer
)


def get_or_create_gestor_financeiro(user):
    gestor = GestorFinanceiro.objects.filter(user=user).first()
    if gestor:
        return gestor
    if user.role != 'gestor_financeiro':
        raise GestorFinanceiro.DoesNotExist

    fazenda = Fazenda.objects.filter(gestores_financeiros__isnull=True).first()
    if fazenda:
        return GestorFinanceiro.objects.create(user=user, fazenda=fazenda)
    raise GestorFinanceiro.DoesNotExist


def get_gestor_financeiro_fazenda(user):
    if user.role == 'gestor_financeiro':
        gestor = get_or_create_gestor_financeiro(user)
        return gestor.fazenda
    return Fazenda.objects.filter(produtor=user).first()

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
        if self.request.user.role in ['gestor_financeiro', 'produtor']:
            fazenda = get_gestor_financeiro_fazenda(self.request.user)
            return Receita.objects.filter(fazenda=fazenda) if fazenda else Receita.objects.none()
        return Receita.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role in ['gestor_financeiro', 'produtor']:
            fazenda = get_gestor_financeiro_fazenda(self.request.user)
            if not fazenda:
                raise NotFound('Fazenda não encontrada para o gestor financeiro.')
            receita = serializer.save(fazenda=fazenda, gestor=self.request.user)
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
        if self.request.user.role in ['gestor_financeiro', 'produtor']:
            fazenda = get_gestor_financeiro_fazenda(self.request.user)
            return Despesa.objects.filter(fazenda=fazenda) if fazenda else Despesa.objects.none()
        return Despesa.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role in ['gestor_financeiro', 'produtor']:
            fazenda = get_gestor_financeiro_fazenda(self.request.user)
            if not fazenda:
                raise NotFound('Fazenda não encontrada para o gestor financeiro.')
            despesa = serializer.save(fazenda=fazenda, gestor=self.request.user)
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
        if self.request.user.role in ['gestor_financeiro', 'produtor']:
            fazenda = get_gestor_financeiro_fazenda(self.request.user)
            return MetaFinanceira.objects.filter(fazenda=fazenda) if fazenda else MetaFinanceira.objects.none()
        return MetaFinanceira.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role in ['gestor_financeiro', 'produtor']:
            fazenda = get_gestor_financeiro_fazenda(self.request.user)
            if not fazenda:
                raise NotFound('Fazenda não encontrada para o gestor financeiro.')
            serializer.save(fazenda=fazenda)
        else:
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            serializer.save(fazenda=fazenda)

class AtividadeFinanceiraViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AtividadeFinanceiraSerializer
    permission_classes = [IsGestorFinanceiroOrAdmin]
    ordering = ['-data']
    
    def get_queryset(self):
        if self.request.user.role == 'gestor_financeiro':
            gestor = GestorFinanceiro.objects.filter(user=self.request.user).first()
            if gestor:
                return AtividadeFinanceira.objects.filter(fazenda=gestor.fazenda)[:50]
            return AtividadeFinanceira.objects.none()
        elif self.request.user.role == 'produtor':
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            return AtividadeFinanceira.objects.filter(fazenda=fazenda)[:50]
        return AtividadeFinanceira.objects.all()[:50]

class RelatorioFinanceiroViewSet(viewsets.ModelViewSet):
    serializer_class = RelatorioFinanceiroSerializer
    permission_classes = [IsGestorFinanceiroOrAdmin]
    
    def get_queryset(self):
        if self.request.user.role == 'gestor_financeiro':
            gestor = GestorFinanceiro.objects.filter(user=self.request.user).first()
            if gestor:
                return RelatorioFinanceiro.objects.filter(fazenda=gestor.fazenda)
            return RelatorioFinanceiro.objects.none()
        elif self.request.user.role == 'produtor':
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            return RelatorioFinanceiro.objects.filter(fazenda=fazenda)
        return RelatorioFinanceiro.objects.all()
    
    @action(detail=False, methods=['get'])
    def gerar(self, request):
        if self.request.user.role == 'gestor_financeiro':
            fazenda = get_gestor_financeiro_fazenda(self.request.user)
            if not fazenda:
                raise NotFound('Gestor financeiro não vinculado a uma fazenda.')
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
            gestor = get_or_create_gestor_financeiro(user)
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
    
    ultimas_atividades = AtividadeFinanceira.objects.filter(fazenda=fazenda)
    ultimas_vendas = ultimas_atividades.filter(tipo='receita').count()
    ultimas_despesas_count = ultimas_atividades.filter(tipo='despesa').count()
    
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
def get_gestor_financeiro_analysis(request):
    user = request.user
    try:
        if user.role == 'gestor_financeiro':
            gestor = get_or_create_gestor_financeiro(user)
            fazenda = gestor.fazenda
        else:
            fazenda = Fazenda.objects.get(produtor=user)
    except (GestorFinanceiro.DoesNotExist, Fazenda.DoesNotExist):
        return Response({
            'error': 'Gestor não vinculado a uma fazenda'
        }, status=status.HTTP_404_NOT_FOUND)

    periodo = request.query_params.get('periodo', '6meses')
    hoje = timezone.now().date()
    primeiro_dia_mes = date(hoje.year, hoje.month, 1)

    if periodo == '12meses':
        meses = 12
        inicio = date(hoje.year, hoje.month, 1)
        total_months = inicio.year * 12 + inicio.month - 1 - (meses - 1)
        inicio = date(total_months // 12, total_months % 12 + 1, 1)
    elif periodo == 'ano':
        inicio = date(hoje.year, 1, 1)
    else:
        meses = 6
        inicio = date(hoje.year, hoje.month, 1)
        total_months = inicio.year * 12 + inicio.month - 1 - (meses - 1)
        inicio = date(total_months // 12, total_months % 12 + 1, 1)

    current = inicio
    meses_data = []
    while current <= primeiro_dia_mes:
        receitas = Receita.objects.filter(
            fazenda=fazenda,
            data__year=current.year,
            data__month=current.month,
        ).aggregate(total=Sum('valor'))['total'] or 0
        despesas = Despesa.objects.filter(
            fazenda=fazenda,
            data__year=current.year,
            data__month=current.month,
        ).aggregate(total=Sum('valor'))['total'] or 0
        lucro = receitas - despesas
        meses_data.append({
            'mes': current.strftime('%b/%Y'),
            'receita': float(receitas),
            'despesa': float(despesas),
            'lucro': float(lucro),
        })

        next_month = current.month + 1
        next_year = current.year
        if next_month > 12:
            next_month = 1
            next_year += 1
        current = date(next_year, next_month, 1)

    def calc_percentual(atual, anterior):
        if anterior == 0:
            return '0%'
        return f"{round(((atual - anterior) / abs(anterior)) * 100, 1)}%"

    tendencia = {
        'receita': '0%',
        'despesa': '0%',
        'lucro': '0%',
    }
    if len(meses_data) >= 2:
        atual = meses_data[-1]
        anterior = meses_data[-2]
        tendencia = {
            'receita': calc_percentual(atual['receita'], anterior['receita']),
            'despesa': calc_percentual(atual['despesa'], anterior['despesa']),
            'lucro': calc_percentual(atual['lucro'], anterior['lucro']),
        }

    total_lucro = sum(item['lucro'] for item in meses_data)
    meses_count = len(meses_data) if len(meses_data) > 0 else 1
    media_mensal = total_lucro / meses_count

    projecao = {
        'proximo_mes': round(media_mensal, 2),
        'trimestre': round(media_mensal * 3, 2),
        'ano': round(media_mensal * 12, 2),
    }

    return Response({
        'lucro_mensal': meses_data,
        'tendencia': tendencia,
        'projecao': projecao,
    })


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsGestorFinanceiroOrAdmin])
def get_gestor_financeiro_profile(request):
    user = request.user

    try:
        gestor = get_or_create_gestor_financeiro(user)
    except GestorFinanceiro.DoesNotExist:
        return Response({'error': 'Perfil do gestor não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    perfil = getattr(user, 'perfil', None)
    if request.method == 'GET':
        return Response({
            'nome': perfil.nome_completo if perfil and perfil.nome_completo else user.username,
            'email': user.email,
            'telefone': str(perfil.telefone) if perfil and perfil.telefone else '',
            'cargo': 'Gestor Financeiro',
            'data_admissao': gestor.created_at.date().isoformat() if gestor.created_at else '',
            'departamento': gestor.departamento or (perfil.area_atuacao if perfil else 'Financeiro'),
            'id_gestor': f"G{user.id}",
            'area_atuacao': perfil.area_atuacao if perfil else '',
            'fazenda': gestor.fazenda.nome if gestor.fazenda else '',
        })

    data = request.data
    if perfil is None:
        perfil = Perfil.objects.create(
            user=user,
            nome_completo=user.username or user.email.split('@')[0],
        )

    if 'nome' in data:
        perfil.nome_completo = data.get('nome')
    if 'telefone' in data:
        perfil.telefone = data.get('telefone') or None
    if 'departamento' in data:
        gestor.departamento = data.get('departamento')
    if 'area_atuacao' in data:
        perfil.area_atuacao = data.get('area_atuacao')
    if 'email' in data:
        user.email = data.get('email')
































    try:
        perfil.save()
        gestor.save()
        user.full_clean()
        user.save()
    except ValidationError as e:
        return Response(
            {'errors': e.message_dict if hasattr(e, 'message_dict') else e.messages},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response({
        'nome': perfil.nome_completo if perfil.nome_completo else user.username,
        'email': user.email,
        'telefone': str(perfil.telefone) if perfil.telefone else '',
        'cargo': 'Gestor Financeiro',
        'data_admissao': gestor.created_at.date().isoformat() if gestor.created_at else '',
        'departamento': gestor.departamento or (perfil.area_atuacao if perfil else 'Financeiro'),
        'id_gestor': f"G{user.id}",
        'area_atuacao': perfil.area_atuacao if perfil else '',
        'fazenda': gestor.fazenda.nome if gestor.fazenda else '',
    })


@api_view(['GET'])
@permission_classes([IsGestorFinanceiroOrAdmin])
def get_gestor_financeiro_statistics(request):
    user = request.user
    try:
        if user.role == 'gestor_financeiro':
            gestor = get_or_create_gestor_financeiro(user)
            fazenda = gestor.fazenda
        else:
            fazenda = Fazenda.objects.get(produtor=user)
    except (GestorFinanceiro.DoesNotExist, Fazenda.DoesNotExist):
        return Response({'error': 'Fazenda não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    total_receitas = Receita.objects.filter(fazenda=fazenda).aggregate(total=Sum('valor'))['total'] or 0
    total_despesas = Despesa.objects.filter(fazenda=fazenda).aggregate(total=Sum('valor'))['total'] or 0
    total_gerenciado = float(total_receitas + total_despesas)
    margem = float((total_receitas - total_despesas) / total_receitas * 100) if total_receitas > 0 else 0
    projetos_aprovados = RelatorioFinanceiro.objects.filter(fazenda=fazenda).count()

    return Response({
        'total_gerenciado': total_gerenciado,
        'economia_gerada': round(margem, 2),
        'projetos_aprovados': projetos_aprovados,
    })