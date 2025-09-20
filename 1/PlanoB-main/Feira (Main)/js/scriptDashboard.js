// script.js - Código Completo Integrado

/* ========== FUNÇÕES AUXILIARES ========== */
function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function getDateString(daysToAdd) {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
}

function formatAnimalType(type) {
    const types = {
        'bovinos': 'Bovinos',
        'suinos': 'Suínos',
        'aves': 'Aves',
        'todos': 'Todos'
    };
    return types[type] || type;
}

/* ========== DADOS DO SISTEMA ========== */
const sampleData = {
    events: [
        { id: 1, date: getDateString(0), title: 'Vacinação contra Febre Aftosa', type: 'mandatory', animal: 'bovinos' },
        { id: 2, date: getDateString(2), title: 'Vermifugação do rebanho', type: 'optional', animal: 'todos' },
        { id: 3, date: getDateString(5), title: 'Vacinação contra Brucelose', type: 'mandatory', animal: 'bovinos' },
        { id: 4, date: getDateString(7), title: 'Suplementação mineral', type: 'task', animal: 'todos' },
        { id: 5, date: getDateString(10), title: 'Vacinação contra Raiva', type: 'mandatory', animal: 'bovinos' }
    ],
    alerts: [
        { id: 1, title: 'Surto de Brucelose', location: 'Fazenda Santa Maria (35km)', animal: 'bovinos', distance: 35, date: getDateString(-1) },
        { id: 2, title: 'Casos de Influenza Aviária', location: 'Granja do Vale (80km)', animal: 'aves', distance: 80, date: getDateString(-2) },
        { id: 3, title: 'Peste Suína detectada', location: 'Chácara do Lago (120km)', animal: 'suinos', distance: 120, date: getDateString(-3) }
    ],
    tasks: [
        { id: 1, text: 'Vacinar bezerros de 3 meses', completed: false, date: getDateString(0), priority: 'high' },
        { id: 2, text: 'Comprar suplemento mineral', completed: true, date: getDateString(-1), priority: 'medium' },
        { id: 3, text: 'Agendar visita do veterinário', completed: false, date: getDateString(2), priority: 'high' },
        { id: 4, text: 'Verificar cercas do pasto', completed: false, date: getDateString(3), priority: 'low' }
    ],
    recommendations: [
        { id: 1, title: 'Rotação de Pastagens', content: 'Recomendamos rotacionar os animais entre os pastos para melhor recuperação do solo.' },
        { id: 2, title: 'Controle de Parasitas', content: 'Período ideal para aplicação de vermífugo no rebanho.' },
        { id: 3, title: 'Preparação para Inverno', content: 'Adequar a alimentação para os meses mais frios que estão por vir.' }
    ],
    weeklyTip: 'Esta semana é ideal para realizar o teste de brucelose em suas matrizes.'
};

/* ========== SISTEMA DE NAVEGAÇÃO ========== */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content');
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggler = document.querySelector('.sidebar-toggler');
    const menuToggler = document.querySelector('.menu-toggler');

    // Navegação entre seções
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Atualiza navegação
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
            
            // Mostra a seção correspondente
            const sectionId = link.getAttribute('data-content');
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === sectionId) {
                    section.classList.add('active');
                    
                    // Carrega dados específicos da seção quando aberta
                    if (sectionId === 'alerts-content') {
                        loadAndRenderAlerts();
                    } else if (sectionId === 'dashboard-content') {
                        loadDashboardData();
                    }
                }
            });
        });
    });

    // Controles da sidebar
    sidebarToggler.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        document.querySelector('.content-area').classList.toggle('expanded');
    });

    menuToggler.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

/* ========== DASHBOARD PRINCIPAL ========== */
async function loadDashboardData() {
    try {
        // Mostra estado de carregamento
        document.getElementById('upcoming-events').innerHTML = `
            <div class="loading-state">
                <span class="material-symbols-rounded animate-spin">progress_activity</span>
                Carregando...
            </div>
        `;
        
        // Carrega dados em paralelo
        const [alerts, events] = await Promise.all([
            fetchHealthAlerts(),
            fetchVaccineSchedule()
        ]);
        
        // Atualiza a UI
        updateSummaryCards(alerts, events);
        renderUpcomingEvents(events);
        
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        renderFallbackData();
    }
}

