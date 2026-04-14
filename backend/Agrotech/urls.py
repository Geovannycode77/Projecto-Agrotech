from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth
    path('api/auth/', include('login_cadastro.urls')),
    
    # Dashboard Admin
    path('api/admin/', include('dashboard_admin.urls')),  # URLs do admin
    
    # Produtor Dashboard - NOVO
    path('api/produtor/', include('produtor_dashboard.urls')),
    
    # Dashboard geral
    path('api/dashboard/', include('Deshboard.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
