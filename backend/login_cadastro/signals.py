# backend/login_cadastro/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser, Perfil

@receiver(post_save, sender=CustomUser)
def criar_perfil_padrao(sender, instance, created, **kwargs):
    """Criar perfil automaticamente para todo novo usuário"""
    if created:
        Perfil.objects.get_or_create(
            user=instance,
            defaults={'nome_completo': instance.email.split('@')[0]}
        )
        print(f"✅ Perfil criado para {instance.email}")

@receiver(post_save, sender=CustomUser)
def criar_perfis_especificos(sender, instance, created, **kwargs):
    """Criar perfis específicos baseado no role do usuário"""
    if not created:
        return
    
    # Para produtores
    if instance.role == 'produtor':
        try:
            from produtor_dashboard.models import Fazenda, PreferenciasNotificacoes
            if not hasattr(instance, 'fazenda') or instance.fazenda is None:
                nome_fazenda = f"Fazenda de {instance.email.split('@')[0]}"
                fazenda = Fazenda.objects.create(
                    produtor=instance,
                    nome=nome_fazenda
                )
                PreferenciasNotificacoes.objects.get_or_create(fazenda=fazenda)
                print(f"✅ Fazenda criada para produtor {instance.email}")
        except ImportError as e:
            print(f"⚠️ Erro ao criar fazenda: {e}")
    
    # Para funcionários
    elif instance.role == 'funcionario':
        try:
            from funcionario_dashboard.models import Funcionario
            from produtor_dashboard.models import Fazenda
            
            fazenda = Fazenda.objects.first()
            if fazenda:
                Funcionario.objects.get_or_create(
                    user=instance,
                    defaults={
                        'fazenda': fazenda,
                        'cargo': 'auxiliar_geral',
                        'ativo': True
                    }
                )
                print(f"✅ Funcionário {instance.email} vinculado à fazenda {fazenda.nome}")
        except ImportError as e:
            print(f"⚠️ Erro ao criar funcionário: {e}")
    
    # Para veterinários
    elif instance.role == 'veterinario':
        try:
            from veterinario_dashboard.models import Veterinario
            from produtor_dashboard.models import Fazenda
            
            fazenda = Fazenda.objects.first()
            if fazenda:
                Veterinario.objects.get_or_create(
                    user=instance,
                    defaults={
                        'fazenda': fazenda,
                        'especialidade': 'geral',
                        'ativo': True
                    }
                )
                print(f"✅ Veterinário {instance.email} vinculado à fazenda {fazenda.nome}")
        except ImportError as e:
            print(f"⚠️ Erro ao criar veterinário: {e}")
    
    # Para gestores financeiros
    elif instance.role == 'gestor_financeiro':
        try:
            from Gestor_financeiro_dashboard.models import GestorFinanceiro
            from produtor_dashboard.models import Fazenda
            
            fazenda = Fazenda.objects.first()
            if fazenda:
                GestorFinanceiro.objects.get_or_create(
                    user=instance,
                    defaults={
                        'fazenda': fazenda,
                        'departamento': 'Financeiro',
                        'nivel_acesso': 'avancado',
                        'ativo': True
                    }
                )
                print(f"✅ Gestor Financeiro {instance.email} vinculado à fazenda {fazenda.nome}")
        except ImportError as e:
            print(f"⚠️ Erro ao criar gestor financeiro: {e}")