from django.core.management.base import BaseCommand
import json

class Command(BaseCommand):
    help = 'Run quick integration tests against produtor endpoints and admin delete'

    def handle(self, *args, **options):
        from django.contrib.auth import get_user_model
        from rest_framework.test import APIClient

        User = get_user_model()
        client = APIClient()
        # Ensure test requests use a host allowed by ALLOWED_HOSTS
        client.defaults['HTTP_HOST'] = 'localhost'

        # Ensure admin user
        admin_email = 'admin_for_test@example.com'
        admin, created = User.objects.get_or_create(
            email=admin_email,
            defaults={'is_superuser': True, 'is_staff': True, 'is_active': True, 'is_blocked': False},
        )
        if created:
            admin.set_password('adminpass')
            admin.save()

        # Ensure produtor user
        prod_email = 'test_produtor@example.com'
        produtor, created = User.objects.get_or_create(
            email=prod_email,
            defaults={
                'role': 'produtor',
                'is_active': True,
                'is_approved': True,
                'is_blocked': False,
            },
        )
        if created:
            produtor.set_password('testpass')
            produtor.save()

        # Create an animal as produtor via API (simulate produtor by force_authenticate)
        client.force_authenticate(user=produtor)
        animal_data = {'brinco': 'T-TEST-003', 'nome': 'Animal Teste 3', 'especie': 'bovino'}
        resp = client.post('/api/produtor/animais/', animal_data, format='json')
        self.stdout.write(f"create animal status: {resp.status_code} {resp.content}")

        # Create a financeiro entry
        finance_data = {'categoria': 'Venda de Gado', 'descricao': 'Venda teste', 'valor': 1000}
        resp2 = client.post('/api/produtor/financeiro/', finance_data, format='json')
        self.stdout.write(f"finance status: {resp2.status_code} {resp2.content}")

        # Get alertas
        resp3 = client.get('/api/produtor/alertas/')
        self.stdout.write(f"alerts status: {resp3.status_code} {resp3.content}")

        # Now test delete user via admin endpoint
        client.force_authenticate(user=admin)
        del_resp = client.delete(f'/api/dashboard-admin/users/{produtor.id}/delete/')
        self.stdout.write(f"delete produtor status: {del_resp.status_code} {del_resp.content}")
