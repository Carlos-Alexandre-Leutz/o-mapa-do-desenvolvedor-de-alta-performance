
const urlBase = "https://pagina-de-venda-dap-default-rtdb.firebaseio.com/18-01-25/";
const id = Date.now();
let btnClicados = "";

const isProd = ["carlos-alexandre-leutz.github.io", "alexandreleutz.com.br"].includes(window.location.hostname);

function verificarAmbiente() {
  if (isProd) save();
}
window.onload = verificarAmbiente;

function obterTipoDispositivo() {
  if (window.innerWidth <= 800) {
    return "mobile";
  } else {
    return "desktop";
  }
}

function save () {
  const params = new URLSearchParams(window.location.search);
  const utm_source = params.get('utm_source');
  const utm_medium = params.get('utm_medium');
  const utm_campaign = params.get('utm_campaign');

  const dados = {
    tipoDispositivo: obterTipoDispositivo(),
    dataDeEntrada: new Date().toISOString(),
    utm_source: utm_source,
    utm_medium: utm_medium,
    utm_campaign: utm_campaign
  };


  const url = `${urlBase}${id}.json`;

  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados)
  })
  .then(response => response.json())
  .catch(() => {});
}

function editarRegistro(idBotao) {
  if (!isProd) return;
  btnClicados = btnClicados ? btnClicados + ", " + idBotao : idBotao;
  const dadosClique = {
    botaoPagamentoClicado: true,
    idBotao: btnClicados,
    tempoClique: new Date().toISOString()
  };

  const urlEdicao = `${urlBase}${id}.json`;

  fetch(urlEdicao, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dadosClique),
  }).catch(() => {});
}
function botaoDesmutarClicado(btn) {
  if (!isProd) return;
  const dadosClique = {
    desmutou: true,
    botao: btn,
    tempoDesmute: new Date().toISOString()
  };

  const urlEdicao = `${urlBase}${id}.json`;

  fetch(urlEdicao, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dadosClique),
  })
  .then(() => {
    // const newBtn = `<div
    //         onclick="editarRegistro('Abaixo do vídeo')"
    //         class="elementor-element elementor-element-6655043a elementor-mobile-align-center elementor-widget-mobile__width-initial elementor-widget elementor-widget-button"
    //         data-id="6655043a"
    //         data-element_type="widget"
    //         data-widget_type="button.default"
    //       >
    //         <div class="elementor-widget-container">
    //           <div class="elementor-button-wrapper">
    //             <a
    //               class="elementor-button elementor-button-link elementor-size-lg"
    //               target="_blank"
    //               href="https://go.hotmart.com/C100353978H"
    //             >
    //               <span class="elementor-button-content-wrapper">
    //                 <span class="elementor-button-text"
    //                   >Inscreva-se Clicando Aqui!<br
    //                 /></span>
    //               </span>
    //             </a>
    //           </div>
    //         </div>
    //       </div>`
    // document.getElementById("btnCompra").innerHTML = newBtn;
  });
}
async function buscarVagas() {
  const url = `https://pagina-de-venda-dap-default-rtdb.firebaseio.com/vagas.json`;

  let dados;
  try {
    const resposta = await fetch(url);
    dados = await resposta.json();
  } catch (erro) {
    console.error("⚠ Não foi possível carregar as vagas.", erro);
    return;
  }

  if (!dados || dados.total == null) {
    console.error("⚠ Banco ainda não tem 'vagas' configurado.");
    return;
  }

  // Atualiza o elemento na página
  const vagasEl = document.getElementById("vagas_numero");
  if (vagasEl) vagasEl.innerText = dados.total;

  // Caso queira mostrar a última atualização:
  if (document.getElementById("vagas_atualizado")) {
    const dataFormatada = new Date(dados.atualizadoEm).toLocaleString("pt-BR");
    document.getElementById("vagas_atualizado").innerText = `Numero de vagas Atualizado em: ${dataFormatada}`;
  }

}
buscarVagas();

async function atualizarVagas(novoValor) {
  if (isNaN(novoValor)) {
    console.error("Valor inválido para vagas.");
    return;
  }

  const dados = {
    total: novoValor,
    atualizadoEm: new Date().toISOString()
  };

  if (!window.usuarioAdmin) {
    throw new Error("É necessário estar logado para atualizar as vagas.");
  }
  const token = await window.usuarioAdmin.getIdToken();
  const url = `https://pagina-de-venda-dap-default-rtdb.firebaseio.com/vagas.json?auth=${token}`;

  const resposta = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  });
  if (!resposta.ok) {
    throw new Error("Falha ao atualizar vagas: " + resposta.status);
  }


  // atualizar imediatamente na tela
  buscarVagas();
}
async function salvarNovaVaga() {
  const valor = parseInt(document.getElementById("inputVagas").value);

  if (isNaN(valor) || valor < 1) {
    document.getElementById("status-vagas").innerText =
      "Por favor, insira um valor válido.";
    return;
  }

  document.getElementById("status-vagas").innerText = "Salvando...";

  try {
    await atualizarVagas(valor);
  } catch (erro) {
    console.error(erro);
    document.getElementById("status-vagas").innerText =
      "Erro ao salvar. Verifique se está logado.";
    return;
  }

  document.getElementById("status-vagas").innerText =
    "Vagas atualizadas com sucesso!";
}