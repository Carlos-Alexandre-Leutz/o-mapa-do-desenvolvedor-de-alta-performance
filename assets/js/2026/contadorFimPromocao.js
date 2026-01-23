// Defina aqui quanto tempo falta (em horas, minutos e segundos)
let totalSeconds = 10 * 3600 + 21 * 60 + 48; // Exemplo da sua imagem

function updateTimer() {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");

  if (totalSeconds > 0) {
    totalSeconds--;
  }
}

export const start = () => {
    updateTimer();
    setInterval(updateTimer, 1000);
}
