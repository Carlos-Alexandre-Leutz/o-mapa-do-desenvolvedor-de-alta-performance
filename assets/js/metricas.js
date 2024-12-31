
let urlBase = "https://sorteio-curso-canal-default-rtdb.firebaseio.com/users/";

function verificarAmbiente() {
  const isProd = window.location.hostname === "carlos-alexandre-leutz.github.io" || window.location.hostname === "alexandreleutz.com";
  if (isProd) {
      urlBase = "https://pagina-de-venda-dap-default-rtdb.firebaseio.com/users/";
  }
}
window.onload = verificarAmbiente;


function obterTipoDispositivo() {
  if (window.innerWidth <= 800) {
    return "mobile";
  } else {
    return "desktop";
  }
}

const dados = {
  tipoDispositivo: obterTipoDispositivo(),
  dataDeEntrada: new Date().toISOString()
};

const id = Date.now();

const url = `${urlBase}${id}.json`;

fetch(url, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(dados)
})
.then(response => response.json());

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
