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
    const btnCompraLink = document.getElementById('btnCompraLink');
    if (btnCompraLink) btnCompraLink.style.display = 'block';
    const btnCompra = document.getElementById('btnCompra');
    if (btnCompra) btnCompra.style.display = 'none';
    botaoDesmutarClicado();
    var iframe = document.getElementById("videoFrame");
    // var videoSrc = "https://www.youtube.com/embed/5fHtpLExs2c?autoplay=1&controls=0&start=2";
    // var videoSrc = "https://www.youtube.com/embed/rXEpCLIKbdY?autoplay=1&controls=0";
    var videoSrc = "https://www.youtube.com/embed/UCqrggoWA30?autoplay=1&controls=0";

    // Reinicia o vídeo e ativa o som removendo o mute
    iframe.src = videoSrc + "&mute=0";
    if (modalAlerta) modalAlerta.style.display = 'none';

    const precoElement = document.getElementById("preco");

    if (precoElement) {
        setTimeout(function () {
            precoElement.style.display = "block";
        }, 237000);
    }
}
