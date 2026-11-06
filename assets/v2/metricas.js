// Métricas no Firebase, MESMO formato do assets/js/metricas.js antigo
// (tipoDispositivo, dataDeEntrada, utm_*, botaoPagamentoClicado, idBotao, tempoClique,
//  desmutou, botao, tempoDesmute) para o auth/dashboard.html continuar funcionando.
// Campos novos: versao, cliques, secoesVistas, scrollMax, tempoNaPagina, chat*.
(function () {
  const C = window.SITE;
  const id = Date.now();
  const isProd = C.hostsProducao.includes(location.hostname);
  const base = isProd ? C.firebaseProd : C.firebaseTeste;
  const url = `${base}${id}.json`;
  const log = [];
  let pagamentos = "";
  let criado = null;

  function enviar(method, dados) {
    const p = fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
      keepalive: true,
    }).catch(() => {});
    return p;
  }
  // PATCH só depois do PUT inicial, para a ordem não inverter
  function patch(dados) {
    (criado || Promise.resolve()).then(() => enviar("PATCH", dados));
  }

  function visita() {
    const p = new URLSearchParams(location.search);
    criado = enviar("PUT", {
      tipoDispositivo: window.innerWidth <= 800 ? "mobile" : "desktop",
      dataDeEntrada: new Date().toISOString(),
      utm_source: p.get("utm_source"),
      utm_medium: p.get("utm_medium"),
      utm_campaign: p.get("utm_campaign"),
      versao: "v2",
    });
  }

  // Clique de pagamento (mesma função/campos do site antigo)
  window.editarRegistro = function (nome) {
    pagamentos += ", " + nome;
    patch({ botaoPagamentoClicado: true, idBotao: pagamentos, tempoClique: new Date().toISOString() });
  };

  // Cliques em qualquer outro botão marcado com data-track
  function clique(nome) {
    log.push(nome);
    patch({ cliques: log.join(", "), tempoUltimoClique: new Date().toISOString() });
  }
  window.registrarClique = clique;

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-track]");
    if (el) clique(el.getAttribute("data-track"));
    const faq = e.target.closest("summary");
    if (faq) clique("faq: " + faq.textContent.trim().slice(0, 40));
  });

  // Chat
  window.registrarChat = (d) => patch(d);

  // Vídeo com som (mesmos campos do antigo)
  window.registrarDesmute = (btn) =>
    patch({ desmutou: true, botao: btn, tempoDesmute: new Date().toISOString() });

  // Seções vistas e scroll máximo
  const vistas = new Set();
  let scrollMax = 0;
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => {
      let mudou = false;
      es.forEach((e) => {
        const n = e.target.getAttribute("data-secao");
        if (e.isIntersecting && !vistas.has(n)) { vistas.add(n); mudou = true; }
      });
      if (mudou) patch({ secoesVistas: [...vistas].join(", ") });
    }, { threshold: 0.35 });
    document.querySelectorAll("[data-secao]").forEach((el) => io.observe(el));
  }
  let tScroll;
  window.addEventListener("scroll", () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    const pct = h > 0 ? Math.round((scrollY / h) * 100) : 0;
    if (pct > scrollMax + 9) {
      scrollMax = pct;
      clearTimeout(tScroll);
      tScroll = setTimeout(() => patch({ scrollMax }), 800);
    }
  }, { passive: true });

  // Tempo na página ao sair
  const t0 = Date.now();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") patch({ tempoNaPagina: Math.round((Date.now() - t0) / 1000) });
  });

  // Vagas "3/100" + barra quase cheia
  async function vagas() {
    let restam = C.vagasPadrao;
    let atualizadoEm = null;
    try {
      const r = await fetch(C.firebaseVagas);
      const d = await r.json();
      if (d && d.total != null) restam = d.total;
      if (d && d.atualizadoEm) atualizadoEm = new Date(d.atualizadoEm);
    } catch (_) {}
    // "Atualizado há X" com a data real gravada no Firebase
    function relativo(dt) {
      const s = Math.max(0, Math.floor((Date.now() - dt.getTime()) / 1000));
      if (s < 60) return "há instantes";
      const m = Math.floor(s / 60);
      if (m < 60) return `há ${m} min`;
      const h = Math.floor(m / 60);
      if (h < 24) return `há ${h} h`;
      const dias = Math.floor(h / 24);
      return `há ${dias} ${dias === 1 ? "dia" : "dias"}`;
    }
    function pintarAtualizado() {
      if (!atualizadoEm || isNaN(atualizadoEm)) return;
      document.querySelectorAll("[data-vagas-atualizado]").forEach(
        (el) => (el.textContent = "Vagas atualizadas " + relativo(atualizadoEm))
      );
    }
    pintarAtualizado();
    setInterval(pintarAtualizado, 30000);
    const total = C.vagasTotal;
    window.SITE.vagas = restam;
    document.querySelectorAll("[data-vagas]").forEach((el) => (el.textContent = restam));
    document.querySelectorAll("[data-vagas-total]").forEach((el) => (el.textContent = total));
    const pct = Math.max(0, Math.min(100, ((total - restam) / total) * 100));
    requestAnimationFrame(() =>
      document.querySelectorAll("[data-vagas-bar] i").forEach((b) => (b.style.width = pct + "%"))
    );
  }

  // Preço/oferta aparecem X segundos depois do clique para ver o vídeo com som
  const KEY_T = "v2_inicio_video";
  function mostrarPreco() {
    document.querySelectorAll(".oculto-ate-preco").forEach((el) => el.classList.remove("oculto-ate-preco"));
  }
  function agendarPreco(inicio) {
    const falta = C.segundosAtePreco * 1000 - (Date.now() - inicio);
    if (falta <= 0) mostrarPreco();
    else setTimeout(mostrarPreco, falta);
  }
  const cobertura = document.getElementById("video-som");
  if (cobertura) {
    cobertura.addEventListener("click", () => {
      const f = document.getElementById("videoFrame");
      f.src = "https://www.youtube.com/embed/UCqrggoWA30?autoplay=1&controls=0&mute=0&playsinline=1";
      cobertura.remove();
      window.registrarDesmute("video-com-som");
      const agora = Date.now();
      try { sessionStorage.setItem(KEY_T, String(agora)); } catch (_) {}
      agendarPreco(agora);
    });
  }
  try { // se recarregar a página, não reinicia a contagem
    const t = Number(sessionStorage.getItem(KEY_T));
    if (t) { cobertura && cobertura.remove(); agendarPreco(t); }
  } catch (_) {}

  visita();
  vagas();
})();
