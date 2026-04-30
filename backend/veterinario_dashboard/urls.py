from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VeterinarioViewSet, ConsultaViewSet, VacinaViewSet,
    TratamentoViewSet, AlertaSaudeViewSet, LembreteSaudeViewSet,
    get_veterinario_dashboard
)

router = DefaultRouter()
router.register(r'veterinarios', VeterinarioViewSet, basename='veterinario')
router.register(r'consultas', ConsultaViewSet, basename='consulta')
router.register(r'vacinas', VacinaViewSet, basename='vacina')
router.register(r'tratamentos', TratamentoViewSet, basename='tratamento')
router.register(r'alertas', AlertaSaudeViewSet, basename='alerta-saude')
router.register(r'lembretes', LembreteSaudeViewSet, basename='lembrete')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', get_veterinario_dashboard, name='veterinario-dashboard'),
]