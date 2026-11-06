# Worker do chat (Cloudflare)

Ele recebe a conversa do site, chama a IA com o roteiro de `prompt.js` e devolve a resposta.
O modelo padrão é `gemini-2.5-flash` (troque com `npx wrangler secret put GEMINI_MODEL` se quiser outro). A chave da API fica só aqui, nunca no site.

## Deploy (uma vez)
1. Crie conta grátis em https://dash.cloudflare.com
2. Crie uma chave NOVA, só para este site, em https://aistudio.google.com/apikey (Gemini). Ative o plano pago com teto de gasto no Google Cloud se for usar de verdade (o gratuito tem limite baixo e pode usar as conversas para treino).
3. No terminal, nesta pasta:
```bash
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
npx wrangler deploy
```
4. Copie a URL que aparecer (`https://chat-curso-alexandre.<conta>.workers.dev`) para `chatUrl` em `assets/v2/config.js`.

## Sem instalar nada (pelo painel, sem Node)
1. https://dash.cloudflare.com → Workers & Pages → Create → Create Worker → Deploy (o "Hello World").
2. Edit code → apague tudo e cole o conteúdo de `worker-colar-no-painel.js` → Deploy.
3. Settings → Variables and Secrets → Add → tipo **Secret**, nome `GEMINI_API_KEY`, valor = sua chave → Deploy.
4. Copie a URL do Worker para `chatUrl` em `assets/v2/config.js`.
(Os nomes dos menus podem mudar um pouco.) Se editar `prompt.js`, gere o arquivo único de novo ou edite o texto direto no painel.

## Mudar o que a IA fala
Edite `prompt.js` e rode `npx wrangler deploy` de novo.

## Proteção contra abuso
- Só aceita requisições vindas do seu domínio (lista `ORIGENS` em `worker.js`).
- Máx. 12 mensagens por minuto por IP, 500 caracteres por mensagem, 600 tokens por resposta.
- O limite por IP é por instância do Worker (fraco). Para um limite forte, adicione uma regra de Rate Limiting no painel da Cloudflare (Security > WAF > Rate limiting) e mantenha o teto de gasto no Google Cloud.
