/* =========================================================================
   POST /api/ask — "Pergunte ao meu currículo".
   Responde perguntas sobre o portfolio com a API do Claude, usando content.js
   como base de conhecimento (via lib/knowledge.js).

   Entrada (JSON): { messages: [{ role: "user" | "assistant", content: string }], lang: "pt" | "en" }
   Saída: NDJSON em streaming, uma linha por evento:
     {"type":"text","text":"..."}   pedaço da resposta
     {"type":"usage", ...}          modelo e tokens (aparece no "trace" do notebook)
     {"type":"done"}                fim normal
     {"type":"error","code":"..."}  refusal | max_tokens | busy | upstream | not_configured
   Erros antes do streaming voltam como JSON { error } com status 400/405/429/503.

   Variáveis de ambiente: ANTHROPIC_API_KEY (obrigatória), ASK_MODEL, ASK_IP_LIMIT,
   ASK_DAILY_LIMIT, UPSTASH_REDIS_REST_URL/TOKEN, ASK_MOCK=1 (resposta simulada, sem API).
   ========================================================================= */
'use strict';

const { Anthropic } = require('@anthropic-ai/sdk');
const { SYSTEM_PROMPT, expId } = require('../lib/knowledge.js');
const { checkLimits } = require('../lib/ratelimit.js');
const C = require('../content.js');

const MODEL = process.env.ASK_MODEL || 'claude-opus-5-5';
const MAX_HISTORY = 8;      // mensagens reenviadas ao modelo (≈ 4 perguntas + 4 respostas)
const MAX_QUESTION = 600;   // caracteres por pergunta
const MAX_ANSWER = 4000;    // caracteres por resposta anterior reenviada
const MAX_BODY = 32 * 1024; // bytes

let client;

function sendJSON(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

async function readBody(req) {
  if (req.body !== undefined) return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) throw new Error('body too large');
  }
  return JSON.parse(raw);
}

// Mantém só o histórico recente, com papéis e tamanhos válidos, terminando numa pergunta.
function sanitize(input) {
  if (!Array.isArray(input)) return null;
  const msgs = input.slice(-MAX_HISTORY)
    .map(m => {
      const role = m && m.role === 'assistant' ? 'assistant' : 'user';
      const limit = role === 'assistant' ? MAX_ANSWER : MAX_QUESTION;
      return { role, content: String((m && m.content) || '').trim().slice(0, limit) };
    })
    .filter(m => m.content);
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  return msgs.length && msgs[msgs.length - 1].role === 'user' ? msgs : null;
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  return (fwd ? String(fwd).split(',')[0].trim() : '') || (req.socket && req.socket.remoteAddress) || 'unknown';
}

// Resposta simulada para testar a interface localmente sem gastar tokens.
async function mockAnswer(send, lang) {
  const t = v => (v && typeof v === 'object' ? v[lang] ?? v.pt : v);
  const p = C.projects.find(x => x.stage !== 'building') || C.projects[0], j = C.experience[0];
  const text = lang === 'en'
    ? `(simulated mode, no API call) ${C.name} shipped "${t(p.title)}" to production [${p.id}] and works as ${t(j.title)} at ${t(j.org)} [${expId(0)}]. Main stack: ${p.stack.slice(0, 3).join(', ')} [STACK].`
    : `(modo simulado, sem chamada à API) ${C.name} colocou em produção o projeto "${t(p.title)}" [${p.id}] e atua como ${t(j.title)} na ${t(j.org)} [${expId(0)}]. Stack principal: ${p.stack.slice(0, 3).join(', ')} [STACK].`;
  await new Promise(r => setTimeout(r, 700));
  for (const word of text.split(/(?<= )/)) {
    send({ type: 'text', text: word });
    await new Promise(r => setTimeout(r, 35));
  }
  send({ type: 'usage', model: 'mock', mock: true });
  send({ type: 'done' });
}

function errorCode(err) {
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) return 'not_configured';
  if (err instanceof Anthropic.RateLimitError || err instanceof Anthropic.InternalServerError || err instanceof Anthropic.APIConnectionError) return 'busy';
  return 'upstream';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJSON(res, 405, { error: 'method_not_allowed' });
  }

  let body;
  try { body = await readBody(req); } catch { return sendJSON(res, 400, { error: 'bad_request' }); }
  const messages = sanitize(body && body.messages);
  if (!messages) return sendJSON(res, 400, { error: 'bad_request' });
  const lang = body.lang === 'en' ? 'en' : 'pt';

  const mock = process.env.ASK_MOCK === '1';
  if (!mock && !process.env.ANTHROPIC_API_KEY) return sendJSON(res, 503, { error: 'not_configured' });

  const limit = await checkLimits(clientIp(req));
  if (!limit.ok) return sendJSON(res, 429, { error: 'rate_limited', scope: limit.scope });

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Accel-Buffering', 'no');
  const send = obj => { if (!res.writableEnded && !res.destroyed) res.write(`${JSON.stringify(obj)}\n`); };

  if (mock) {
    await mockAnswer(send, lang);
    return res.end();
  }

  client ??= new Anthropic();
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 2048, // teto de custo num endpoint público; as respostas são curtas
    output_config: { effort: 'low' },
    // Se o classificador de segurança recusar por engano, a API refaz no modelo recomendado.
    // Haiku não tem fallback no servidor.
    ...(MODEL.includes('haiku') ? {} : { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' }),
    system: [
      { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: `Site language: ${lang === 'en' ? 'English' : 'Portuguese'}` }
    ],
    messages
  });

  // Visitante fechou a aba: interrompe a geração para não pagar tokens à toa.
  res.on('close', () => { if (!res.writableEnded) stream.abort(); });

  try {
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        send({ type: 'text', text: event.delta.text });
      }
    }
    const final = await stream.finalMessage();
    const u = final.usage;
    send({
      type: 'usage', model: final.model, input: u.input_tokens, output: u.output_tokens,
      cache_read: u.cache_read_input_tokens || 0, cache_write: u.cache_creation_input_tokens || 0
    });
    if (final.stop_reason === 'refusal') send({ type: 'error', code: 'refusal' });
    else if (final.stop_reason === 'max_tokens') send({ type: 'error', code: 'max_tokens' });
    else send({ type: 'done' });

    console.log(JSON.stringify({
      evt: 'ask', model: final.model, stop: final.stop_reason, input: u.input_tokens,
      cache_read: u.cache_read_input_tokens, cache_write: u.cache_creation_input_tokens, output: u.output_tokens
    }));
  } catch (err) {
    if (err instanceof Anthropic.APIUserAbortError) return;
    console.error('[ask]', err.status || '', err.message);
    send({ type: 'error', code: errorCode(err) });
  }
  res.end();
};
