from rest_framework import viewsets, status, filters, serializers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, Sum
from django.utils import timezone
from datetime import timedelta, date
from django_filters.rest_framework import DjangoFilterBackend
from login_cadastro.models import CustomUser
from produtor_dashboard.models import Fazenda, Animal, TipoRacao
from produtor_dashboard.serializers import AnimalSerializer, TipoRacaoSerializer
from .models import (
    Funcionario, Tarefa, RegistroAlimentacaoFuncionario,
    Ocorrencia, AtualizacaoAnimal, Nascimento
)
from .serializers import (
    FuncionarioSerializer, TarefaSerializer, RegistroAlimentacaoFuncionarioSerializer,
    OcorrenciaSerializer, AtualizacaoAnimalSerializer, NascimentoSerializer,
    DashboardFuncionarioSerializer
)

class IsFuncionarioOrAdmin(IsAuthenticated):
    """Permissão para funcionários e administradores"""
    def has_permission(self, request, view):
        return super().has_permission(request, view) and (
            request.user.role == 'funcionario' or 
            request.user.role == 'produtor' or
            request.user.role == 'administrador' or 
            request.user.is_superuser
        )

class FuncionarioViewSet(viewsets.ModelViewSet):
    serializer_class = FuncionarioSerializer
    permission_classes = [IsFuncionarioOrAdmin]
    
    def get_queryset(self):
        if self.request.user.role == 'funcionario':
            return Funcionario.objects.filter(user=self.request.user)
        return Funcionario.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['GET'])
@permission_classes([IsFuncionarioOrAdmin])
def get_animais_funcionario(request):
    if request.user.role == 'funcionario':
        funcionario = Funcionario.objects.get(user=request.user)
        animais = Animal.objects.filter(fazenda=funcionario.fazenda)
    elif request.user.role == 'produtor':
        fazenda = Fazenda.objects.get(produtor=request.user)
        animais = Animal.objects.filter(fazenda=fazenda)
    else:
        animais = Animal.objects.none()

    serializer = AnimalSerializer(animais, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsFuncionarioOrAdmin])
def get_tipos_racao_funcionario(request):
    if request.user.role == 'funcionario':
        funcionario = Funcionario.objects.get(user=request.user)
        tipos = TipoRacao.objects.filter(fazenda=funcionario.fazenda)
    elif request.user.role == 'produtor':
        fazenda = Fazenda.objects.get(produtor=request.user)
        tipos = TipoRacao.objects.filter(fazenda=fazenda)
    else:
        tipos = TipoRacao.objects.none()

    serializer = TipoRacaoSerializer(tipos, many=True)
    return Response(serializer.data)

