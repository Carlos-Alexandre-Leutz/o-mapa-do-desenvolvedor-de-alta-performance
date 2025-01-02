
let urlBase = "https://sorteio-curso-canal-default-rtdb.firebaseio.com/users/";
const id = Date.now();

function verificarAmbiente() {
  const isProd = window.location.hostname === "carlos-alexandre-leutz.github.io";
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
}
