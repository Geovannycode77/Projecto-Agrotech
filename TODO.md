# TODO - Conexão Frontend-Backend AgroTech

## Análise do Projeto

### Estrutura de URLs do Backend:
- `api/auth/` → login_cadastro (autenticação, registro, perfil)
- `api/dashboard-admin/` → dashboard_admin (gestão de utilizadores)  
- `api/produtor/` → produtor_dashboard
- `api/funcionario/` → funcionario_dashboard
- `api/gestor-financeiro/` → Gestor_financeiro_dashboard
- `api/veterinario/` → veterinario_dashboard

### Problemas Identificados:

1. **AdminService.js** - Os endpoints usam caminhos incorretos:
   - `dashboard-admin/stats/` ❌ → O backend usa `/stats/`
   - `dashboard-admin/users/` ❌ → O backend usa o router

2. **Sincronização de Dados:** 
   - Quando um utilizador faz register → dados vão para login_cadastro
   - O admin dashboard deve mostrar os utilizadores pendentes

## Plano de Implementação

### Passo 1: Corrigir AdminService.js
- [ ] Usar os endpoints corretos do backend
- [ ] Testar a conexão com stats

### Passo 2: Verificar sincronização de dados
- [ ] Registro → dados inseridos corretamente
- [ ] Pending users aparecem no admin
- [ ] Aprovação → utilizador pode acessar dashboard

### Passo 3: Verificar dashboards
- [ ] ProdutorDashboard mostra dados corretos
- [ ] FuncionarioDashboard mostra dados corretos
- [ ] GestorFinanceiroDashboard mostra dados corretos
- [ ] VeterinarioDashboard mostra dados corretos

## Status: EM ANÁLISE
