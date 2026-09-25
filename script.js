// --- LÓGICA DO CRONÔMETRO ---
let modes = {
    foco: { minutes: 25, color: '#f05b56' },
    curta: { minutes: 5, color: '#4ca6a9' },
    longa: { minutes: 15, color: '#498fc1' }
};

let currentMode = 'foco';
let totalTimeInSeconds = modes[currentMode].minutes * 60;
let timeLeft = totalTimeInSeconds;
let timerId = null;

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById('time').textContent = formattedTime;
    document.title = `[${formattedTime}] 8-BIT POMODORO`;
    
    const progressPercentage = ((totalTimeInSeconds - timeLeft) / totalTimeInSeconds) * 100;
    document.getElementById('progress-fill').style.width = `${progressPercentage}%`;
}

function setMode(mode) {
    pauseTimer();
    currentMode = mode;
    totalTimeInSeconds = modes[mode].minutes * 60;
    timeLeft = totalTimeInSeconds;
    
    const color = modes[mode].color;
    document.body.style.backgroundColor = color;
    document.getElementById('progress-fill').style.backgroundColor = color;
    
    document.querySelectorAll('.modes button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${mode}`).classList.add('active');
    
    updateDisplay();
}

function startTimer() {
    if (timerId !== null) return; 
    
    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerId);
            timerId = null;
            
            // Só salva o progresso se for o modo "FOCO" concluído até o fim.
            if (currentMode === 'foco') {
                saveSessionData(modes.foco.minutes * 60);
            }
            
            alert('GAME OVER! TEMPO ESGOTADO.');
            resetTimer();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerId);
    timerId = null;
}

function resetTimer() {
    pauseTimer();
    timeLeft = totalTimeInSeconds;
    updateDisplay();
}

// --- SISTEMA DE SAVE (LOCAL STORAGE) ---

function saveSessionData(seconds) {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    // Busca dados salvos ou cria um objeto vazio
    let historico = JSON.parse(localStorage.getItem('pomodoro8bit_save')) || {};
    
    // Se já tiver dados hoje, soma. Se não, cria.
    if (historico[dataAtual]) {
        historico[dataAtual] += seconds;
    } else {
        historico[dataAtual] = seconds;
    }
    
    // Salva de volta na memória do navegador
    localStorage.setItem('pomodoro8bit_save', JSON.stringify(historico));
    carregarStats(); // Atualiza a tela de log
}

function carregarStats() {
    const statsList = document.getElementById('stats-list');
    statsList.innerHTML = '';
    
    let historico = JSON.parse(localStorage.getItem('pomodoro8bit_save')) || {};
    const datas = Object.keys(historico).reverse(); // Mais recente primeiro
    
    if (datas.length === 0) {
        statsList.innerHTML = '<li>NENHUM DADO SALVO.</li>';
        return;
    }

    datas.forEach(data => {
        const totalSegundos = historico[data];
        const horas = Math.floor(totalSegundos / 3600);
        const minutos = Math.floor((totalSegundos % 3600) / 60);
        
        let tempoTexto = '';
        if (horas > 0) tempoTexto += `${horas}H `;
        tempoTexto += `${minutos}M`;
        
        const li = document.createElement('li');
        
        const spanData = document.createElement('span');
        spanData.textContent = data;
        
        const spanTempo = document.createElement('span');
        spanTempo.textContent = tempoTexto;
        spanTempo.style.color = '#e74c3c'; // Destaca o tempo em vermelho retro
        
        li.appendChild(spanData);
        li.appendChild(spanTempo);
        statsList.appendChild(li);
    });
}

function clearStats() {
    if (confirm("DELETAR TODO O SEU SAVE DE FOCO?")) {
        localStorage.removeItem('pomodoro8bit_save');
        carregarStats();
    }
}

// --- LÓGICA DE PAINEIS ---

function togglePanel(panelId) {
    // Fecha os dois paineis antes
    const isAtivo = document.getElementById(panelId).classList.contains('active');
    document.getElementById('settings-panel').classList.remove('active');
    document.getElementById('stats-panel').classList.remove('active');
    
    // Se não estava ativo antes, abre ele
    if (!isAtivo) {
        document.getElementById(panelId).classList.add('active');
        if (panelId === 'stats-panel') {
            carregarStats(); // Carrega o histórico mais atualizado
        }
    }
}

function saveSettings() {
    const novoFoco = Math.max(1, document.getElementById('input-foco').value);
    const novaCurta = Math.max(1, document.getElementById('input-curta').value);
    const novaLonga = Math.max(1, document.getElementById('input-longa').value);

    modes.foco.minutes = novoFoco;
    modes.curta.minutes = novaCurta;
    modes.longa.minutes = novaLonga;

    togglePanel('settings-panel');
    totalTimeInSeconds = modes[currentMode].minutes * 60;
    resetTimer();
}

// --- LÓGICA DA LISTA DE TAREFAS (QUESTS) ---

function addTask() {
    const input = document.getElementById('task-input');
    const taskText = input.value.trim();
    if (taskText === '') return;

    const taskList = document.getElementById('task-list');
    const li = document.createElement('li');
    li.className = 'task-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.onclick = function() {
        if (checkbox.checked) li.classList.add('completed');
        else li.classList.remove('completed');
    };

    const span = document.createElement('span');
    span.textContent = taskText;

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = 'X';
    deleteBtn.className = 'btn-delete-task';
    deleteBtn.onclick = function() { taskList.removeChild(li); };

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);

    input.value = '';
}

function handleKeyPress(event) {
    if (event.key === 'Enter') addTask();
}

// Inicializa o app ao carregar a página
setMode('foco'); 
carregarStats();