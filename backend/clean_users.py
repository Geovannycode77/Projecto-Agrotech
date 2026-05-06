import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Agrotech.settings')
django.setup()

from login_cadastro.models import CustomUser, Perfil

print("🗑️ Apagando TODOS os usuários...")
num_users = CustomUser.objects.count()
CustomUser.objects.all().delete()
print(f"✅ {num_users} usuários apagados!")

print("DB limpa - pronto para novos registros!")

