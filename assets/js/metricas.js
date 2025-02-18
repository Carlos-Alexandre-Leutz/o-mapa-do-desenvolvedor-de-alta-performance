
let urlBase = "https://sorteio-curso-canal-default-rtdb.firebaseio.com/users/";
const id = Date.now();

function verificarAmbiente() {
  let isProd = window.location.hostname === "carlos-alexandre-leutz.github.io";
  if(!isProd) {
    isProd = window.location.hostname === "alexandreleutz.com.br";
  }
  if (isProd) {
      urlBase = "https://pagina-de-venda-dap-default-rtdb.firebaseio.com/users/";
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
  const dadosClique = {
    botaoPagamentoClicado: true,
    idBotao: idBotao,
    tempoClique: new Date().toISOString()
  };

  const urlEdicao = `${urlBase}${id}.json`;

  fetch(urlEdicao, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dadosClique),
  })
  .then(response => response.json());

  // alert("Deseja adicionar os módulos:\n\n- Desenvolvimento de Carreira e Networking\n- Técnicas para Passar em uma Entrevista Técnica\n\nGRÁTIS ao seu carrinho?\n\nEssa oferta é válida somente para VOCÊ agora!");

}
function botaoDesmutarClicado() {
  const dadosClique = {
    desmutou: true,
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
  .then(response => response.json());
}
