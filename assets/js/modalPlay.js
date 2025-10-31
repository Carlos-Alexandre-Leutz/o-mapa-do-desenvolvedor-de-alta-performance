// Obtendo elementos
const videoElement = document.getElementById('video');
const modalAlerta = document.getElementById('modalAlerta');

// Função para mostrar o modal
// function exibirModal() {
//     modalAlerta.style.display = 'flex';
// }

// // Mostrar o modal quando o vídeo estiver no mudo
// videoElement.onplay = function() {
//     console.log('teste');
//     if (videoElement.muted) {

//         exibirModal();
//     }
// }

// Função para ativar o áudio
function desmutar() {
    // videoElement.currentTime = 0;
    // videoElement.muted = false;
    let btnCompraLink = document.getElementById('btnCompraLink');
    btnCompraLink.style.display = 'block';
    let btnCompra = document.getElementById('btnCompra');
    btnCompra.style.display = 'none';
    botaoDesmutarClicado();
    var iframe = document.getElementById("videoFrame");
    // var videoSrc = "https://www.youtube.com/embed/5fHtpLExs2c?autoplay=1&controls=0&start=2";
    // var videoSrc = "https://www.youtube.com/embed/rXEpCLIKbdY?autoplay=1&controls=0";
    var videoSrc = "https://www.youtube.com/embed/fETwgEJL7VU?autoplay=1&controls=0";

    // Reinicia o vídeo e ativa o som removendo o mute
    iframe.src = videoSrc + "&mute=0";
    modalAlerta.style.display = 'none';
}
