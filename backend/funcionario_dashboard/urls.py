# backend/funcionario_dashboard/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FuncionarioViewSet, TarefaViewSet, RegistroAlimentacaoViewSet,
    OcorrenciaViewSet, AtualizacaoAnimalViewSet, NascimentoViewSet,
    get_funcionario_dashboard, get_animais_funcionario, get_tipos_racao_funcionario,
    get_funcionarios_list
)


router = DefaultRouter()
router.register(r'funcionarios', FuncionarioViewSet, basename='funcionario')
router.register(r'tarefas', TarefaViewSet, basename='tarefa')
router.register(r'alimentacao', RegistroAlimentacaoViewSet, basename='alimentacao-funcionario')
router.register(r'ocorrencias', OcorrenciaViewSet, basename='ocorrencia')
router.register(r'atualizacoes', AtualizacaoAnimalViewSet, basename='atualizacao')
router.register(r'nascimentos', NascimentoViewSet, basename='nascimento')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', get_funcionario_dashboard, name='funcionario-dashboard'),
    path('animais/', get_animais_funcionario, name='funcionario-animais'),
    path('alimentacao/tipos/', get_tipos_racao_funcionario, name='funcionario-tipos-racao'),
    path('funcionarios-list/', get_funcionarios_list, name='funcionarios-list'),  # ← Adicione esta linha
]# backend/funcionario_dashboard/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FuncionarioViewSet, TarefaViewSet, RegistroAlimentacaoViewSet,
    OcorrenciaViewSet, AtualizacaoAnimalViewSet, NascimentoViewSet,
    get_funcionario_dashboard, get_animais_funcionario, get_tipos_racao_funcionario,
    get_funcionarios_list
)

router = DefaultRouter()
router.register(r'funcionarios', FuncionarioViewSet, basename='funcionario')
router.register(r'tarefas', TarefaViewSet, basename='tarefa')
router.register(r'alimentacao', RegistroAlimentacaoViewSet, basename='alimentacao-funcionario')
router.register(r'ocorrencias', OcorrenciaViewSet, basename='ocorrencia')
router.register(r'atualizacoes', AtualizacaoAnimalViewSet, basename='atualizacao')
router.register(r'nascimentos', NascimentoViewSet, basename='nascimento')

urlpatterns = [
    # ⚠️ Paths específicos ANTES do router, senão o router engole tudo
    path('dashboard/', get_funcionario_dashboard, name='funcionario-dashboard'),
    path('animais/', get_animais_funcionario, name='funcionario-animais'),
    path('alimentacao/tipos/', get_tipos_racao_funcionario, name='funcionario-tipos-racao'),
    path('funcionarios-list/', get_funcionarios_list, name='funcionarios-list'),

    # Router por último
    path('', include(router.urls)),
]
