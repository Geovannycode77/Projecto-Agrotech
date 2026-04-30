from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    FuncionarioViewSet, TarefaViewSet, RegistroAlimentacaoViewSet,
    OcorrenciaViewSet, AtualizacaoAnimalViewSet, NascimentoViewSet,
    get_funcionario_dashboard
)

router = DefaultRouter()
router.register(r'funcionarios', FuncionarioViewSet, basename='funcionario')
router.register(r'tarefas', TarefaViewSet, basename='tarefa')
router.register(r'alimentacao', RegistroAlimentacaoViewSet, basename='alimentacao')
router.register(r'ocorrencias', OcorrenciaViewSet, basename='ocorrencia')
router.register(r'atualizacoes', AtualizacaoAnimalViewSet, basename='atualizacao')
router.register(r'nascimentos', NascimentoViewSet, basename='nascimento')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', get_funcionario_dashboard, name='funcionario_dashboard'),
]
