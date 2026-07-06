from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import CustomUser


class CompleteProfilePasswordTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_complete_profile_sets_password_for_existing_user(self):
        user = CustomUser.objects.create_user(
            email="existing@example.com",
            password=None,
            role="produtor",
            is_approved=True,
            email_confirmed=True,
            is_active=True,
        )

        response = self.client.post(
            reverse("complete_profile"),
            {
                "email": "existing@example.com",
                "role": "produtor",
                "password": "senha123",
                "isGoogle": False,
                "profile": {
                    "nome_completo": "Usuário Existente",
                    "telefone": "912345678",
                    "data_nascimento": "1990-01-01",
                    "endereco": "Luanda",
                    "fazenda_nome": "Fazenda Teste",
                },
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.check_password("senha123"))
        self.assertFalse(user.needs_password_setup)

    def test_complete_profile_creates_google_user_with_password(self):
        response = self.client.post(
            reverse("complete_profile"),
            {
                "email": "google@example.com",
                "role": "veterinario",
                "password": "senhaGoogle123",
                "isGoogle": True,
                "credential": "fake-credential",
                "google_id": "google-123",
                "picture": "https://example.com/photo.jpg",
                "name": "Google User",
                "profile": {
                    "nome_completo": "Google User",
                    "telefone": "912345678",
                    "data_nascimento": "1990-01-01",
                    "endereco": "Luanda",
                    "especialidade": "Bovinos",
                    "crmv": "CRMV-123",
                },
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        user = CustomUser.objects.get(email="google@example.com")
        self.assertTrue(user.check_password("senhaGoogle123"))
        self.assertFalse(user.needs_password_setup)
