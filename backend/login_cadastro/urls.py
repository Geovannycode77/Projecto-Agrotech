from django.urls import path
from .views import CustomLoginView, RegisterView

urlpatterns = [
    path('login/', CustomLoginView.as_view(), name='login'),
    path('registro/', RegisterView.as_view(), name='registro'),
]
