from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VeterinarioViewSet, ConsultaViewSet, VacinaViewSet,
    TratamentoViewSet, AlertaSaudeViewSet, LembreteSaudeViewSet,
    get_veterinario_dashboard, get_animais_veterinario, get_resumo_saude, get_perfil_veterinario
)

router = DefaultRouter()
router.register(r'veterinarios', VeterinarioViewSet, basename='veterinario')
router.register(r'consultas', ConsultaViewSet, basename='consulta')
router.register(r'vacinas', VacinaViewSet, basename='vacina')
router.register(r'tratamentos', TratamentoViewSet, basename='tratamento')
router.register(r'alertas', AlertaSaudeViewSet, basename='alerta-saude')
router.register(r'lembretes', LembreteSaudeViewSet, basename='lembrete')

urlpatterns = [
    # ← paths específicos ANTES do router
    path('dashboard/', get_veterinario_dashboard, name='veterinario-dashboard'),
    path('animais/', get_animais_veterinario, name='veterinario-animais'),
    path('saude/resumo/', get_resumo_saude, name='veterinario-saude-resumo'),
    path('perfil/',get_perfil_veterinario, name='veterinario-perfil'),
    path('', include(router.urls)),
]