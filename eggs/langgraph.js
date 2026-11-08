/* eggs/langgraph.js — Apêndice C: agente revisor como StateGraph do LangGraph, no navegador.
   Semântica do LangGraph em JS (reducers, arestas condicionais, ciclo, interrupt(), checkpointer); sem LLM. */
(function () {
  'use strict';

  const KEYS = ['summary', 'keywords', 'evidence', 'cursor', 'fit', 'other_fit', 'review'];
  const DELAY = 640;
  const hex = n => { let s = ''; while (s.length < n) s += Math.floor(Math.random() * 16).toString(16); return s; };
  const cid = () => `1f0${hex(5)}-${hex(4)}-6${hex(3)}-8${hex(3)}-${hex(12)}`;
  const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
  const enOf = v => (v && typeof v === 'object' ? v.en : v) || '';

  // Estado do módulo: sobrevive às re-renderizações (troca de idioma) e é reexecutado no idioma novo.
  const M = { thread: 'review-' + hex(4), path: [], cur: -1, intr: null, fork: null, timer: 0, running: false, auto: false, view: 'g', logKeys: [] };
  let U = null; // elementos e contexto da renderização atual

  const STR = {
    en: {
      lead: (s3, appA) => `LangGraph is part of my stack (${s3}). This appendix is a small agent you can run: a StateGraph that reviews this paper on your behalf, with a cycle, a human-in-the-loop interrupt and a checkpointer you can time-travel through. Every node reads the same data as the rest of the page; nothing is generated.${appA ? ` The trace under each answer in ${appA} is the other half, observability in the LangSmith style; that assistant is a single Claude API call, not a graph.` : ''}`,
      section: 'Section', appendix: 'Appendix',
      cap: 'A reviewer agent as a LangGraph StateGraph, executed in your browser. JavaScript re-implementation of LangGraph semantics: state with reducers, conditional edges, a cycle, interrupt() and a checkpointer. The Python tab shows the equivalent code.',
      view: 'View', graph: 'Graph', controls: 'Run controls', run: 'Run', pause: 'Pause', step: 'Step', reset: 'Reset',
      state: 'State', ckpts: 'Checkpoints', cpHint: 'One per super-step. Click one to time-travel; Run continues from there.', noCp: 'No checkpoints yet.',
      stream: 'Stream', idle: '# Press Run or Step to call graph.stream(...)',
      forkC: id => `# time travel → checkpoint ${id}: graph.stream(None, snapshot.config, …)`,
      q: 'Does the role involve AI agents in production?', yes: 'Yes', no: 'No',
      intr: 'check_fit paused the graph, and its state is saved in the checkpoint. Your answer resumes the thread with Command(resume=…).',
      done: 'done', eyes: 'yes', eno: 'no', of: (a, b) => `${a}/${b} read`,
      legend: 'solid: add_edge · dashed: add_conditional_edges',
      desc: 'Graph: __start__ to skim_abstract to read_systems. read_systems loops back to itself while projects remain (conditional edge more_projects), then goes to check_fit. check_fit pauses for your answer: yes goes to write_review; no goes to find_other_fit and then write_review. write_review goes to __end__.',
      form: 'Review form', reviewer: 'Reviewer 2 (an agent)', sum: 'Summary', str: 'Strengths', weak: 'Weaknesses', dec: 'Decision',
      mail: 'Email the author', subject: 'Interview: the reviewer agent recommends acceptance',
      body: (n, d) => `Hi ${n},\n\nThe reviewer agent in Appendix C reached a decision: ${d}.\n\n`,
      copy: 'Copy', copied: 'Copied',
      liveStep: (s, n, k, nx) => `Step ${s}: ${n} updated ${k}. Next: ${nx}.`, liveStart: 'Thread started.',
      livePause: q => `Paused at check_fit: ${q}`, liveEnd: d => `Review written. Decision: ${d}.`, liveTT: s => `Restored checkpoint at step ${s}.`, liveReset: 'Reset. New thread.',
      roles: 'Data roles', prod: 'Used in production',
      pyStrength: `f"{e['title']}: {e['metric']} saved"`,
      pyPending: [`f"{e['id']} ({e['title']}) is still {e['status'].lower()}, so it reports no results yet. "`, `"The reviewer asks for them in the camera-ready version."`],
      pyCi: [`f"Savings are reported as lower bounds ({', '.join(e['metric'] for e in shipped)}) "`, `"with no confidence intervals: a curious omission for a statistician."`],
      offTopic: 'The paper is mostly about AI agents in production, which this role does not involve; the relevant evidence is in the methods, experience and education sections.',
      pySummary: `f"{state['summary']} Evidence: {len(state['evidence'])} systems read, {len(shipped)} with reported metrics."`,
      accept: 'Accept for interview', acceptData: 'Accept for interview (data & statistics track)'
    },
    pt: {
      lead: (s3, appA) => `O LangGraph faz parte da minha stack (${s3}). Este apêndice é um pequeno agente que você pode executar: um StateGraph que revisa este artigo por você, com um ciclo, uma interrupção human-in-the-loop e um checkpointer pelo qual dá para viajar no tempo. Cada nó lê os mesmos dados do resto da página; nada é gerado.${appA ? ` O trace sob cada resposta do ${appA} é a outra metade, a observabilidade no estilo do LangSmith; aquele assistente é uma única chamada à API do Claude, não um grafo.` : ''}`,
      section: 'Seção', appendix: 'Apêndice',
      cap: 'Um agente revisor como StateGraph do LangGraph, executado no seu navegador. Reimplementação em JavaScript da semântica do LangGraph: estado com reducers, arestas condicionais, um ciclo, interrupt() e um checkpointer. A aba Python mostra o código equivalente.',
      view: 'Visualização', graph: 'Grafo', controls: 'Controles de execução', run: 'Executar', pause: 'Pausar', step: 'Passo', reset: 'Reiniciar',
      state: 'Estado', ckpts: 'Checkpoints', cpHint: 'Um por super-step. Clique num deles para viajar no tempo; Executar continua dali.', noCp: 'Nenhum checkpoint ainda.',
      stream: 'Stream', idle: '# Clique em Executar ou Passo para chamar graph.stream(...)',
      forkC: id => `# viagem no tempo → checkpoint ${id}: graph.stream(None, snapshot.config, …)`,
      q: 'A vaga envolve agentes de IA em produção?', yes: 'Sim', no: 'Não',
      intr: 'check_fit pausou o grafo, e o estado está salvo no checkpoint. Sua resposta retoma a thread com Command(resume=…).',
      done: 'fim', eyes: 'sim', eno: 'não', of: (a, b) => `${a}/${b} lidos`,
      legend: 'contínua: add_edge · tracejada: add_conditional_edges',
      desc: 'Grafo: __start__ para skim_abstract para read_systems. read_systems volta para si mesmo enquanto houver projetos (aresta condicional more_projects) e depois vai para check_fit. check_fit pausa esperando sua resposta: sim vai para write_review; não vai para find_other_fit e depois write_review. write_review vai para __end__.',
      form: 'Formulário de revisão', reviewer: 'Revisor 2 (um agente)', sum: 'Resumo', str: 'Pontos fortes', weak: 'Pontos fracos', dec: 'Decisão',
      mail: 'Enviar e-mail', subject: 'Entrevista: o agente revisor recomenda aceitar',
      body: (n, d) => `Olá, ${n}!\n\nO agente revisor do Apêndice C chegou a uma decisão: ${d}.\n\n`,
      copy: 'Copiar', copied: 'Copiado',
      liveStep: (s, n, k, nx) => `Step ${s}: ${n} atualizou ${k}. Próximo: ${nx}.`, liveStart: 'Thread iniciada.',
      livePause: q => `Pausado em check_fit: ${q}`, liveEnd: d => `Revisão escrita. Decisão: ${d}.`, liveTT: s => `Checkpoint do step ${s} restaurado.`, liveReset: 'Reiniciado. Nova thread.',
      roles: 'Cargos em dados', prod: 'Uso em produção',
      pyStrength: `f"{e['title']}: {e['metric']} poupadas"`,
      pyPending: [`f"{e['id']} ({e['title']}) ainda está {e['status'].lower()}, então ainda não relata resultados. "`, `"O revisor pede esses números na versão final."`],
      pyCi: [`f"Os ganhos são relatados como limites inferiores ({', '.join(e['metric'] for e in shipped)}), "`, `"sem intervalos de confiança: uma omissão curiosa para alguém formado em Estatística."`],
      offTopic: 'O artigo trata sobretudo de agentes de IA em produção, que esta vaga não envolve; a evidência relevante está nas seções de métodos, experiência e formação.',
      pySummary: `f"{state['summary']} Evidência: {len(state['evidence'])} sistemas lidos, {len(shipped)} com métricas relatadas."`,
      accept: 'Aceito para entrevista', acceptData: 'Aceito para entrevista (trilha de dados e estatística)'
    }
  };

  /* ---------- fatos, todos lidos do PORTFOLIO ---------- */
  function facts(ctx, L) {
    const { C, t } = ctx;
    const dsv = k => { const d = (C.datasheet || []).find(x => enOf(x.k) === k); return d ? `${t(d.k)}: ${t(d.v)}` : null; };
    const stat = re => { const s = (C.stats || []).find(x => re.test(enOf(x.label))); return s ? `${s.value} ${t(s.label)}` : null; };
    const projects = (C.projects || []).map(p => {
      const m = (p.metrics || []).find(x => x && x.value);
      return { id: String(p.id || ''), title: t(p.title), status: t(p.status), metric: m ? `${m.value}${t(m.unit) || ''}` : null };
    });
    const roles = (C.experience || []).filter(e => /data|risk/i.test(enOf(e.title))).map(e => `${t(e.title)} · ${t(e.org)}`);
    const prod = [];
    (C.skills || []).filter(g => /^(data|bi)\b/i.test(enOf(g.group))).forEach(g => (g.items || []).forEach(([n, l]) => { if (l >= 3) prod.push(t(n)); }));
    const res = ((C.activities && C.activities.items) || []).find(a => /research/i.test(enOf(a.title)));
    return {
      tagline: t(C.tagline), focus: t(C.focus), projects,
      facts: [stat(/agent/i), dsv('Citizenship'), dsv('Experience'), dsv('Education')].filter(Boolean),
      data_fit: [roles.length && `${L.roles}: ${roles.join('; ')}`, prod.length && `${L.prod}: ${prod.join(', ')}`, dsv('Education'),
        res && `${t(res.title)}: ${t(res.org).split(' · ').slice(1).join(' · ') || t(res.org)}`, stat(/data/i)].filter(Boolean),
      email: (C.links || {}).email || '', name: String(C.name || '').split(' ')[0]
    };
  }

  /* ---------- o grafo: nós, roteamento e reducers ---------- */
  // O texto da revisão sai das mesmas f-strings exibidas na aba Python (uma única fonte).
  const FX = {
    "e['title']": c => c.e.title, "e['metric']": c => c.e.metric, "e['id']": c => c.e.id, "e['status'].lower()": c => c.e.status.toLowerCase(),
    "', '.join(e['metric'] for e in shipped)": c => c.shipped.map(e => e.metric).join(', '),
    "state['summary']": c => c.s.summary, "len(state['evidence'])": c => c.s.evidence.length, 'len(shipped)': c => c.shipped.length
  };
  const fpy = (tpl, c) => [].concat(tpl).map(p => p.replace(/^f?"|"$/g, '')).join('').replace(/\{([^{}]+)\}/g, (_, x) => FX[x](c));
  function nodes(D, L) {
    return {
      skim_abstract: () => ({ summary: D.tagline, keywords: D.focus.split('·').map(s => s.trim()).filter(Boolean) }),
      read_systems: s => ({ evidence: D.projects[s.cursor] ? [D.projects[s.cursor]] : [], cursor: s.cursor + 1 }),
      check_fit: (s, a) => ({ fit: !!a }),
      find_other_fit: () => ({ other_fit: D.data_fit }),
      write_review: s => {
        const shipped = s.evidence.filter(e => e.metric), weak = s.evidence.filter(e => !e.metric).map(e => fpy(L.pyPending, { e }));
        if (shipped.length) weak.push(fpy(L.pyCi, { shipped }));
        if (!s.fit) weak.push(L.offTopic);
        return { review: {
          summary: fpy(L.pySummary, { s, shipped }),
          strengths: Array.from(new Set([...(s.other_fit || []), ...shipped.map(e => fpy(L.pyStrength, { e })), ...D.facts])),
          weaknesses: weak,
          decision: s.fit ? L.accept : L.acceptData
        } };
      }
    };
  }
  const route = (n, s, D) => ({
    __start__: 'skim_abstract', skim_abstract: 'read_systems',
    read_systems: s.cursor < D.projects.length ? 'read_systems' : 'check_fit',
    check_fit: s.fit ? 'write_review' : 'find_other_fit',
    find_other_fit: 'write_review', write_review: '__end__'
  })[n];
  // evidence usa o reducer operator.add (acrescenta); as outras chaves são sobrescritas.
  const reduce = (v, d) => { const o = Object.assign({}, v); Object.keys(d).forEach(k => { o[k] = k === 'evidence' ? (v.evidence || []).concat(d[k]) : d[k]; }); return o; };

  // Reexecuta o caminho salvo (determinístico): um snapshot por checkpoint, no idioma atual.
  function replay() {
    const N = nodes(U.D, U.L);
    let v = {};
    return M.path.map((cp, i) => {
      let delta = null;
      if (i > 0) delta = cp.node === '__start__' ? { evidence: [], cursor: 0 } : N[cp.node](v, cp.answer);
      if (delta) v = reduce(v, delta);
      return { v, delta, next: i === 0 ? '__start__' : route(cp.node, v, U.D) };
    });
  }

  /* ---------- execução ---------- */
  const snap = () => (M.cur >= 0 ? replay()[M.cur] : null);
  const atEnd = () => { const s = snap(); return !!s && s.next === '__end__'; };
  const paused = () => !!M.intr && M.cur >= 0 && M.path[M.cur].id === M.intr.cp;
  const later = fn => { M.timer = setTimeout(fn, U.ctx.reduced ? 0 : DELAY); };

  function advance() {
    if (!M.path.length) { M.path.push({ id: cid(), node: null }); M.cur = 0; return; }
    // continuar de um checkpoint antigo bifurca a thread (como graph.stream(None, snapshot.config))
    if (M.cur < M.path.length - 1) { M.fork = M.path[M.cur].id; M.path = M.path.slice(0, M.cur + 1); M.intr = null; }
    const next = replay()[M.cur].next;
    if (next === '__end__') return;
    if (next === 'check_fit') { if (!paused()) M.intr = { cp: M.path[M.cur].id, id: hex(32) }; return; }
    M.path.push({ id: cid(), node: next, fork: M.fork });
    M.fork = null;
    M.cur = M.path.length - 1;
  }
  function stop() { clearTimeout(M.timer); M.running = false; }
  function tick() {
    if (!M.running) return;
    advance();
    if (paused() || atEnd()) M.running = false; else later(tick);
    update(true);
  }
  function run() {
    if (M.running) { stop(); M.auto = false; update(); return; }
    if (paused() || atEnd()) return;
    M.running = M.auto = true;
    tick();
  }
  function stepOnce() {
    if (M.running || paused() || atEnd()) return;
    M.auto = false;
    advance();
    update(true);
  }
  function answer(val) {
    if (!paused()) return;
    M.path.push({ id: cid(), node: 'check_fit', answer: val, intrId: M.intr.id, fork: M.fork });
    M.fork = M.intr = null;
    M.cur = M.path.length - 1;
    if (M.auto && !atEnd()) { M.running = true; later(tick); }
    update(true);
    U.run.focus({ preventScroll: true });
  }
  function reset() {
    stop();
    Object.assign(M, { thread: 'review-' + hex(4), path: [], cur: -1, intr: null, fork: null, auto: false });
    U.code.innerHTML = codeHTML();
    U.thread.textContent = M.thread;
    update();
    say(U.L.liveReset);
  }
  function travel(i) {
    if (i < 0 || i >= M.path.length) return;
    stop();
    M.cur = i;
    update();
    say(U.L.liveTT(i - 1));
  }

  /* ---------- realce de sintaxe e repr do Python ---------- */
  const PY_RE = /(#[^\n]*)|(f?"(?:[^"\\\n]|\\.)*"|f?'(?:[^'\\\n]|\\.)*')|\b(def|class|return|from|import|for|in|if|else|not|and|or|is|lambda)\b|\b(True|False|None|\d+)\b|\b([A-Za-z_]\w*)(?=\()/g;
  function hl(src) {
    const esc = U.ctx.esc;
    let out = '', last = 0, m;
    PY_RE.lastIndex = 0;
    while ((m = PY_RE.exec(src))) {
      out += esc(src.slice(last, m.index)) + `<span class="lg-t${m[1] ? 'c' : m[2] ? 's' : m[3] ? 'k' : m[4] ? 'b' : 'f'}">${esc(m[0])}</span>`;
      last = PY_RE.lastIndex;
    }
    return out + esc(src.slice(last));
  }
  // repr() encurtado, como print(chunk) mostraria
  function pyr(v, d) {
    if (v === null || v === undefined) return 'None';
    if (typeof v === 'boolean') return v ? 'True' : 'False';
    if (typeof v === 'number') return String(v);
    if (typeof v === 'string') return `'${clip(v, 26).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
    if (Array.isArray(v)) { const a = v.slice(0, 2).map(x => pyr(x, d + 1)); if (v.length > 2) a.push('…'); return `[${a.join(', ')}]`; }
    const ks = Object.keys(v), a = ks.slice(0, d > 1 ? 2 : 4).map(k => `'${k}': ${pyr(v[k], d + 1)}`);
    if (ks.length > a.length) a.push('…');
    return `{${a.join(', ')}}`;
  }

  /* ---------- código Python equivalente (LangGraph atual) ---------- */
  function codeHTML() {
    const D = U.D, L = U.L, s = x => JSON.stringify(String(x));
    const list = a => `[\n${a.map(x => `        ${s(x)},`).join('\n')}\n    ]`;
    const add = ['skim_abstract', 'read_systems', 'check_fit', 'find_other_fit', 'write_review'].map(n => `builder.add_node("${n}", ${n})`).join('\n');
    U.src = `# pip install -U langgraph
import operator
from typing import Annotated, TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt

# The same facts the browser version reads from content.js (PORTFOLIO)
PAPER = {
    "tagline": ${s(D.tagline)},
    "focus": ${s(D.focus)},
    "projects": [
${D.projects.map(p => `        {"id": ${s(p.id)}, "title": ${s(p.title)}, "status": ${s(p.status)}, "metric": ${p.metric == null ? 'None' : s(p.metric)}},`).join('\n')}
    ],
    "facts": ${list(D.facts)},
    "data_fit": ${list(D.data_fit)},
}


class ReviewState(TypedDict, total=False):
    summary: str
    keywords: list[str]
    evidence: Annotated[list[dict], operator.add]  # reducer: appends, never overwrites
    cursor: int
    fit: bool
    other_fit: list[str]
    review: dict


def skim_abstract(state: ReviewState) -> dict:
    keywords = [k.strip() for k in PAPER["focus"].split("·")]
    return {"summary": PAPER["tagline"], "keywords": keywords}


def read_systems(state: ReviewState) -> dict:
    i = state["cursor"]  # one project per super-step
    return {"evidence": [PAPER["projects"][i]], "cursor": i + 1}


def more_projects(state: ReviewState) -> str:
    return "read_systems" if state["cursor"] < len(PAPER["projects"]) else "check_fit"


def check_fit(state: ReviewState) -> dict:
    answer = interrupt({"question": ${s(L.q)}})
    return {"fit": bool(answer)}


def route_fit(state: ReviewState) -> str:
    return "write_review" if state["fit"] else "find_other_fit"


def find_other_fit(state: ReviewState) -> dict:
    return {"other_fit": PAPER["data_fit"]}


def write_review(state: ReviewState) -> dict:
    shipped = [e for e in state["evidence"] if e["metric"]]
    pending = [e for e in state["evidence"] if not e["metric"]]
    strengths = [${L.pyStrength} for e in shipped]
    weaknesses = [
        ${L.pyPending[0]}
        ${L.pyPending[1]}
        for e in pending
    ]
    if shipped:
        weaknesses.append(
            ${L.pyCi[0]}
            ${L.pyCi[1]}
        )
    if not state["fit"]:
        weaknesses.append(${s(L.offTopic)})
    return {"review": {
        "summary": ${L.pySummary},
        "strengths": list(dict.fromkeys(state.get("other_fit", []) + strengths + PAPER["facts"])),
        "weaknesses": weaknesses,
        "decision": ${s(L.accept)} if state["fit"] else ${s(L.acceptData)},
    }}


builder = StateGraph(ReviewState)
${add}

builder.add_edge(START, "skim_abstract")
builder.add_edge("skim_abstract", "read_systems")
builder.add_conditional_edges("read_systems", more_projects, ["read_systems", "check_fit"])  # the cycle
builder.add_conditional_edges("check_fit", route_fit, ["write_review", "find_other_fit"])
builder.add_edge("find_other_fit", "write_review")
builder.add_edge("write_review", END)

graph = builder.compile(checkpointer=InMemorySaver())
config = {"configurable": {"thread_id": ${s(M.thread)}}}

# Runs until check_fit calls interrupt(); the last chunk is {'__interrupt__': (Interrupt(...),)}
for chunk in graph.stream({"evidence": [], "cursor": 0}, config=config, stream_mode="updates"):
    print(chunk)

# Human in the loop: resume the same thread with the answer
for chunk in graph.stream(Command(resume=True), config=config, stream_mode="updates"):
    print(chunk)

print(graph.get_state(config).values["review"]["decision"])

# Time travel: stream again from an earlier checkpoint (forks the thread; it interrupts again)
before_fit = next(s for s in graph.get_state_history(config) if s.next == ("check_fit",))
for chunk in graph.stream(None, config=before_fit.config, stream_mode="updates"):
    print(chunk)
`;
    return U.src.replace(/\n$/, '').split('\n').map(l => `<span class="lg-ln">${hl(l) || ' '}</span>`).join('');
  }

  /* ---------- diagrama (SVG), no desenho dos diagramas do próprio LangGraph ---------- */
  const BOX = {
    __start__: [58, 8, 84, 26], skim_abstract: [30, 70, 140, 32], read_systems: [30, 144, 140, 32],
    check_fit: [30, 230, 140, 32], find_other_fit: [190, 292, 130, 32], write_review: [30, 354, 140, 32], __end__: [58, 428, 84, 26]
  };
  const EDGES = [ // de, para, caminho, rótulo condicional, x, y, âncora
    ['__start__', 'skim_abstract', 'M100 34V69'],
    ['skim_abstract', 'read_systems', 'M100 102V143'],
    ['read_systems', 'read_systems', 'M170 152C226 147 226 177 171 172', 'more_projects?', 228, 159],
    ['read_systems', 'check_fit', 'M100 176V229', 'done', 107, 207],
    ['check_fit', 'find_other_fit', 'M170 246H255V291', 'eno', 213, 240, 'middle'],
    ['check_fit', 'write_review', 'M100 262V353', 'eyes', 107, 312],
    ['find_other_fit', 'write_review', 'M255 324V370H171'],
    ['write_review', '__end__', 'M100 386V427']
  ];
  function svgHTML(L, esc) {
    const mk = (id, cls) => `<marker id="${id}" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto"><path class="${cls}" d="M0 1.2 10 5 0 8.8 2.6 5z"/></marker>`;
    let o = `<defs>${mk('lg-ah', 'lg-ah')}${mk('lg-ah-on', 'lg-ah lg-ah-on')}</defs>`;
    EDGES.forEach(([, , d, lab, x, y, anc], i) => {
      o += `<path class="lg-e${lab ? ' lg-cond' : ''}" data-e="${i}" d="${d}" marker-end="url(#lg-ah)"/>`;
      if (lab) o += `<text class="lg-el" x="${x}" y="${y}" text-anchor="${anc || 'start'}">${esc(L[lab] || lab)}</text>`;
    });
    o += '<text class="lg-cnt" id="lg-cnt" x="228" y="174"></text>';
    Object.keys(BOX).forEach(n => {
      const [x, y, w, h] = BOX[n], pill = n[0] === '_';
      o += `<g class="lg-n${pill ? ' lg-pill' : ''}${n === '__end__' ? ' lg-last' : ''}" data-n="${n}"><rect x="${x + 0.5}" y="${y + 0.5}" width="${w}" height="${h}" rx="${pill ? h / 2 : 3}"/>`
        + (n === 'check_fit' ? `<path class="lg-pz" d="M${x + 13} ${y + 10}v12M${x + 18} ${y + 10}v12"/>` : '')
        + `<text x="${x + w / 2}" y="${y + h / 2 + 4.6}" text-anchor="middle">${n}</text></g>`;
    });
    return `<svg class="lg-svg" viewBox="0 0 330 458" width="330" height="458" aria-hidden="true" focusable="false">${o}</svg>`;
  }

  /* ---------- painéis ---------- */
  // JSON do estado; realça as chaves que o último super-step escreveu (em evidence, só os itens acrescentados).
  function jsonHTML(v, delta) {
    const esc = U.ctx.esc, ks = KEYS.filter(k => k in v), chg = k => (delta && k in delta ? ' lg-chg' : '');
    if (!ks.length) return '<span class="lg-kv">{}</span>';
    const lit = x => (typeof x === 'string' ? `<span class="lg-ts">${esc(JSON.stringify(clip(x, 74)))}</span>` : `<span class="lg-tb">${x == null ? 'null' : esc(String(x))}</span>`);
    const fmt = (x, ind) => {
      if (x === null || typeof x !== 'object') return lit(x);
      const arr = Array.isArray(x), items = arr ? x : Object.keys(x), [o, c] = arr ? '[]' : '{}';
      if (!items.length) return o + c;
      const parts = items.map(i => (arr ? fmt(i, ind + 2) : `<span class="lg-tk">${esc(JSON.stringify(i))}</span>: ${fmt(x[i], ind + 2)}`));
      if (JSON.stringify(x).length + ind < 40) return o + parts.join(', ') + c;
      return `${o}\n${parts.map(p => ' '.repeat(ind + 2) + p).join(',\n')}\n${' '.repeat(ind)}${c}`;
    };
    const kv = (k, i) => {
      const comma = i < ks.length - 1 ? ',' : '', key = `  <span class="lg-tk">"${k}"</span>: `, ev = v[k];
      if (k !== 'evidence' || !ev.length) return `<span class="lg-kv${chg(k)}">${key}${fmt(v[k], 2)}${comma}</span>`;
      const from = delta && delta.evidence ? ev.length - delta.evidence.length : ev.length;
      return `<span class="lg-kv">${key}[</span>` + ev.map((e, j) => `<span class="lg-kv${j >= from ? ' lg-chg' : ''}">    ${fmt(e, 4)}${j < ev.length - 1 ? ',' : ''}</span>`).join('') + `<span class="lg-kv">  ]${comma}</span>`;
    };
    return `<span class="lg-kv">{</span>${ks.map(kv).join('')}<span class="lg-kv">}</span>`;
  }

  // Linhas do stream (stream_mode="updates") derivadas do caminho da thread.
  function logLines(R) {
    const L = U.L, out = [];
    if (!M.path.length) return [['idle', L.idle, 'c']];
    out.push(['in', "# graph.stream({'evidence': [], 'cursor': 0}, config, stream_mode='updates')", 'c']);
    const intr = id => [`i${id}`, `{'__interrupt__': (Interrupt(value={'question': ${pyr(L.q, 9)}}, id='${id.slice(0, 8)}…'),)}`, 'i'];
    M.path.forEach((cp, i) => {
      if (i === 0) return;
      if (cp.fork) out.push([`f${cp.fork}`, L.forkC(cp.fork.slice(0, 8)), 'c']);
      if (cp.node === 'check_fit') out.push(intr(cp.intrId), [`r${cp.id}`, `# graph.stream(Command(resume=${cp.answer ? 'True' : 'False'}), config, stream_mode='updates')`, 'c']);
      if (cp.node !== '__start__') out.push([`u${cp.id}`, cp.node, 'u', R[i].delta]);
    });
    if (M.fork) out.push([`f${M.fork}`, L.forkC(M.fork.slice(0, 8)), 'c']);
    if (M.intr && M.path.some(c => c.id === M.intr.cp)) out.push(intr(M.intr.id));
    return out;
  }
  const lineHTML = ([, txt, kind, delta]) => (kind === 'u'
    ? `<div class="lg-ll">{<b class="lg-tn">'${txt}'</b>: ${hl(pyr(delta, 1))}}</div>`
    : `<div class="lg-ll${kind === 'i' ? ' lg-li' : ''}">${hl(txt)}</div>`);

  function reviewHTML(rv) {
    const { esc, smart } = U.ctx, L = U.L, D = U.D;
    const txt = s => {
      let h = esc(smart(s));
      const m = /^([^:]{2,50}): /.exec(s);
      if (m && !/^PRJ-/.test(s)) { const k = esc(smart(m[1])); h = `<span class="lg-rk">${k}:</span>${h.slice(k.length + 1)}`; }
      return h.replace(/PRJ-\d+/g, id => (document.getElementById(id.toLowerCase()) ? `<a class="xref" href="#${id.toLowerCase()}">${id}</a>` : id));
    };
    const ol = a => `<ol>${a.map(s => `<li>${txt(s)}</li>`).join('')}</ol>`;
    const mail = D.email ? `mailto:${D.email}?subject=${encodeURIComponent(L.subject)}&body=${encodeURIComponent(L.body(D.name, rv.decision))}` : '';
    return `<h3 class="lg-rv-h" id="lg-rv-h">${esc(L.form)}</h3>
      <p class="lg-rv-meta">${esc(L.reviewer)} · thread_id <code>${esc(M.thread)}</code></p>
      <dl class="lg-rv">
        <div><dt>${esc(L.sum)}</dt><dd>${esc(smart(rv.summary))}</dd></div>
        <div><dt>${esc(L.str)}</dt><dd>${ol(rv.strengths)}</dd></div>
        <div><dt>${esc(L.weak)}</dt><dd>${ol(rv.weaknesses)}</dd></div>
        <div><dt>${esc(L.dec)}</dt><dd class="lg-dec"><strong>${esc(rv.decision)}</strong>${mail ? `<a class="lg-cta" href="${esc(mail)}"><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="1.75" y="3.25" width="12.5" height="9.5" rx="1"/><path d="m2.25 4 5.75 4.5L13.75 4"/></svg>${esc(L.mail)}</a>` : ''}</dd></div>
      </dl>`;
  }

  /* ---------- atualização da interface ---------- */
  function say(msg) { if (U && msg) { U.live.textContent = ''; setTimeout(() => { if (U) U.live.textContent = msg; }, 30); } }

  function update(announce) {
    const L = U.L, esc = U.ctx.esc;
    const R = replay(), S = M.cur >= 0 ? R[M.cur] : null, isP = paused(), end = !!S && S.next === '__end__';
    // controles
    U.run.disabled = isP || end;
    U.run.innerHTML = M.running ? `${ICON.pause}<span>${esc(L.pause)}</span>` : `${ICON.play}<span>${esc(L.run)}</span>`;
    U.step.disabled = M.running || isP || end;
    U.reset.disabled = !M.path.length;
    // grafo: nós visitados, nó ativo, arestas percorridas, pausa
    const exec = M.path.slice(1, M.cur + 1).map(c => c.node), seq = S ? exec.concat(S.next) : [];
    const pairs = new Set(seq.slice(1).map((b, i) => `${seq[i]}>${b}`)), on = !S ? '__start__' : (end || isP ? null : S.next);
    U.svg.querySelectorAll('.lg-n').forEach(g => {
      const n = g.dataset.n;
      g.classList.toggle('is-done', exec.includes(n) || (n === '__end__' && end));
      g.classList.toggle('is-on', n === on);
      g.classList.toggle('is-paused', n === 'check_fit' && isP);
    });
    U.svg.querySelectorAll('.lg-e').forEach(p => {
      const [a, b] = EDGES[p.dataset.e], hit = pairs.has(`${a}>${b}`);
      p.classList.toggle('is-done', hit);
      p.setAttribute('marker-end', `url(#${hit ? 'lg-ah-on' : 'lg-ah'})`);
    });
    const cur = S && S.v.cursor, np = U.D.projects.length;
    U.cnt.textContent = cur ? L.of(Math.min(cur, np), np) : '';
    U.intr.hidden = !isP;
    // estado (StateSnapshot)
    U.snap.textContent = S ? `step ${M.cur - 1} · next: ${end ? '()' : `('${S.next}',)`}` : '';
    U.json.innerHTML = jsonHTML(S ? S.v : {}, S && S.delta);
    const chg = U.json.querySelector('.lg-chg');
    U.json.scrollTop = chg ? Math.max(0, chg.offsetTop - U.json.offsetTop - 6) : 0;
    // checkpoints (InMemorySaver)
    const f = document.activeElement && document.activeElement.closest && document.activeElement.closest('.lg-cp');
    const fi = f ? Number(f.dataset.i) : -1;
    U.cpl.innerHTML = M.path.length ? M.path.map((cp, i) => {
      const nx = R[i].next === '__end__' ? '()' : R[i].next, sid = cp.id.slice(0, 8);
      const intr = (M.intr && M.intr.cp === cp.id) || (M.path[i + 1] && M.path[i + 1].intrId);
      return `<li><button type="button" class="lg-cp${i === M.cur ? ' is-cur' : ''}${i > M.cur ? ' is-future' : ''}" data-i="${i}"${i === M.cur ? ' aria-current="true"' : ''}><span class="lg-cp-s">${i - 1}</span><span class="lg-cp-n">${esc(nx)}</span><span class="lg-cp-id">${sid}</span><span class="lg-cp-m" aria-hidden="true">${cp.fork ? '⑂' : ''}${intr ? '⏸' : ''}</span></button></li>`;
    }).join('') : `<li class="lg-cp-none">${esc(L.noCp)}</li>`;
    if (fi >= 0) { const b = U.cpl.querySelector(`[data-i="${Math.min(fi, M.path.length - 1)}"]`); if (b) b.focus({ preventScroll: true }); }
    const cb = U.cpl.querySelector('.is-cur');
    if (cb) { const t = cb.offsetTop - U.cpl.offsetTop, h = U.cpl.clientHeight; if (t < U.cpl.scrollTop || t > U.cpl.scrollTop + h - 30) U.cpl.scrollTop = t - h / 2; }
    // stream: só acrescenta as linhas novas, para o leitor de tela anunciar apenas o que mudou
    const lines = logLines(R), keys = lines.map(l => l[0]);
    if (M.logKeys.length <= keys.length && M.logKeys.every((k, i) => k === keys[i]) && U.log.childElementCount === M.logKeys.length) U.log.insertAdjacentHTML('beforeend', lines.slice(M.logKeys.length).map(lineHTML).join(''));
    else U.log.innerHTML = lines.map(lineHTML).join('');
    M.logKeys = keys;
    U.log.scrollTop = U.log.scrollHeight;
    // formulário de revisão
    const rv = S && S.v.review;
    U.rv.hidden = !rv;
    U.rv.innerHTML = rv ? reviewHTML(rv) : '';
    if (announce && S) {
      if (isP) { say(L.livePause(L.q)); U.yes.focus({ preventScroll: true }); }
      else if (rv && end) say(L.liveEnd(rv.decision));
      else if (S.delta && M.cur > 0) say(L.liveStep(M.cur - 1, M.path[M.cur].node, Object.keys(S.delta).join(', '), S.next));
      else say(L.liveStart);
    }
  }

  const SVGI = d => `<svg class="lg-ic" viewBox="0 0 16 16" aria-hidden="true" focusable="false">${d}</svg>`;
  const ICON = {
    play: SVGI('<path d="M4.5 3v10l8-5z" fill="currentColor" stroke="none"/>'),
    pause: SVGI('<path d="M5 3.5v9M11 3.5v9" stroke-width="2.2"/>'),
    step: SVGI('<path d="M3.5 3.5v9l6-4.5z" fill="currentColor" stroke="none"/><path d="M12 3.5v9" stroke-width="1.8"/>'),
    reset: SVGI('<path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v2.75h-2.75"/>')
  };

  function setView(v, focus) {
    M.view = v;
    [['g', U.tabG, U.paneG], ['p', U.tabP, U.paneP]].forEach(([k, tab, pane]) => {
      const on = k === v;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      pane.hidden = !on;
      if (on && focus) tab.focus();
    });
  }

  /* ---------- montagem ---------- */
  (window.ArtigoEggs = window.ArtigoEggs || {}).langgraph = function (el, ctx) {
    stop();
    const L = STR[ctx.lang] || STR.en, esc = ctx.esc, n = ctx.n || 'C';
    U = { ctx, L, D: facts(ctx, L) };
    const secN = document.querySelector('#metodos-h .sec-n');
    const s3 = secN ? `<a class="xref" href="#metodos">${esc(L.section)}&nbsp;${esc(secN.textContent.trim())}</a>` : esc(L.section);
    const appA = document.getElementById('apendice-a') ? `<a class="xref" href="#apendice-a">${esc(L.appendix)}&nbsp;A</a>` : '';
    const lead = esc(ctx.smart(L.lead('\u0001', appA ? '\u0002' : ''))).replace('\u0001', s3).replace('\u0002', appA);

    el.innerHTML = `<p class="lg-lead">${lead}</p>
<figure class="fig lg-fig" id="fig-${esc(n)}-1">
<div class="lg${ctx.reduced ? ' lg-rm' : ''}">
 <div class="lg-bar">
  <div class="lg-tabs" role="tablist" aria-label="${esc(L.view)}">
   <button type="button" role="tab" id="lg-tab-g" aria-controls="lg-pane-g">${esc(L.graph)}</button>
   <button type="button" role="tab" id="lg-tab-p" aria-controls="lg-pane-p">Python</button>
  </div>
  <span class="lg-thread">thread_id <code id="lg-thread">${esc(M.thread)}</code></span>
  <div class="lg-ctl" role="group" aria-label="${esc(L.controls)}">
   <button type="button" class="lg-btn lg-primary" id="lg-run"></button>
   <button type="button" class="lg-btn" id="lg-step">${ICON.step}<span>${esc(L.step)}</span></button>
   <button type="button" class="lg-btn" id="lg-reset">${ICON.reset}<span>${esc(L.reset)}</span></button>
  </div>
 </div>
 <div class="lg-pane" id="lg-pane-g" role="tabpanel" aria-labelledby="lg-tab-g"><div class="lg-grid">
  <div class="lg-graph"><p class="sr-only">${esc(L.desc)}</p>${svgHTML(L, esc)}<p class="lg-legend" aria-hidden="true">${esc(L.legend)}</p></div>
  <div class="lg-intr" id="lg-intr" role="group" aria-labelledby="lg-q" hidden>
   <p class="lg-intr-n"><span class="lg-intr-tag">interrupt()</span> ${esc(L.intr)}</p>
   <p class="lg-q" id="lg-q">${esc(L.q)}</p>
   <div class="lg-ans"><button type="button" class="lg-btn lg-primary" id="lg-yes">${esc(L.yes)}</button><button type="button" class="lg-btn" id="lg-no">${esc(L.no)}</button></div>
  </div>
  <div class="lg-side">
   <section class="lg-panel" aria-labelledby="lg-h-s">
    <h3 class="lg-ph" id="lg-h-s">${esc(L.state)} <span class="lg-ph-x" id="lg-snap"></span></h3>
    <pre class="lg-json" id="lg-json" tabindex="0" role="region" aria-labelledby="lg-h-s"></pre>
   </section>
   <section class="lg-panel" aria-labelledby="lg-h-c">
    <h3 class="lg-ph" id="lg-h-c">${esc(L.ckpts)} <span class="lg-ph-x">InMemorySaver</span></h3>
    <p class="lg-cp-head" aria-hidden="true"><span>step</span><span>next</span><span>checkpoint_id</span></p>
    <ol class="lg-cpl" id="lg-cpl"></ol>
    <p class="lg-hint">${esc(L.cpHint)}</p>
   </section>
  </div>
  <section class="lg-panel lg-stream" aria-labelledby="lg-h-l">
   <h3 class="lg-ph" id="lg-h-l">${esc(L.stream)} <span class="lg-ph-x">stream_mode="updates"</span></h3>
   <div class="lg-log" id="lg-log" role="log" aria-live="polite" aria-relevant="additions" aria-labelledby="lg-h-l" tabindex="0"></div>
  </section>
  <section class="lg-review" id="lg-review" aria-labelledby="lg-rv-h" hidden></section>
 </div></div>
 <div class="lg-pane" id="lg-pane-p" role="tabpanel" aria-labelledby="lg-tab-p" hidden>
  <div class="lg-code-bar"><span>reviewer_agent.py</span><button type="button" class="lg-btn" id="lg-copy">${esc(L.copy)}</button></div>
  <pre class="lg-code" tabindex="0" role="region" aria-label="reviewer_agent.py"><code id="lg-code"></code></pre>
 </div>
 <p class="sr-only" id="lg-live" aria-live="polite"></p>
</div>
<figcaption class="cap"><span class="cap-l">${esc(ctx.figure)} ${esc(n)}.1:</span> ${esc(L.cap)}</figcaption>
</figure>`;

    const $ = id => el.querySelector('#' + id);
    Object.assign(U, {
      run: $('lg-run'), step: $('lg-step'), reset: $('lg-reset'), svg: el.querySelector('.lg-svg'), cnt: $('lg-cnt'),
      intr: $('lg-intr'), yes: $('lg-yes'), snap: $('lg-snap'), json: $('lg-json'), cpl: $('lg-cpl'), log: $('lg-log'),
      rv: $('lg-review'), live: $('lg-live'), code: $('lg-code'), thread: $('lg-thread'),
      tabG: $('lg-tab-g'), tabP: $('lg-tab-p'), paneG: $('lg-pane-g'), paneP: $('lg-pane-p')
    });
    U.code.innerHTML = codeHTML();
    M.logKeys = [];

    U.run.addEventListener('click', run);
    U.step.addEventListener('click', stepOnce);
    U.reset.addEventListener('click', reset);
    U.yes.addEventListener('click', () => answer(true));
    $('lg-no').addEventListener('click', () => answer(false));
    U.cpl.addEventListener('click', e => { const b = e.target.closest('.lg-cp'); if (b) travel(Number(b.dataset.i)); });
    U.tabG.addEventListener('click', () => setView('g'));
    U.tabP.addEventListener('click', () => setView('p'));
    el.querySelector('.lg-tabs').addEventListener('keydown', e => {
      if (!/^(ArrowLeft|ArrowRight|Home|End)$/.test(e.key)) return;
      e.preventDefault();
      setView(e.key === 'Home' ? 'g' : e.key === 'End' ? 'p' : (M.view === 'g' ? 'p' : 'g'), true);
    });
    $('lg-copy').addEventListener('click', e => {
      const b = e.currentTarget;
      try { navigator.clipboard.writeText(U.src).then(() => { b.textContent = L.copied; setTimeout(() => { b.textContent = L.copy; }, 1600); }, () => {}); } catch (err) { /* sem clipboard */ }
    });

    setView(M.view);
    update();
  };
})();
