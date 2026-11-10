// Configuração única do site novo. Mude aqui, não espalhe pelo HTML.
window.SITE = {
  // Link de checkout da Hotmart
  checkoutUrl: "https://pay.hotmart.com/B95460619U",

  // WhatsApp do Alexandre (liberação do acompanhamento)
  whatsapp: "554797336957",
  whatsappMsg: "Oi Alexandre, comprei o curso e quero liberar o acompanhamento!",

  // Preço exibido (se mudar aqui, mude também no worker/prompt.js)
  precoDe: "R$ 697,00",
  precoPor: "R$ 197,00",
  parcelas: "12x",

  // Vagas de acompanhamento no WhatsApp (usado se o Firebase não responder)
  vagasPadrao: 3,
  vagasTotal: 100, // mostra "3/100" e a barra quase cheia

  // Segundos depois do clique no vídeo para mostrar preço/oferta (antes: 237000 ms)
  segundosAtePreco: 237,

  // URL do Cloudflare Worker (preencher depois do deploy, ver worker/README.md)
  chatUrl: "https://aged-violet-4f3b.alexandreoantiquado.workers.dev",

  // Firebase Realtime Database (mesmos bancos do site antigo)
  firebaseProd: "https://pagina-de-venda-dap-default-rtdb.firebaseio.com/18-01-25/",
  firebaseVagas: "https://pagina-de-venda-dap-default-rtdb.firebaseio.com/vagas.json",
  hostsProducao: ["carlos-alexandre-leutz.github.io", "alexandreleutz.com.br", "www.alexandreleutz.com.br"],
};
