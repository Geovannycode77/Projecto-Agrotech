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

const healthData = {
    vaccines: [
        { id: 1, name: "Febre Aftosa", animal: "bovinos", date: "2023-06-15", status: "pending", batch: "AFT-2023-1" },
        { id: 2, name: "Brucelose", animal: "bovinos", date: "2023-05-20", status: "completed", batch: "BRU-2023-1" },
        { id: 3, name: "Raiva", animal: "bovinos", date: "2023-07-10", status: "pending", batch: "RAI-2023-1" },
        { id: 4, name: "Influenza Aviária", animal: "aves", date: "2023-06-05", status: "completed", batch: "INF-2023-2" }
    ],
    diseases: [
        { id: 1, name: "Mastite", animal: "bovinos", date: "2023-05-15", cases: 2, treatment: "Antibiótico" },
        { id: 2, name: "Diarreia Neonatal", animal: "suinos", date: "2023-06-02", cases: 5, treatment: "Hidratação" }
    ]
};

const breedingData = {
    females: [
        { id: 1, tag: "V-023", breed: "Nelore", lastCalving: "2023-01-15", nextHeat: "2023-06-20", status: "cycling" },
        { id: 2, tag: "V-045", breed: "Angus", lastCalving: "2023-03-10", nextHeat: "2023-07-05", status: "pregnant" },
        { id: 3, tag: "V-067", breed: "Brahman", lastCalving: "2022-11-30", nextHeat: "2023-06-15", status: "cycling" }
    ],
    events: [
        { id: 1, type: "insemination", animal: "V-023", date: "2023-05-20", bull: "T-112", technician: "Dr. Silva" },
        { id: 2, type: "pregnancyCheck", animal: "V-045", date: "2023-04-15", result: "positive" },
        { id: 3, type: "calving", animal: "V-078", date: "2023-05-30", calf: "B-2023-45" }
    ]
};

const nutritionData = {
    plans: [
        { id: 1, name: "Engorda Bovinos", animal: "bovinos", phase: "crescimento", ingredients: "Silagem, Ração, Sal", dailyAmount: "15kg" },
        { id: 2, name: "Dieta Aves", animal: "aves", phase: "postura", ingredients: "Milho, Farelo Soja, Premix", dailyAmount: "120g" },
        { id: 3, name: "Lactação Suínos", animal: "suinos", phase: "lactação", ingredients: "Farelo, Milho, Minerais", dailyAmount: "3.5kg" }
    ],
    weightHistory: [
        { id: 1, animal: "Bovino-023", date: "2023-01-01", weight: "320kg" },
        { id: 2, animal: "Bovino-023", date: "2023-02-01", weight: "350kg" },
        { id: 3, animal: "Bovino-023", date: "2023-03-01", weight: "380kg" },
        { id: 4, animal: "Bovino-023", date: "2023-04-01", weight: "410kg" },
        { id: 5, animal: "Bovino-023", date: "2023-05-01", weight: "440kg" }
    ]
};

