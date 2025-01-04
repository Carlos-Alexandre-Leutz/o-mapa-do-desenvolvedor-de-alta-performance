// Obtendo elementos
const videoElement = document.getElementById('video');
const modalAlerta = document.getElementById('modalAlerta');

// Função para mostrar o modal
function exibirModal() {
    modalAlerta.style.display = 'flex';
}

// Mostrar o modal quando o vídeo estiver no mudo
videoElement.onplay = function() {
    if (videoElement.muted) {
        exibirModal();
    }
}

// Função para ativar o áudio
function desmutar() {
    videoElement.muted = false; // Desativa o mudo
    modalAlerta.style.display = 'none'; // Fecha o modal
}
