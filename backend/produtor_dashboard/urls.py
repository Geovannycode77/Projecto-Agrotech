from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FazendaViewSet, AnimalViewSet, AlimentacaoViewSet,
    FinanceiroViewSet, AlertaViewSet, AtividadeViewSet,
    RelatorioViewSet, get_produtor_dashboard
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
]