class TarefaViewSet(viewsets.ModelViewSet):
    serializer_class = TarefaSerializer
    permission_classes = [IsFuncionarioOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'prioridade', 'tipo']
    search_fields = ['titulo', 'descricao']
    ordering_fields = ['data_limite', 'created_at']
    ordering = ['data_limite']
    
    def get_queryset(self):
        if self.request.user.role == 'funcionario':
            return Tarefa.objects.filter(funcionario=self.request.user)
        elif self.request.user.role == 'produtor':
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            return Tarefa.objects.filter(fazenda=fazenda)
        return Tarefa.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role == 'produtor':
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            if 'funcionario' not in serializer.validated_data or serializer.validated_data.get('funcionario') is None:
                raise serializers.ValidationError({'funcionario_id': 'O funcionário responsável pela tarefa deve ser informado.'})
            serializer.save(fazenda=fazenda)
        else:
            funcionario = Funcionario.objects.get(user=self.request.user)
            serializer.save(
                funcionario=self.request.user,
                fazenda=funcionario.fazenda
            )
    
    @action(detail=True, methods=['post'])
    def concluir(self, request, pk=None):
        tarefa = self.get_object()
        tarefa.status = 'concluida'
        tarefa.data_conclusao = timezone.now()
        tarefa.save()
        return Response({'message': 'Tarefa concluída com sucesso'})
    
    @action(detail=True, methods=['post'])
    def iniciar(self, request, pk=None):
        tarefa = self.get_object()
        tarefa.status = 'em_andamento'
        tarefa.save()
        return Response({'message': 'Tarefa iniciada'})
    
    @action(detail=False, methods=['get'])
    def hoje(self, request):
        """Tarefas para hoje"""
        hoje = timezone.now().date()
        amanha = hoje + timedelta(days=1)
        
        tarefas = self.get_queryset().filter(
            data_limite__date__gte=hoje,
            data_limite__date__lt=amanha,
            status__in=['pendente', 'em_andamento']
        )
        serializer = self.get_serializer(tarefas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def proximas(self, request):
        """Próximas tarefas (próximos 7 dias)"""
        hoje = timezone.now().date()
        limite = hoje + timedelta(days=7)
        
        tarefas = self.get_queryset().filter(
            data_limite__date__gt=hoje,
            data_limite__date__lte=limite,
            status__in=['pendente', 'em_andamento']
        ).order_by('data_limite')
        
        serializer = self.get_serializer(tarefas, many=True)
        return Response(serializer.data)

class RegistroAlimentacaoViewSet(viewsets.ModelViewSet):
    serializer_class = RegistroAlimentacaoFuncionarioSerializer
    permission_classes = [IsFuncionarioOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['tipo_racao']
    ordering_fields = ['data_hora']
    ordering = ['-data_hora']
    
    def get_queryset(self):
        if self.request.user.role == 'funcionario':
            return RegistroAlimentacaoFuncionario.objects.filter(funcionario=self.request.user)
        elif self.request.user.role == 'produtor':
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            return RegistroAlimentacaoFuncionario.objects.filter(fazenda=fazenda)
        return RegistroAlimentacaoFuncionario.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role == 'funcionario':
            funcionario = Funcionario.objects.get(user=self.request.user)
            serializer.save(
                funcionario=self.request.user,
                fazenda=funcionario.fazenda
            )
        else:
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            serializer.save(fazenda=fazenda)

class OcorrenciaViewSet(viewsets.ModelViewSet):
    serializer_class = OcorrenciaSerializer
    permission_classes = [IsFuncionarioOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tipo', 'resolvido']
    search_fields = ['titulo', 'descricao']
    ordering_fields = ['data_hora']
    ordering = ['-data_hora']
    
    def get_queryset(self):
        if self.request.user.role == 'funcionario':
            return Ocorrencia.objects.filter(funcionario=self.request.user)
        elif self.request.user.role == 'produtor':
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            return Ocorrencia.objects.filter(fazenda=fazenda)
        return Ocorrencia.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role == 'funcionario':
            funcionario = Funcionario.objects.get(user=self.request.user)
            serializer.save(
                funcionario=self.request.user,
                fazenda=funcionario.fazenda
            )
        else:
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            serializer.save(fazenda=fazenda)
    
    @action(detail=True, methods=['post'])
    def resolver(self, request, pk=None):
        ocorrencia = self.get_object()
        ocorrencia.resolvido = True
        ocorrencia.data_resolucao = timezone.now()
        ocorrencia.save()
        return Response({'message': 'Ocorrência marcada como resolvida'})

class AtualizacaoAnimalViewSet(viewsets.ModelViewSet):
    serializer_class = AtualizacaoAnimalSerializer
    permission_classes = [IsFuncionarioOrAdmin]
    ordering = ['-data_hora']
    
    def get_queryset(self):
        if self.request.user.role == 'funcionario':
            return AtualizacaoAnimal.objects.filter(funcionario=self.request.user)
        elif self.request.user.role == 'produtor':
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            return AtualizacaoAnimal.objects.filter(animal__fazenda=fazenda)
        return AtualizacaoAnimal.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(funcionario=self.request.user)

class NascimentoViewSet(viewsets.ModelViewSet):
    serializer_class = NascimentoSerializer
    permission_classes = [IsFuncionarioOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['especie']
    ordering = ['-data_nascimento']
    
    def get_queryset(self):
        if self.request.user.role == 'funcionario':
            return Nascimento.objects.filter(funcionario=self.request.user)
        elif self.request.user.role == 'produtor':
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            return Nascimento.objects.filter(fazenda=fazenda)
        return Nascimento.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role == 'funcionario':
            funcionario = Funcionario.objects.get(user=self.request.user)
            serializer.save(
                funcionario=self.request.user,
                fazenda=funcionario.fazenda
            )
        else:
            fazenda = Fazenda.objects.get(produtor=self.request.user)
            serializer.save(fazenda=fazenda)

class FuncionarioViewSet(viewsets.ModelViewSet):
    serializer_class = FuncionarioSerializer
    permission_classes = [IsFuncionarioOrAdmin]
    
    def get_queryset(self):
        if self.request.user.role == 'funcionario':
            return Funcionario.objects.filter(user=self.request.user)
        return Funcionario.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def para_produtor(self, request):
        """Listar funcionários para o produtor"""
        if request.user.role == 'produtor':
            from produtor_dashboard.models import Fazenda
            fazenda = Fazenda.objects.get(produtor=request.user)
            funcionarios = Funcionario.objects.filter(fazenda=fazenda)
            
            resultados = []
            for func in funcionarios:
                nome = func.user.email.split('@')[0]
                if hasattr(func.user, 'perfil') and func.user.perfil and func.user.perfil.nome_completo:
                    nome = func.user.perfil.nome_completo
                
                resultados.append({
                    'id': func.id,
                    'nome': nome,
                    'email': func.user.email,
                })
            return Response(resultados)
        return Response([])

@api_view(['GET'])
@permission_classes([IsFuncionarioOrAdmin])
def get_funcionario_dashboard(request):
    """Dados completos do dashboard do funcionário"""
    user = request.user
    
    try:
        funcionario = Funcionario.objects.get(user=user)
        fazenda = funcionario.fazenda
    except Funcionario.DoesNotExist:
        return Response({
            'error': 'Funcionário não vinculado a uma fazenda'
        }, status=status.HTTP_404_NOT_FOUND)
    
    hoje = timezone.now().date()
    amanha = hoje + timedelta(days=1)
    inicio_mes = date(hoje.year, hoje.month, 1)
    
    # Tarefas para hoje
    tarefas_hoje = Tarefa.objects.filter(
        funcionario=user,
        data_limite__date__gte=hoje,
        data_limite__date__lt=amanha,
        status__in=['pendente', 'em_andamento']
    ).count()
    
    # Tarefas concluídas hoje
    tarefas_concluidas = Tarefa.objects.filter(
        funcionario=user,
        status='concluida',
        data_conclusao__date=hoje
    ).count()
    
    # Tarefas pendentes
    tarefas_pendentes = Tarefa.objects.filter(
        funcionario=user,
        status__in=['pendente', 'em_andamento']
    ).count()
    
    # Próximas tarefas (próximos 7 dias)
    limite = hoje + timedelta(days=7)
    tarefas_proximas = Tarefa.objects.filter(
        funcionario=user,
        data_limite__date__gt=hoje,
        data_limite__date__lte=limite,
        status__in=['pendente', 'em_andamento']
    ).count()
    
    # Alimentações registradas no mês
    alimentacoes_registradas = RegistroAlimentacaoFuncionario.objects.filter(
        funcionario=user,
        data_hora__date__gte=inicio_mes
    ).count()
    
    # Atualizações de animais no mês
    animais_atualizados = AtualizacaoAnimal.objects.filter(
        funcionario=user,
        data_hora__date__gte=inicio_mes
    ).count()
    
    # Nascimentos no mês
    nascimentos_mes = Nascimento.objects.filter(
        fazenda=fazenda,
        data_nascimento__gte=inicio_mes
    ).aggregate(total=Sum('quantidade'))['total'] or 0
    
    # Ocorrências pendentes
    ocorrencias = Ocorrencia.objects.filter(
        fazenda=fazenda,
        resolvido=False
    ).count()
    
    return Response({
        'tarefas_hoje': tarefas_hoje,
        'tarefas_concluidas': tarefas_concluidas,
        'tarefas_pendentes': tarefas_pendentes,
        'tarefas_proximas': tarefas_proximas,
        'alimentacoes_registradas': alimentacoes_registradas,
        'animais_atualizados': animais_atualizados,
        'nascimentos_mes': nascimentos_mes,
        'ocorrencias': ocorrencias,
    })

# Adicione no final do arquivo

# backend/funcionario_dashboard/views.py

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_funcionarios_list(request):
    """Listar todos os funcionários para o produtor"""
    try:
        if request.user.role == 'produtor':
            from produtor_dashboard.models import Fazenda
            from login_cadastro.models import Perfil
            
            fazenda = Fazenda.objects.get(produtor=request.user)
            funcionarios = Funcionario.objects.filter(fazenda=fazenda)
            
            resultados = []
            for func in funcionarios:
                # Buscar o nome do perfil do funcionário
                nome_funcionario = func.user.email.split('@')[0]
                
                # Tentar pegar do perfil
                try:
                    perfil = Perfil.objects.get(user=func.user)
                    if perfil.nome_completo:
                        nome_funcionario = perfil.nome_completo
                except Perfil.DoesNotExist:
                    pass
                
                resultados.append({
                    'id': func.id,
                    'user_id': func.user.id,
                    'email': func.user.email,
                    'nome': nome_funcionario,
                    'fazenda': func.fazenda.nome if func.fazenda else None,
                })
            
            print(f"✅ Funcionários encontrados: {len(resultados)}")  # Debug
            return Response(resultados)
        return Response([])
    except Exception as e:
        print(f"❌ Erro em get_funcionarios_list: {e}")
        return Response([], status=500)