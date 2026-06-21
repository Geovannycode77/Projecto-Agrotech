# TODO

- [x] Agendar backup automático a cada 24h via Celery beat (CELERY_BEAT_SCHEDULE) apontando para `dashboard_admin.tasks.backup_database_task`.

- [ ] Confirmar configurações mínimas de Celery (BROKER/RESULT_BACKEND) caso necessário.
- [ ] Validar execução: `celery -A Agrotech call dashboard_admin.tasks.backup_database_task`.
- [ ] Rodar worker e beat e confirmar criação de arquivo em `backups/`.
