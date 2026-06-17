from django.core.management.base import BaseCommand
from login_cadastro.models import CustomUser, Perfil


class Command(BaseCommand):
    help = 'Garante que todos os usuários tenham um Perfil associado'

    def handle(self, *args, **options):
        users_without_perfil = CustomUser.objects.filter(perfil__isnull=True)
        count = users_without_perfil.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS('✅ Todos os usuários já possuem Perfil'))
            return
        
        self.stdout.write(f'🔄 Criando Perfil para {count} usuário(s)...')
        
        created_count = 0
        for user in users_without_perfil:
            # Tenta usar o primeiro nome do email como nome_completo
            nome_padrao = user.email.split('@')[0].replace('.', ' ').title()
            
            Perfil.objects.create(
                user=user,
                nome_completo=nome_padrao
            )
            created_count += 1
            self.stdout.write(f'  ✓ Perfil criado para {user.email}')
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ {created_count} Perfil(is) criado(s) com sucesso!'))
