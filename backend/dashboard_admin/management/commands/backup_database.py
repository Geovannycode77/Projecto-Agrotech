import os
import subprocess
from datetime import datetime

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings

from dashboard_admin.models import AdminLog


class Command(BaseCommand):
    help = "Cria um backup REAL do banco PostgreSQL usando pg_dump e guarda em backend/backups/."

    def add_arguments(self, parser):
        parser.add_argument(
            '--retention-days',
            type=int,
            default=int(os.getenv('BACKUP_RETENTION_DAYS', '7')),
            help='Dias de retenção dos backups (padrão: 7).',
        )
        parser.add_argument(
            '--use-timestamp',
            action='store_true',
            help='Usar timestamp no nome do backup (padrão sim via timestamp automático).',
        )

    def handle(self, *args, **options):
        retention_days = options['retention_days']

        db = settings.DATABASES.get('default', {})
        if db.get('ENGINE') != 'django.db.backends.postgresql':
            raise RuntimeError('backup_database só suporta PostgreSQL neste projecto')

        db_name = db.get('NAME')
        db_user = db.get('USER')
        db_password = db.get('PASSWORD')
        db_host = db.get('HOST')
        db_port = str(db.get('PORT', '5432'))

        if not all([db_name, db_user, db_password, db_host, db_port]):
            raise RuntimeError('DB config incompleta para criar backup')

        backups_dir = os.path.join(settings.BASE_DIR, 'backups')
        os.makedirs(backups_dir, exist_ok=True)

        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        backup_file = f"backup_{timestamp}.sql"
        backup_path = os.path.join(backups_dir, backup_file)

        # Tenta obter um admin/superuser para registrar o log
        admin = None
        try:
            from login_cadastro.models import CustomUser

            admin = (
                CustomUser.objects.filter(is_superuser=True, is_active=True).order_by('-date_joined').first()
                or CustomUser.objects.filter(role='administrador', is_active=True).order_by('-date_joined').first()
            )
        except Exception:
            admin = None

        # Comando pg_dump (assumindo que pg_dump está no PATH do sistema)
        env = os.environ.copy()
        env['PGPASSWORD'] = db_password

        cmd = [
            'pg_dump',
            '--format=plain',
            '--no-owner',
            '--no-acl',
            '--host', db_host,
            '--port', db_port,
            '--username', db_user,
            '--dbname', db_name,
        ]

        self.stdout.write(f'Criando backup: {backup_path}')
        with open(backup_path, 'wb') as f:
            proc = subprocess.run(cmd, env=env, stdout=f, stderr=subprocess.PIPE)

        if proc.returncode != 0:
            stderr = proc.stderr.decode('utf-8', errors='ignore')
            # Não regista log de sucesso; dispara falha
            raise RuntimeError(f'pg_dump falhou (returncode={proc.returncode}): {stderr}')

        # Retenção: remove backups mais antigos
        try:
            now_ts = datetime.now().timestamp()
            for name in os.listdir(backups_dir):
                if not name.endswith('.sql'):
                    continue
                p = os.path.join(backups_dir, name)
                age_days = (now_ts - os.path.getmtime(p)) / 86400
                if age_days > retention_days:
                    os.remove(p)
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Falha ao aplicar retenção: {e}'))

        # Registo no AdminLog (se existir admin)
        try:
            if admin:
                AdminLog.objects.create(
                    admin=admin,
                    action='settings_change',
                    target_user=None,
                    description=f'Backup automático criado: {backup_file}',
                    ip_address=None,
                )
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Não foi possível registar AdminLog: {e}'))

        self.stdout.write(self.style.SUCCESS(f'✅ Backup criado com sucesso: {backup_file}'))

