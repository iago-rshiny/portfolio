/* =========================================================================
   lib/ratelimit.js — limite de perguntas por IP e teto diário global.
   Com UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN configurados, os
   contadores ficam no Redis e valem para todas as instâncias. Sem eles, ficam
   na memória de cada instância (proteção parcial: zera quando a função esfria).
   ========================================================================= */
'use strict';

const PER_IP_PER_HOUR = Number(process.env.ASK_IP_LIMIT) || 15;
const PER_DAY = Number(process.env.ASK_DAILY_LIMIT) || 300;
const HOUR = 3600;
const DAY = 86400;

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const memory = new Map(); // chave -> { n, exp }

function memoryIncr(key, ttl) {
  const now = Date.now();
  let entry = memory.get(key);
  if (!entry || entry.exp <= now) {
    entry = { n: 0, exp: now + ttl * 1000 };
    memory.set(key, entry);
  }
  entry.n += 1;
  if (memory.size > 5000) {
    for (const [k, v] of memory) if (v.exp <= now) memory.delete(k);
  }
  return entry.n;
}

async function redisIncr(key, ttl) {
  // SET NX define o TTL só na primeira vez; INCR mantém o TTL existente.
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([['SET', key, '0', 'EX', String(ttl), 'NX'], ['INCR', key]])
  });
  if (!res.ok) throw new Error(`upstash ${res.status}`);
  const [, incr] = await res.json();
  return Number(incr.result);
}

async function incr(key, ttl) {
  if (REDIS_URL && REDIS_TOKEN) {
    try { return await redisIncr(key, ttl); } catch (err) { console.error('[ratelimit] redis indisponível:', err.message); }
  }
  return memoryIncr(key, ttl);
}

async function checkLimits(ip) {
  const now = Date.now();
  const [perIp, perDay] = await Promise.all([
    incr(`ask:ip:${ip}:${Math.floor(now / (HOUR * 1000))}`, HOUR),
    incr(`ask:day:${Math.floor(now / (DAY * 1000))}`, DAY)
  ]);
  if (perIp > PER_IP_PER_HOUR) return { ok: false, scope: 'ip' };
  if (perDay > PER_DAY) return { ok: false, scope: 'daily' };
  return { ok: true };
}

module.exports = { checkLimits };
