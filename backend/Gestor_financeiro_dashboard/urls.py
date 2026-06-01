from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GestorFinanceiroViewSet, ReceitaViewSet, DespesaViewSet,
    MetaFinanceiraViewSet, AtividadeFinanceiraViewSet, 
    RelatorioFinanceiroViewSet, get_gestor_financeiro_dashboard,
    get_gestor_financeiro_analysis, get_gestor_financeiro_profile,
    get_gestor_financeiro_statistics
)

router = DefaultRouter()
router.register(r'gestores', GestorFinanceiroViewSet, basename='gestor-financeiro')
router.register(r'receitas', ReceitaViewSet, basename='receita')
router.register(r'despesas', DespesaViewSet, basename='despesa')
router.register(r'metas', MetaFinanceiraViewSet, basename='meta-financeira')
router.register(r'atividades', AtividadeFinanceiraViewSet, basename='atividade-financeira')
router.register(r'relatorios', RelatorioFinanceiroViewSet, basename='relatorio-financeiro')

urlpatterns = [
    path('relatorios/estatisticas/', get_gestor_financeiro_statistics, name='gestor-financeiro-estatisticas'),
    path('dashboard/', get_gestor_financeiro_dashboard, name='gestor-financeiro-dashboard'),
    path('perfil/', get_gestor_financeiro_profile, name='gestor-financeiro-profile'),
    path('analise/', get_gestor_financeiro_analysis, name='gestor-financeiro-analise'),
    path('', include(router.urls)),
]
