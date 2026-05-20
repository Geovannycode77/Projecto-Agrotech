from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FazendaViewSet, AnimalViewSet, AlimentacaoViewSet,
    FinanceiroViewSet, AlertaViewSet, AtividadeViewSet,
    RelatorioViewSet, get_produtor_dashboard,
    get_proximas_vacinas, get_alertas_list, marcar_alerta_lido,
    get_indicadores_producao, get_relatorios_disponiveis
)

router = DefaultRouter()
router.register(r'fazenda', FazendaViewSet, basename='fazenda')
router.register(r'animais', AnimalViewSet, basename='animal')
router.register(r'alimentacao', AlimentacaoViewSet, basename='alimentacao')
router.register(r'financeiro', FinanceiroViewSet, basename='financeiro')
router.register(r'alertas', AlertaViewSet, basename='alerta')
router.register(r'atividades', AtividadeViewSet, basename='atividade')
router.register(r'relatorios', RelatorioViewSet, basename='relatorio')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', get_produtor_dashboard, name='produtor_dashboard'),

    # Vacinas e Alertas
    path('vacinas/proximas/', get_proximas_vacinas, name='vacinas-proximas'),
    path('alertas/list/', get_alertas_list, name='alertas-list'),
    path('alertas/<int:alerta_id>/marcar-lido/', marcar_alerta_lido, name='marcar-alerta-lido'),

    # Indicadores e Relatórios
    path('relatorios/indicadores/', get_indicadores_producao, name='indicadores-producao'),
    path('relatorios/disponiveis/', get_relatorios_disponiveis, name='relatorios-disponiveis'),
]
