from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FazendaViewSet, AnimalViewSet, 
    TipoRacaoViewSet, EstoqueRacaoViewSet,
    AlimentacaoViewSet, CompraRacaoViewSet,
    FinanceiroViewSet, AlertaViewSet, AtividadeViewSet,
    RelatorioViewSet, get_produtor_dashboard, get_perfil_estatisticas,
    get_indicadores_producao, preferencias_notificacoes, get_ocorrencias_fazenda, resolver_ocorrencia_produtor
)

router = DefaultRouter()
router.register(r'fazenda', FazendaViewSet, basename='fazenda')
router.register(r'animais', AnimalViewSet, basename='animal')
router.register(r'tipos-racao', TipoRacaoViewSet, basename='tipo-racao')
router.register(r'estoque-racao', EstoqueRacaoViewSet, basename='estoque-racao')
router.register(r'alimentacao', AlimentacaoViewSet, basename='alimentacao')
router.register(r'compras-racao', CompraRacaoViewSet, basename='compra-racao')
router.register(r'financeiro', FinanceiroViewSet, basename='financeiro')
router.register(r'alertas', AlertaViewSet, basename='alerta')
router.register(r'atividades', AtividadeViewSet, basename='atividade')
router.register(r'relatorios', RelatorioViewSet, basename='relatorio')

urlpatterns = [
   
    path('dashboard/', get_produtor_dashboard, name='produtor_dashboard'),
    path('perfil/estatisticas/', get_perfil_estatisticas, name='perfil-estatisticas'),
    path('indicadores/', get_indicadores_producao, name='indicadores-producao'),
    path('preferencias/notificacoes/', preferencias_notificacoes, name='preferencias-notificacoes'), 
    path('ocorrencias/', get_ocorrencias_fazenda, name='ocorrencias-fazenda'),
    path('ocorrencias/<int:ocorrencia_id>/resolver/', resolver_ocorrencia_produtor, name='resolver-ocorrencia'),
    
    path('', include(router.urls)),
]