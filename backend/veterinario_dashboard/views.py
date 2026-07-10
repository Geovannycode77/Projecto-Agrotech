from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta, date
from produtor_dashboard.models import Animal, Fazenda
from produtor_dashboard.serializers import AnimalSerializer
from django_filters.rest_framework import DjangoFilterBackend
from login_cadastro.models import CustomUser
from login_cadastro.permissions import ModulePermission
from produtor_dashboard.models import Fazenda, Animal
from .models import (
    Veterinario, Consulta, Vacina, Tratamento, AlertaSaude, LembreteSaude
)
from .serializers import (
    VeterinarioSerializer, ConsultaSerializer, VacinaSerializer,
    TratamentoSerializer, AlertaSaudeSerializer, LembreteSaudeSerializer
)

class IsVeterinarioOrAdmin(IsAuthenticated):
    """Permissão para veterinários e administradores"""
    def has_permission(self, request, view):
        return super().has_permission(request, view) and (
            request.user.role == 'veterinario' or 
            request.user.role == 'produtor' or
            request.user.role == 'administrador' or 
            request.user.is_superuser
        )

class VeterinarioViewSet(viewsets.ModelViewSet):
    serializer_class = VeterinarioSerializer
    permission_classes = [IsVeterinarioOrAdmin]
    
    def get_queryset(self):
        if self.request.user.role == 'veterinario':
            return Veterinario.objects.filter(user=self.request.user)
        return Veterinario.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ConsultaViewSet(viewsets.ModelViewSet):
    serializer_class = ConsultaSerializer
    permission_classes = [IsVeterinarioOrAdmin, ModulePermission('consultas')]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'tipo']
    search_fields = ['descricao', 'diagnostico']
    ordering_fields = ['data_consulta', 'horario']
    ordering = ['data_consulta', 'horario']
    
    def get_queryset(self):
        if self.request.user.role == 'veterinario':
            return Consulta.objects.filter(veterinario=self.request.user)
        elif self.request.user.role == 'produtor':
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            return Consulta.objects.filter(fazenda=fazenda)
        return Consulta.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role == 'veterinario':
            veterinario = Veterinario.objects.get(user=self.request.user)
            serializer.save(veterinario=self.request.user, fazenda=veterinario.fazenda)
        else:
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            serializer.save(fazenda=fazenda)
    
    @action(detail=True, methods=['post'])
    def concluir(self, request, pk=None):
        consulta = self.get_object()
        consulta.status = 'concluido'
        consulta.save()
        return Response({'message': 'Consulta concluída com sucesso'})
    
    @action(detail=False, methods=['get'])
    def hoje(self, request):
        hoje = timezone.now().date()
        consultas = self.get_queryset().filter(data_consulta=hoje)
        serializer = self.get_serializer(consultas, many=True)
        return Response(serializer.data)

class VacinaViewSet(viewsets.ModelViewSet):
    serializer_class = VacinaSerializer
    permission_classes = [IsVeterinarioOrAdmin, ModulePermission('vacinas')]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['nome_vacina']
    search_fields = ['nome_vacina', 'lote']
    ordering = ['-data_aplicacao']
    
    def get_queryset(self):
        if self.request.user.role == 'veterinario':
            return Vacina.objects.filter(veterinario=self.request.user)
        elif self.request.user.role == 'produtor':
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            return Vacina.objects.filter(fazenda=fazenda)
        return Vacina.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role == 'veterinario':
            veterinario = Veterinario.objects.get(user=self.request.user)
            serializer.save(veterinario=self.request.user, fazenda=veterinario.fazenda)
        else:
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            serializer.save(fazenda=fazenda)
    
    @action(detail=False, methods=['get'])
    def proximas(self, request):
        hoje = timezone.now().date()
        proximas = self.get_queryset().filter(data_proxima_dose__gte=hoje)[:20]
        serializer = self.get_serializer(proximas, many=True)
        return Response(serializer.data)

class TratamentoViewSet(viewsets.ModelViewSet):
    serializer_class = TratamentoSerializer
    permission_classes = [IsVeterinarioOrAdmin, ModulePermission('consultas', 'vacinas')]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']
    ordering = ['-data_inicio']
    
    def get_queryset(self):
        if self.request.user.role == 'veterinario':
            return Tratamento.objects.filter(veterinario=self.request.user)
        elif self.request.user.role == 'produtor':
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            return Tratamento.objects.filter(fazenda=fazenda)
        return Tratamento.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role == 'veterinario':
            veterinario = Veterinario.objects.get(user=self.request.user)
            serializer.save(veterinario=self.request.user, fazenda=veterinario.fazenda)
        else:
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            serializer.save(fazenda=fazenda)
    
    @action(detail=True, methods=['post'])
    def concluir(self, request, pk=None):
        tratamento = self.get_object()
        tratamento.status = 'concluido'
        tratamento.data_fim = timezone.now().date()
        tratamento.save()
        return Response({'message': 'Tratamento concluído com sucesso'})

