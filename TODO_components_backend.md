# TODO - backend/components (estrutura + integração)

## Step 1: Confirmar smoke imports
- [ ] Garantir que `python manage.py check` passa.
- [ ] Garantir que `components.apps.ComponentsConfig` é importável.

## Step 2: Integrar `components` no Django
- [ ] Adicionar `components` em `INSTALLED_APPS` em `backend/Agrotech/settings.py`.

## Step 3: Definir padrão de AppConfig/Configuração
- [ ] Garantir que `backend/components/__init__.py` referencia `ComponentsConfig` corretamente (ou usar `components.apps.ComponentsConfig`).

## Step 4: (Opcional) Middleware
- [ ] Se fizer sentido, adicionar `components.middleware` em `MIDDLEWARE`.

## Step 5: Testes
- [ ] Rodar testes (ou no mínimo `python manage.py test components`).

