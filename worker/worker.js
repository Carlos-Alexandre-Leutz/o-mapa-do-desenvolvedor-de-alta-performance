// Cloudflare Worker: esconde a chave da API e aplica limites. Usa Gemini.
import { systemPrompt } from "./prompt.js";

const ORIGENS = [
  "https://alexandreleutz.com.br",
  "https://www.alexandreleutz.com.br",
  "https://carlos-alexandre-leutz.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
];
// Só usado se não der para descobrir os modelos da chave. Para fixar um modelo,
// crie a variável GEMINI_MODEL no painel da Cloudflare.
const MODELO_PADRAO = "gemini-2.5-flash";
const MAX_MSGS = 30;
const MAX_CHARS = 500;
const LIMITE_POR_MIN = 12; // por IP (por instância do worker; ver README para limite forte)

const hits = new Map();
let modelosCache = null;

// Lista os modelos que a chave enxerga e devolve a ordem de tentativa:
// Flash estáveis (mais novo primeiro), depois Flash-Lite estáveis.
async function descobrirModelos(chave) {
  try {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", {
      headers: { "x-goog-api-key": chave },
    });
    if (!r.ok) return null;
    const d = await r.json();
    const nomes = (d.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
      .map((m) => m.name.replace("models/", ""));
    const versao = (n) => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [0, 0])[1]);
    const ordenar = (l) => l.sort((a, b) => versao(b) - versao(a));
    const flash = ordenar(nomes.filter((n) => /^gemini-[\d.]+-flash$/.test(n)));
    const lite = ordenar(nomes.filter((n) => /^gemini-[\d.]+-flash-lite$/.test(n)));
    const lista = [...lite, ...flash]; // lite primeiro: mais rápido e com mais limite
    return lista.length ? lista : null;
  } catch (_) {
    return null;
  }
}

// Qualquer porta de localhost/127.0.0.1 vale (testes locais)
function permitida(origin) {
  return ORIGENS.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function cors(origin) {
  const ok = permitida(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : ORIGENS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors(origin) },
  });
}

function limitado(ip) {
  const agora = Date.now();
  const lista = (hits.get(ip) || []).filter((t) => agora - t < 60000);
  lista.push(agora);
  hits.set(ip, lista);
  if (hits.size > 5000) hits.clear();
  return lista.length > LIMITE_POR_MIN;
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (req.method !== "POST") return json({ error: "método" }, 405, origin);
    if (!permitida(origin)) return json({ error: "origem" }, 403, origin);

    const ip = req.headers.get("CF-Connecting-IP") || "?";
    if (limitado(ip)) return json({ reply: "Calma, tá rápido demais 😅 Espera um minutinho e me manda de novo." }, 429, origin);

    let dados;
    try {
      dados = await req.json();
    } catch (_) {
      return json({ error: "json" }, 400, origin);
    }

    const msgs = (Array.isArray(dados.messages) ? dados.messages : [])
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-MAX_MSGS)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS * 4) }));
    // a primeira e a última têm que ser do usuário (exigência da API)
    while (msgs.length && msgs[0].role !== "user") msgs.shift();
    if (!msgs.length || msgs[msgs.length - 1].role !== "user") return json({ error: "mensagens" }, 400, origin);
    msgs[msgs.length - 1].content = msgs[msgs.length - 1].content.slice(0, MAX_CHARS);

    const vagas = Number.isInteger(dados.vagas) && dados.vagas >= 0 && dados.vagas <= 20 ? dados.vagas : 3;

    const corpo = (comThinking) => ({
      systemInstruction: { parts: [{ text: systemPrompt(vagas) }] },
      contents: msgs.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        ...(comThinking ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
      },
    });
    const chamar = (modelo, comThinking) =>
      fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify(corpo(comThinking)),
        signal: AbortSignal.timeout(8000), // não deixa o visitante esperando
      });

    if (!env.GEMINI_MODEL && !modelosCache) modelosCache = await descobrirModelos(env.GEMINI_API_KEY);
    const lista = env.GEMINI_MODEL ? [env.GEMINI_MODEL] : (modelosCache || [MODELO_PADRAO]).slice(0, 4);

    let r = null;
    let modelo = lista[0];
    for (const m of lista) {
      modelo = m;
      try {
        r = await chamar(m, true);
        if (r.status === 400) r = await chamar(m, false); // alguns modelos recusam thinkingBudget
      } catch (_) {
        r = null; // timeout: tenta o próximo
        continue;
      }
      if (r.ok) break;
      if (![404, 429, 500, 502, 503, 504].includes(r.status)) break;
    }

    if (!r || !r.ok) {
      const detalhe = r ? (await r.text()).slice(0, 300) : "timeout";
      return json({ error: "ia", status: r ? r.status : 0, modelo, detalhe }, 502, origin);
    }

    const d = await r.json();
    const reply = ((d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) || [])
      .map((p) => p.text || "")
      .join("")
      .trim();
    if (!reply) return json({ error: "vazio", modelo }, 502, origin);
    return json({ reply }, 200, origin);
  },
};
