// Chat de vendas. No celular abre em tela cheia.
(function () {
  const C = window.SITE;
  const KEY = "chat_v2";
  const MAX_CHARS = 500;
  const MARCADOR_COMPRA = "[[COMPRAR]]";
  const MARCADOR_ZAP = "[[WHATSAPP]]";

  const $ = (s) => document.querySelector(s);
  const root = $("#chat");
  const fab = $("#chat-fab");
  const lista = $("#chat-msgs");
  const form = $("#chat-form");
  const input = $("#chat-input");
  const enviarBtn = $("#chat-send");

  const SAUDACAO =
    "Oi! 👋 Eu sou o assistente do Alexandre e tiro suas dúvidas sobre o curso.\n\nPra começar: **qual é a sua maior dificuldade hoje pra começar a programar?**";

  let historico = [];
  let carregando = false;
  let abertoRegistrado = false;
  let enviadas = 0;

  try {
    historico = JSON.parse(sessionStorage.getItem(KEY)) || [];
  } catch (_) {}

  // ---------- render ----------
  function escapar(t) {
    return t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function formatar(t) {
    return escapar(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
  }

  function bolha(role, texto) {
    const comprar = role === "assistant" && texto.includes(MARCADOR_COMPRA);
    const zap = role === "assistant" && texto.includes(MARCADOR_ZAP);
    const limpo = texto.replace(MARCADOR_COMPRA, "").replace(MARCADOR_ZAP, "").trim();
    const el = document.createElement("div");
    el.className = "msg " + (role === "user" ? "msg-user" : "msg-bot");
    el.innerHTML = formatar(limpo);
    if (comprar) {
      const a = document.createElement("a");
      a.className = "btn btn-cta chat-buy";
      a.href = C.checkoutUrl;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Garantir minha vaga agora";
      a.addEventListener("click", () => {
        window.editarRegistro && window.editarRegistro("chat-comprar");
      });
      el.appendChild(a);
    }
    if (zap) {
      const a = document.createElement("a");
      a.className = "btn btn-zap chat-buy";
      a.href = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(C.whatsappMsg)}`;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Chamar o Alexandre no WhatsApp";
      a.addEventListener("click", () => {
        window.registrarClique && window.registrarClique("chat-whatsapp");
      });
      el.appendChild(a);
    }
    lista.appendChild(el);
    rolar();
    return el;
  }

  function rolar() {
    lista.scrollTop = lista.scrollHeight;
  }

  function digitando(on) {
    let el = $("#chat-typing");
    if (on && !el) {
      el = document.createElement("div");
      el.id = "chat-typing";
      el.className = "msg msg-bot typing";
      el.innerHTML = "<span></span><span></span><span></span>";
      lista.appendChild(el);
      rolar();
    } else if (!on && el) {
      el.remove();
    }
  }

  function salvar() {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(historico.slice(-40)));
    } catch (_) {}
  }

  // ---------- abrir/fechar ----------
  function abrir() {
    root.classList.add("open");
    root.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("chat-lock");
    fab.classList.add("hidden");
    if (!lista.children.length) {
      if (historico.length) historico.forEach((m) => bolha(m.role, m.content));
      else bolha("assistant", SAUDACAO);
    }
    if (!abertoRegistrado) {
      abertoRegistrado = true;
      window.registrarChat && window.registrarChat({ chatAberto: true, chatAbertoEm: new Date().toISOString() });
    }
    setTimeout(() => input.focus({ preventScroll: true }), 150);
    rolar();
  }

  function fechar() {
    root.classList.remove("open");
    root.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("chat-lock");
    fab.classList.remove("hidden");
  }

  // Teclado do celular: ajusta altura ao viewport visível
  function ajustarViewport() {
    const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    root.style.setProperty("--vh", h + "px");
    rolar();
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", ajustarViewport);
    window.visualViewport.addEventListener("scroll", ajustarViewport);
  }
  ajustarViewport();

  // ---------- envio ----------
  async function enviar(texto) {
    texto = texto.trim().slice(0, MAX_CHARS);
    if (!texto || carregando) return;

    bolha("user", texto);
    historico.push({ role: "user", content: texto });
    salvar();
    input.value = "";
    autoAltura();
    enviadas++;
    window.registrarChat && window.registrarChat({ chatMensagens: enviadas });

    carregando = true;
    enviarBtn.disabled = true;
    digitando(true);

    try {
      if (!C.chatUrl) throw new Error("chatUrl não configurada");
      const r = await fetch(C.chatUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historico.slice(-30), vagas: window.SITE.vagas }),
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const d = await r.json();
      const resposta = (d.reply || "").trim();
      if (!resposta) throw new Error("vazio");
      historico.push({ role: "assistant", content: resposta });
      salvar();
      digitando(false);
      bolha("assistant", resposta);
    } catch (e) {
      digitando(false);
      historico.pop(); // permite reenviar
      salvar();
      console.error("[chat]", e);
      bolha(
        "assistant",
        C.chatUrl
          ? "Deu um problema aqui e não consegui responder agora 😕 Tenta de novo em instantes."
          : "⚠️ Chat ainda não conectado à IA (falta o deploy do Worker, ver worker/README.md)."
      );
    } finally {
      carregando = false;
      enviarBtn.disabled = false;
      input.focus({ preventScroll: true });
    }
  }

  function autoAltura() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    enviar(input.value);
  });
  input.addEventListener("input", autoAltura);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 700) {
      e.preventDefault();
      enviar(input.value);
    }
  });

  fab.addEventListener("click", abrir);
  $("#chat-close").addEventListener("click", fechar);
  document.addEventListener("keydown", (e) => e.key === "Escape" && fechar());
  document.querySelectorAll("[data-abrir-chat]").forEach((b) => b.addEventListener("click", abrir));
})();
