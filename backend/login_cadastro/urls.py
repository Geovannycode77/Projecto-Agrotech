from django.urls import path
from . import views

urlpatterns = [
    # Autenticação
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('me/', views.get_current_user, name='me'),
    path('logout/', views.logout, name='logout'),
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    path('reset-password/', views.reset_password, name='reset_password'),
    path('change-password/', views.change_password, name='change-password'),
    
    # Google OAuth
    path('google-login/', views.google_login, name='google_login'),
    path('google-register/', views.google_register, name='google_register'),
     path('auth/set-password/', views.set_password, name='set-password'),
    
    # Confirmação de email
    path('confirm-email/', views.confirm_email, name='confirm_email'),
    path('resend-confirmation/', views.resend_confirmation_email, name='resend_confirmation'),
    
    # Completar perfil
    path('complete-profile/', views.complete_profile, name='complete_profile'),
    
    # Perfil
    path('profile/', views.get_update_profile, name='profile'),
    path('delete-account/', views.delete_own_account, name='delete_account'),
    path('profile/photo/', views.update_profile_photo, name='profile_photo'),
    
    # Admin - Gestão de usuários
    path('admin/users/', views.list_users, name='list_users'),
    path('admin/users/pending/', views.get_pending_users, name='pending_users'),
    path('admin/users/<int:user_id>/approve/', views.approve_user, name='approve_user'),
    path('admin/users/<int:user_id>/role/', views.update_user_role, name='update_role'),
    path('admin/users/<int:user_id>/delete/', views.delete_user, name='delete_user'),
    path('admin/stats/', views.get_admin_stats, name='admin_stats'),
]