# TODO - Datas & Idade + Backups 24h

## Idade de utilizadores (>= 18)

- [x] Atualizar `Perfil.clean()` para impedir `data_nascimento` no futuro e garantir idade >= 18
- [x] Atualizar `PerfilSerializer.validate_data_nascimento()` com a mesma regra

## Animais (datas realistas)

- [x] Criar `Animal.clean()` com:
  - [x] `data_nascimento` não pode ser futura
  - [x] `data_nascimento` não pode exceder idade máxima realista (bovinos)
- [x] Garantir que `Animal.save()` chama `full_clean()` para ativar a validação

## Registos com datas (não futuro)

- [ ] Saúde: bloquear `AnimalSaude.data_registro` no futuro
- [ ] Vacinas: bloquear `Vacina`/`proxima_dose` no futuro + garantir `data_aplicacao <= data_proxima_dose`
- [ ] Tratamentos: bloquear `data_inicio` no futuro e se existir `data_fim`, garantir coerência
- [ ] Alimentação/financeiro/ocorrências/tarefas: bloquear datas no futuro e coerência entre datas relacionadas

## Backups automáticos (24h)

- [x] Management command `backup_database.py` existe e é real (pg_dump)
- [ ] Configurar Celery beat schedule a cada 24h para chamar `dashboard_admin.tasks.backup_database_task`
- [ ] Confirmar que `dashboard_admin/views.py` lista ficheiros gerados (já existe `get_backups()`)

## Documentação final

- [ ] Criar `ALL_FUNCTIONS_SUMMARY.md` com resumo total do projecto
