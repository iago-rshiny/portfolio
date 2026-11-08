/* eggs/kmeans.js — k-means de verdade, no navegador, sobre as ferramentas do content.js (TF-IDF EN+PT das frases que
   as citam ⊕ empregos). k = 6: k-means semeado com um léxico por área (Basu et al., 2002). Sem bibliotecas. */
(function () {
'use strict';

const SW = { // só as que aparecem no conteúdo; "ai" está em quase toda frase e vira ruído
  en: 'a an the and or but then so of in on at to for from by with into over under about as is are do does have i my it they them that there here what where why how each every other no not own same can just could via per plus across whether up once now two new im sc ai work works hours week year years built build building designed designing created performed implemented applied applying produced deployed saved make keep kept took many real actually looks good enough daily use',
  pt: 'a o e de do da dos das em no na nos um uma para por pela pelos com sobre entre que se ao aos as os como mais ou ja nao sim minha ele eles isso cada todo toda muitas outros mesmo quando qual so antes tem vai via sou ia trabalho horas semana semanais ano anos construindo construo projetei coloquei criados uso poupadas poupado fazer feito dia diario real reais parece boa hoje dois cuidam ganhar'
};
Object.keys(SW).forEach(l => { SW[l] = new Set(SW[l].split(' ')); });
const fold = s => s.normalize('NFD').replace(/\p{M}/gu, '');
const STEM = {
  pt: [[/mente$/, ''], [/[oa]es$/, 'ao'], [/ais$/, 'al'], [/eis$/, 'el'], [/ns$/, 'm'], [/res$/, 'r'], [/([^s])s$/, '$1']],
  en: [[/^administrative$/, 'admin'], [/ically$/, ''], [/ical$/, ''], [/ics$/, ''], [/ations?$/, 'at'], [/ies$/, 'y'], [/(ss|x|ch|sh)es$/, '$1'], [/ing$/, ''], [/ed$/, ''], [/([^s])s$/, '$1']]
};
function stem(w, lang) {
  if (w.length <= 3) return w;
  for (const [re, to] of STEM[lang]) {
    const v = w.replace(re, to);
    if (v !== w) { if (v.length >= 3) w = v; break; }
  }
  return w.length > 4 ? w.replace(lang === 'pt' ? /[aeo]$/ : /e$/, '') : w;
}
function tokens(text, lang) {
  const s = text.toLowerCase().replace(/['’]s\b/g, '').replace(/['’]/g, ''), re = /[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*/gu, out = [];
  let m;
  while ((m = re.exec(s))) {
    const n = fold(m[0]).replace(/-/g, '');
    if (n.length > 1 && !/^\d/.test(n) && !SW[lang].has(n)) out.push({ key: `${lang[0]}:${stem(n, lang)}`, surf: m[0] });
  }
  return out;
}
const bitok = d => [...tokens(d.en, 'en'), ...tokens(d.pt, 'pt')]; // EN + PT: a figura é a mesma nos dois idiomas

/* áreas de trabalho (k = 6): rótulo e léxico-semente "EN | PT" */
const AREAS = [
  ['ETL', 'ETL', 'etl pipelines extract transform load wrangling | etl pipelines extração transformação carga tratamento de dados'],
  ['Data engineering', 'Engenharia de dados', 'orchestration monitoring failed loads data dictionary schemas | orquestração monitoramento cargas com falha dicionário de dados schemas'],
  ['BI & visualization', 'BI & visualização', 'dashboards visualization reports bi | dashboards visualização relatórios bi'],
  ['Data science', 'Ciência de dados', 'statistics models supervised unsupervised clustering time series | estatística modelos supervisionado não supervisionado clusterização séries temporais'],
  ['AI engineering', 'Engenharia de IA', 'llm rag ontology memory fine-tuning | llm rag ontologia memória fine-tuning'],
  ['Harness engineering', 'Harness engineering', 'agent architecture harness tools context execution loop | arquitetura de agentes harness ferramentas contexto loop de execução']
].map(([en, pt, lex]) => ({ en, pt, lex: lex.split(' | ') }));
const KA = AREAS.length;

/* como cada ferramenta é citada (texto em inglês); padrão: o próprio nome */
const AL = {
  'ai agents': /\bagent/i, 'prompt engineering': /\bprompt/i, 'harness engineering': /harness/i, evals: /\bevals?\b|evaluation/i,
  observability: /observab|tracing|traced/i, 'semantic & procedural memory': /semantic|procedural/i, 'fine-tuning': /fine-?tun/i, llms: /\bllms?\b/i,
  'multi-agent orchestration': /orchestrat/i, 'statistical modeling': /statistic|mixed model/i, 'supervised learning': /(^|[^n])supervised/i,
  'unsupervised learning': /unsupervised|cluster/i, 'etl pipelines': /\betl\b|pipeline/i, 'email automation': /e-?mail/i
};
const reOf = en => AL[en.toLowerCase()] || new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, en.length < 3 ? '' : 'i');

/* corpus: frases (EN + PT), lugares (empregos e pesquisa) e ferramentas */
const tl = (v, l) => (v && typeof v === 'object' && !Array.isArray(v) ? v[l] : v);
const first = v => fold(String(tl(v, 'en') || '').toLowerCase()).split(/[^a-z0-9]+/).filter(Boolean)[0];
const split = s => String(s || '').replace(/([.!?])\s+(?=[\p{Lu}"“])/gu, '$1\n').split('\n');
function corpus(C) {
  const docs = [], places = [], exp = C.experience || [];
  const add = (en, pt, pl) => { en = String(en || '').trim(); if (en) docs.push({ en, pt: String(pt || en).trim(), pl }); };
  const tx = (v, pl) => add(tl(v, 'en'), tl(v, 'pt'), pl);
  exp.forEach(e => places.push({ org: e.org, title: e.title, stack: (e.stack || []).slice(), dup: exp.filter(f => first(f.org) === first(e.org)).length > 1 }));
  ((C.activities || {}).items || []).forEach(a => {
    if (!a.stack) return;
    places.push({ org: a.org, stack: a.stack.slice() });
    add(`${tl(a.title, 'en')} — ${tl(a.org, 'en')}`, `${tl(a.title, 'pt')} — ${tl(a.org, 'pt')}`, places.length - 1);
  });
  (C.projects || []).forEach(p => { // o projeto entra no emprego em que foi feito
    const y = +String(p.year || '').slice(-4), y4 = s => +String(s || '').slice(0, 4);
    let pl = exp.findIndex(e => first(e.org) === first(p.org) && y4(e.start) <= y && (!e.end || y4(e.end) >= y));
    if (pl < 0) { pl = places.length; places.push({ org: p.org, stack: [] }); }
    places[pl].stack.push(...(p.stack || []));
    ['summary', 'problem', 'solution'].forEach(f => tx(p[f], pl));
    (p.flow || []).forEach(s => [s, s.via, s.branch].forEach(x => x && tx(x.text, pl)));
  });
  exp.forEach((e, i) => { const pt = tl(e.bullets, 'pt') || []; (tl(e.bullets, 'en') || []).forEach((s, j) => add(s, pt[j], i)); });
  ((C.about || {}).principles || []).forEach(p => add(`${tl(p.title, 'en')}. ${tl(p.text, 'en')}`, `${tl(p.title, 'pt')}. ${tl(p.text, 'pt')}`, -1));
  const bio = (C.about || {}).bio || {}, bp = tl(bio, 'pt') || [];
  (tl(bio, 'en') || []).forEach((par, i) => {
    const e = split(par), p = split(bp[i]);
    if (e.length === p.length) e.forEach((s, j) => add(s, p[j], -1)); else add(par, bp[i], -1);
  });
  const items = [], seen = new Set();
  const item = (nm, lvl) => { const en = String(tl(nm, 'en') || ''); if (en && !seen.has(en.toLowerCase())) { seen.add(en.toLowerCase()); items.push({ nm, en, lvl }); } };
  (C.skills || []).forEach(g => (g.items || []).forEach(([n, l]) => item(n, l)));
  places.forEach(p => p.stack.forEach(n => item(n, 0)));
  return { docs, places, items };
}

/* TF-IDF por frase (tf sublinear, idf suavizado, L2); ferramenta = soma das suas frases ⊕ lugares */
function features(C) {
  const { docs, places, items } = corpus(C), T = docs.map(bitok), df = new Map(), sc = new Map();
  T.forEach(ts => {
    new Set(ts.map(x => x.key)).forEach(k => df.set(k, (df.get(k) || 0) + 1));
    ts.forEach(x => { const m = sc.get(x.key) || new Map(); m.set(x.surf, (m.get(x.surf) || 0) + 1); sc.set(x.key, m); });
  });
  const terms = [...df.keys()].sort(), ix = new Map(terms.map((k, i) => [k, i])), Dw = terms.length, P = places.length, D = Dw + P;
  const idf = terms.map(k => Math.log((1 + docs.length) / (1 + df.get(k))) + 1);
  const unit = (v, a, b) => { let n = 0; for (let j = a; j < b; j++) n += v[j] * v[j]; n = Math.sqrt(n); if (n) for (let j = a; j < b; j++) v[j] /= n; return n; };
  const vec = ts => {
    const v = new Float64Array(D);
    ts.forEach(x => { const j = ix.get(x.key); if (j !== undefined) v[j]++; });
    for (let j = 0; j < Dw; j++) if (v[j]) v[j] = (1 + Math.log(v[j])) * idf[j];
    unit(v, 0, Dw);
    return v;
  };
  const S = T.map(vec), pts = [], drop = [];
  items.forEach(it => {
    const re = reOf(it.en), ev = docs.map((d, i) => i).filter(i => re.test(docs[i].en)), x = new Float64Array(D), at = new Set();
    ev.forEach(i => { for (let j = 0; j < Dw; j++) x[j] += S[i][j]; if (docs[i].pl >= 0) at.add(docs[i].pl); });
    places.forEach((p, pi) => { if (p.stack.some(s => String(tl(s, 'en')).toLowerCase() === it.en.toLowerCase())) at.add(pi); });
    if (!ev.length && !at.size) return drop.push(it);
    at.forEach(pi => { x[Dw + pi] = 1; });
    if (unit(x, 0, Dw) && unit(x, Dw, D)) for (let j = 0; j < D; j++) x[j] /= Math.SQRT2; // metade palavras, metade lugares
    pts.push(Object.assign(it, { x, ev: ev.length, at: [...at].sort((p, q) => p - q) }));
  });
  const surf = terms.map(k => [...sc.get(k)].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length || (a[0] < b[0] ? -1 : 1))[0][0]);
  return { pts, drop, places, terms, surf, Dw, seeds: AREAS.map(a => vec(bitok({ en: a.lex[0], pt: a.lex[1] }))) };
}

/* Lloyd; k-means++ com PRNG mulberry32 de semente fixa */
function prng(a) {
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
const d2 = (a, b) => { let s = 0; for (let j = 0; j < a.length; j++) { const d = a[j] - b[j]; s += d * d; } return s; };
const dot = (a, b) => { let s = 0; for (let j = 0; j < a.length; j++) s += a[j] * b[j]; return s; };
function lloyd(X, init) {
  const k = init.length, D = X[0].length, hist = [];
  let cent = init, prev = null;
  for (let it = 0; it < 100; it++) {
    let inertia = 0, changed = !prev;
    const a = X.map((x, i) => {
      let bj = 0, bd = Infinity;
      for (let c = 0; c < k; c++) { const d = d2(x, cent[c]); if (d < bd - 1e-12) { bd = d; bj = c; } }
      inertia += bd;
      if (prev && bj !== prev[i]) changed = true;
      return bj;
    });
    hist.push({ a, inertia });
    if (!changed) break;
    const cnt = new Array(k).fill(0);
    a.forEach(c => cnt[c]++);
    for (let c = 0; c < k; c++) if (!cnt[c]) { // grupo vazio recebe o ponto mais distante
      let fi = 0, fd = -1;
      X.forEach((x, i) => { const d = d2(x, cent[a[i]]); if (cnt[a[i]] > 1 && d > fd) { fd = d; fi = i; } });
      cnt[a[fi]]--; a[fi] = c; cnt[c] = 1;
    }
    cent = cnt.map(() => new Float64Array(D));
    X.forEach((x, i) => { const s = cent[a[i]]; for (let j = 0; j < D; j++) s[j] += x[j] / cnt[a[i]]; });
    prev = a;
  }
  const a = hist[hist.length - 1].a;
  return { hist, cent, assign: a, inertia: X.reduce((s, x, i) => s + d2(x, cent[a[i]]), 0) };
}
function kpp(X, k, seed) {
  const N = X.length, rnd = prng(seed), seeds = [Math.floor(rnd() * N)], near = X.map(x => d2(x, X[seeds[0]]));
  while (seeds.length < k) { // próxima semente com probabilidade ∝ D(x)²
    let r = rnd() * near.reduce((a, b) => a + b, 0), i = 0;
    for (; i < N - 1; i++) { r -= near[i]; if (r < 0) break; }
    while (seeds.includes(i)) i = (i + 1) % N;
    seeds.push(i);
    X.forEach((x, j) => { near[j] = Math.min(near[j], d2(x, X[i])); });
  }
  return Object.assign(lloyd(X, seeds.map(i => X[i])), { seeds });
}
function silhouette(Dm, a, k) {
  const per = a.map((own, i) => {
    const sum = new Array(k).fill(0), cnt = new Array(k).fill(0);
    a.forEach((c, j) => { if (j !== i) { sum[c] += Dm[i][j]; cnt[c]++; } });
    if (!cnt[own]) return 0; // grupo unitário: s = 0
    const ai = sum[own] / cnt[own];
    let bi = Infinity;
    for (let c = 0; c < k; c++) if (c !== own && cnt[c]) bi = Math.min(bi, sum[c] / cnt[c]);
    return (bi - ai) / Math.max(ai, bi);
  });
  return { s: per.reduce((p, q) => p + q, 0) / a.length, per };
}

/* PCA pela matriz de Gram centrada (N < D): potência + deflação; proj() projeta qualquer vetor */
function pca(X) {
  const N = X.length, D = X[0].length, mu = new Float64Array(D);
  X.forEach(x => { for (let j = 0; j < D; j++) mu[j] += x[j] / N; });
  const Xc = X.map(x => x.map((v, j) => v - mu[j])), G = Xc.map(p => Xc.map(q => dot(p, q)));
  const tr = G.reduce((s, row, i) => s + row[i], 0);
  const pcs = [0, 1].map(() => {
    let v = G.map((_, i) => 1 + (i * 37 % 11) / 10), lam = 0;
    for (let it = 0; it < 5000; it++) {
      const w = G.map(row => dot(row, v));
      lam = Math.hypot(...w);
      const nv = w.map(x => x / lam), diff = Math.hypot(...nv.map((x, i) => x - v[i]));
      v = nv;
      if (diff < 1e-12) break;
    }
    const mi = v.reduce((b, x, i) => (Math.abs(x) > Math.abs(v[b]) ? i : b), 0);
    if (v[mi] < 0) v = v.map(x => -x); // sinal determinístico
    G.forEach((row, i) => row.forEach((g, j) => { row[j] = g - lam * v[i] * v[j]; }));
    return { lam, v };
  });
  const proj = s => { const g = Xc.map(q => dot(q, s) - dot(q, mu)); return pcs.map(p => dot(p.v, g) / Math.sqrt(p.lam)); };
  return { xy: X.map((_, i) => pcs.map(p => p.v[i] * Math.sqrt(p.lam))), ev: pcs.map(p => p.lam / tr), proj };
}

/* análise completa: a mesma nos dois idiomas, calculada uma vez */
let cache = null;
function analyze(C) {
  if (cache) return cache;
  const F = features(C), X = F.pts.map(p => p.x), N = X.length;
  if (N < 4) return null;
  const Dm = X.map(p => X.map(q => Math.sqrt(Math.max(0, d2(p, q))))), P = pca(X), runs = {}, ks = [];
  const top = (c, l) => [...c.slice(0, F.Dw)].map((w, j) => [w, j]).filter(x => x[0] > 0 && F.terms[x[1]][0] === l[0])
    .sort((p, q) => q[0] - p[0] || p[1] - q[1]).slice(0, 2).map(x => F.surf[x[1]]);
  const finish = (r, k) => {
    r.size = new Array(k).fill(0);
    r.assign.forEach(c => r.size[c]++);
    Object.assign(r, silhouette(Dm, r.assign, k));
    r.terms = { en: r.cent.map(c => top(c, 'en')), pt: r.cent.map(c => top(c, 'pt')) };
    return r;
  };
  for (let k = 2; k <= Math.min(KA, N - 1); k++) {
    let r = null;
    for (let n = 0; n < 50; n++) { // n_init = 50
      const x = kpp(X, k, 1000 + k * 101 + n * 7919);
      if (!r || x.inertia < r.inertia - 1e-9) r = x;
    }
    const size = new Array(k).fill(0);
    r.assign.forEach(c => size[c]++);
    const ord = size.map((s, c) => c).sort((p, q) => size[q] - size[p] || r.assign.indexOf(p) - r.assign.indexOf(q)), perm = [];
    ord.forEach((c, i) => { perm[c] = i; });
    r.hist.forEach(h => { h.a = h.a.map(c => perm[c]); });
    Object.assign(r, { cent: ord.map(c => r.cent[c]), assign: r.assign.map(c => perm[c]), c0: ord.map(c => P.xy[r.seeds[c]]) });
    runs[k] = finish(r, k);
    ks.push(k);
  }
  const S = N > KA ? finish(Object.assign(lloyd(X, F.seeds), { seeded: true, c0: F.seeds.map(P.proj) }), KA) : null;
  return (cache = { F, X, N, P, runs, ks, S });
}

/* textos da interface */
const join = (a, and) => (a.length > 1 ? `${a.slice(0, -1).join(', ')} ${and} ${a[a.length - 1]}` : a[0] || '');
const UI = {
  en: {
    ctl: 'k-means controls', kAria: 'Number of clusters, k', run: 'Run k-means', skip: 'Skip to result',
    seedP: 'k-means++ seeding', seedL: 'seeding from area lexicons', it: 'iteration', its: n => `${n} iterations`, inertia: 'inertia', sil: 'silhouette', conv: 'converged',
    pc: (i, v) => `PC${i} (${v}% var.)`, b: 'Inertia', c: 'Mean silhouette', ring: 'seeded', next: 'next',
    a: 'Tools on the first two principal components', pts: 'Tools as points. Arrow keys move between them.',
    why: 'Words it shares with the group', sent: n => `in ${n} ${n === 1 ? 'sentence' : 'sentences'}`, none: 'only in a stack',
    live: (k, it, I, s) => `k = ${k}: converged after ${it} iterations; inertia ${I}, mean silhouette ${s}.`,
    sr: (k, n, s) => `Text summary: k-means with k = ${k} split ${n} tools into ${k} groups (mean silhouette ${s}).`,
    lead: (tab, fig) => `${tab ? `${tab} groups the tools by hand; ${fig} lets the text group them.` : `${fig} lets the text group the tools.`} Each point is one tool or technique, described by the words of every sentence in this paper that mentions it and by the jobs and research it was used in. The distance between two points measures how little those descriptions overlap: 0 when they are identical, about 1.4 when they share nothing. k-means splits the points into <i>k</i> groups and moves each group’s center until the inertia, the sum of squared distances from each point to its center, stops falling. The silhouette then grades each point: near 1, it sits well inside its group; near 0, on the border with the next one; below 0, closer to another group.`,
    cap: x => `${x.seeded ? 'Seeded k-means' : 'k-means'} (k = ${x.k}${x.seeded ? '' : ', best of 50 k-means++ restarts'}) on the ${x.N} tools and techniques ${x.tab ? `of ${x.tab} and the project stacks ` : ''}that the text mentions, projected onto the first two principal components (a), which keep ${x.pc}% of the variance. Each tool’s vector is half TF-IDF of the English and Portuguese sentences that mention it, half the jobs and research it was used in. ` +
      (x.seeded ? 'The centroids start from one small keyword lexicon per area of work (seeded k-means; Basu, Banerjee and Mooney, 2002), then move freely; crosses mark where they settle. ' : `Groups are named after their heaviest terms; the default, k = ${x.ka}, is seeded from one keyword lexicon per area of work. `) +
      `(b) Inertia and (c) mean silhouette of the best of 50 k-means++ restarts${x.sS ? '; rings mark the seeded run' : ''}. ` +
      (x.kb === x.ka ? `The silhouette peaks at k = ${x.ka} (${x.sb}).` : `The silhouette peaks at k = ${x.kb} (${x.sb})${x.close ? `, with k = ${x.ka} close behind (${x.su}): the data does not single out a k, and six areas of work set it.` : `; k = ${x.ka} is set by the six areas of work, not by the data.`}`) +
      (x.sS ? ` Seeding costs some fit (mean silhouette ${x.sS}, against ${x.su} unseeded): the areas overlap.` : '') +
      (x.drop.length ? ` ${join(x.drop, 'and')} never ${x.drop.length > 1 ? 'appear' : 'appears'} in the text and ${x.drop.length > 1 ? 'are' : 'is'} left out.` : '')
  },
  pt: {
    ctl: 'Controles do k-means', kAria: 'Número de grupos, k', run: 'Rodar k-means', skip: 'Pular para o resultado',
    seedP: 'sementes k-means++', seedL: 'sementes dos léxicos', it: 'iteração', its: n => `${n} iterações`, inertia: 'inércia', sil: 'silhueta', conv: 'convergiu',
    pc: (i, v) => `CP${i} (${v}% da var.)`, b: 'Inércia', c: 'Silhueta média', ring: 'semeado', next: 'depois',
    a: 'Ferramentas nas duas primeiras componentes principais', pts: 'Ferramentas como pontos. As setas do teclado navegam entre eles.',
    why: 'Palavras que compartilha com o grupo', sent: n => `em ${n} ${n === 1 ? 'frase' : 'frases'}`, none: 'só numa stack',
    live: (k, it, I, s) => `k = ${k}: convergiu após ${it} iterações; inércia ${I}, silhueta média ${s}.`,
    sr: (k, n, s) => `Resumo em texto: o k-means com k = ${k} dividiu ${n} ferramentas em ${k} grupos (silhueta média ${s}).`,
    lead: (tab, fig) => `${tab ? `A ${tab} agrupa as ferramentas à mão; a ${fig} deixa o próprio texto agrupá-las.` : `A ${fig} deixa o próprio texto agrupar as ferramentas.`} Cada ponto é uma ferramenta ou técnica, descrita pelas palavras de todas as frases deste artigo que a citam e pelos empregos e pela pesquisa em que foi usada. A distância entre dois pontos mede o quanto essas descrições não se sobrepõem: 0 quando são idênticas, cerca de 1,4 quando não têm nada em comum. O k-means divide os pontos em <i>k</i> grupos e move o centro de cada grupo até que a inércia, a soma das distâncias ao quadrado de cada ponto ao seu centro, pare de cair. A silhueta, então, avalia cada ponto: perto de 1, ele está bem dentro do seu grupo; perto de 0, na fronteira com o vizinho; abaixo de 0, mais perto de outro grupo.`,
    cap: x => `${x.seeded ? 'k-means semeado' : 'k-means'} (k = ${x.k}${x.seeded ? '' : ', melhor de 50 inícios k-means++'}) sobre as ${x.N} ferramentas e técnicas ${x.tab ? `da ${x.tab} e das stacks dos projetos ` : ''}que o texto cita, projetadas nas duas primeiras componentes principais (a), que retêm ${x.pc}% da variância. O vetor de cada ferramenta é metade TF-IDF das frases em inglês e em português que a citam, metade os empregos e a pesquisa em que foi usada. ` +
      (x.seeded ? 'Os centroides partem de um pequeno léxico de palavras-chave por área de trabalho (k-means semeado; Basu, Banerjee e Mooney, 2002) e depois andam livres; as cruzes marcam onde param. ' : `Os grupos levam o nome dos termos de maior peso; o padrão, k = ${x.ka}, é semeado com um léxico por área de trabalho. `) +
      `(b) Inércia e (c) silhueta média do melhor de 50 inícios k-means++${x.sS ? '; os anéis marcam a execução semeada' : ''}. ` +
      (x.kb === x.ka ? `A silhueta é máxima com k = ${x.ka} (${x.sb}).` : `A silhueta é máxima com k = ${x.kb} (${x.sb})${x.close ? `, com k = ${x.ka} logo atrás (${x.su}): os dados não apontam um k único, e as seis áreas de trabalho o fixam.` : `; k = ${x.ka} vem das seis áreas de trabalho, não dos dados.`}`) +
      (x.sS ? ` Semear custa um pouco de ajuste (silhueta média ${x.sS}, contra ${x.su} sem sementes): as áreas se sobrepõem.` : '') +
      (x.drop.length ? ` ${join(x.drop, 'e')} não ${x.drop.length > 1 ? 'aparecem' : 'aparece'} no texto e ${x.drop.length > 1 ? 'ficaram' : 'ficou'} de fora.` : '')
  }
};

/* desenho */
// forma por grupo: cor nunca sozinha
const SH = [null, [-.9, -.9, .9, -.9, .9, .9, -.9, .9], [0, -1.28, 1.14, .7, -1.14, .7], [0, -1.3, 1.12, 0, 0, 1.3, -1.12, 0], [0, 1.28, 1.14, -.7, -1.14, -.7],
  [-.4, -1.2, .4, -1.2, .4, -.4, 1.2, -.4, 1.2, .4, .4, .4, .4, 1.2, -.4, 1.2, -.4, .4, -1.2, .4, -1.2, -.4, -.4, -.4]];
const shape = (c, r) => !SH[c]
  ? `M${-r} 0a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`
  : 'M' + SH[c].map((v, i) => (v * r).toFixed(2) + (i % 2 ? (i < SH[c].length - 1 ? 'L' : 'Z') : ' ')).join('');
const glyph = c => `<svg class="km-gl" width="14" height="14" viewBox="-7 -7 14 14" aria-hidden="true" focusable="false"><path class="km-c${c}" d="${shape(c, 4.6)}"/></svg>`;
const R1 = v => Math.round(v * 10) / 10;
const CROSS = '<path class="km-cx-h" d="M-5 -5L5 5M5 -5L-5 5"/><path class="km-cx" d="M-5 -5L5 5M5 -5L-5 5"/>';
function nice(lo, hi, n) {
  const p = Math.pow(10, Math.floor(Math.log10((hi - lo) / n)));
  const step = [1, 2, 5, 10].map(m => m * p).find(s => (hi - lo) / s <= n + 2), out = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push(Math.abs(v) < 1e-12 ? 0 : v);
  return { out, dec: Math.max(0, -Math.floor(Math.log10(step) + 1e-9)) };
}
const ext = (vs, pad) => { const lo = Math.min(...vs), hi = Math.max(...vs), d = (hi - lo) * pad || 1; return [lo - d, hi + d]; };
let meas = null;
const textW = (s, fs) => {
  try { meas = meas || document.createElement('canvas').getContext('2d'); meas.font = `italic ${fs}px Newsreader, serif`; return meas.measureText(s).width; }
  catch (e) { return s.length * fs * 0.48; }
};
let live = null, played = false;

(window.ArtigoEggs = window.ArtigoEggs || {}).kmeans = function (el, ctx) {
  if (live) live.stop();
  const { esc } = ctx, lang = ctx.lang in UI ? ctx.lang : 'en', U = UI[lang];
  const A = analyze(ctx.C);
  if (!A) return;
  const N = A.N, xy = A.P.xy, F = A.F, name = i => String(tl(F.pts[i].nm, lang));
  const num = (v, d) => { const s = v.toFixed(d); return (lang === 'pt' ? s.replace('.', ',') : s).replace(/^-/, '−'); };
  const run = kk => (kk === KA && A.S ? A.S : A.runs[kk]);
  const lab = (r, j) => (r.seeded ? AREAS[j][lang] : r.terms[lang][j].join(' · '));
  const pname = pi => { const p = F.places[pi]; return String(tl(p.org, lang) || '').split(' · ')[0] + (p.dup ? ` (${tl(p.title, lang)})` : ''); };
  let k = A.ks[A.ks.length - 1], timers = [], raf = 0, running = false, W = 0, G = null, cur = null, focusI = -1, hoverI = -1;

  const tb = el.closest('.sec') && el.closest('.sec').querySelector('figure.tbl[id^="tab-"]');
  const tabTxt = tb ? `${ctx.table} ${tb.id.slice(4)}` : '', xr = (id, s) => `<a class="xref" href="#${id}">${esc(s).replace(/ /g, '&nbsp;')}</a>`;

  el.innerHTML = `
    <p class="km-lead">${U.lead(tb ? xr(tb.id, tabTxt) : '', xr(`fig-${esc(ctx.n)}`, `${ctx.figure} ${ctx.n}`))}</p>
    <figure class="fig km" id="fig-${esc(ctx.n)}" aria-describedby="km-sum">
      <div class="km-ctl" role="group" aria-label="${esc(U.ctl)}">
        <div class="km-k" role="radiogroup" aria-label="${esc(U.kAria)}"><span class="km-kl" aria-hidden="true"><i>k</i> =</span>${A.ks.map(v =>
          `<label class="km-kb"><input class="km-rad" type="radio" name="km-k" value="${v}"${v === k ? ' checked' : ''}><span>${v}</span></label>`).join('')}</div>
        <button type="button" class="km-run"><svg viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M2 1.2v7.6L8.6 5z"/></svg><span>${esc(U.run)}</span></button>
        <span class="km-stat" aria-hidden="true"></span><span class="sr-only" aria-live="polite" id="km-live"></span>
      </div>
      <div class="km-plot"><div class="km-tip" hidden></div></div>
      <ul class="km-leg"></ul>
      <div class="km-sub"></div>
      <div class="sr-only" id="km-sum"></div>
      <figcaption class="cap"><span class="cap-l">${esc(ctx.figure)} ${esc(ctx.n)}:</span> <span class="km-cap"></span></figcaption>
    </figure>`;
  const $ = s => el.querySelector(s);
  const plot = $('.km-plot'), tip = $('.km-tip'), stat = $('.km-stat'), runB = $('.km-run');

  // centroide 2-D = média das projeções dos membros (a PCA é afim)
  const means = a => {
    const s = Array.from({ length: k }, () => [0, 0, 0]);
    a.forEach((c, i) => { s[c][0] += xy[i][0]; s[c][1] += xy[i][1]; s[c][2]++; });
    return s.map(v => [v[0] / v[2], v[1] / v[2]]);
  };
  const finalFrame = () => {
    const r = run(k);
    return { a: r.assign, c: means(r.assign), lab: true, s: [`${U.conv} · ${U.its(r.hist.length)}`, `${U.inertia} ${num(r.inertia, 2)} · ${U.sil} ${num(r.s, 3)}`] };
  };

  /* gráfico (a), refeito quando a largura muda */
  function layout() {
    const narrow = W < 520, H = Math.round(narrow ? W * 1.02 : Math.min(430, W * 0.62));
    const m = { l: narrow ? 42 : 50, r: 14, t: 8, b: narrow ? 40 : 44 }, yb = H - m.b, all = [...xy, ...(A.S ? A.S.c0 : [])];
    const [x0, x1] = ext(all.map(p => p[0]), 0.06), [y0, y1] = ext(all.map(p => p[1]), 0.07);
    const sx = v => m.l + (v - x0) / (x1 - x0) * (W - m.l - m.r), sy = v => m.t + (1 - (v - y0) / (y1 - y0)) * (yb - m.t);
    const tx = nice(x0, x1, narrow ? 3 : 5), ty = nice(y0, y1, narrow ? 3 : 4), fs = narrow ? 11 : 12, r = narrow ? 4.2 : 4.6;
    let ax = (x0 < 0 && x1 > 0 ? `<path class="km-zero" d="M${R1(sx(0))} ${m.t}V${yb}"/>` : '') + (y0 < 0 && y1 > 0 ? `<path class="km-zero" d="M${m.l} ${R1(sy(0))}H${W - m.r}"/>` : '') +
      `<path class="km-sp" d="M${m.l} ${m.t}V${yb}H${W - m.r}"/>`;
    tx.out.forEach(v => { const X = R1(sx(v)); ax += `<path class="km-sp" d="M${X} ${yb}v4"/><text x="${X}" y="${yb + 16}" text-anchor="middle" font-size="${fs}">${num(v, tx.dec)}</text>`; });
    ty.out.forEach(v => { const Y = R1(sy(v)); ax += `<path class="km-sp" d="M${m.l} ${Y}h-4"/><text x="${m.l - 7}" y="${R1(Y + fs * 0.34)}" text-anchor="end" font-size="${fs}">${num(v, ty.dec)}</text>`; });
    ax += `<text class="km-at" x="${R1((m.l + W - m.r) / 2)}" y="${H - 6}" text-anchor="middle" font-size="${fs + 1}">${esc(U.pc(1, num(A.P.ev[0] * 100, 1)))}</text>` +
      `<text class="km-at" transform="translate(${narrow ? 11 : 13} ${R1((m.t + yb) / 2)}) rotate(-90)" text-anchor="middle" font-size="${fs + 1}">${esc(U.pc(2, num(A.P.ev[1] * 100, 1)))}</text>`;
    // ferramentas com o mesmo vetor ficam lado a lado
    const P = xy.map(p => [sx(p[0]), sy(p[1])]), twin = xy.map(() => []);
    P.forEach((p, i) => {
      const g = P.slice(0, i).findIndex((q, j) => !twin[j].done && Math.abs(q[0] - p[0]) < 1.5 && Math.abs(q[1] - p[1]) < 1.5);
      if (g >= 0) { twin[g].push(i); twin[i].done = true; }
    });
    twin.forEach((g, i) => {
      const c = P[i].slice(), all2 = [i, ...g];
      if (g.length) all2.forEach((j, n) => { P[j] = [c[0] + (n - g.length / 2) * (2 * r + 1.5), c[1]]; });
    });
    const order = xy.map((p, i) => i).sort((p, q) => P[p][0] - P[q][0] || P[p][1] - P[q][1]);
    plot.querySelectorAll('svg').forEach(s => s.remove());
    plot.insertAdjacentHTML('afterbegin', `<svg class="km-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="group" aria-label="${esc(U.a)}">` +
      `<g aria-hidden="true">${ax}</g><g class="km-spk" aria-hidden="true">${xy.map(() => '<path/>').join('')}</g>` +
      `<circle class="km-hl" r="${r + 4}" visibility="hidden" aria-hidden="true"/><g class="km-pts" role="listbox" tabindex="-1" aria-label="${esc(U.pts)}">` +
      order.map((i, n) => `<g class="km-pt" data-i="${i}" role="option" aria-selected="false" tabindex="${n ? -1 : 0}" transform="translate(${R1(P[i][0])} ${R1(P[i][1])})"><path/></g>`).join('') +
      '</g><g class="km-cts" aria-hidden="true"></g><g class="km-labs" aria-hidden="true"></g></svg>');
    const q = s => plot.querySelector(s);
    G = { sx, sy, r, narrow, m, H, P, order, svg: q('svg'), spk: [...q('.km-spk').children], cts: q('.km-cts'), labs: q('.km-labs'), hl: q('.km-hl'), pts: [] };
    plot.querySelectorAll('.km-pt').forEach(p => { G.pts[+p.dataset.i] = p; });
    bindPlot();
    drawSub();
  }

  /* painéis (b) inércia e (c) silhueta média; o anel é a execução semeada */
  function mini(vals, title, tag, ring) {
    const w = Math.floor((W - 18) / 2), h = W < 520 ? 116 : 132, fs = W < 520 ? 10.5 : 11, m = { l: 36, r: 10, t: 14, b: 30 }, yb = h - m.b;
    const all = ring === undefined ? vals : [...vals, ring], lo0 = Math.min(...all), hi0 = Math.max(...all), pad = (hi0 - lo0) * 0.15 || 0.01;
    const ty = nice(tag === 'c' ? Math.min(0, lo0) : lo0 - pad, hi0 + pad, 3);
    const yl = Math.min(tag === 'c' ? Math.min(0, lo0) : lo0 - pad, ty.out[0]), yh = Math.max(hi0 + pad, ty.out[ty.out.length - 1]);
    const sx = kk => m.l + 8 + (kk - A.ks[0]) / (A.ks[A.ks.length - 1] - A.ks[0]) * (w - m.l - m.r - 16), sy = v => m.t + (1 - (v - yl) / (yh - yl)) * (yb - m.t);
    const onRing = ring !== undefined && k === KA;
    let o = `<path class="km-cur" d="M${R1(sx(k))} ${m.t - 4}V${yb}"/><path class="km-sp" d="M${m.l} ${m.t - 4}V${yb}H${w - m.r}"/>`;
    ty.out.forEach(v => { const Y = R1(sy(v)); o += `<path class="km-sp" d="M${m.l} ${Y}h-3"/><text x="${m.l - 5}" y="${R1(Y + fs * 0.34)}" text-anchor="end" font-size="${fs}">${num(v, ty.dec)}</text>`; });
    A.ks.forEach(kk => { const X = R1(sx(kk)); o += `<path class="km-sp" d="M${X} ${yb}v3"/><text x="${X}" y="${yb + 13}" text-anchor="middle" font-size="${fs}">${kk}</text>`; });
    o += `<text class="km-at" x="${w - m.r}" y="${h - 2}" text-anchor="end" font-size="${fs + 0.5}" font-style="italic">k</text>` +
      `<path class="km-ln" d="M${A.ks.map((kk, i) => `${R1(sx(kk))} ${R1(sy(vals[i]))}`).join('L')}"/>` +
      A.ks.map((kk, i) => `<circle class="km-mk${kk === k && !onRing ? ' is-on' : ''}" cx="${R1(sx(kk))}" cy="${R1(sy(vals[i]))}" r="${kk === k && !onRing ? 4 : 3.2}"/>`).join('');
    if (ring !== undefined) {
      const X = R1(sx(KA)), Y = R1(sy(ring)), up = ring > vals[A.ks.indexOf(KA)];
      o += `<circle class="km-rg${onRing ? ' is-on' : ''}" cx="${X}" cy="${Y}" r="${onRing ? 5 : 4.4}"/>` +
        `<text class="km-max" x="${R1(X + 6)}" y="${R1(up ? Y - 9 : Y + 9 + fs * 0.7)}" text-anchor="end" font-size="${fs}">${esc(U.ring)}</text>`;
    }
    return `<div class="km-pan"><svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">${o}</svg><p class="km-ptl">(${tag}) ${esc(title)}</p></div>`;
  }
  const drawSub = () => {
    $('.km-sub').innerHTML = mini(A.ks.map(kk => A.runs[kk].inertia), U.b, 'b', A.S ? A.S.inertia : undefined) + mini(A.ks.map(kk => A.runs[kk].s), U.c, 'c', A.S ? A.S.s : undefined);
  };

  /* aplica um quadro: atribuições, centroides, rótulos, status */
  function apply(f, cpos) {
    cur = f;
    const c = cpos || f.c;
    G.pts.forEach((p, i) => {
      const cl = f.a ? f.a[i] : -1;
      if (p._c === cl) return;
      p._c = cl;
      p.firstChild.setAttribute('d', shape(cl, G.r));
      p.firstChild.setAttribute('class', `km-sh km-c${cl < 0 ? 'n' : cl}`);
    });
    G.spk.forEach((p, i) => {
      const cl = f.a ? f.a[i] : -1;
      p.setAttribute('d', cl < 0 || !c[cl] ? '' : `M${R1(G.P[i][0])} ${R1(G.P[i][1])}L${R1(G.sx(c[cl][0]))} ${R1(G.sy(c[cl][1]))}`);
      p.setAttribute('class', `km-c${cl}`);
    });
    G.cts.innerHTML = c.map(p => `<g transform="translate(${R1(G.sx(p[0]))} ${R1(G.sy(p[1]))})">${CROSS}</g>`).join('');
    if (!cpos) G.labs.innerHTML = f.lab ? labels(f.c) : '';
    stat.innerHTML = f.s.map(s => `<span>${esc(s) || '&nbsp;'}</span>`).join('');
  }

  // rótulo de cada grupo: a posição candidata com menos colisões
  function labels(c) {
    const r = run(k), fs = G.narrow ? 11.5 : 12.5, boxes = [], Cp = c.map(p => [G.sx(p[0]), G.sy(p[1])]);
    const inB = (p, b, pad) => p[0] > b[0] - pad && p[0] < b[0] + b[2] + pad && p[1] > b[1] - pad && p[1] < b[1] + b[3] + pad;
    return c.map((p, j) => j).sort((p, q) => r.size[q] - r.size[p]).map(j => {
      const s = lab(r, j), cut = [...s].map((ch, i) => (ch === ' ' ? i : 0)).filter(Boolean).sort((p, q) => Math.abs(p - s.length / 2) - Math.abs(q - s.length / 2))[0];
      const lines = !G.narrow || s.length <= 13 ? [s] : s.includes(' · ') ? s.split(' · ') : cut ? [s.slice(0, cut), s.slice(cut + 1)] : [s];
      const w = Math.max(...lines.map(x => textW(x, fs))) + 15, h = lines.length * fs * 1.15 + 3, [cx, cy] = Cp[j];
      let best = null;
      [[1, 0], [-1, 0], [0, -1], [0, 1], [1, -1], [-1, -1], [1, 1], [-1, 1]].forEach(([dx, dy], pi) => [13, 26, 42, 60].forEach(dd => {
        const b = [dx > 0 ? cx + dd : dx < 0 ? cx - dd - w : cx - w / 2, dy > 0 ? cy + dd * 0.7 : dy < 0 ? cy - dd * 0.7 - h : cy - h / 2, w, h];
        let cost = pi * 0.4 + dd * 0.05;
        if (b[0] < G.m.l + 2 || b[1] < G.m.t + 2 || b[0] + w > W - G.m.r || b[1] + h > G.H - G.m.b - 2) cost += 1000;
        G.P.forEach(q => { if (inB(q, b, 4)) cost += 9; });
        Cp.forEach(q => { if (inB(q, b, 9)) cost += 80; });
        boxes.forEach(o => { const ox = Math.min(b[0] + w, o[0] + o[2]) - Math.max(b[0], o[0]), oy = Math.min(b[1] + h, o[1] + o[3]) - Math.max(b[1], o[1]); if (ox > -3 && oy > -3) cost += 200 + (ox + 3) * (oy + 3); });
        if (!best || cost < best.cost) best = { cost, b };
      }));
      boxes.push(best.b);
      const [bx, by] = best.b, ty = by + fs * 0.95;
      return `<g class="km-lab"><path class="km-c${j}" transform="translate(${R1(bx + 6)} ${R1(ty - fs * 0.33)})" d="${shape(j, 3.6)}"/>` +
        lines.map((x, li) => `<text x="${R1(bx + 14)}" y="${R1(ty + li * fs * 1.15)}" font-size="${fs}">${esc(x)}</text>`).join('') + '</g>';
    }).join('');
  }

  /* por que o ponto está ali: termos que mais pesam no produto com o centroide, o grupo seguinte, os lugares */
  function why(i) {
    const r = run(k), c = r.assign[i], it = F.pts[i], x = it.x, cent = r.cent[c], ws = [], seen = new Set();
    for (let j = 0; j < F.Dw; j++) if (x[j] * cent[j] > 0 && F.terms[j][0] === lang[0]) ws.push([x[j] * cent[j], j]);
    let nx = -1, nd = Infinity;
    r.cent.forEach((cc, j) => { const d = j === c ? Infinity : d2(x, cc); if (d < nd) { nd = d; nx = j; } });
    return {
      c, nx, ws: ws.sort((p, q) => q[0] - p[0] || p[1] - q[1]).map(w => F.surf[w[1]]).filter(s => !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase())).slice(0, 3),
      meta: [it.ev ? U.sent(it.ev) : U.none, ...it.at.map(pname)].join(' · ') + ` · ${U.sil} ${num(r.per[i], 2)}`
    };
  }

  /* legenda (membros do mais central ao mais distante), resumo, legenda da figura, rótulos dos pontos */
  function texts() {
    const r = run(k), su = A.runs[KA] ? A.runs[KA].s : 0, kb = A.ks.reduce((b, kk) => (A.runs[kk].s > A.runs[b].s ? kk : b), A.ks[0]);
    const members = j => A.X.map((x, i) => i).filter(i => r.assign[i] === j).sort((p, q) => d2(A.X[p], r.cent[j]) - d2(A.X[q], r.cent[j])).map(name);
    $('.km-leg').innerHTML = r.size.map((n, j) => `<li><span class="km-lh">${glyph(j)}<b>${esc(lab(r, j))}</b> <span class="km-n">${n}</span></span><span class="km-lm">${esc(members(j).join(', '))}</span></li>`).join('');
    $('#km-sum').textContent = U.sr(k, N, num(r.s, 3));
    $('.km-cap').innerHTML = esc(U.cap({
      k, seeded: !!r.seeded, N, tab: tabTxt, pc: num((A.P.ev[0] + A.P.ev[1]) * 100, 1), ka: KA, kb, sb: num(A.runs[kb].s, 2),
      su: num(su, 2), close: A.runs[kb].s - su < 0.05, sS: A.S ? num(A.S.s, 2) : '', drop: F.drop.map(d => String(tl(d.nm, lang)))
    })).replace(/k-means\+*|k = \d+/g, '<span class="km-nw">$&</span>');
    G.pts.forEach((p, i) => {
      const y = why(i);
      p.setAttribute('aria-label', `${name(i)}. ${lab(r, y.c)} (${U.next}: ${lab(r, y.nx)}). ${U.why}: ${y.ws.join(', ')}. ${y.meta}.`);
    });
  }

  /* animação: sementes (léxicos ou k-means++), depois atribuição → atualização até convergir */
  function stop() {
    timers.forEach(clearTimeout);
    timers = [];
    cancelAnimationFrame(raf);
    running = false;
    runB.lastChild.textContent = U.run;
    runB.classList.remove('is-on');
  }
  const announce = () => { const r = run(k); $('#km-live').textContent = U.live(k, r.hist.length, num(r.inertia, 2), num(r.s, 3)); };
  const show = () => { stop(); apply(finalFrame()); };
  function frames() {
    const r = run(k), sp = r.c0, FR = [{ a: null, c: [], s: [r.seeded ? U.seedL : U.seedP, ''], d: 380 }];
    sp.forEach((p, j) => FR.push({
      a: null, c: sp.slice(0, j + 1), d: r.seeded ? 520 : 260,
      s: r.seeded ? [`${U.seedL} · ${AREAS[j][lang]} (${j + 1}/${k})`, AREAS[j].lex[lang === 'pt' ? 1 : 0].split(' ').filter(w => !/^(de|da|do|das|dos|e|com|of|and)$/.test(w)).join(', ')] : [`${U.seedP} · ${j + 1}/${k}`, '']
    }));
    let c = sp;
    r.hist.forEach((h, t) => {
      const s = [`${U.it} ${t + 1}`, `${U.inertia} ${num(h.inertia, 2)}`];
      FR.push({ a: h.a, c, s, d: 620 });
      if (t < r.hist.length - 1) { const nc = means(h.a); FR.push({ a: h.a, c: nc, from: c, s, d: 700 }); c = nc; }
    });
    return FR;
  }
  function play() {
    stop();
    hideTip();
    if (ctx.reduced) { show(); announce(); return; }
    running = true;
    runB.lastChild.textContent = U.skip;
    runB.classList.add('is-on');
    const FR = frames();
    let i = 0;
    const step = () => {
      if (!el.isConnected) return stop();
      if (i >= FR.length) { show(); announce(); return; }
      const f = FR[i++];
      apply(f, f.from);
      if (f.from) {
        const t0 = performance.now();
        const tick = now => {
          const u = Math.min(1, (now - t0) / 460), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(2 - 2 * u, 2) / 2;
          apply(f, f.c.map((p, j) => [f.from[j][0] + (p[0] - f.from[j][0]) * e, f.from[j][1] + (p[1] - f.from[j][1]) * e]));
          if (u < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }
      timers.push(setTimeout(step, f.d));
    };
    step();
  }

  /* dica: a ferramenta, o grupo e por que está nele (mouse, toque ou teclado) */
  function showTip(i) {
    const cl = G.pts[i]._c, [X, Y] = G.P[i], r = run(k), y = cur && cur.lab ? why(i) : null;
    tip.innerHTML = `<span class="km-src">${esc(name(i))}</span>` +
      (cl >= 0 ? `<span class="km-tc">${glyph(cl)}<span>${esc(lab(r, cl))}${y ? ` <span class="km-nx">· ${esc(U.next)}: ${esc(lab(r, y.nx))}</span>` : ''}</span></span>` : '') +
      (y ? `<span class="km-tx">${esc(U.why)}: ${y.ws.map(w => `<i>${esc(w)}</i>`).join(', ')}</span><span class="km-meta">${esc(y.meta)}</span>` : '');
    tip.hidden = false;
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    tip.style.left = `${Math.round(Math.max(0, Math.min(W - tw, X - tw / 2)))}px`;
    tip.style.top = `${Math.round(Y - th - 12 >= 0 ? Y - th - 12 : Y + 14)}px`;
    G.hl.setAttribute('cx', R1(X));
    G.hl.setAttribute('cy', R1(Y));
    G.hl.setAttribute('visibility', 'visible');
  }
  function hideTip() { tip.hidden = true; if (G) G.hl.setAttribute('visibility', 'hidden'); }
  const nearest = (e, rad) => {
    const b = G.svg.getBoundingClientRect(), px = e.clientX - b.left, py = e.clientY - b.top;
    let bi = -1, bd = rad * rad;
    G.P.forEach((p, i) => { const dd = (p[0] - px) ** 2 + (p[1] - py) ** 2; if (dd < bd) { bd = dd; bi = i; } });
    return bi;
  };
  const back = () => (focusI >= 0 ? showTip(focusI) : hideTip());
  function bindPlot() {
    const svg = G.svg, list = svg.querySelector('.km-pts');
    svg.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const i = nearest(e, 16);
      if (i !== hoverI) { hoverI = i; if (i >= 0) showTip(i); else back(); }
    });
    svg.addEventListener('pointerleave', () => { hoverI = -1; back(); });
    svg.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'touch') return;
      const i = nearest(e, 24);
      if (i >= 0) showTip(i); else hideTip();
    });
    list.addEventListener('focusin', e => {
      const p = e.target.closest('.km-pt');
      if (!p) return;
      focusI = +p.dataset.i;
      G.pts.forEach(q => q.setAttribute('aria-selected', String(q === p)));
      showTip(focusI);
    });
    list.addEventListener('focusout', () => { focusI = -1; hideTip(); });
    list.addEventListener('keydown', e => {
      const p = e.target.closest('.km-pt');
      if (!p) return;
      if (e.key === 'Escape') return hideTip();
      const n = G.order.indexOf(+p.dataset.i), to = { ArrowRight: n + 1, ArrowDown: n + 1, ArrowLeft: n - 1, ArrowUp: n - 1, Home: 0, End: N - 1 }[e.key];
      if (to === undefined) return;
      e.preventDefault();
      const q = G.pts[G.order[Math.max(0, Math.min(N - 1, to))]];
      p.setAttribute('tabindex', '-1');
      q.setAttribute('tabindex', '0');
      q.focus();
    });
  }

  /* controles, redimensionamento, primeira exibição */
  el.querySelectorAll('.km-rad').forEach(rb => rb.addEventListener('change', () => { k = +rb.value; hideTip(); show(); texts(); drawSub(); announce(); }));
  runB.addEventListener('click', () => { if (running) { show(); announce(); } else play(); });
  el.addEventListener('keydown', e => { if (e.key === 'Escape' && !tip.hidden) hideTip(); });
  function measure() {
    const w = Math.floor(plot.clientWidth);
    if (!w || w === W) return;
    const was = running;
    W = w;
    stop();
    layout();
    texts();
    apply(was || !cur ? finalFrame() : cur);
  }
  measure();
  if (!W) requestAnimationFrame(measure);
  const ro = 'ResizeObserver' in window ? new ResizeObserver(measure) : null;
  if (ro) ro.observe(plot);
  if (document.fonts) Promise.all(['italic 12.5px Newsreader', 'italic 11.5px Newsreader'].map(f => document.fonts.load(f))).catch(() => 0)
    .then(() => { if (G && cur && cur.lab && !running && el.isConnected) G.labs.innerHTML = labels(cur.c); });
  // na primeira vez que a figura entra na tela, o k-means roda sozinho (uma vez por visita)
  let io = null;
  if (!ctx.reduced && !played && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); played = true; if (!running) play(); } }, { threshold: 0.6 });
    io.observe(plot);
  }
  live = { stop() { stop(); if (ro) ro.disconnect(); if (io) io.disconnect(); } };
};
window.ArtigoEggs.kmeans.analyze = analyze; // exposto para testes
})();
