# ALL_FUNCTIONS_SUMMARY.md

Resumo (funções do projecto)

## Backend (Django / DRF / JWT)

### Agrotech (config central)

- `Agrotech/settings.py`: configura o projecto (apps, REST framework, JWT, CORS, segurança TLS).
- `Agrotech/urls.py`: monta endpoints REST + JWT token/refresh/verify e inclui URLs das apps.

### Auth / Utilizadores (`login_cadastro`)

- `models.py`:
  - `CustomUser`: usuário baseado em email com campos de confirmação e aprovação.
  - `Perfil`: dados adicionais do usuário, incluindo `data_nascimento`.
  - Validações implementadas para `Perfil.data_nascimento`:
    - não pode ser futura
    - deve garantir idade >= 18 anos.
  - `UserActivity`: log de atividades do usuário.
- `serializers.py`:
  - `PerfilSerializer`: valida `data_nascimento` (não futura + 18+).

### Dashboard Admin (`dashboard_admin`)

- `models.py`:
  - `AdminLog`: log de ações do admin.
  - `SystemSettings`: KV de configurações.
  - `DashboardWidget`: widgets customizáveis.
- `views.py`:
  - Endpoints para gestão de usuários, logs, settings e widgets.
  - Backups:
    - `get_backups`: lista ficheiros da pasta `backups/`.
    - `create_backup`: cria um backup (teste) via endpoint.
    - `download_backup`, `delete_backup`.
- `management/commands/backup_database.py`:
  - `backup_database` command real via `pg_dump` (PostgreSQL) e retenção configurável.
- `tasks.py`:
  - Celery task `backup_database_task` chama o management command.

### Produtor (`produtor_dashboard`)

- `models.py`:
  - `Fazenda`, `TipoRacao`, `EstoqueRacao`.
  - `Animal`: dados do rebanho.
    - Validação implementada em `Animal.clean()`:
      - `data_nascimento` não pode ser futura
      - limite de idade máxima realista (bovinos): 35 anos.
    - `save()` chama `full_clean()` para garantir a validação.
  - Registos: `AnimalSaude`, `AlimentacaoRegistro`, `CompraRacao`, `TransacaoFinanceira`, `Alerta`, `Atividade`, `RelatorioProducao`.
- `views.py` e `serializers.py`: CRUD + endpoints de dashboard e criação manual de registos (muitos endpoints setam defaults e calculam quantidades).

### Veterinário (`veterinario_dashboard`)

- `models.py`:
  - `Veterinario`, `Consulta`, `Vacina`, `Tratamento`, `AlertaSaude`, `LembreteSaude`.

### Funcionário (`funcionario_dashboard`)

- `models.py`:
  - `Funcionario`, `Tarefa`, `RegistroAlimentacaoFuncionario`, `Ocorrencia`, `AtualizacaoAnimal`, `Nascimento`.

### Gestor Financeiro (`Gestor_financeiro_dashboard`)

- `models.py`:
  - `GestorFinanceiro`, `Receita`, `Despesa`, `MetaFinanceira`, `AtividadeFinanceira`, `RelatorioFinanceiro`.

## Validações de datas implementadas nesta rodada

- `login_cadastro.Perfil.data_nascimento`:
  - bloqueia futuro
  - bloqueia idade < 18
- `produtor_dashboard.Animal.data_nascimento`:
  - bloqueia futuro
  - bloqueia idade > 35 anos (bovinos)

## Backups

- Command real existente: `dashboard_admin/management/commands/backup_database.py` via `pg_dump`.
- Task Celery existente: `dashboard_admin/tasks.py`.
- Falta agendar automaticamente a cada 24h (Celery beat) — ainda não implementado.