function updateSummaryCards(alerts = [], events = []) {
    // Card de Vacinas Pendentes
    const pendingVaccines = events.filter(e => 
        new Date(e.date) >= new Date() && e.type === 'mandatory'
    ).length;
    document.querySelector('.card:nth-child(1) .big-number').textContent = pendingVaccines;
    
    // Card de Alertas
    document.querySelector('.card:nth-child(2) .big-number').textContent = alerts.length;
    
    // Card de Tarefas
    const pendingTasks = sampleData.tasks.filter(t => !t.completed).length;
    document.querySelector('.card:nth-child(3) .big-number').textContent = pendingTasks;
}

function renderFallbackData() {
    document.getElementById('upcoming-events').innerHTML = `
        <div class="error-state">
            <span class="material-symbols-rounded">error</span>
            <p>Dados offline - atualizando quando a conexão for restabelecida</p>
        </div>
    `;
}

/* ========== SISTEMA DE ALERTAS ========== */
async function loadAndRenderAlerts() {
    const container = document.getElementById('alerts-list');
    container.innerHTML = `
        <div class="loading-state">
            <span class="material-symbols-rounded animate-spin">progress_activity</span>
            Carregando alertas...
        </div>
    `;
    
    try {
        const alerts = await fetchHealthAlerts();
        renderAlerts(alerts);
    } catch (error) {
        container.innerHTML = `
            <div class="error-state">
                <span class="material-symbols-rounded">error</span>
                <p>Não foi possível carregar os alertas</p>
                <button onclick="loadAndRenderAlerts()">Tentar novamente</button>
            </div>
        `;
    }
}

async function fetchHealthAlerts() {
    try {
        const response = await fetch('http://localhost:3000/api/alerts');
        if (!response.ok) throw new Error('Erro na API');
        const apiAlerts = await response.json();
        
        // Combina alertas da API com os locais
        return [...apiAlerts, ...sampleData.alerts];
    } catch (error) {
        console.error("Falha ao buscar alertas:", error);
        return sampleData.alerts; // Fallback para dados locais
    }
}

function renderAlerts(alerts) {
    const container = document.getElementById('alerts-list');
    container.innerHTML = alerts.map(alert => `
        <div class="alert-item">
            <div class="alert-header">
                <span class="material-symbols-rounded">${getAlertIcon(alert)}</span>
                <h3>${alert.title}</h3>
            </div>
            
            ${alert.location ? `<div class="alert-location">${alert.location}</div>` : ''}
            
            <div class="alert-meta">
                ${alert.date ? `<span class="alert-date">${formatDate(new Date(alert.date))}</span>` : ''}
                ${alert.distance ? `<span class="alert-distance">${alert.distance}km</span>` : ''}
                <span class="alert-animal ${alert.animal}">${formatAnimalType(alert.animal)}</span>
            </div>
            
            ${alert.link ? `
            <a href="${alert.link}" target="_blank" class="alert-link">
                <span class="material-symbols-rounded">open_in_new</span>
                Ver detalhes
            </a>
            ` : ''}
        </div>
    `).join('');
}

function getAlertIcon(alert) {
    const icons = {
        'bovinos': 'agriculture',
        'suinos': 'piggy',
        'aves': 'egg'
    };
    return icons[alert.animal] || 'warning';
}

function initAlertFilters() {
    const animalFilter = document.getElementById('animal-type');
    const distanceFilter = document.getElementById('distance');
    
    animalFilter.addEventListener('change', filterAlerts);
    distanceFilter.addEventListener('change', filterAlerts);
}

async function filterAlerts() {
    const animalType = document.getElementById('animal-type').value;
    const distance = parseInt(document.getElementById('distance').value);
    
    const allAlerts = await fetchHealthAlerts();
    const filtered = allAlerts.filter(alert => {
        return (animalType === 'all' || alert.animal === animalType) && 
               (!alert.distance || alert.distance <= distance);
    });
    
    renderAlerts(filtered);
}

