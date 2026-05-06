import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Agrotech.settings')
django.setup()

from django.db import connection

print("🗑️ Reset DB - APAGANDO TODOS USERS (ignore tabelas faltando)...")

# Apagar apenas usuários e perfis
from login_cadastro.models import CustomUser, Perfil
CustomUser.objects.all().delete()
Perfil.objects.all().delete()

print("✅ Users e Perfis APAGADOS!")
print("DB limpa - pronto para register!")

