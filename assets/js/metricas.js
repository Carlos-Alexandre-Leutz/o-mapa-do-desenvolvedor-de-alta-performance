
let urlBase = "https://sorteio-curso-canal-default-rtdb.firebaseio.com/users/";
const id = Date.now();
let btnClicados = "";

function verificarAmbiente() {
  let isProd = window.location.hostname === "carlos-alexandre-leutz.github.io";
  if(!isProd) {
    isProd = window.location.hostname === "alexandreleutz.com.br";
  }
  if (isProd) {
      urlBase ="https://pagina-de-venda-dap-default-rtdb.firebaseio.com/18-01-25/"; //dadoso salvoso apartir desta data
  }
  save();
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
  .then(response => response.json());
};

function editarRegistro(idBotao) {
  btnClicados = btnClicados + ", " + idBotao;
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
  });
}
function botaoDesmutarClicado(btn) {
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
  const url = `${urlBase}vagas.json`;

  const resposta = await fetch(url);
  const dados = await resposta.json();

  if (!dados || dados.total == null) {
    console.error("⚠ Banco ainda não tem 'vagas' configurado.");
    return;
  }

  // Atualiza o elemento na página
  document.getElementById("vagas_numero").innerText = dados.total;

  // Caso queira mostrar a última atualização:
  if (document.getElementById("vagas_atualizado")) {
    const dataFormatada = new Date(dados.atualizadoEm).toLocaleString("pt-BR");
    document.getElementById("vagas_atualizado").innerText = `Numero de vagas Atualizado em: ${dataFormatada}`;
  }

  console.log("🔥 Vagas carregadas:", dados.total);
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

  const url = `${urlBase}vagas.json`;

  await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  });

  console.log("🔥 Vagas atualizadas para:", novoValor);

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

  await atualizarVagas(valor);

  document.getElementById("status-vagas").innerText =
    "Vagas atualizadas com sucesso!";
}