const suppliesData = {
    inventory: [
        { id: 1, name: "Ração Bovinos", category: "alimento", currentStock: "1200kg", minStock: "1500kg", unit: "kg" },
        { id: 2, name: "Vacina Aftosa", category: "saúde", currentStock: "50 doses", minStock: "30 doses", unit: "doses" },
        { id: 3, name: "Antibiótico", category: "medicamento", currentStock: "25 unidades", minStock: "50 unidades", unit: "unidades" },
        { id: 4, name: "Suplemento Mineral", category: "nutrição", currentStock: "15 sacos", minStock: "20 sacos", unit: "sacos" }
    ],
    movements: [
        { id: 1, date: "2023-06-01", item: "Ração Bovinos", type: "entrada", quantity: "500kg", cost: "R$ 1.250,00" },
        { id: 2, date: "2023-06-02", item: "Vacina Aftosa", type: "saída", quantity: "20 doses", cost: "R$ 0,00" },
        { id: 3, date: "2023-05-30", item: "Suplemento Mineral", type: "entrada", quantity: "10 sacos", cost: "R$ 850,00" }
    ]
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
                    } else if (sectionId === 'health-content') {
                        initHealthModule();
                    } else if (sectionId === 'breeding-content') {
                        initBreedingModule();
                    } else if (sectionId === 'nutrition-content') {
                        initNutritionModule();
                    } else if (sectionId === 'supplies-content') {
                        initSuppliesModule();
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

/* ========== MÓDULO DE SAÚDE ANIMAL ========== */
function initHealthModule() {
    renderVaccineList();
    renderDiseaseHistory();
    updateHealthStats();
    
    document.getElementById('health-animal-type').addEventListener('change', filterHealthRecords);
    document.getElementById('add-health-record').addEventListener('click', showHealthForm);
}

function renderVaccineList() {
    const container = document.getElementById('vaccine-list');
    const pendingVaccines = healthData.vaccines.filter(v => v.status === 'pending');
    
    if (pendingVaccines.length === 0) {
        container.innerHTML = '<p class="no-records">Nenhuma vacinação pendente</p>';
        return;
    }
    
    container.innerHTML = pendingVaccines.map(vaccine => `
        <div class="vaccine-item">
            <div class="vaccine-info">
                <h4>${vaccine.name}</h4>
                <p>${formatAnimalType(vaccine.animal)} • ${formatDate(new Date(vaccine.date))}</p>
                <small>Lote: ${vaccine.batch}</small>
            </div>
            <span class="vaccine-status status-pending">Pendente</span>
        </div>
    `).join('');
}

function renderDiseaseHistory() {
    const container = document.getElementById('disease-history');
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Doença</th>
                    <th>Animal</th>
                    <th>Casos</th>
                    <th>Tratamento</th>
                </tr>
            </thead>
            <tbody>
                ${healthData.diseases.map(disease => `
                    <tr>
                        <td>${formatDate(new Date(disease.date))}</td>
                        <td>${disease.name}</td>
                        <td>${formatAnimalType(disease.animal)}</td>
                        <td>${disease.cases}</td>
                        <td>${disease.treatment}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function updateHealthStats() {
    const pendingVaccines = healthData.vaccines.filter(v => v.status === 'pending').length;
    const diseaseCases = healthData.diseases.reduce((sum, disease) => sum + disease.cases, 0);
    
    document.getElementById('pending-vaccines').textContent = pendingVaccines;
    document.getElementById('disease-cases').textContent = diseaseCases;
}

function filterHealthRecords() {
    const animalType = document.getElementById('health-animal-type').value;
    
    // Filtra vacinas
    const filteredVaccines = animalType === 'all' 
        ? healthData.vaccines 
        : healthData.vaccines.filter(v => v.animal === animalType);
    
    // Filtra doenças
    const filteredDiseases = animalType === 'all' 
        ? healthData.diseases 
        : healthData.diseases.filter(d => d.animal === animalType);
    
    // Atualiza as visualizações
    renderFilteredHealthData(filteredVaccines, filteredDiseases);
}

function showHealthForm() {
    // Implementar um modal ou formulário para adicionar novos registros
    alert("Formulário para adicionar novo registro de saúde será implementado aqui");
}




/* ========== MÓDULO REPRODUTIVO ========== */
/* ========== MÓDULO REPRODUTIVO (SIMPLIFICADO) ========== */
function initBreedingModule() {
    renderBreedingHistory();
    updateBreedingStats();
}

function renderBreedingHistory() {
    const container = document.getElementById('breeding-history');
    
    if (!container) return; // Seção não existe, não renderiza
    
    // Ordena eventos por data (mais recente primeiro)
    const sortedEvents = [...breedingData.events].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    container.innerHTML = `
        <table class="breeding-table">
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Animal</th>
                    <th>Detalhes</th>
                </tr>
            </thead>
            <tbody>
                ${sortedEvents.map(event => `
                    <tr>
                        <td>${formatDate(new Date(event.date))}</td>
                        <td>${formatEventType(event.type)}</td>
                        <td>${event.animal}</td>
                        <td>${getEventDetails(event)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Mantém as funções auxiliares existentes
function formatEventType(type) {
    const types = {
        'insemination': 'Inseminação',
        'pregnancyCheck': 'Exame Prenhez',
        'calving': 'Parto'
    };
    return types[type] || type;
}

function getEventDetails(event) {
    switch(event.type) {
        case 'insemination': return `Touro: ${event.bull} - Técnico: ${event.technician}`;
        case 'pregnancyCheck': return `Resultado: ${event.result === 'positive' ? 'Positivo' : 'Negativo'}`;
        case 'calving': return `Bezerro: ${event.calf}`;
        default: return '';
    }
}

function updateBreedingStats() {
    // Atualiza estatísticas se necessário
    const pregnantCount = breedingData.females.filter(f => f.status === 'pregnant').length;
    const statsElement = document.getElementById('pregnant-females');
    if (statsElement) {
        statsElement.textContent = pregnantCount;
    }
}

function showBreedingForm() {
    // Implementar um modal ou formulário para adicionar novos registros
    alert("Formulário para adicionar novo registro reprodutivo será implementado aqui");
}

/* ========== MÓDULO DE NUTRIÇÃO ========== */
function initNutritionModule() {
    renderFeedingPlans();
    renderWeightHistoryChart();
    updateNutritionStats();
    
    document.getElementById('nutrition-animal-type').addEventListener('change', filterNutritionData);
    document.getElementById('add-feeding-plan').addEventListener('click', showNutritionForm);
}

function renderFeedingPlans() {
    const container = document.getElementById('feeding-plans');
    
    container.innerHTML = nutritionData.plans.map(plan => `
        <div class="plan-item">
            <div class="plan-info">
                <h4>${plan.name}</h4>
                <p>${formatAnimalType(plan.animal)} • ${plan.phase}</p>
                <small>Ingredientes: ${plan.ingredients}</small>
            </div>
            <div class="plan-details">
                <span>${plan.dailyAmount}/animal/dia</span>
            </div>
        </div>
    `).join('');
}

function renderWeightHistoryChart() {
    const container = document.getElementById('weight-history-chart');
    
    // Implementação simplificada - em produção usar Chart.js ou similar
    container.innerHTML = `
        <div class="chart-placeholder">
            <p>Gráfico de evolução de peso será exibido aqui</p>
            <p>Dados disponíveis para: Bovino-023, Bovino-045, Suíno-012</p>
        </div>
    `;
}

function updateNutritionStats() {
    // Valores hardcoded para exemplo
    document.getElementById('daily-consumption').textContent = "1200kg";
    document.getElementById('feed-cost').textContent = "R$ 2.850";
    document.getElementById('average-gmd').textContent = "1.2kg";
}

function filterNutritionData() {
    const animalType = document.getElementById('nutrition-animal-type').value;
    
    const filteredPlans = animalType === 'all' 
        ? nutritionData.plans 
        : nutritionData.plans.filter(p => p.animal === animalType);
    
    renderFilteredNutritionData(filteredPlans);
}

function showNutritionForm() {
    // Implementar um modal ou formulário para adicionar novos planos
    alert("Formulário para adicionar novo plano nutricional será implementado aqui");
}

/* ========== MÓDULO DE INSUMOS ========== */
function initSuppliesModule() {
    renderInventory();
    renderSupplyMovements();
    updateSupplyAlerts();
    updateSupplyReports();
    
    document.getElementById('add-supply').addEventListener('click', showSupplyForm);
    document.getElementById('new-supply-movement').addEventListener('click', showMovementForm);
}

function renderInventory() {
    const container = document.getElementById('current-inventory');
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Categoria</th>
                    <th>Estoque Atual</th>
                    <th>Estoque Mínimo</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${suppliesData.inventory.map(item => {
                    const status = getStockStatus(item);
                    return `
                        <tr class="${status.class}">
                            <td>${item.name}</td>
                            <td>${formatCategory(item.category)}</td>
                            <td>${item.currentStock}</td>
                            <td>${item.minStock}</td>
                            <td><span class="status-badge ${status.class}">${status.text}</span></td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function getStockStatus(item) {
    // Extrai números dos valores (ex: "50 doses" -> 50)
    const current = parseFloat(item.currentStock);
    const min = parseFloat(item.minStock);
    
    if (current <= min * 0.5) {
        return { text: 'Crítico', class: 'critical' };
    } else if (current <= min * 0.8) {
        return { text: 'Alerta', class: 'warning' };
    } else {
        return { text: 'OK', class: 'ok' };
    }
}

function formatCategory(category) {
    const categories = {
        'alimento': 'Alimento',
        'saúde': 'Saúde',
        'medicamento': 'Medicamento',
        'nutrição': 'Nutrição'
    };
    return categories[category] || category;
}

function renderSupplyMovements() {
    const container = document.getElementById('supply-movements');
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Item</th>
                    <th>Tipo</th>
                    <th>Quantidade</th>
                    <th>Custo</th>
                </tr>
            </thead>
            <tbody>
                ${suppliesData.movements.map(movement => `
                    <tr>
                        <td>${formatDate(new Date(movement.date))}</td>
                        <td>${movement.item}</td>
                        <td class="${movement.type}">${movement.type === 'entrada' ? 'Entrada' : 'Saída'}</td>
                        <td>${movement.quantity}</td>
                        <td>${movement.cost}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function updateSupplyAlerts() {
    const criticalItems = suppliesData.inventory.filter(item => {
        const status = getStockStatus(item);
        return status.class === 'critical';
    }).length;
    
    const warningItems = suppliesData.inventory.filter(item => {
        const status = getStockStatus(item);
        return status.class === 'warning';
    }).length;
    
    document.getElementById('critical-supplies').textContent = `${criticalItems} itens abaixo do mínimo`;
    document.getElementById('warning-supplies').textContent = `${warningItems} itens próximos do mínimo`;
}

function updateSupplyReports() {
    // Valores hardcoded para exemplo
    document.getElementById('monthly-cost').textContent = "R$ 5.200";
    document.getElementById('price-variation').textContent = "+2.5%";
    document.getElementById('consumption-index').textContent = "0.85";
}

function showSupplyForm() {
    // Implementar um modal ou formulário para adicionar novos insumos
    alert("Formulário para adicionar novo insumo será implementado aqui");
}

function showMovementForm() {
    // Implementar um modal ou formulário para registrar movimentações
    alert("Formulário para registrar movimentação de estoque será implementado aqui");
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
    setInterval(loadDashboardData, 180);
    
    // Verifica atualizações quando a página ganha foco
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            loadDashboardData();
        }
    });
});