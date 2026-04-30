from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('login_cadastro.urls')),
    path('api/dashboard-admin/', include('dashboard_admin.urls')),
    path('api/produtor/', include('produtor_dashboard.urls')),
path('api/funcionario/', include('funcionario_dashboard.urls')),
path('api/gestor-financeiro/', include('Gestor_financeiro_dashboard.urls')),
    path('api/veterinario/', include('veterinario_dashboard.urls')),
]
