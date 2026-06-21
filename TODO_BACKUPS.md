# TODO - Backups automáticos (24h)

- [ ] Criar management command `backup_database.py` (pg_dump) [feito]
- [ ] Configurar agendamento automático 24h no projecto (Celery beat ou alternativa)
- [ ] Garantir que backups aparecem em `dashboard_admin/views.py` (já lista diretório backups)
- [ ] Ajustar `create_backup`/logs se necessário para distinguir manual vs automático
- [ ] Testar: rodar command manualmente e verificar ficheiro criado