class AlertaSaudeViewSet(viewsets.ModelViewSet):
    serializer_class = AlertaSaudeSerializer
    permission_classes = [IsVeterinarioOrAdmin, ModulePermission('consultas', 'vacinas')]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['prioridade', 'tipo', 'lido']
    ordering = ['-created_at']
    
    def get_queryset(self):
        if self.request.user.role == 'veterinario':
            return AlertaSaude.objects.filter(veterinario=self.request.user)
        elif self.request.user.role == 'produtor':
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            return AlertaSaude.objects.filter(fazenda=fazenda)
        return AlertaSaude.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role == 'veterinario':
            veterinario = Veterinario.objects.get(user=self.request.user)
            serializer.save(veterinario=self.request.user, fazenda=veterinario.fazenda)
        else:
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            serializer.save(fazenda=fazenda)
    
    @action(detail=True, methods=['post'])
    def marcar_lido(self, request, pk=None):
        alerta = self.get_object()
        alerta.lido = True
        alerta.save()
        return Response({'message': 'Alerta marcado como lido'})
    
    @action(detail=False, methods=['get'])
    def nao_lidos(self, request):
        alertas = self.get_queryset().filter(lido=False)
        serializer = self.get_serializer(alertas, many=True)
        return Response(serializer.data)

class LembreteSaudeViewSet(viewsets.ModelViewSet):
    serializer_class = LembreteSaudeSerializer
    permission_classes = [IsVeterinarioOrAdmin, ModulePermission('consultas', 'vacinas')]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['ativo', 'frequencia']
    ordering = ['data_lembrete']
    
    def get_queryset(self):
        if self.request.user.role == 'veterinario':
            return LembreteSaude.objects.filter(veterinario=self.request.user)
        elif self.request.user.role == 'produtor':
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            return LembreteSaude.objects.filter(fazenda=fazenda)
        return LembreteSaude.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role == 'veterinario':
            veterinario = Veterinario.objects.get(user=self.request.user)
            serializer.save(veterinario=self.request.user, fazenda=veterinario.fazenda)
        else:
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            serializer.save(fazenda=fazenda)

@api_view(['GET'])
@permission_classes([IsVeterinarioOrAdmin, ModulePermission('dashboard')])
def get_veterinario_dashboard(request):
    """Dados completos do dashboard do veterinário"""
    user = request.user
    
    try:
        if user.role == 'veterinario':
            try:
                veterinario = Veterinario.objects.get(user=user)
                fazenda = veterinario.fazenda
            except Veterinario.DoesNotExist:
                # Veterinário sem perfil criado ainda — retorna dados zerados
                # em vez de 404, para não crashar o dashboard
                return Response({
                    'consultas_hoje': 0,
                    'vacinacoes_hoje': 0,
                    'pendentes': 0,
                    'alertas': 0,
                    'animais_tratamento': 0,
                    'recuperados_mes': 0,
                    'estatisticas': {
                        'taxa_sucesso': 0,
                        'total_atendimentos': 0,
                    },
                    'aviso': 'Veterinário não vinculado a uma fazenda ainda.'
                })
        else:
            try:
                fazenda = Fazenda.objects.get(produtor=user)
            except Fazenda.DoesNotExist:
                return Response({
                    'consultas_hoje': 0, 'vacinacoes_hoje': 0,
                    'pendentes': 0, 'alertas': 0,
                    'animais_tratamento': 0, 'recuperados_mes': 0,
                    'estatisticas': {'taxa_sucesso': 0, 'total_atendimentos': 0},
                })
    except Exception as e:
        return Response({
            'consultas_hoje': 0, 'vacinacoes_hoje': 0,
            'pendentes': 0, 'alertas': 0,
            'animais_tratamento': 0, 'recuperados_mes': 0,
            'estatisticas': {'taxa_sucesso': 0, 'total_atendimentos': 0},
            'error': str(e)
        })

    hoje = timezone.now().date()
    inicio_mes = date(hoje.year, hoje.month, 1)

    consultas_hoje = Consulta.objects.filter(
        fazenda=fazenda, data_consulta=hoje,
        status__in=['agendado', 'em_andamento']
    ).count()

    vacinacoes_hoje = Vacina.objects.filter(
        fazenda=fazenda, data_aplicacao=hoje
    ).count()

    pendentes = Consulta.objects.filter(
        fazenda=fazenda, data_consulta__lt=hoje, status='agendado'
    ).count()

    alertas_nao_lidos = AlertaSaude.objects.filter(
        fazenda=fazenda, lido=False
    ).count()

    animais_tratamento = Tratamento.objects.filter(
        fazenda=fazenda, status='em_andamento'
    ).values('animal').distinct().count()

    recuperados_mes = Tratamento.objects.filter(
        fazenda=fazenda, status='concluido', data_fim__gte=inicio_mes
    ).count()

    total_atendimentos = Consulta.objects.filter(fazenda=fazenda).count()
    tratamentos_concluidos = Tratamento.objects.filter(
        fazenda=fazenda, status='concluido'
    ).count()
    taxa_sucesso = (
        tratamentos_concluidos / total_atendimentos * 100
    ) if total_atendimentos > 0 else 0

    return Response({
        'consultas_hoje': consultas_hoje,
        'vacinacoes_hoje': vacinacoes_hoje,
        'pendentes': pendentes,
        'alertas': alertas_nao_lidos,
        'animais_tratamento': animais_tratamento,
        'recuperados_mes': recuperados_mes,
        'estatisticas': {
            'taxa_sucesso': round(taxa_sucesso, 2),
            'total_atendimentos': total_atendimentos,
        }
    })

