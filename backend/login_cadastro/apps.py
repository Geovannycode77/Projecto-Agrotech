from django.apps import AppConfig

class LoginCadastroConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'login_cadastro'
    
    def ready(self):
        import login_cadastro.signals