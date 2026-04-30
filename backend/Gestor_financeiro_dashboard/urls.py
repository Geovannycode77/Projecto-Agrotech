from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GestorFinanceiroViewSet, ReceitaViewSet, DespesaViewSet,
    MetaFinanceiraViewSet, AtividadeFinanceiraViewSet, 
    RelatorioFinanceiroViewSet, get_gestor_financeiro_dashboard
)

router = DefaultRouter()
router.register(r'gestores', GestorFinanceiroViewSet, basename='gestor-financeiro')
router.register(r'receitas', ReceitaViewSet, basename='receita')
router.register(r'despesas', DespesaViewSet, basename='despesa')
router.register(r'metas', MetaFinanceiraViewSet, basename='meta-financeira')
router.register(r'atividades', AtividadeFinanceiraViewSet, basename='atividade-financeira')
router.register(r'relatorios', RelatorioFinanceiroViewSet, basename='relatorio-financeiro')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', get_gestor_financeiro_dashboard, name='gestor-financeiro-dashboard'),
]
