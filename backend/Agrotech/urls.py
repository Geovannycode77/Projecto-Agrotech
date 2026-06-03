from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # JWT Token endpoints - Adicione ESTAS linhas
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Seus endpoints existentes
    path('api/auth/', include('login_cadastro.urls')),
    path('api/dashboard-admin/', include('dashboard_admin.urls')),
    path('api/produtor/', include('produtor_dashboard.urls')),
    path('api/funcionario/', include('funcionario_dashboard.urls')),
    path('api/gestor-financeiro/', include('Gestor_financeiro_dashboard.urls')),
    path('api/veterinario/', include('veterinario_dashboard.urls')),
    
]