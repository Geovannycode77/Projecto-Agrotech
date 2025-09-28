<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit;
}

$username = htmlspecialchars($_SESSION['username']);
$nome_fazenda = htmlspecialchars($_SESSION['nome_fazenda']);
$email = htmlspecialchars($_SESSION['email']);
$data_fundacao = htmlspecialchars($_SESSION['data_fundacao']);
$provincia = htmlspecialchars($_SESSION['provincia']);
$municipio = htmlspecialchars($_SESSION['municipio']);
$tipo_gado = htmlspecialchars($_SESSION['tipo_gado']);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AgroDashboard</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" />
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <aside class="sidebar">
        <header class="sidebar-header">
            <a href="#" class="header-logo">
                <img src="logo.png" alt="AgroDashboard">
            </a>
            <button class="toggler sidebar-toggler">
                <span class="material-symbols-rounded">chevron_left</span>
            </button>
            <button class="toggler menu-toggler">
                <span class="material-symbols-rounded">menu</span>
            </button>
        </header>
        
        <nav class="sidebar-nav">
            <ul class="nav-list primary-nav">
                <li class="nav-item">
                    <a href="#" class="nav-link active" data-content="dashboard-content">
                        <span class="nav-icon material-symbols-rounded">dashboard</span> 
                        <span class="nav-label">Painel</span>
                    </a>
                    <span class="nav-tooltip">Painel Principal</span>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-content="calendar-content">
                        <span class="nav-icon material-symbols-rounded">calendar_month</span> 
                        <span class="nav-label">Calendário</span>
                    </a>
                    <span class="nav-tooltip">Calendário</span>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-content="alerts-content">
                        <span class="nav-icon material-symbols-rounded">warning</span> 
                        <span class="nav-label">Alertas</span>
                    </a>
                    <span class="nav-tooltip">Alertas</span>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-content="tasks-content">
                        <span class="nav-icon material-symbols-rounded">assignment</span> 
                        <span class="nav-label">Tarefas</span>
                    </a>
                    <span class="nav-tooltip">Tarefas</span>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-content="reports-content">
                        <span class="material-symbols-rounded">analytics</span> 
                        <span class="nav-label">Relatórios</span>
                    </a>
                    <span class="nav-tooltip">Relatórios</span>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-content="health-content">
                        <span class="material-symbols-rounded">vaccines</span> 
                        <span class="nav-label">Saúde Animal</span>
                    </a>
                    <span class="nav-tooltip">Controle de Saúde</span>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-content="breeding-content">
                        <span class="material-symbols-rounded">fertile</span> 
                        <span class="nav-label">Reprodução</span>
                    </a>
                    <span class="nav-tooltip">Controle Reprodutivo</span>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-content="nutrition-content">
                        <span class="material-symbols-rounded">nutrition</span> 
                        <span class="nav-label">Nutrição</span>
                    </a>
                    <span class="nav-tooltip">Alimentação Animal</span>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-content="supplies-content">
                        <span class="material-symbols-rounded">inventory</span> 
                        <span class="nav-label">Insumos</span>
                    </a>
                    <span class="nav-tooltip">Gestão de Estoque</span>
                </li>
            </ul>

            <ul class="nav-list secondary-nav">
                <li class="nav-item">
                    <a href="#" class="nav-link" data-content="profile-content">
                        <span class="nav-icon material-symbols-rounded">account_circle</span> 
                        <span class="nav-label">Perfil</span>
                    </a>
                    <span class="nav-tooltip">Perfil</span>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">
                        <span class="nav-icon material-symbols-rounded">logout</span> 
                        <span class="nav-label">Sair</span>
                    </a>
                    <span class="nav-tooltip">Sair</span>
                </li>
            </ul>
        </nav>
    </aside>

    <main class="content-area">
        <!-- Painel Principal -->
        <div class="content active" id="dashboard-content">
            <h1>Painel de Gestão Rural</h1>
            
            <div class="summary-cards">
                <div class="card">
                    <span class="material-symbols-rounded">vaccines</span>
                    <h3>Vacinas Pendentes</h3>
                    <p class="big-number">5</p>
                    <p>para esta semana</p>
                </div>
                <div class="card">
                    <span class="material-symbols-rounded">warning</span>
                    <h3>Alertas Ativos</h3>
                    <p class="big-number">2</p>
                    <p>na sua região</p>
                </div>
                <div class="card">
                    <span class="material-symbols-rounded">assignment</span>
                    <h3>Tarefas Hoje</h3>
                    <p class="big-number">7</p>
                    <p>para completar</p>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="upcoming-events">
                    <h2>Próximos Eventos</h2>
                    <div class="event-list" id="upcoming-events">
                        <!-- Eventos serão carregados por JavaScript -->
                    </div>
                </div>
                
                <div class="quick-actions">
                    <h2>Ações Rápidas</h2>
                    <button class="quick-action-btn">
                        <span class="material-symbols-rounded">add</span>
                        Nova Tarefa
                    </button>
                    <button class="quick-action-btn">
                        <span class="material-symbols-rounded">calendar_add_on</span>
                        Agendar Vacina
                    </button>
                    <button class="quick-action-btn">
                        <span class="material-symbols-rounded">report</span>
                        Reportar Problema
                    </button>
                </div>
            </div>
        </div>

        <!-- Calendário -->
        <div class="content hidden" id="calendar-content">
            <h1>Calendário de Gestão</h1>
            
            <div class="calendar-controls">
                <button id="prev-month">
                    <span class="material-symbols-rounded">chevron_left</span>
                </button>
                <h2 id="current-month">Junho 2023</h2>
                <button id="next-month">
                    <span class="material-symbols-rounded">chevron_right</span>
                </button>
            </div>
            
            <div class="calendar-grid" id="calendar">
                <!-- Calendário será gerado por JavaScript -->
            </div>
            
            <div class="vaccine-legend">
                <div class="legend-item">
                    <span class="legend-color mandatory"></span>
                    <span>Vacina Obrigatória</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color optional"></span>
                    <span>Vacina Opcional</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color task"></span>
                    <span>Tarefa Agendada</span>
                </div>
            </div>
        </div>

        <!-- Alertas -->
        <div class="content hidden" id="alerts-content">
            <h1>Alertas de Surtos</h1>
            
            <div class="alert-filters">
                <div class="filter-group">
                    <label for="animal-type">
                        <span class="material-symbols-rounded">pets</span>
                        Tipo de Animal
                    </label>
                    <select id="animal-type">
                        <option value="all">Todos</option>
                        <option value="bovinos">Bovinos</option>
                        <option value="suinos">Suínos</option>
                        <option value="aves">Aves</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="distance">
                        <span class="material-symbols-rounded">location_on</span>
                        Distância Máxima
                    </label>
                    <select id="distance">
                        <option value="50">50 km</option>
                        <option value="100">100 km</option>
                        <option value="200">200 km</option>
                        <option value="500">500 km</option>
                    </select>
                </div>
            </div>
            
            <div class="alerts-map">
                <div class="map-placeholder">
                    <p>Mapa de alertas será exibido aqui</p>
                </div>
            </div>
            
            <div class="alerts-list" id="alerts-list">
                <!-- Alertas serão carregados dinamicamente -->
                <div class="loading-alerts">
                    <span class="material-symbols-rounded">progress_activity</span>
                    Carregando alertas...
                </div>
            </div>
        </div>

        <!-- Tarefas -->
        <div class="content hidden" id="tasks-content">
            <h1>Gestão de Tarefas</h1>
            
            <div class="task-controls">
                <input type="text" id="new-task" placeholder="Adicionar nova tarefa...">
                <button id="add-task">
                    <span class="material-symbols-rounded">add</span>
                    Adicionar
                </button>
            </div>
            
            <div class="task-filters">
                <button class="filter-btn active" data-filter="all">Todas</button>
                <button class="filter-btn" data-filter="today">Hoje</button>
                <button class="filter-btn" data-filter="pending">Pendentes</button>
                <button class="filter-btn" data-filter="completed">Concluídas</button>
            </div>
            
            <div class="task-list" id="task-list">
                <!-- Tarefas serão carregadas por JavaScript -->
            </div>
        </div>

        <!-- Controle de Saúde Animal -->
        <div class="content hidden" id="health-content">
            <div class="health-header">
                <h1>Controle de Saúde Animal</h1>
                <div class="health-filters">
                    <select id="health-animal-type">
                        <option value="all">Todos os animais</option>
                        <option value="bovinos">Bovinos</option>
                        <option value="suinos">Suínos</option>
                        <option value="aves">Aves</option>
                    </select>
                    <button class="btn primary" id="add-health-record">
                        <span class="material-symbols-rounded">add</span>
                        Novo Registro
                    </button>
                </div>
            </div>
            
            <div class="health-grid">
                <div class="vaccine-control">
                    <h2>Controle de Vacinação</h2>
                    <div class="vaccine-list" id="vaccine-list">
                        <!-- Lista de vacinas será carregada por JS -->
                    </div>
                </div>
                
                <div class="health-stats">
                    <div class="stat-card">
                        <span class="material-symbols-rounded">medication</span>
                        <h3>Vacinas Pendentes</h3>
                        <p class="big-number" id="pending-vaccines">0</p>
                    </div>
                    <div class="stat-card">
                        <span class="material-symbols-rounded">sick</span>
                        <h3>Casos de Doença</h3>
                        <p class="big-number" id="disease-cases">0</p>
                    </div>
                    <div class="stat-card">
                        <span class="material-symbols-rounded">monitor_heart</span>
                        <h3>Saúde do Rebanho</h3>
                        <p class="big-number" id="herd-health">95%</p>
                    </div>
                </div>
            </div>
            
            <div class="disease-history">
                <h2>Histórico de Doenças</h2>
                <div class="history-table" id="disease-history">
                    <!-- Tabela será carregada por JS -->
                </div>
            </div>
        </div>

        <!-- Controle Reprodutivo -->
        <div class="content hidden" id="breeding-content">
            <div class="breeding-header">
                <h1>Controle Reprodutivo</h1>
                <div class="breeding-actions">
                    <button class="btn primary" id="add-breeding-record">
                        <span class="material-symbols-rounded">add</span>
                        Novo Registro
                    </button>
                </div>
            </div>
            
            <div class="breeding-stats">
                <div class="stat-card">
                    <span class="material-symbols-rounded">pregnant</span>
                    <h3>Fêmeas Prenhes</h3>
                    <p class="big-number" id="pregnant-females">12</p>
                </div>
                <div class="stat-card">
                    <span class="material-symbols-rounded">egg</span>
                    <h3>Taxa de Concepção</h3>
                    <p class="big-number" id="conception-rate">78%</p>
                </div>
                <div class="stat-card">
                    <span class="material-symbols-rounded">crib</span>
                    <h3>Nascimentos Este Mês</h3>
                    <p class="big-number" id="births-this-month">5</p>
                </div>
            </div>
            
            <div class="breeding-calendar">
                <h2>Calendário Reprodutivo</h2>
                <div id="breeding-calendar-view">
                    <!-- Calendário será carregado por JS -->
                </div>
            </div>
            
            <div class="breeding-history">
                <h2>Histórico Reprodutivo</h2>
                <div class="history-table" id="breeding-history">
                    <!-- Tabela será carregada por JS -->
                </div>
            </div>
        </div>

        <!-- Alimentação e Nutrição -->
        <div class="content hidden" id="nutrition-content">
            <div class="nutrition-header">
                <h1>Gestão de Alimentação</h1>
                <div class="nutrition-filters">
                    <select id="nutrition-animal-type">
                        <option value="all">Todos os animais</option>
                        <option value="bovinos">Bovinos</option>
                        <option value="suinos">Suínos</option>
                        <option value="aves">Aves</option>
                    </select>
                    <button class="btn primary" id="add-feeding-plan">
                        <span class="material-symbols-rounded">add</span>
                        Novo Plano
                    </button>
                </div>
            </div>
            
            <div class="nutrition-stats">
                <div class="stat-card">
                    <span class="material-symbols-rounded">scale</span>
                    <h3>Consumo Diário</h3>
                    <p class="big-number" id="daily-consumption">1200kg</p>
                </div>
                <div class="stat-card">
                    <span class="material-symbols-rounded">attach_money</span>
                    <h3>Custo com Ração</h3>
                    <p class="big-number" id="feed-cost"> 28500 kz</p>
                </div>
                <div class="stat-card">
                    <span class="material-symbols-rounded">trending_up</span>
                    <h3>GMD</h3>
                    <p class="big-number" id="average-gmd">1.2kg</p>
                </div>
            </div>
            
            <div class="feeding-plans">
                <h2>Planos de Alimentação</h2>
                <div class="plans-grid" id="feeding-plans">
                    <!-- Planos serão carregados por JS -->
                </div>
            </div>
            
            <div class="nutrition-history">
                <h2>Histórico de Pesagem</h2>
                <div class="history-chart" id="weight-history-chart">
                    <!-- Gráfico será carregado por JS -->
                </div>
            </div>
        </div>

        <!-- Gestão de Insumos -->
        <div class="content hidden" id="supplies-content">
            <div class="supplies-header">
                <h1>Gestão de Insumos</h1>
                <div class="supplies-actions">
                    <button class="btn primary" id="add-supply">
                        <span class="material-symbols-rounded">add</span>
                        Novo Insumo
                    </button>
                    <button class="btn secondary" id="new-supply-movement">
                        <span class="material-symbols-rounded">swap_horiz</span>
                        Movimentação
                    </button>
                </div>
            </div>
            
            <div class="supplies-alerts">
                <div class="alert-card critical">
                    <span class="material-symbols-rounded">warning</span>
                    <div>
                        <h3>Insumos Críticos</h3>
                        <p id="critical-supplies">3 itens abaixo do mínimo</p>
                    </div>
                </div>
                <div class="alert-card warning">
                    <span class="material-symbols-rounded">info</span>
                    <div>
                        <h3>Insumos em Alerta</h3>
                        <p id="warning-supplies">5 itens próximos do mínimo</p>
                    </div>
                </div>
            </div>
            
            <div class="supplies-grid">
                <div class="inventory-summary">
                    <h2>Estoque Atual</h2>
                    <div class="inventory-table" id="current-inventory">
                        <!-- Tabela será carregada por JS -->
                    </div>
                </div>
                
                <div class="movement-history">
                    <h2>Últimas Movimentações</h2>
                    <div class="history-table" id="supply-movements">
                        <!-- Tabela será carregada por JS -->
                    </div>
                </div>
            </div>
            
            <div class="supply-reports">
                <h2>Relatórios Financeiros</h2>
                <div class="reports-cards">
                    <div class="report-card">
                        <h3>Custo Médio Mensal</h3>
                        <p class="big-number" id="monthly-cost"> 50000 kz</p>
                    </div>
                    <div class="report-card">
                        <h3>Variação de Preços</h3>
                        <p class="big-number" id="price-variation">+2.5%</p>
                    </div>
                    <div class="report-card">
                        <h3>Índice de Consumo</h3>
                        <p class="big-number" id="consumption-index">0.85</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Perfil -->
        <div class="content hidden" id="profile-content">
            <div class="profile-view">
                <div class="profile-header">
                    <div class="avatar-container">
                        <img id="user-avatar" src="farmer.png" alt="Foto do Perfil" class="profile-avatar">
                    </div>
                    <div class="profile-info">
                        <h1 id="user-name"><?php echo $username  ; ?></h1>
                        <p id="user-role">Produtor Rural</p>
                        <p id="user-email"><?php echo $email;?></p>
                    </div>
                </div>
                
                <div class="profile-stats">
                    <div class="stat-item">
                        <span class="stat-number" id="animals-count">120</span>
                        <span class="stat-label">Cabeças de Gado</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number" id="area-count">250</span>
                        <span class="stat-label">Hectares</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number" id="tasks-completed">87%</span>
                        <span class="stat-label">Tarefas Concluídas</span>
                    </div>
                </div>
                
                <div class="profile-details">
                    <div class="detail-item">
                        <span class="detail-icon material-symbols-rounded">location_on</span>
                        <span id="farm-location" class="detail-value"><?php echo $municipio; ?>, <?php echo $provincia; ?></span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon material-symbols-rounded">agriculture</span>
                        <span id="farm-type" class="detail-value">Pecuária de Corte</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon material-symbols-rounded">calendar_month</span>
                        <span id="member-since" class="detail-value">Membro desde <?php echo $data_fundacao; ?></span>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script src="script.js"></script>
</body>
</html>