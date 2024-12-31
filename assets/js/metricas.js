
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
    return "mobile"; // Se a largura da tela for menor ou igual a 800px, considera como "mobile"
  } else {
    return "desktop"; // Caso contrário, considera como "desktop"
  }
}

// Dados que você quer salvar
const dados = {
  tipoDispositivo: obterTipoDispositivo(),
  dataDeEntrada: new Date().toISOString() // data formatada para ISO
};

// Gerando um ID único baseado no timestamp (milissegundos)
const id = Date.now(); // O ID será o timestamp atual

// URL do Firebase Realtime Database
const url = `${urlBase}${id}.json`;

// Função para enviar o POST
fetch(url, {
  method: 'PUT', // Usando PUT para criar um nó com o ID customizado
  headers: {
    'Content-Type': 'application/json', // Especificando que o conteúdo é JSON
  },
  body: JSON.stringify(dados) // Convertendo os dados para JSON
})
.then(response => response.json()) // Converte a resposta para JSON
.then(data => {
  console.log('Dados salvos com sucesso:', data);
})
.catch(error => {
  console.error('Erro ao salvar dados:', error);
});

// Função para editar o registro com o clique no botão
function editarRegistro(idBotao) {
  // Dados adicionais do clique no botão
  const dadosClique = {
    botaoPagamentoClicado: true,
    idBotao: idBotao,
    tempoClique: new Date().toISOString() // Hora do clique formatada
  };

  // URL para atualizar o registro no Firebase
  const urlEdicao = `${urlBase$}{id}.json`;

  // Atualizando o registro com o PATCH
  fetch(urlEdicao, {
    method: 'PATCH', // Usando PATCH para atualizar o nó existente sem sobrescrever
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dadosClique), // Convertendo os dados adicionais para JSON
  })
  .then(response => response.json()) // Converte a resposta para JSON
  .then(data => {
    console.log('Dados atualizados com sucesso:', data);
  })
  .catch(error => {
    console.error('Erro ao atualizar dados:', error);
  });
}
