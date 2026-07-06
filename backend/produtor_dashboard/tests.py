from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from login_cadastro.models import CustomUser
from .models import Alerta, Fazenda, PreferenciasNotificacoes


class PreferenciasNotificacoesTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            email='produtor@example.com',
            password='senha123',
            role='produtor',
            is_active=True,
            is_approved=True,
        )
        self.fazenda, _ = Fazenda.objects.get_or_create(
            produtor=self.user,
            defaults={'nome': 'Fazenda Teste'},
        )
        self.client.force_authenticate(self.user)

    def test_alertas_respeitam_preferencias_de_notificacoes(self):
        PreferenciasNotificacoes.objects.create(
            fazenda=self.fazenda,
            alertas_saude=False,
            alertas_estoque=True,
            alertas_relatorios=False,
        )

        Alerta.objects.create(
            fazenda=self.fazenda,
            tipo='saude',
            prioridade='alta',
            titulo='Checkup necessário',
            mensagem='Animal precisa de avaliação',
        )
        Alerta.objects.create(
            fazenda=self.fazenda,
            tipo='alimentacao',
            prioridade='media',
            titulo='Estoque baixo',
            mensagem='Ração quase acabando',
        )
        Alerta.objects.create(
            fazenda=self.fazenda,
            tipo='sistema',
            prioridade='baixa',
            titulo='Relatório pronto',
            mensagem='Relatório gerado',
        )

        response = self.client.get('/api/produtor/alertas/')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        tipos = [item['tipo'] for item in data]
        self.assertNotIn('saude', tipos)
        self.assertIn('alimentacao', tipos)
        self.assertNotIn('sistema', tipos)


