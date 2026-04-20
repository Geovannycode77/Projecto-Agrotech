import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Agrotech.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

print(f"Using email: {settings.EMAIL_HOST_USER}")
print(f"API Key length: {len(settings.EMAIL_HOST_PASSWORD)}")

try:
    send_mail(
        'Teste AgroTech',
        'Este é um email de teste do AgroTech',
        settings.DEFAULT_FROM_EMAIL,
        ['seu-email@teste.com'],  # Coloque um email real para teste
        fail_silently=False,
    )
    print("✅ Email enviado com sucesso!")
except Exception as e:
    print(f"❌ Erro ao enviar email: {e}")