@api_view(['GET'])
@permission_classes([IsVeterinarioOrAdmin, ModulePermission('animais', 'consultas', 'vacinas')])
def get_animais_veterinario(request):
    try:
        vet = Veterinario.objects.get(user=request.user)
        animais = Animal.objects.filter(fazenda=vet.fazenda)
    except Veterinario.DoesNotExist:
        # ← retorna vazio em vez de 404
        if request.user.role in ('administrador',) or request.user.is_superuser:
            animais = Animal.objects.all()
        else:
            return Response([])

    status_saude = request.query_params.get('status_saude')
    status_param = request.query_params.get('status')
    especie      = request.query_params.get('especie')
    limit        = request.query_params.get('limit')

    if status_saude:
        animais = animais.filter(status=status_saude)
    if status_param:
        animais = animais.filter(status=status_param)
    if especie:
        animais = animais.filter(especie=especie)
    if limit:
        try:
            animais = animais[:int(limit)]
        except ValueError:
            pass

    serializer = AnimalSerializer(animais, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsVeterinarioOrAdmin, ModulePermission('consultas', 'vacinas')])
def get_resumo_saude(request):
    try:
        vet = Veterinario.objects.get(user=request.user)
        fazenda = vet.fazenda
    except Veterinario.DoesNotExist:
        try:
            fazenda = Fazenda.objects.get(produtor=request.user)
        except Fazenda.DoesNotExist:
            # ← retorna zeros em vez de 404
            return Response({
                'total_animais': 0, 'animais_saudaveis': 0,
                'animais_doentes': 0, 'animais_mortos': 0,
                'tratamentos_ativos': 0,
            })

    animais = Animal.objects.filter(fazenda=fazenda)
    return Response({
        'total_animais':      animais.count(),
        'animais_saudaveis':  animais.filter(status='ativo').count(),
        'animais_doentes':    animais.filter(status='doente').count(),
        'animais_mortos':     animais.filter(status='morto').count(),
        'tratamentos_ativos': Tratamento.objects.filter(
            fazenda=fazenda, status='em_andamento'
        ).count(),
    })

@api_view(['GET', 'PUT'])
@permission_classes([IsVeterinarioOrAdmin])
def get_perfil_veterinario(request):
    from login_cadastro.models import Perfil

    # Carrega o Veterinario com segurança
    try:
        vet = Veterinario.objects.get(user=request.user)
    except Veterinario.DoesNotExist:
        vet = None

    # Carrega o Perfil com segurança
    perfil, _ = Perfil.objects.get_or_create(
        user=request.user,
        defaults={'nome_completo': ''}
    )

    if request.method == 'GET':
        # especialidade: devolve o valor raw, não o display
        # (evita crash se o valor não estiver nas choices)
        especialidade_raw = ''
        if vet:
            especialidade_raw = vet.especialidade or ''

        return Response({
            'nome_completo':   perfil.nome_completo   or '',
            'email':           request.user.email     or '',
            'telefone':        str(perfil.telefone) if perfil.telefone else '',
            'endereco':        perfil.endereco         or '',
            'data_nascimento': str(perfil.data_nascimento) if perfil.data_nascimento else '',
            'registro_crmv':   vet.registro_crmv       if vet else '',
            'especialidade':   especialidade_raw,
            'fazenda_nome':    vet.fazenda.nome         if vet and vet.fazenda else '',
        })

    # PUT — atualiza Perfil e Veterinario
    if request.method == 'PUT':
        data = request.data

        # Atualiza Perfil
        campos_perfil = ['nome_completo', 'telefone', 'endereco', 'data_nascimento']
        for campo in campos_perfil:
            if campo in data:
                valor = data[campo] or None if campo == 'data_nascimento' else data[campo]
                setattr(perfil, campo, valor)
        perfil.save()

        # Atualiza Veterinario
        if vet:
            if 'registro_crmv' in data:
                vet.registro_crmv = data['registro_crmv'] or ''
            if 'especialidade' in data:
                vet.especialidade = data['especialidade'] or 'geral'
            vet.save()

        return Response({
            'message': 'Perfil atualizado com sucesso',
            'nome_completo':   perfil.nome_completo,
            'telefone':        perfil.telefone or '',
            'endereco':        perfil.endereco or '',
            'data_nascimento': str(perfil.data_nascimento) if perfil.data_nascimento else '',
            'registro_crmv':   vet.registro_crmv if vet else '',
            'especialidade':   vet.especialidade  if vet else '',
        })