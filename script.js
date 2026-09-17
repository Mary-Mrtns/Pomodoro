// LÓGICA DO CRONÔMETRO 
let modes = {
    foco:  { minutes: 25, color: '#f05b56' },
    curta: { minutes: 5, color: '#4ca6a9'  },
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
    document.title = `[${formattedTime}] POMODORO`;

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


            if (currentMode === 'foco') {
                saveSessionDate(modes.foco.minutes * 60);
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

// SISTEMA DE SAVE (LOCAL STORAGE)

function saveSessionData(seconds) {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    // Busca dados salvos ou cria um objeto vazio
    let historico = JSON.parse(localStorage.getItem('pomodoro_save')) || {};

    // Se já tiver dados hoje, soma. Se não, cria.
    if (historico[dataAtual]) {
        historico[dataAtual] += seconds;
    } else {
        historico[dataAtual] = seconds;
    }

    // Salva de volta na memória do navegador
    localStorage.setItem('pomodoro_save', JSON.stringify(historico));
    carregarStats(); // Atualiza a tela de log
}

function carregarStats() {
    const statsList = document.getElementById('stats-list');
    statsList.innerHTML = '';

    let historico = JSON.parse(localStorage.getItem('pomodoro_save')) || {};
    const datas = Object.keys(historico).reverse(); // Mais recente primeiro   

    if (datas.length === 0) {
        statsList.innerHTML = '<li>NENHUM DADO SALVO.<li>';
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