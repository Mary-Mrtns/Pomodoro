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
}