/* ========== CALENDÁRIO DE VACINAS ========== */
function initCalendar() {
    const currentMonthElement = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const calendarGrid = document.getElementById('calendar');

    let currentDate = new Date();

    function renderCalendar() {
        // Configura cabeçalho do mês
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        currentMonthElement.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        
        // Limpa calendário anterior
        calendarGrid.innerHTML = '';
        
        // Cabeçalho dos dias da semana
        const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        daysOfWeek.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-header';
            dayElement.textContent = day;
            calendarGrid.appendChild(dayElement);
        });
        
        // Calcula dias do mês
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const totalDays = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        // Dias vazios no início
        for (let i = 0; i < startingDay; i++) {
            calendarGrid.appendChild(createEmptyDay());
        }
        
        // Dias do mês
        for (let day = 1; day <= totalDays; day++) {
            calendarGrid.appendChild(createCalendarDay(day));
        }
    }

    function createEmptyDay() {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        return emptyCell;
    }

    function createCalendarDay(day) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        
        // Número do dia
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);
        
        // Eventos para este dia
        const currentDateStr = formatCalendarDate(day);
        addEventsToDay(dayCell, currentDateStr);
        
        return dayCell;
    }

    function formatCalendarDate(day) {
        return `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }

    function addEventsToDay(dayCell, dateStr) {
        sampleData.events.forEach(event => {
            if (event.date === dateStr) {
                dayCell.appendChild(createEventElement(event));
            }
        });
    }

    function createEventElement(event) {
        const eventElement = document.createElement('div');
        eventElement.className = `calendar-event ${event.type}-badge`;
        eventElement.textContent = event.title;
        eventElement.addEventListener('click', () => showEventDetails(event));
        return eventElement;
    }

    // Navegação entre meses
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Renderização inicial
    renderCalendar();
}

async function fetchVaccineSchedule() {
    try {
        const response = await fetch('http://localhost:3000/api/vaccines');
        return await response.json();
    } catch (error) {
        return sampleData.events; // Fallback para dados locais
    }
}

function showEventDetails(event) {
    // Implemente um modal ou popup mais elaborado aqui
    alert(`Detalhes do Evento:\n\nTítulo: ${event.title}\nTipo: ${event.type === 'mandatory' ? 'Obrigatório' : 'Opcional'}\nAnimal: ${formatAnimalType(event.animal)}\nData: ${formatDate(new Date(event.date))}`);
}

/* ========== SISTEMA DE TAREFAS ========== */
function initTasks() {
    const taskList = document.getElementById('task-list');
    const newTaskInput = document.getElementById('new-task');
    const addTaskBtn = document.getElementById('add-task');
    const taskFilters = document.querySelectorAll('.filter-btn');

    function renderTasks(filter = 'all') {
        taskList.innerHTML = '';
        
        let filteredTasks = filterTasks(filter);
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<p class="no-tasks">Nenhuma tarefa encontrada</p>';
            return;
        }
        
        filteredTasks.forEach(task => {
            taskList.appendChild(createTaskElement(task, filter));
        });
    }

    function filterTasks(filter) {
        let tasks = [...sampleData.tasks];
        
        if (filter === 'today') {
            const today = new Date().toISOString().split('T')[0];
            tasks = tasks.filter(task => task.date === today);
        } else if (filter === 'pending') {
            tasks = tasks.filter(task => !task.completed);
        } else if (filter === 'completed') {
            tasks = tasks.filter(task => task.completed);
        } else if (filter === 'high') {
            tasks = tasks.filter(task => task.priority === 'high');
        } else if (filter === 'medium') {
            tasks = tasks.filter(task => task.priority === 'medium');
        } else if (filter === 'low') {
            tasks = tasks.filter(task => task.priority === 'low');
        }
        
        // Ordena por prioridade e data
        return tasks.sort((a, b) => {
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (a.priority !== 'high' && b.priority === 'high') return 1;
            return new Date(a.date) - new Date(b.date);
        });
    }

    function createTaskElement(task, currentFilter) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        
        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            renderTasks(currentFilter);
            updateDashboardStats();
        });
        
        // Conteúdo da tarefa
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
        
        const taskText = document.createElement('span');
        taskText.className = `task-text ${task.completed ? 'task-completed' : ''}`;
        taskText.textContent = task.text;
        
        const taskMeta = document.createElement('div');
        taskMeta.className = 'task-meta';
        taskMeta.innerHTML = `
            <span class="task-date">${formatDate(new Date(task.date))}</span>
            <span class="task-priority ${task.priority}">${getPriorityLabel(task.priority)}</span>
        `;
        
        taskContent.appendChild(taskText);
        taskContent.appendChild(taskMeta);
        
        // Botão de deletar
        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-task material-symbols-rounded';
        deleteBtn.textContent = 'delete';
        deleteBtn.addEventListener('click', () => {
            sampleData.tasks = sampleData.tasks.filter(t => t.id !== task.id);
            renderTasks(currentFilter);
            updateDashboardStats();
        });
        
        // Monta o elemento final
        taskElement.appendChild(checkbox);
        taskElement.appendChild(taskContent);
        taskElement.appendChild(deleteBtn);
        
        return taskElement;
    }

    function getPriorityLabel(priority) {
        const labels = {
            'high': 'Alta Prioridade',
            'medium': 'Prioridade Média',
            'low': 'Baixa Prioridade'
        };
        return labels[priority] || priority;
    }

    addTaskBtn.addEventListener('click', () => {
        const newTaskText = newTaskInput.value.trim();
        if (newTaskText) {
            addNewTask(newTaskText);
            newTaskInput.value = '';
            renderTasks();
            updateDashboardStats();
        }
    });

    function addNewTask(text) {
        const newTask = {
            id: sampleData.tasks.length + 1,
            text: text,
            completed: false,
            date: new Date().toISOString().split('T')[0],
            priority: 'medium'
        };
        sampleData.tasks.push(newTask);
    }

    taskFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            taskFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            renderTasks(filter.getAttribute('data-filter'));
        });
    });
    
    // Renderização inicial
    renderTasks();
}

function updateDashboardStats() {
    const pendingTasks = sampleData.tasks.filter(t => !t.completed).length;
    document.querySelector('.card:nth-child(3) .big-number').textContent = pendingTasks;
    
    const completionRate = Math.round(
        (sampleData.tasks.filter(t => t.completed).length / sampleData.tasks.length) * 100
    ) || 0;
    document.getElementById('tasks-completed').textContent = `${completionRate}%`;
}

/* ========== PERFIL DO USUÁRIO ========== */


/* ========== EVENTOS PRÓXIMOS ========== */
function renderUpcomingEvents() {
    const container = document.getElementById('upcoming-events');
    const now = new Date();
    
    // Filtra e ordena eventos futuros
    const upcoming = sampleData.events
        .filter(event => new Date(event.date) >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5); // Limita a 5 eventos
    
    if (upcoming.length === 0) {
        container.innerHTML = '<p class="no-events">Nenhum evento agendado</p>';
        return;
    }
    
    container.innerHTML = upcoming.map(event => `
        <div class="event-item" onclick="showEventDetails(${JSON.stringify(event).replace(/"/g, '&quot;')})">
            <span class="event-date">${formatDate(new Date(event.date))}</span>
            <span class="event-title">${event.title}</span>
            <span class="event-type ${event.type}-badge">
                ${event.type === 'mandatory' ? 'Obrigatória' : 'Opcional'}
            </span>
        </div>
    `).join('');
}

/* ========== DICA SEMANAL ========== */
function renderWeeklyTip() {
    const tipElement = document.createElement('div');
    tipElement.className = 'weekly-tip';
    tipElement.innerHTML = `
        <h3>Dica da Semana</h3>
        <p>${sampleData.weeklyTip}</p>
    `;
    
    // Adiciona ao dashboard (ajuste o seletor conforme necessário)
    document.querySelector('.dashboard-grid').appendChild(tipElement);
}

/* ========== INICIALIZAÇÃO ========== */
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initCalendar();
    initAlertFilters();
    initTasks();
    initProfile();
    loadDashboardData();
    renderWeeklyTip();
    
    // Atualiza dados a cada 30 minutos
    setInterval(loadDashboardData, 1800000);
    
    // Verifica atualizações quando a página ganha foco
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            loadDashboardData();
        }
    });
});