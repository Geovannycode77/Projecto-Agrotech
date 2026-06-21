from celery import shared_task
from django.core.management import call_command


@shared_task(name='dashboard_admin.tasks.backup_database_task')
def backup_database_task():
    """Task periódica que chama o management command de backup."""
    # Retenção pode ser controlada por env BACKUP_RETENTION_DAYS
    call_command('backup_database')

