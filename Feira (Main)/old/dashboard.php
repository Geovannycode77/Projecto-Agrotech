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
    <link rel="stylesheet" href="css/stylesDashboard.css">
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
            </ul>

            <ul class="nav-list secondary-nav">
                <li class="nav-item">
                    <a href="#" class="nav-link" data-content="profile-content">
                        <span class="nav-icon material-symbols-rounded">account_circle</span> 
                        <span class="nav-label">Perfil</span>
                    </a>
                    <span class="nav-tooltip">Perfil</span>
                </li>
                <li class="nav-item" onclick="location.href = 'php/logout.php';">
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

        <!-- Perfil -->
        <div class="content hidden" id="profile-content">
            <div class="profile-view">
                <div class="profile-header">
                    <div class="avatar-container">
                        <img id="user-avatar" src="farmer.png" alt="Foto do Perfil" class="profile-avatar">
                    </div>
                    <div class="profile-info">
                        <h1><?php echo $nome_fazenda; ?></h1>
                        <p id="user-role">Produtor Rural</p>
                        <p> <?php echo $email; ?> </p>
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
                        <span id="farm-type" class="detail-value">Pecuária de <?php echo $tipo_gado; ?></span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon material-symbols-rounded">calendar_month</span>
                        <span id="member-since" class="detail-value">Fundada aos <?php echo $data_fundacao; ?></span>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script src="js/scriptDashboard.js"></script>
</body>
</html>