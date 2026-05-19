from django.conf import settings
settings.ALLOWED_HOSTS=['testserver','localhost','127.0.0.1']
from rest_framework.test import APIClient
from login_cadastro.models import CustomUser
client=APIClient()
email='test_produtor@example.com'
created=False
try:
    user=CustomUser.objects.get(email=email)
except CustomUser.DoesNotExist:
    user=CustomUser.objects.create_user(email=email, password='testpass', is_blocked=False, role='produtor', is_active=True, is_approved=True, email_confirmed=True)
    created=True
print('created?', created)
client.force_authenticate(user)
resp = client.post('/api/produtor/animais/', {'brinco':'T-TEST-002','nome':'Animal Teste 2','especie':'bovino'}, format='json')
print('create status', resp.status_code, getattr(resp, 'data', resp.content))
resp2 = client.post('/api/produtor/financeiro/', {'categoria':'Venda de Gado','descricao':'Venda teste','valor':1000}, format='json')
print('trans status', resp2.status_code, getattr(resp2, 'data', resp2.content))
resp3 = client.get('/api/produtor/alertas/')
print('alerts', resp3.status_code, getattr(resp3, 'data', resp3.content))
