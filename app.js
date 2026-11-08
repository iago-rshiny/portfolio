/* =========================================================================
   Artigo — o portfólio como um preprint de pesquisa em IA.
   Todo o conteúdo vem de content.js (global PORTFOLIO); aqui só há
   strings de interface (UI) e a tipografia.
   ========================================================================= */
(function () {
  'use strict';

  const C = window.PORTFOLIO;
  const paper = document.getElementById('paper');
  if (!C || !paper) return;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reducedMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const store = {
    get(k) { try { return localStorage.getItem(`artigo:${k}`); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(`artigo:${k}`, v); } catch (e) { /* armazenamento bloqueado */ } }
  };

  const LANGS = ['en', 'pt']; // o primeiro é o padrão
  let lang = (() => {
    const q = new URLSearchParams(location.search).get('lang');
    if (LANGS.includes(q)) return q;
    const s = store.get('lang');
    return LANGS.includes(s) ? s : LANGS[0];
  })();

  /* ---------- helpers de conteúdo ---------- */
  const t = v => (v == null ? '' : (typeof v === 'object' && !Array.isArray(v) ? (v[lang] ?? v.pt ?? '') : v));
  const has = v => { const x = t(v); return Array.isArray(x) ? x.length > 0 : String(x).trim() !== ''; };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad2 = n => String(n).padStart(2, '0');
  // Tipografia: aspas e apóstrofos curvos no texto corrido (só apresentação; o conteúdo não muda).
  const smart = s => String(s ?? '').replace(/"([^"]*)"/g, '\u201C$1\u201D').replace(/(\w)'(\w)/g, '$1\u2019$2');
  const tx = v => esc(smart(t(v)));
  const L = C.links || {};

  /* ---------- strings de interface ---------- */
  const MONTHS = {
    pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };
  const UI = {
    pt: {
      skip: 'Pular para o conteúdo', navLabel: 'Seções do artigo', langGroup: 'Idioma',
      pdfBar: 'PDF', pdfBarTitle: 'Baixar o currículo em PDF',
      preprint: 'Preprint', note: 'Nota',
      titleNote: 'Preprint. Em avaliação — por você.', back: 'Voltar ao texto',
      ctaPdf: 'Currículo', ctaPdfSub: 'PDF', ctaLinkedin: 'LinkedIn', ctaEmail: 'E-mail', ctaGithub: 'GitHub', ctaProjects: 'Projetos',
      ctaLabel: 'Links principais',
      abstract: 'Resumo', keywords: 'Palavras-chave', metadata: 'Metadados',
      sec: { intro: 'Introdução', systems: 'Sistemas', methods: 'Métodos e ferramentas', exp: 'Experiência profissional', edu: 'Formação e atividades', refs: 'Referências', appendix: 'Apêndice', ask: 'Pergunte ao meu currículo', ont: 'A ontologia do artigo', supp: 'Suplemento estatístico', graph: 'Um agente revisor em LangGraph' },
      nav: { intro: 'Introdução', systems: 'Sistemas', methods: 'Métodos', exp: 'Experiência', edu: 'Formação', refs: 'Referências', ask: 'Apêndice', ont: 'Ontologia', supp: 'Estatística', graph: 'Grafo', apps: 'Apêndices' },
      table: 'Tabela', figure: 'Figura', section: 'Seção', appendixRef: 'Apêndice',
      introLead: parts => `Este documento apresenta meu trabalho no formato de um artigo: ${parts}.`,
      introAsk: ref => ` O ${ref} é executável: um assistente responde perguntas sobre o conteúdo e cita as fontes.`,
      introParts: { systems: 'os sistemas', methods: 'os métodos e ferramentas', exp: 'a trajetória profissional', edu: 'a formação' },
      and: 'e',
      statsLead: ref => `A ${ref} resume a trajetória em números. Os princípios de trabalho vêm a seguir.`,
      statsCaption: 'Resumo em números.',
      principle: 'Princípio',
      systemsLead: 'Cada subseção descreve um sistema: problema, solução, fluxograma e, quando houver, resultados medidos.',
      legend: 'Símbolos dos fluxogramas',
      shapes: { term: 'Início / fim', io: 'Entrada de dados', proc: 'Processo', sub: 'Processo principal', decision: 'Decisão', doc: 'Documento', store: 'Base de dados' },
      problem: 'Problema', solution: 'Solução', stack: 'Stack', links: 'Links',
      figCaption: (title, via) => `Como funciona: “${title}”, de cima para baixo.${via ? ' Setas tracejadas indicam a base de conhecimento consultada no passo.' : ''}`,
      figDesc: 'Passos do fluxograma',
      figVia: 'consulta', figBranch: 'saída alternativa',
      metricsCaption: title => `Resultados medidos — ${title}.`,
      col: { metric: 'Métrica', before: 'Antes', after: 'Depois', delta: 'Variação', value: 'Resultado', skill: 'Técnica', level: 'Nível' },
      methodsLead: ref => `A ${ref} lista técnicas e ferramentas por área, com o nível de uso de cada uma.`,
      skillsCaption: 'Métodos e ferramentas por área.',
      levels: { 3: 'uso em produção', 2: 'proficiente', 1: 'familiar' },
      levelOf: (n, label) => `${n} de 3: ${label}`,
      present: 'atual',
      dur: (y, m) => [y && `${y} ${y > 1 ? 'anos' : 'ano'}`, m && `${m} ${m > 1 ? 'meses' : 'mês'}`].filter(Boolean).join(' e '),
      education: 'Formação acadêmica', certifications: 'Certificações',
      refsLead: 'Correspondência',
      ref: { linkedin: 'Perfil profissional no LinkedIn', cvPt: 'Currículo (PDF, português)', cvEn: 'Currículo (PDF, inglês)', email: 'Endereço para correspondência', github: 'Repositórios de código no GitHub' },
      ontLead: 'Todas as seções deste artigo são geradas de um único arquivo de dados. A figura abaixo mostra esse arquivo como um grafo de conhecimento: os cargos e as empresas, os sistemas construídos, os agentes que eles implantam, as bases de conhecimento que esses agentes consultam e as ferramentas usadas em cada emprego.',
      askLead: 'Este apêndice é executável. Um assistente de IA responde perguntas sobre minha experiência usando apenas o conteúdo desta página, e cita a fonte de cada afirmação: clique numa citação para ir até ela.',
      askNote: 'Respostas geradas por IA podem conter erros. Na dúvida, fale comigo.',
      nbFile: 'curriculo.ipynb', nbKernel: 'Kernel: currículo', nbIdle: 'ocioso', nbBusy: 'ocupado',
      nbRestart: 'Reiniciar kernel', nbRun: 'Executar', nbInput: 'Sua pergunta',
      nbPlaceholder: 'Digite sua pergunta e tecle Enter…', nbSuggest: 'Sugestões',
      nbIntro: 'Pergunte sobre experiência, projetos ou stack. Escolha uma sugestão abaixo ou escreva a sua.',
      nbLog: 'Histórico de perguntas e respostas', nbQ: 'Pergunta:', nbA: 'Resposta:',
      nbThinking: 'executando', nbTruncated: 'Resposta truncada pelo limite de tamanho.',
      tr: { trace: 'trace', ttft: 'tempo até o 1º token', stream: 'streaming', chunks: n => `${n} trechos`, model: 'modelo', tin: 'entrada', tout: 'saída', cache: 'lidos do cache', mock: 'simulado, sem chamada à API', tok: 'tokens', span: 'span', dur: 'duração', label: 'Trace da resposta' },
      err: {
        offline: 'O assistente está offline neste ambiente. Escreva direto para {contact}.',
        rate_limited: 'Limite de perguntas atingido por agora. Tente mais tarde ou escreva para {contact}.',
        not_configured: 'O assistente ainda não está configurado. Fale comigo por {contact}.',
        busy: 'O modelo está ocupado. Tente de novo em alguns segundos ou escreva para {contact}.',
        refusal: 'Não posso responder a isso. Pergunte sobre experiência, projetos ou stack, ou escreva para {contact}.',
        bad_request: 'Não consegui processar a pergunta. Tente reformular ou escreva para {contact}.',
        upstream: 'Falha ao consultar o modelo. Tente de novo ou escreva para {contact}.'
      },
      colophon: 'Composto em Newsreader e Inconsolata. Nenhum LaTeX foi compilado na produção desta página: só HTML, CSS e JavaScript.',
      page: 'Página', demo: 'Amostra · dados fictícios',
      colophonSrc: 'Composto em Newsreader e Inconsolata. A compilação da abertura é encenada: esta página é HTML, CSS e JavaScript. Mas o código-fonte em LaTeX existe:',
      colophonLink: 'veja o .tex',
      texBtn: 'Ver código-fonte (.tex)', srcLines: n => `${n} linhas`, srcCompile: 'Compilar', srcDownload: 'Baixar .tex', close: 'Fechar',
      srcNote: 'Gerado do mesmo content.js que monta esta página. Compila com pdflatex.',
      bootSkip: 'clique ou tecle algo para pular',
      texAskNote: 'Na versão HTML, este apêndice é um notebook executável: o PDF não responde perguntas.',
      texEggNote: 'Figura interativa na versão HTML.', seeAlso: 'veja o',
      history: 'Histórico de versões', histHint: 'Cada emprego é uma revisão. Clique para ver o diff.', histCurrent: 'atual',
      diffLabel: v => `Diff da versão ${v}`, diffPrev: 'Versão anterior', diffNext: 'Próxima versão',
      diffField: { role: 'cargo', org: 'afiliação', notes: 'destaques' },
      diffStat: (i, d) => `1 arquivo alterado, ${i} ${i === 1 ? 'inserção' : 'inserções'}(+), ${d} ${d === 1 ? 'remoção' : 'remoções'}(−)`
    },
    en: {
      skip: 'Skip to content', navLabel: 'Paper sections', langGroup: 'Language',
      pdfBar: 'PDF', pdfBarTitle: 'Download the résumé as PDF',
      preprint: 'Preprint', note: 'Note',
      titleNote: 'Preprint. Under review — by you.', back: 'Back to text',
      ctaPdf: 'Résumé', ctaPdfSub: 'PDF', ctaLinkedin: 'LinkedIn', ctaEmail: 'Email', ctaGithub: 'GitHub', ctaProjects: 'Projects',
      ctaLabel: 'Main links',
      abstract: 'Abstract', keywords: 'Keywords', metadata: 'Metadata',
      sec: { intro: 'Introduction', systems: 'Systems', methods: 'Methods and tools', exp: 'Professional experience', edu: 'Education and activities', refs: 'References', appendix: 'Appendix', ask: 'Ask my résumé', ont: 'The ontology of this paper', supp: 'Statistical supplement', graph: 'A reviewer agent in LangGraph' },
      nav: { intro: 'Introduction', systems: 'Systems', methods: 'Methods', exp: 'Experience', edu: 'Education', refs: 'References', ask: 'Appendix', ont: 'Ontology', supp: 'Statistics', graph: 'Graph', apps: 'Appendices' },
      table: 'Table', figure: 'Figure', section: 'Section', appendixRef: 'Appendix',
      introLead: parts => `This document presents my work in the format of a paper: ${parts}.`,
      introAsk: ref => ` ${ref} is executable: an assistant answers questions about the content and cites its sources.`,
      introParts: { systems: 'the systems', methods: 'methods and tools', exp: 'career history', edu: 'education' },
      and: 'and',
      statsLead: ref => `${ref} summarizes the track record in numbers. The working principles follow.`,
      statsCaption: 'Summary in numbers.',
      principle: 'Principle',
      systemsLead: 'Each subsection describes one system: problem, solution, flowchart and, where available, measured results.',
      legend: 'Flowchart symbols',
      shapes: { term: 'Start / end', io: 'Data input', proc: 'Process', sub: 'Main process', decision: 'Decision', doc: 'Document', store: 'Data store' },
      problem: 'Problem', solution: 'Solution', stack: 'Stack', links: 'Links',
      figCaption: (title, via) => `How it works: “${title}”, top to bottom.${via ? ' Dashed arrows mark the knowledge base consulted at that step.' : ''}`,
      figDesc: 'Flowchart steps',
      figVia: 'consults', figBranch: 'alternative exit',
      metricsCaption: title => `Measured results — ${title}.`,
      col: { metric: 'Metric', before: 'Before', after: 'After', delta: 'Change', value: 'Result', skill: 'Technique', level: 'Level' },
      methodsLead: ref => `${ref} lists techniques and tools by area, with the level of use for each.`,
      skillsCaption: 'Methods and tools by area.',
      levels: { 3: 'used in production', 2: 'proficient', 1: 'familiar' },
      levelOf: (n, label) => `${n} of 3: ${label}`,
      present: 'present',
      dur: (y, m) => [y && `${y} ${y > 1 ? 'yrs' : 'yr'}`, m && `${m} ${m > 1 ? 'mos' : 'mo'}`].filter(Boolean).join(' '),
      education: 'Education', certifications: 'Certifications',
      refsLead: 'Correspondence',
      ref: { linkedin: 'Professional profile on LinkedIn', cvPt: 'Résumé (PDF, Portuguese)', cvEn: 'Résumé (PDF, English)', email: 'Correspondence address', github: 'Code repositories on GitHub' },
      ontLead: 'Every section of this paper is generated from a single data file. The figure below shows that file as a knowledge graph: the positions and organizations, the systems built, the agents they deploy, the knowledge bases those agents query and the tools each job used.',
      askLead: 'This appendix is executable. An AI assistant answers questions about my experience using only the content of this page, and cites the source of every claim: click a citation to jump to it.',
      askNote: 'AI-generated answers can contain mistakes. When in doubt, talk to me.',
      nbFile: 'resume.ipynb', nbKernel: 'Kernel: résumé', nbIdle: 'idle', nbBusy: 'busy',
      nbRestart: 'Restart kernel', nbRun: 'Run', nbInput: 'Your question',
      nbPlaceholder: 'Type a question and press Enter…', nbSuggest: 'Suggestions',
      nbIntro: 'Ask about experience, projects or stack. Pick a suggestion below or write your own.',
      nbLog: 'Questions and answers', nbQ: 'Question:', nbA: 'Answer:',
      nbThinking: 'running', nbTruncated: 'Answer truncated by the length limit.',
      tr: { trace: 'trace', ttft: 'time to first token', stream: 'streaming', chunks: n => `${n} chunks`, model: 'model', tin: 'input', tout: 'output', cache: 'read from cache', mock: 'simulated, no API call', tok: 'tokens', span: 'span', dur: 'duration', label: 'Answer trace' },
      err: {
        offline: 'The assistant is offline in this environment. Write to me directly at {contact}.',
        rate_limited: 'Question limit reached for now. Try again later or write to {contact}.',
        not_configured: "The assistant isn't configured yet. Reach me at {contact}.",
        busy: 'The model is busy. Try again in a few seconds or write to {contact}.',
        refusal: "I can't answer that. Ask about experience, projects or stack, or write to {contact}.",
        bad_request: "I couldn't process that question. Try rephrasing it or write to {contact}.",
        upstream: 'The model request failed. Try again or write to {contact}.'
      },
      colophon: 'Set in Newsreader and Inconsolata. No LaTeX was compiled in the making of this page: just HTML, CSS and JavaScript.',
      page: 'Page', demo: 'Sample · fictional data',
      colophonSrc: 'Set in Newsreader and Inconsolata. The compile log at the start is staged: this page is HTML, CSS and JavaScript. The LaTeX source is real, though:',
      colophonLink: 'view the .tex',
      texBtn: 'View source (.tex)', srcLines: n => `${n} lines`, srcCompile: 'Compile', srcDownload: 'Download .tex', close: 'Close',
      srcNote: 'Generated from the same content.js that builds this page. Compiles with pdflatex.',
      bootSkip: 'click or press any key to skip',
      texAskNote: 'In the HTML version this appendix is an executable notebook: the PDF does not answer questions.',
      texEggNote: 'Interactive figure in the HTML version.', seeAlso: 'see',
      history: 'Submission history', histHint: 'Each job is a revision. Click one to see the diff.', histCurrent: 'current',
      diffLabel: v => `Diff of version ${v}`, diffPrev: 'Previous version', diffNext: 'Next version',
      diffField: { role: 'role', org: 'affiliation', notes: 'highlights' },
      diffStat: (i, d) => `1 file changed, ${i} insertion${i === 1 ? '' : 's'}(+), ${d} deletion${d === 1 ? '' : 's'}(−)`
    }
  };
  const u = (k, ...a) => { const v = UI[lang][k] ?? UI.pt[k]; return typeof v === 'function' ? v(...a) : v; };

  /* ---------- dados derivados ---------- */
  const kEn = r => (r && typeof r.k === 'object' ? (r.k.en || r.k.pt || '') : String((r && r.k) || ''));
  const datasheet = (C.datasheet || []).filter(r => has(r.v));
  const roleRow = datasheet.find(r => /^(role|função|cargo)$/i.test(kEn(r)));
  const baseRow = datasheet.find(r => /^based/i.test(kEn(r)));
  const currentJob = (C.experience || []).find(j => !j.end);
  const authorShort = (() => {
    const p = String(C.name || '').trim().split(/\s+/);
    return p.length > 1 ? `${p.slice(0, -1).map(w => `${w[0]}.`).join(' ')} ${p[p.length - 1]}` : (C.name || '');
  })();
  const expId = i => `exp-${pad2(i + 1)}`;
  const cvHref = l => { const f = L.cv && (typeof L.cv === 'object' ? L.cv[l] : L.cv); return f || ''; };
  // Histórico de versões: cada emprego é uma revisão do artigo, da mais antiga (v1) à atual.
  const versions = (C.experience || []).map((j, i) => ({ j, i })).filter(v => v.j && v.j.start)
    .sort((a, b) => String(a.j.start).localeCompare(String(b.j.start)));
  const orgShort = j => String(t(j.org) || '').split(' · ')[0];

  // Título no formato de artigo, derivado do tagline: "Construo X — de A a B" → "X: de A a B".
  function paperTitle() {
    // Título explícito em content.js ("Título: subtítulo") tem prioridade sobre o tagline.
    const own = String(t(C.title) || '').trim();
    if (own) {
      const k = own.indexOf(': ');
      return k > 0 ? { main: own.slice(0, k), sub: own.slice(k + 2).replace(/[.]\s*$/, '') } : { main: own, sub: '' };
    }
    const tag = String(t(C.tagline) || '').trim();
    if (!tag) return { main: t(C.role) || C.name, sub: '' };
    const [head, ...rest] = tag.split(/\s+[—–]\s+/);
    let main = head.replace(/^(i build|i create|i design|construo|crio|desenvolvo)\s+/i, '').replace(/[.:;]\s*$/, '');
    main = main.charAt(0).toUpperCase() + main.slice(1);
    const sub = rest.join(' — ').replace(/[.]\s*$/, '');
    return { main, sub };
  }

  const now = new Date();
  const ymOf = s => { const [y, m] = String(s).split('-').map(Number); return { y, m: m || 1 }; };
  const fmtYM = s => { const d = ymOf(s); return `${MONTHS[lang][d.m - 1]} ${d.y}`; };
  function duration(start, end) {
    const a = ymOf(start);
    const b = end ? ymOf(end) : { y: now.getFullYear(), m: now.getMonth() + 1 };
    const total = (b.y - a.y) * 12 + (b.m - a.m) + 1;
    return total > 0 ? u('dur', Math.floor(total / 12), total % 12) : '';
  }
  const stampDate = () => `${now.getDate()} ${MONTHS[lang][now.getMonth()]} ${now.getFullYear()}`;
  const version = `v${now.getFullYear()}.${pad2(now.getMonth() + 1)}`;
  const listJoin = arr => arr.length < 2 ? arr.join('') : `${arr.slice(0, -1).join(', ')} ${u('and')} ${arr[arr.length - 1]}`;
  const fmtNum = v => (typeof v === 'number' ? v.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR') : t(v));

  /* ---------- ícones ---------- */
  const ICON = {
    pdf: '<path d="M4 1.75h5.25L12.5 5v9.25H4z"/><path d="M9 1.75V5.25h3.5M6.25 8.5h4M6.25 11h4"/>',
    linkedin: '<rect x="1.75" y="1.75" width="12.5" height="12.5" rx="2"/><path d="M5.2 7v4.6M8 11.6V7m0 2.2c0-1.4.9-2.3 2-2.3s1.9.8 1.9 2.2v2.5"/><circle cx="5.2" cy="4.9" r=".45" fill="currentColor"/>',
    email: '<rect x="1.75" y="3.25" width="12.5" height="9.5" rx="1"/><path d="m2.25 4 5.75 4.5L13.75 4"/>',
    github: '<path d="M5.5 4 2 8l3.5 4M10.5 4 14 8l-3.5 4"/>',
    down: '<path d="M8 2.5v10.5m0 0-4-4m4 4 4-4"/>',
    play: '<path d="M4.5 3v10l8-5z" fill="currentColor" stroke="none"/>',
    restart: '<path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v2.75h-2.75"/>',
    nb: '<rect x="2.25" y="1.75" width="11.5" height="12.5" rx="1"/><path d="M5 1.75v12.5M7.5 5h4M7.5 7.5h4"/>'
  };
  const icon = k => `<svg class="ic" viewBox="0 0 16 16" aria-hidden="true" focusable="false">${ICON[k]}</svg>`;

  /* ---------- citações do assistente ---------- */
  const CITE_TAG = 'PRJ-\\d+|EXP-\\d+|ABOUT|STACK|EDU|CONTACT';
  const CITE_RE = new RegExp(`\\[((?:${CITE_TAG})(?:\\s*[,;]\\s*(?:${CITE_TAG}))*)\\]`, 'g');
  const CITE_ID = { ABOUT: 'resumo', STACK: 'metodos', EDU: 'formacao', CONTACT: 'contato' };
  const citeId = tag => CITE_ID[tag] || tag.toLowerCase();

  /* =======================================================================
     RENDER
     ======================================================================= */
  let counters, secNo, navItems;

  // Hospedagem só estática (GitHub Pages, arquivo aberto direto) não tem o /api/ask: o assistente
  // some sozinho e a ontologia ganha um apêndice próprio. Na Vercel ele volta sem mudar nada.
  // ?static=1 simula isso localmente.
  const staticHost = location.protocol === 'file:' || /\.github\.io$/i.test(location.hostname)
    || new URLSearchParams(location.search).has('static');

  function sectionsPlan() {
    const askOn = (!C.assistant || C.assistant.enabled !== false) && !staticHost;
    const ontOn = !askOn && eggOn('ontology');
    const eduOn = (C.education || []).length || (C.certifications || []).length || (C.activities && (C.activities.items || []).length);
    const refsOn = L.email || L.linkedin || L.github || cvHref('pt') || cvHref('en');
    const plan = [
      { key: 'intro', id: 'introducao', on: true },
      { key: 'systems', id: 'sistemas', on: (C.projects || []).length > 0 },
      { key: 'methods', id: 'metodos', on: (C.skills || []).length > 0 },
      { key: 'exp', id: 'experiencia', on: (C.experience || []).length > 0 },
      { key: 'edu', id: 'formacao', on: !!eduOn }
    ].filter(s => s.on);
    secNo = {};
    plan.forEach((s, i) => { secNo[s.key] = String(i + 1); });
    navItems = plan.map(s => ({ id: s.id, n: secNo[s.key], label: u('nav')[s.key] }));
    if (refsOn) navItems.push({ id: 'contato', n: '', label: u('nav').refs });
    // Apêndices: as letras seguem a ordem dos que estiverem ligados (A, B, C...).
    const suppOn = eggOn('evallab'), graphOn = eggOn('langgraph');
    [askOn && ['apendice-a', 'ask'], ontOn && ['apendice-ont', 'ont'], suppOn && ['apendice-b', 'supp'], graphOn && ['apendice-c', 'graph']]
      .filter(Boolean).forEach(([id, key], i) => navItems.push({ id, n: 'ABCDE'[i], label: u('nav')[key] }));
    return { askOn, ontOn, refsOn, suppOn, graphOn };
  }

  // Easter eggs em módulos separados (eggs/*.js): cada um se registra em window.ArtigoEggs[nome]
  // e recebe um contêiner vazio, já numerado, para desenhar a própria figura ou tabela.
  const eggOn = name => typeof (window.ArtigoEggs || {})[name] === 'function';
  const eggSlot = (name, n) => `<div class="egg" data-egg="${name}" data-n="${esc(n)}"></div>`;

  const xref = (href, text) => `<a class="xref" href="#${href}">${esc(text).replace(/ /g, '&nbsp;')}</a>`;
  const secHead = (key, id, extra = '') =>
    `<h2 class="sec-h" id="${id}-h"><span class="sec-n">${esc(secNo[key])}</span> <span class="sec-t">${esc(u('sec')[key])}</span>${extra}</h2>`;

  function frontHTML() {
    const tl = paperTitle();
    const role = roleRow ? t(roleRow.v) : [t(C.role), currentJob && t(currentJob.org)].filter(Boolean).join(' · ');
    const base = baseRow ? t(baseRow.v) : '';
    const bio = t(C.about && C.about.bio) || [];
    const kws = String(t(C.focus) || '').split(/\s*·\s*/).filter(Boolean);
    const meta = datasheet.filter(r => r !== roleRow && r !== baseRow);
    const cv = cvHref(lang);
    const fnMark = `<sup class="fn-mark"><a href="#fn-1" id="fnref-1" aria-label="${esc(u('note'))} 1">*</a></sup>`;

    const ctas = [
      cv && `<a class="cta cta-primary" href="${esc(cv)}" download>${icon('pdf')}<span>${esc(u('ctaPdf'))}</span><small>${esc(u('ctaPdfSub'))}</small></a>`,
      L.linkedin && `<a class="cta" href="${esc(L.linkedin)}" target="_blank" rel="noopener">${icon('linkedin')}<span>${esc(u('ctaLinkedin'))}</span></a>`,
      L.email && `<a class="cta" href="mailto:${esc(L.email)}">${icon('email')}<span>${esc(u('ctaEmail'))}</span></a>`,
      L.github && `<a class="cta" href="${esc(L.github)}" target="_blank" rel="noopener">${icon('github')}<span>${esc(u('ctaGithub'))}</span></a>`,
      (C.projects || []).length && `<a class="cta" href="#sistemas">${icon('down')}<span>${esc(u('ctaProjects'))}</span></a>`
    ].filter(Boolean);

    return `
      <div class="front" id="topo">
        <p class="stamp" aria-hidden="true">${C.demo ? `<b>${esc(u('demo'))}</b> · ` : ''}<span class="sc">${esc(u('preprint'))}</span> · ${esc(version)} · [cs.AI] · ${esc(stampDate())}</p>
        <h1 class="title">
          <span class="title-main">${esc(tl.main)}${tl.sub ? ':' : fnMark}</span>${tl.sub ? ` <span class="title-sub">${esc(tl.sub)}${fnMark}</span>` : ''}
        </h1>
        <div class="authors">
          <p class="author">${esc(C.name)}</p>
          <p class="affil">
            ${role ? `<span class="affil-role">${esc(role)}</span>` : ''}
            ${base ? `<span class="affil-base">${esc(base)}</span>` : ''}
            ${L.email ? `<a class="affil-mail" href="mailto:${esc(L.email)}">${esc(L.email)}</a>` : ''}
          </p>
        </div>
        ${ctas.length ? `<nav class="ctas" aria-label="${esc(u('ctaLabel'))}">${ctas.join('')}</nav>` : ''}
        ${bio.length ? `
        <section class="abstract" id="resumo" aria-labelledby="resumo-h">
          <h2 id="resumo-h">${esc(u('abstract'))}</h2>
          <p>${bio.map(b => esc(smart(b))).join(' ')}</p>
          ${kws.length ? `<p class="kw"><span class="kw-l">${esc(u('keywords'))} —</span> ${kws.map(esc).join(' · ')}</p>` : ''}
        </section>` : ''}
        ${meta.length || versions.length > 1 ? `
        <div class="metabox">
          ${meta.length ? `
          <section aria-labelledby="meta-h">
            <h2 class="metabox-h" id="meta-h">${esc(u('metadata'))}</h2>
            <dl>${meta.map(r => `<div${r.led ? ' class="now"' : ''}><dt>${esc(t(r.k))}</dt><dd>${r.led ? '<i class="dot" aria-hidden="true"></i>' : ''}${esc(t(r.v))}</dd></div>`).join('')}</dl>
          </section>` : ''}
          ${versions.length > 1 ? historyHTML() : ''}
        </div>` : ''}
      </div>`;
  }

  function historyHTML() {
    const last = versions.length;
    return `
          <section class="hist" aria-labelledby="hist-h">
            <h2 class="metabox-h" id="hist-h">${esc(u('history'))}</h2>
            <ol>${versions.map((v, k) => `
              <li><button type="button" class="hist-b" data-hist="${k + 1}" aria-label="${esc(u('diffLabel', `v${k + 1}`))}: ${esc(t(v.j.title))}, ${esc(orgShort(v.j))}">
                <span class="hist-n">[v${k + 1}]</span> <span class="hist-d">${esc(fmtYM(v.j.start))}${k + 1 === last && !v.j.end ? ` · ${esc(u('histCurrent'))}` : ''}</span>
                <span class="hist-t">${esc(t(v.j.title))}, ${esc(orgShort(v.j))}</span>
              </button></li>`).join('')}</ol>
            <p class="hist-hint">${esc(u('histHint'))}</p>
          </section>`;
  }

  function introHTML() {
    const parts = ['systems', 'methods', 'exp', 'edu'].filter(k => secNo[k])
      .map(k => `${u('introParts')[k]} (${xref(k === 'systems' ? 'sistemas' : k === 'methods' ? 'metodos' : k === 'exp' ? 'experiencia' : 'formacao', `${u('section')} ${secNo[k]}`)})`);
    const stats = (C.stats || []).filter(s => has(s.value));
    const principles = (C.about && C.about.principles) || [];
    const suppItem = navItems.find(i => i.id === 'apendice-b');
    const suppRef = suppItem ? `${u('appendixRef')} ${suppItem.n}` : '';
    let statsHTML = '';
    if (stats.length) {
      const n = ++counters.tab;
      statsHTML = `
        <figure class="tbl stats-fig" id="tab-${n}">
          <figcaption class="cap"><span class="cap-l">${esc(u('table'))} ${n}:</span> ${esc(u('statsCaption'))}</figcaption>
          <ul class="stats">${stats.map(s => `<li><span class="stat-v">${esc(t(s.value))}</span> <span class="stat-d">${esc(t(s.label))}</span></li>`).join('')}</ul>
        </figure>`;
    }
    const askRef = navItems.some(i => i.id === 'apendice-a') ? u('introAsk', xref('apendice-a', `${u('appendixRef')} A`)) : '';
    return `
      <section class="sec" id="introducao" aria-labelledby="introducao-h">
        ${secHead('intro', 'introducao')}
        ${parts.length ? `<p>${u('introLead', listJoin(parts))}${askRef}</p>` : ''}
        ${stats.length ? `<p>${u('statsLead', xref(`tab-${counters.tab}`, `${u('table')} ${counters.tab}`))}</p>` : ''}
        ${statsHTML}
        ${principles.map((p, i) => `
          <div class="thm" id="principio-${i + 1}">
            <p><span class="thm-h">${esc(u('principle'))} ${i + 1}</span> <span class="thm-n">(${esc(t(p.title))}).</span> <em>${tx(p.text)}</em>${suppRef && /estat|statist/i.test(t(p.title)) ? ` (${esc(u('seeAlso'))} ${xref('apendice-b', suppRef)})` : ''}</p>
          </div>`).join('')}
      </section>`;
  }

  /* ---------- Seção: sistemas ---------- */
  const SHAPE_KEYS = ['term', 'io', 'proc', 'sub', 'decision', 'doc', 'store'];

  function legendHTML() {
    const used = new Set();
    (C.projects || []).forEach(p => (p.flow || []).forEach(n => {
      used.add(n.shape);
      if (n.via) used.add(n.via.shape);
      if (n.branch) used.add(n.branch.shape);
    }));
    const keys = SHAPE_KEYS.filter(k => used.has(k));
    if (!keys.length) return '';
    return `
      <div class="sn legend" aria-hidden="true">
        <p class="sn-h">${esc(u('legend'))}</p>
        <ul>${keys.map(k => `<li>${glyphSVG(k)}<span>${esc(u('shapes')[k])}</span></li>`).join('')}</ul>
      </div>`;
  }

  function metricsHTML(p) {
    const ms = (p.metrics || []).filter(m => m && (m.value !== undefined || (m.before !== undefined && m.after !== undefined)));
    if (!ms.length) return '';
    const n = ++counters.tab;
    const ba = ms.some(m => m.value === undefined);
    const col = u('col');
    const fmt = (m, v) => `${m.prefix || ''}${fmtNum(v)}${t(m.unit)}`;
    const delta = m => {
      if (has(m.delta)) return t(m.delta);
      if (typeof m.before !== 'number' || typeof m.after !== 'number' || !m.before) return '—';
      const pct = Math.round((m.after - m.before) / m.before * 100);
      return `${pct > 0 ? '+' : pct < 0 ? '−' : ''}${Math.abs(pct)}%`;
    };
    const head = ba ? [col.metric, col.before, col.after, col.delta] : [col.metric, col.value];
    const rows = ms.map(m => ba
      ? `<tr><th scope="row">${esc(t(m.label))}</th>${m.value !== undefined
        ? `<td class="r">—</td><td class="r">${esc(fmt(m, m.value))}</td><td class="r">—</td>`
        : `<td class="r">${esc(fmt(m, m.before))}</td><td class="r">${esc(fmt(m, m.after))}</td><td class="r">${esc(delta(m))}</td>`}</tr>`
      : `<tr><th scope="row">${esc(t(m.label))}</th><td class="r num">${esc(fmt(m, m.value))}</td></tr>`).join('');
    return `
      <div class="tbl-wrap">
        <table class="bt" id="tab-${n}">
          <caption class="cap"><span class="cap-l">${esc(u('table'))} ${n}:</span> ${esc(u('metricsCaption', t(p.title)))}</caption>
          <thead><tr>${head.map((h, j) => `<th scope="col"${j ? ' class="r"' : ''}>${esc(h)}</th>`).join('')}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  function flowDescHTML(flow) {
    return `<ol class="sr-only" aria-label="${esc(u('figDesc'))}">${flow.map(n => `<li>${n.edge ? `${esc(t(n.edge))}: ` : ''}${esc(u('shapes')[n.shape] || '')}: ${esc(t(n.text))}${n.via ? ` (${esc(u('figVia'))}: ${esc(t(n.via.text))})` : ''}${n.branch ? ` (${esc(u('figBranch'))}, ${esc(t(n.branch.edge))}: ${esc(t(n.branch.text))})` : ''}</li>`).join('')}</ol>`;
  }

  function projectHTML(p, i) {
    const pid = String(p.id || `prj-${pad2(i + 1)}`).toLowerCase();
    const num = `${secNo.systems}.${i + 1}`;
    const building = p.stage === 'building';
    const flow = (p.flow || []).filter(n => n && has(n.text));
    let fig = '';
    if (flow.length) {
      const n = ++counters.fig;
      const hasVia = flow.some(s => s.via);
      fig = `${n === 1 ? legendHTML() : ''}
        <figure class="fig" id="fig-${n}">
          <div class="fig-canvas" data-prj="${i}" style="min-height:${flow.length * 72}px"></div>
          ${flowDescHTML(flow)}
          <figcaption class="cap"><span class="cap-l">${esc(u('figure'))} ${n}:</span> ${esc(u('figCaption', t(p.title), hasVia))}</figcaption>
        </figure>`;
    }
    const links = (p.links || []).filter(l => l && l.url && l.url !== '#');
    const org = t(p.org);
    return `
      <article class="prj" id="${esc(pid)}" aria-labelledby="${esc(pid)}-h">
        <div class="has-meta">
          <h3 class="sub-h" id="${esc(pid)}-h"><span class="sub-n">${esc(num)}</span> ${esc(t(p.title))}</h3>
          <p class="meta">
            <span class="meta-id">${esc(p.id || '')}</span>
            ${[p.year, org].filter(Boolean).length ? `<span>${esc([p.year, org].filter(Boolean).join(' · '))}</span>` : ''}
            ${has(p.status) ? `<span class="status${building ? ' is-building' : ''}"><i class="dot" aria-hidden="true"></i>${esc(t(p.status))}</span>` : ''}
          </p>
        </div>
        ${has(p.summary) ? `<p class="lead">${tx(p.summary)}</p>` : ''}
        ${has(p.problem) ? `<p class="para"><span class="run-in">${esc(u('problem'))}.</span> ${tx(p.problem)}</p>` : ''}
        ${has(p.solution) ? `<p class="para"><span class="run-in">${esc(u('solution'))}.</span> ${tx(p.solution)}</p>` : ''}
        ${fig}
        ${metricsHTML(p)}
        ${(p.stack || []).length ? `<p class="stack"><span class="run-in">${esc(u('stack'))}:</span> ${p.stack.map(s => `<span class="kw-sc">${esc(t(s))}</span>`).join('<span class="sep" aria-hidden="true"> · </span>')}</p>` : ''}
        ${links.length ? `<p class="stack"><span class="run-in">${esc(u('links'))}:</span> ${links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(t(l.label) || l.url)}</a>`).join(' · ')}</p>` : ''}
      </article>`;
  }

  function systemsHTML() {
    return `
      <section class="sec" id="sistemas" aria-labelledby="sistemas-h">
        ${secHead('systems', 'sistemas')}
        <p>${esc(u('systemsLead'))}</p>
        ${C.projects.map(projectHTML).join('')}
      </section>`;
  }

  /* ---------- Seção: métodos ---------- */
  const dots = lvl => {
    const n = Math.max(0, Math.min(3, Number(lvl) || 0));
    return `<span class="lv" aria-hidden="true">${[1, 2, 3].map(i => `<i${i <= n ? ' class="on"' : ''}></i>`).join('')}</span><span class="sr-only">${esc(u('levelOf', n, u('levels')[n] || ''))}</span>`;
  };

  function methodsHTML() {
    const n = ++counters.tab;
    const levels = u('levels');
    const groups = C.skills.filter(g => (g.items || []).length);
    return `
      <section class="sec" id="metodos" aria-labelledby="metodos-h">
        ${secHead('methods', 'metodos')}
        <p>${u('methodsLead', xref(`tab-${n}`, `${u('table')} ${n}`))}</p>
        <figure class="tbl skills-fig" id="tab-${n}">
          <figcaption class="cap"><span class="cap-l">${esc(u('table'))} ${n}:</span> ${esc(u('skillsCaption'))}</figcaption>
          <div class="skills-grid">
            ${groups.map(g => `
              <table class="bt skills">
                <thead><tr><th scope="col" class="grp">${esc(t(g.group))}</th><th scope="col" class="r"><span class="sr-only">${esc(u('col').level)}</span></th></tr></thead>
                <tbody>${g.items.map(([name, lvl]) => `<tr><th scope="row">${esc(t(name))}</th><td class="r">${dots(lvl)}</td></tr>`).join('')}</tbody>
              </table>`).join('')}
          </div>
          <p class="lv-legend">${[3, 2, 1].map(l => `<span>${dots(l).replace(/<span class="sr-only">.*?<\/span>/, '')} ${esc(levels[l])}</span>`).join('')}</p>
        </figure>
        ${eggOn('kmeans') ? eggSlot('kmeans', ++counters.fig) : ''}
      </section>`;
  }

  /* ---------- Seção: experiência ---------- */
  function expHTML() {
    return `
      <section class="sec" id="experiencia" aria-labelledby="experiencia-h">
        ${secHead('exp', 'experiencia')}
        <ol class="exp">
          ${C.experience.map((j, i) => {
            const bullets = t(j.bullets) || [];
            const dates = `${fmtYM(j.start)} – ${j.end ? fmtYM(j.end) : u('present')}`;
            const dur = duration(j.start, j.end);
            return `
            <li class="exp-i" id="${expId(i)}">
              <div class="has-meta">
                <h3 class="exp-h"><span class="exp-t">${esc(t(j.title))}</span><span class="exp-sep">, </span><span class="exp-o">${esc(t(j.org))}</span></h3>
                <p class="meta">
                  <span class="meta-date">${esc(dates)}${!j.end ? ' <i class="dot" aria-hidden="true"></i>' : ''}</span>
                  ${dur ? `<span class="meta-dur">${esc(dur)}</span>` : ''}
                  <span class="meta-id">EXP-${pad2(i + 1)}</span>
                </p>
              </div>
              ${bullets.length ? `<ul class="bul">${bullets.map(b => `<li>${esc(smart(b))}</li>`).join('')}</ul>` : ''}
            </li>`;
          }).join('')}
        </ol>
      </section>`;
  }

  /* ---------- Seção: formação ---------- */
  function entriesHTML(list) {
    return `<ul class="entries">${list.map(e => `
      <li class="has-meta">
        <p class="ent"><span class="ent-t">${esc(t(e.title))}</span>${has(e.org) ? `. <span class="ent-o">${esc(t(e.org))}</span>` : ''}.</p>
        ${has(e.year) ? `<p class="meta"><span class="meta-date">${esc(t(e.year))}</span></p>` : ''}
      </li>`).join('')}</ul>`;
  }

  function eduHTML() {
    const subs = [];
    if ((C.education || []).length) subs.push([u('education'), C.education]);
    if ((C.certifications || []).length) subs.push([u('certifications'), C.certifications]);
    if (C.activities && (C.activities.items || []).length) subs.push([t(C.activities.title), C.activities.items]);
    return `
      <section class="sec" id="formacao" aria-labelledby="formacao-h">
        ${secHead('edu', 'formacao')}
        ${subs.map(([title, list], i) => `
          <h3 class="sub-h"><span class="sub-n">${esc(secNo.edu)}.${i + 1}</span> ${esc(title)}</h3>
          ${entriesHTML(list)}`).join('')}
      </section>`;
  }

  /* ---------- Referências ---------- */
  function refsHTML() {
    const refs = [];
    const R = u('ref');
    const pretty = url => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    if (L.linkedin) refs.push([R.linkedin, L.linkedin, pretty(L.linkedin), true]);
    if (cvHref('pt')) refs.push([R.cvPt, cvHref('pt'), cvHref('pt'), false]);
    if (cvHref('en') && cvHref('en') !== cvHref('pt')) refs.push([R.cvEn, cvHref('en'), cvHref('en'), false]);
    if (L.github) refs.push([R.github, L.github, pretty(L.github), true]);
    if (L.email) refs.push([R.email, `mailto:${L.email}`, L.email, false]);
    const lead = t(C.contact && C.contact.lead);
    return `
      <section class="sec refs" id="contato" aria-labelledby="contato-h">
        <h2 class="sec-h" id="contato-h"><span class="sec-t">${esc(u('sec').refs)}</span></h2>
        ${lead || L.email ? `<p class="corr"><span class="run-in">${esc(u('refsLead'))}.</span> ${esc(C.name)}${baseRow ? `, ${esc(t(baseRow.v))}` : ''}${L.email ? `; <a href="mailto:${esc(L.email)}" class="mono-link">${esc(L.email)}</a>` : ''}.${lead ? ` ${esc(smart(lead))}` : ''}</p>` : ''}
        ${eggOn('confusion') ? eggSlot('confusion', ++counters.tab) : ''}
        <ol class="bib">${refs.map(([title, href, shown, ext], i) => `
          <li id="ref-${i + 1}"><span class="bib-n" aria-hidden="true">[${i + 1}]</span>
            <span class="bib-b">${esc(authorShort)}. <cite>${esc(title)}</cite>. <a href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}${/\.pdf$/i.test(href) ? ' download' : ''} class="url">${esc(shown)}</a></span>
          </li>`).join('')}</ol>
      </section>`;
  }

  /* ---------- Apêndice A: notebook ---------- */
  function askHTML() {
    const sugg = ((C.assistant && C.assistant.suggestions) || []).map(t).filter(Boolean);
    return `
      <section class="sec appendix" id="apendice-a" aria-labelledby="apendice-a-h">
        <h2 class="sec-h" id="apendice-a-h"><span class="sec-n">A</span> <span class="sec-t">${esc(u('sec').ask)}</span></h2>
        <p>${esc(u('askLead'))}<sup class="fn-mark"><a href="#fn-2" id="fnref-2" aria-label="${esc(u('note'))} 2">†</a></sup></p>
        <div class="nb" id="nb">
          <div class="nb-bar">
            <span class="nb-file">${icon('nb')}${esc(u('nbFile'))}</span>
            <span class="nb-kernel"><span class="nb-kname">${esc(u('nbKernel'))}</span><span class="nb-state" id="nb-state"><i aria-hidden="true"></i><span>${esc(u(ask.busy ? 'nbBusy' : 'nbIdle'))}</span></span></span>
            <button type="button" class="nb-btn" id="nb-restart">${icon('restart')}<span>${esc(u('nbRestart'))}</span></button>
          </div>
          <div class="nb-md"><p>${esc(u('nbIntro'))}</p></div>
          <div class="nb-log" id="nb-log" role="log" aria-label="${esc(u('nbLog'))}" aria-busy="false" tabindex="-1"></div>
          <form class="nb-row nb-in nb-input" id="nb-form" autocomplete="off">
            <div class="nb-p" aria-hidden="true">In&nbsp;[&nbsp;]:</div>
            <div class="nb-src nb-edit">
              <label class="sr-only" for="nb-q">${esc(u('nbInput'))}</label>
              <input id="nb-q" name="q" type="text" maxlength="600" spellcheck="false" placeholder="${esc(u('nbPlaceholder'))}">
              <button type="submit" class="nb-run" id="nb-run">${icon('play')}<span>${esc(u('nbRun'))}</span></button>
            </div>
          </form>
          ${sugg.length ? `
          <div class="nb-chips">
            <p class="nb-chips-l" id="nb-chips-l">${esc(u('nbSuggest'))}</p>
            <ul aria-labelledby="nb-chips-l">${sugg.map(s => `<li><button type="button" class="chip" data-ask="${esc(s)}">${esc(s)}</button></li>`).join('')}</ul>
          </div>` : ''}
        </div>
        ${eggOn('ontology') ? eggSlot('ontology', 'A.1') : ''}
      </section>`;
  }

  /* ---------- Apêndices B e C: módulos eggs/evallab.js e eggs/langgraph.js ---------- */
  function eggAppendixHTML(id, key, egg, num) {
    const item = navItems.find(i => i.id === id);
    return `
      <section class="sec appendix" id="${id}" aria-labelledby="${id}-h">
        <h2 class="sec-h" id="${id}-h"><span class="sec-n">${esc(item.n)}</span> <span class="sec-t">${esc(u('sec')[key])}</span></h2>
        ${num ? `<p>${esc(u('ontLead'))}</p>` : ''}
        ${eggSlot(egg, num ? `${item.n}.1` : item.n)}
      </section>`;
  }

  /* ---------- páginas ---------- */
  function runningHead(right) {
    return `<div class="rh" aria-hidden="true"><span>${esc(C.name)} · ${esc(t(C.role))}</span><span>${esc(right)}</span></div>`;
  }
  const folio = n => `<div class="folio" aria-hidden="true">${n}</div>`;

  function render() {
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
    document.documentElement.setAttribute('data-lang', lang);
    document.title = `${C.name} — ${t(C.role)}`;
    const md = $('meta[name="description"]');
    if (md && has(C.tagline)) md.setAttribute('content', `${C.name}, ${t(C.role)}. ${t(C.tagline)}`);

    counters = { tab: 0, fig: 0 };
    const { askOn, ontOn, refsOn, suppOn, graphOn } = sectionsPlan();
    const sec = u('sec');
    const head = k => `${secNo[k]} ${sec[k]}`;

    const p1 = frontHTML() + introHTML();
    const p2 = secNo.systems ? systemsHTML() : '';
    const p3 = (secNo.methods ? methodsHTML() : '') + (secNo.exp ? expHTML() : '');
    const p4 = (secNo.edu ? eduHTML() : '') + (refsOn ? refsHTML() : '') + (askOn ? askHTML() : '') + (ontOn ? eggAppendixHTML('apendice-ont', 'ont', 'ontology', true) : '') + (suppOn ? eggAppendixHTML('apendice-b', 'supp', 'evallab') : '')
      + (graphOn ? eggAppendixHTML('apendice-c', 'graph', 'langgraph') : '');
    const notes1 = `<div class="fn-area"><p id="fn-1"><sup>*</sup> ${esc(u('titleNote'))} <a href="#fnref-1" class="fn-back" aria-label="${esc(u('back'))}">↩</a></p></div>`;
    const notes4 = askOn ? `<div class="fn-area"><p id="fn-2"><sup>†</sup> ${esc(u('askNote'))} <a href="#fnref-2" class="fn-back" aria-label="${esc(u('back'))}">↩</a></p></div>` : '';
    const colophon = `<p class="colophon">${esc(u('colophonSrc'))} <button type="button" class="linkish" data-open-src>${esc(u('colophonLink'))}</button>.</p>`;

    const pages = [
      { html: p1, rh: '', foot: notes1 },
      { html: p2, rh: secNo.systems ? head('systems') : '' },
      { html: p3, rh: [secNo.methods && head('methods'), secNo.exp && head('exp')].filter(Boolean).join(' · ') },
      { html: p4, rh: secNo.edu ? head('edu') : (refsOn ? sec.refs : sec.ask), foot: notes4 + colophon }
    ].filter(p => p.html.trim());

    paper.innerHTML = pages.map((p, i) => `
      <div class="page${i === 0 ? ' page-1' : ''}">
        ${i > 0 ? runningHead(p.rh) : ''}
        <div class="col">${p.html}</div>
        ${p.foot || ''}
        ${folio(i + 1)}
      </div>`).join('');

    renderBar();
    runEggs();
    if (askOn) { bindAsk(); renderLog(); }
    drawFigures();
    setupSpy();
    setupScrollables();
    tuneJustify();
  }

  function runEggs() {
    const E = window.ArtigoEggs || {};
    const ctx = { lang, C, t, esc, smart, reduced: reducedMQ.matches, figure: u('figure'), table: u('table'), ask: !staticHost && (!C.assistant || C.assistant.enabled !== false) };
    $$('[data-egg]').forEach(el => {
      const fn = E[el.dataset.egg];
      if (typeof fn !== 'function') return;
      try { fn(el, Object.assign({ n: el.dataset.n }, ctx)); } catch (err) { console.error(`[egg:${el.dataset.egg}]`, err); el.remove(); }
    });
  }

  // Na barra, os apêndices viram um item só ("A–C Apêndices") para caber ao lado do nome.
  const isApp = id => /^apendice-/.test(id);
  function barItems() {
    const apps = navItems.filter(i => isApp(i.id));
    const items = navItems.filter(i => !isApp(i.id));
    if (apps.length) items.push(apps.length > 1 ? { id: apps[0].id, n: `${apps[0].n}–${apps[apps.length - 1].n}`, label: u('nav').apps } : apps[0]);
    return items;
  }

  function renderBar() {
    $$('[data-ui]').forEach(el => { el.textContent = u(el.dataset.ui); });
    $$('[data-ui-label]').forEach(el => el.setAttribute('aria-label', u(el.dataset.uiLabel)));
    $$('[data-fill="name"]').forEach(el => { el.textContent = C.name; });
    $$('[data-fill="role"]').forEach(el => { el.textContent = t(C.role); });
    $$('button[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    const tex = $('#bar-tex');
    tex.setAttribute('aria-label', u('texBtn'));
    tex.title = u('texBtn');
    const pdf = $('#bar-pdf');
    const cv = cvHref(lang);
    pdf.hidden = !cv;
    if (cv) {
      pdf.href = cv;
      pdf.setAttribute('download', '');
      pdf.setAttribute('aria-label', u('pdfBarTitle'));
      pdf.title = u('pdfBarTitle');
    }
    $('#nav-list').innerHTML = barItems().map(it =>
      `<li><a href="#${it.id}">${it.n ? `<span class="nav-n">${esc(it.n)}</span> ` : ''}<span class="nav-l">${esc(it.label)}</span></a></li>`).join('');
  }

  /* =======================================================================
     FLUXOGRAMAS (SVG desenhado sob medida para a largura disponível)
     ======================================================================= */
  const SVGNS = 'http://www.w3.org/2000/svg';
  let measurer = null;
  function textWidth(str, fs) {
    if (!measurer) {
      const svg = document.createElementNS(SVGNS, 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('class', 'fg measurer');
      measurer = document.createElementNS(SVGNS, 'text');
      svg.appendChild(measurer);
      document.body.appendChild(svg);
    }
    measurer.setAttribute('font-size', fs);
    measurer.textContent = str;
    return measurer.getComputedTextLength();
  }
  function greedy(words, maxW, fs) {
    const lines = [];
    let cur = '';
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      if (!cur || textWidth(next, fs) <= maxW) cur = next;
      else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines;
  }
  // Quebra equilibrada: mesma quantidade de linhas, com a menor largura possível.
  function wrap(str, maxW, fs) {
    const words = String(str).split(/\s+/).filter(Boolean);
    const base = greedy(words, maxW, fs);
    if (base.length < 2) return base;
    let lo = maxW * 0.45, hi = maxW, best = base;
    for (let k = 0; k < 7; k++) {
      const mid = (lo + hi) / 2;
      const ls = greedy(words, mid, fs);
      if (ls.length <= base.length && ls.every(l => textWidth(l, fs) <= mid + 0.5)) { best = ls; hi = mid; } else lo = mid;
    }
    return best;
  }

  const PADS = { proc: [12, 9, 9], sub: [20, 9, 9], term: [18, 9, 9], io: [22, 9, 9], doc: [12, 8, 15], store: [12, 16, 9] };
  function nodeBox(node, width, fs) {
    const LH = Math.round(fs * 1.3);
    const shape = SHAPE_KEYS.includes(node.shape) ? node.shape : 'proc';
    const text = t(node.text);
    if (shape === 'decision') {
      const lines = wrap(text, width * 0.5, fs);
      const tw = Math.max(...lines.map(l => textWidth(l, fs)));
      const p = tw / 2 + 9, q = (lines.length * LH) / 2 + 5;
      let a = p + 2 * q, b = a / 2;
      if (a > width / 2) { a = width / 2; b = q / Math.max(0.2, 1 - p / a); }
      return { shape, lines, LH, w: 2 * a, h: 2 * b, a, b, padTop: b - (lines.length * LH) / 2 };
    }
    const [px, pt, pb] = PADS[shape];
    const lines = wrap(text, width - 2 * px, fs);
    return { shape, lines, LH, w: width, h: pt + lines.length * LH + pb, padTop: pt };
  }

  const R = v => Math.round(v) + 0.5;
  function shapeSVG(b, extraClass = '') {
    const x = R(b.x), y = R(b.y), w = Math.round(b.w), h = Math.round(b.h);
    const cls = `fg-n fg-${b.shape} ${extraClass}`;
    switch (b.shape) {
      case 'term': return `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(h / 2, 20)}"/>`;
      case 'sub': return `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}"/><path class="fg-l" d="M${x + 7} ${y}V${y + h}M${x + w - 7} ${y}V${y + h}"/>`;
      case 'io': { const k = Math.min(12, h * 0.3); return `<path class="${cls}" d="M${x + k} ${y}H${x + w}L${x + w - k} ${y + h}H${x}Z"/>`; }
      case 'doc': { const a = Math.min(6, h * 0.12), yb = y + h - a; return `<path class="${cls}" d="M${x} ${y}H${x + w}V${yb}Q${x + w * 0.75} ${yb + 2 * a} ${x + w / 2} ${yb}T${x} ${yb}Z"/>`; }
      case 'store': {
        const ry = Math.min(6, h * 0.14), rx = w / 2;
        return `<path class="${cls}" d="M${x} ${y + ry}V${y + h - ry}A${rx} ${ry} 0 0 0 ${x + w} ${y + h - ry}V${y + ry}A${rx} ${ry} 0 0 0 ${x} ${y + ry}Z"/><path class="fg-l" d="M${x} ${y + ry}A${rx} ${ry} 0 0 0 ${x + w} ${y + ry}"/>`;
      }
      case 'decision': { const cx = x + w / 2, cy = y + h / 2; return `<path class="${cls}" d="M${cx} ${y}L${x + w} ${cy}L${cx} ${y + h}L${x} ${cy}Z"/>`; }
      default: return `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
    }
  }
  function labelSVG(b, fs) {
    const cx = b.x + b.w / 2;
    const top = b.y + b.padTop;
    return b.lines.map((l, i) => `<text class="fg-t" x="${cx.toFixed(1)}" y="${(top + i * b.LH + b.LH / 2 + fs * 0.34).toFixed(1)}" font-size="${fs}" text-anchor="middle">${esc(l)}</text>`).join('');
  }
  const bottomOf = b => b.y + b.h - (b.shape === 'doc' ? Math.min(6, b.h * 0.12) : 0);
  const rightAt = b => b.x + b.w - (b.shape === 'io' ? Math.min(12, b.h * 0.3) / 2 : 0);

  let figSeq = 0;
  function flowSVG(flow, W) {
    const narrow = W < 540;
    const fs = narrow ? 12.5 : 14;
    const efs = narrow ? 10.5 : 11.5;
    const hasSide = flow.some(n => n.via || n.branch);
    const gapX = narrow ? 30 : 56;
    let mainW, sideW, x0;
    if (hasSide) {
      mainW = narrow ? Math.floor((W - gapX) * 0.56) : Math.min(290, Math.floor((W - gapX) * 0.56));
      sideW = Math.max(96, Math.min(narrow ? 999 : 220, W - gapX - mainW - 2));
      x0 = Math.max(0, Math.floor((W - (mainW + gapX + sideW)) / 2));
    } else {
      mainW = Math.min(300, W - 2); sideW = 0; x0 = Math.floor((W - mainW) / 2);
    }
    const cx = x0 + mainW / 2, sx = x0 + mainW + gapX;
    const rows = [];
    let y = 1;
    flow.forEach((n, i) => {
      const m = nodeBox(n, mainW, fs);
      const sideNode = n.via || n.branch;
      const s = sideNode ? nodeBox(sideNode, sideW, fs) : null;
      if (i > 0) y += n.edge ? (narrow ? 30 : 34) : (narrow ? 22 : 26);
      const rowH = Math.max(m.h, s ? s.h : 0);
      m.x = cx - m.w / 2; m.y = y + (rowH - m.h) / 2;
      if (s) { s.x = sx; s.y = y + (rowH - s.h) / 2; }
      rows.push({ m, s, kind: n.via ? 'via' : n.branch ? 'branch' : '', sEdge: n.branch && t(n.branch.edge), edge: n.edge && t(n.edge) });
      y += rowH;
    });
    const H = Math.ceil(y + 2);
    const id = `ah${++figSeq}`;
    let out = `<defs><marker id="${id}" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path class="fg-ah" d="M0 1.2 10 5 0 8.8 2.6 5z"/></marker></defs>`;
    rows.forEach((r, i) => {
      if (i > 0) {
        const prev = rows[i - 1].m;
        const y1 = bottomOf(prev), y2 = r.m.y;
        out += `<path class="fg-l" d="M${R(cx)} ${y1.toFixed(1)}V${(y2 - 0.6).toFixed(1)}" marker-end="url(#${id})"/>`;
        if (r.edge) out += `<text class="fg-e" x="${(cx + 8).toFixed(1)}" y="${((y1 + y2) / 2 + efs * 0.36).toFixed(1)}" font-size="${efs}">${esc(r.edge)}</text>`;
      }
    });
    rows.forEach(r => {
      out += shapeSVG(r.m) + labelSVG(r.m, fs);
      if (r.s) {
        const cy = R(r.m.y + r.m.h / 2);
        const xr = rightAt(r.m);
        if (r.kind === 'via') {
          out += `<path class="fg-l fg-dash" d="M${r.s.x.toFixed(1)} ${cy}H${(xr + 0.6).toFixed(1)}" marker-end="url(#${id})"/>`;
        } else {
          out += `<path class="fg-l" d="M${xr.toFixed(1)} ${cy}H${(r.s.x - 0.6).toFixed(1)}" marker-end="url(#${id})"/>`;
          if (r.sEdge) out += `<text class="fg-e" x="${((xr + r.s.x) / 2).toFixed(1)}" y="${(cy - 6).toFixed(1)}" font-size="${efs}" text-anchor="middle">${esc(r.sEdge)}</text>`;
        }
        out += shapeSVG(r.s, r.kind === 'via' ? 'fg-side' : '') + labelSVG(r.s, fs);
      }
    });
    return `<svg class="fg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">${out}</svg>`;
  }

  // Miniaturas para a legenda dos símbolos.
  function glyphSVG(shape) {
    const b = { shape, x: 1, y: 2, w: 30, h: 16 };
    if (shape === 'decision') { b.x = 4; b.w = 24; b.y = 1; b.h = 18; }
    return `<svg class="fg glyph" width="32" height="20" viewBox="0 0 32 20" aria-hidden="true" focusable="false">${shapeSVG(b)}</svg>`;
  }

  const figWidths = new WeakMap();
  function drawFigure(canvas, force) {
    const p = C.projects[Number(canvas.dataset.prj)];
    if (!p) return;
    const W = Math.floor(canvas.clientWidth);
    if (!W || (!force && figWidths.get(canvas) === W)) return;
    figWidths.set(canvas, W);
    canvas.innerHTML = flowSVG((p.flow || []).filter(n => n && has(n.text)), W);
    canvas.style.minHeight = '';
  }
  let fontsReady = false;
  const ro = 'ResizeObserver' in window ? new ResizeObserver(entries => {
    if (!fontsReady) return;
    entries.forEach(e => drawFigure(e.target, false));
  }) : null;
  function drawFigures() {
    const canvases = $$('.fig-canvas');
    if (ro) canvases.forEach(c => ro.observe(c));
    if (fontsReady) canvases.forEach(c => drawFigure(c, true));
  }
  const fontLoad = (document.fonts && document.fonts.load)
    ? Promise.all([document.fonts.load('400 14px Newsreader'), document.fonts.load('400 12.5px Newsreader')]).catch(() => null)
    : Promise.resolve();
  Promise.race([fontLoad, new Promise(r => setTimeout(r, 2500))]).then(() => {
    fontsReady = true;
    $$('.fig-canvas').forEach(c => drawFigure(c, true));
    tuneJustify();
  });
  if (document.fonts && document.fonts.addEventListener) {
    document.fonts.addEventListener('loadingdone', () => { if (fontsReady) $$('.fig-canvas').forEach(c => drawFigure(c, true)); });
  }
  if (!ro) window.addEventListener('resize', () => $$('.fig-canvas').forEach(c => drawFigure(c, false)));

  // Tabelas que não couberem rolam dentro do próprio contêiner (e ficam acessíveis por teclado).
  function setupScrollables() {
    $$('.tbl-wrap').forEach(el => {
      if (el.scrollWidth > el.clientWidth + 1) el.setAttribute('tabindex', '0'); else el.removeAttribute('tabindex');
    });
  }
  // Justificação só em parágrafos de 3+ linhas: em 2 linhas a única linha justificada fica frouxa ("underfull hbox").
  function tuneJustify() {
    $$('.sec > p, .prj > p.para, .prj > p.lead, .abstract > p:not(.kw), .corr, .bul li, .thm p').forEach(el => {
      el.classList.remove('rag');
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 28;
      if (Math.round(el.getBoundingClientRect().height / lh) < 3) el.classList.add('rag');
    });
  }
  window.addEventListener('resize', () => {
    clearTimeout(setupScrollables.t);
    setupScrollables.t = setTimeout(() => { setupScrollables(); tuneJustify(); }, 150);
  });

  /* =======================================================================
     APÊNDICE A — "Pergunte ao meu currículo" (POST /api/ask, NDJSON)
     ======================================================================= */
  const ASK_URL = '/api/ask';
  const ask = { entries: [], history: [], busy: false, n: 0 };
  let logEl = null;

  function contactHTML() {
    if (L.email) return `<a href="mailto:${esc(L.email)}">${esc(L.email)}</a>`;
    if (L.linkedin) return `<a href="${esc(L.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>`;
    return '—';
  }
  const ERR_NAME = { offline: 'ConnectionError', rate_limited: 'RateLimitError', not_configured: 'KernelNotConfigured', busy: 'KernelBusyError', bad_request: 'ValueError', upstream: 'UpstreamError' };
  function errHTML(code) {
    const known = Object.prototype.hasOwnProperty.call(UI.pt.err, code) ? code : 'upstream';
    const msg = esc(u('err')[known]).replace('{contact}', contactHTML());
    const name = known === 'refusal' ? '' : `<span class="nb-ename">${esc(ERR_NAME[known] || 'UpstreamError')}</span> `;
    return `${name}${msg}`;
  }
  function citeHTML(tag) {
    const id = citeId(tag);
    return document.getElementById(id) ? `<a class="cite" href="#${id}">${esc(tag)}</a>` : esc(tag);
  }
  function answerHTML(text) {
    let h = esc(text).replace(CITE_RE, (_, g) => `[${g.split(/\s*[,;]\s*/).map(citeHTML).join(', ')}]`);
    if (L.email) h = h.split(esc(L.email)).join(`<a href="mailto:${esc(L.email)}">${esc(L.email)}</a>`);
    return h;
  }

  function entryHTML(e) {
    if (e.kind === 'q') {
      return `<div class="nb-row nb-in"><div class="nb-p" aria-hidden="true">In&nbsp;[${e.running ? '*' : e.n}]:</div><div class="nb-src"><span class="sr-only">${esc(u('nbQ'))} </span><code><span class="tk-f">ask</span>(<span class="tk-s">"${esc(e.text)}"</span>)</code></div></div>`;
    }
    if (e.kind === 'a') {
      const body = e.thinking
        ? `<p class="nb-thinking">${esc(u('nbThinking'))}<span class="ell" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span></p>`
        : `<p class="nb-ans">${answerHTML(e.text)}${e.streaming ? '<span class="caret" aria-hidden="true"></span>' : ''}</p>`;
      return `<div class="nb-row nb-out"><div class="nb-p" aria-hidden="true">Out[${e.n}]:</div><div class="nb-res"><span class="sr-only">${esc(u('nbA'))} </span>${body}${e.truncated ? `<p class="nb-note">${esc(u('nbTruncated'))}</p>` : ''}${!e.streaming && e.trace ? traceHTML(e.trace) : ''}</div></div>`;
    }
    return `<div class="nb-row nb-err"><div class="nb-p" aria-hidden="true"></div><div class="nb-stderr" role="alert">${errHTML(e.code)}</div></div>`;
  }

  // Observabilidade: cada resposta guarda o próprio trace (latências medidas no navegador + uso de tokens do servidor).
  const fmtMs = ms => (ms >= 1000 ? `${(ms / 1000).toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR', { maximumFractionDigits: 2 })} s` : `${Math.round(ms)} ms`);
  const fmtInt = n => Number(n || 0).toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR');
  function traceHTML(tr) {
    const T = u('tr');
    const total = Math.max(tr.total, 1);
    const ttft = Math.min(tr.ttft ?? total, total);
    const spans = [
      ['POST /api/ask', 0, total, 0],
      [T.ttft, 0, ttft, 1],
      [`${T.stream} · ${T.chunks(tr.chunks)}`, ttft, total - ttft, 1]
    ];
    const us = tr.usage;
    const attrs = us && !us.mock
      ? [[T.model, us.model], [T.tin, `${fmtInt((us.input || 0) + (us.cache_read || 0) + (us.cache_write || 0))} ${T.tok}`],
        [T.cache, `${fmtInt(us.cache_read)} ${T.tok}`], [T.tout, `${fmtInt(us.output)} ${T.tok}`]]
      : [[T.model, us && us.mock ? T.mock : '—']];
    const outTok = us && !us.mock ? ` · ${fmtInt(us.output)} ${T.tok}` : '';
    return `
      <details class="nb-trace">
        <summary><span class="tr-k">${esc(T.trace)}</span> ${esc(fmtMs(total))}${esc(outTok)}</summary>
        <div class="tr-body" role="group" aria-label="${esc(T.label)}">
          <ol class="tr-spans">${spans.map(([name, start, dur, depth]) => `
            <li class="tr-span${depth ? ' tr-child' : ''}">
              <span class="tr-name">${depth ? '<i aria-hidden="true">└</i> ' : ''}${esc(name)}</span>
              <span class="tr-dur">${esc(fmtMs(dur))}</span>
              <span class="tr-track" aria-hidden="true"><b style="left:${(start / total * 100).toFixed(2)}%;width:${Math.max(dur / total * 100, .6).toFixed(2)}%"></b></span>
            </li>`).join('')}</ol>
          <dl class="tr-attrs">${attrs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        </div>
      </details>`;
  }

  const nearBottom = () => logEl.scrollHeight - logEl.scrollTop - logEl.clientHeight < 60;
  const toBottom = () => { logEl.scrollTop = logEl.scrollHeight; };
  function renderLog() {
    if (!logEl) return;
    logEl.innerHTML = ask.entries.map(entryHTML).join('');
    logEl.hidden = !ask.entries.length;
    toBottom();
  }
  function pushEntry(e) {
    ask.entries.push(e);
    logEl.hidden = false;
    logEl.insertAdjacentHTML('beforeend', entryHTML(e));
    toBottom();
  }
  function updateEntry(e) {
    const i = ask.entries.indexOf(e), el = logEl.children[i];
    if (!el) return;
    const stick = nearBottom();
    el.outerHTML = entryHTML(e);
    if (stick) toBottom();
  }
  function removeEntry(e) {
    const i = ask.entries.indexOf(e);
    if (i < 0) return;
    ask.entries.splice(i, 1);
    if (logEl.children[i]) logEl.children[i].remove();
  }
  function setBusy(b) {
    ask.busy = b;
    if (!logEl) return;
    logEl.setAttribute('aria-busy', String(b));
    const st = $('#nb-state');
    if (st) { st.classList.toggle('is-busy', b); st.lastElementChild.textContent = u(b ? 'nbBusy' : 'nbIdle'); }
    const run = $('#nb-run');
    if (run) run.disabled = b;
    $$('.chip').forEach(c => c.setAttribute('aria-disabled', String(b)));
  }

  async function readNDJSON(res, onEvent) {
    const reader = res.body.getReader(), dec = new TextDecoder();
    let buf = '';
    const flush = line => {
      line = line.trim();
      if (!line) return;
      try { onEvent(JSON.parse(line)); } catch (e) { /* linha inválida */ }
    };
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) { flush(buf.slice(0, nl)); buf = buf.slice(nl + 1); }
    }
    flush(buf + dec.decode());
  }

  async function askQuestion(raw) {
    const q = String(raw || '').trim();
    if (!q || ask.busy || !logEl) return;
    const n = ++ask.n;
    const qe = { kind: 'q', n, text: q, running: true };
    const answer = { kind: 'a', n, text: '', streaming: true, thinking: true };
    pushEntry(qe);
    pushEntry(answer);
    ask.history.push({ role: 'user', content: q });
    setBusy(true);

    let error = null;
    const t0 = performance.now();
    const trace = { chunks: 0, ttft: null, total: 0, usage: null };
    try {
      const res = await fetch(ASK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: ask.history.slice(-8), lang })
      });
      if (!res.ok) {
        error = { 429: 'rate_limited', 503: 'not_configured', 400: 'bad_request', 404: 'offline', 405: 'offline', 501: 'offline' }[res.status] || 'upstream';
      } else if (!res.body) {
        error = 'offline';
      } else {
        await readNDJSON(res, ev => {
          if (ev.type === 'text' && typeof ev.text === 'string') {
            if (trace.ttft === null) trace.ttft = performance.now() - t0;
            trace.chunks++;
            answer.thinking = false;
            answer.text += ev.text;
            updateEntry(answer);
          } else if (ev.type === 'usage') {
            trace.usage = ev;
          } else if (ev.type === 'error') {
            error = ev.code || 'upstream';
          }
        });
      }
    } catch (e) {
      error = 'offline';
    }

    trace.total = performance.now() - t0;
    if (answer.text) answer.trace = trace;
    answer.streaming = answer.thinking = false;
    qe.running = false;
    updateEntry(qe);
    if (error === 'max_tokens') { answer.truncated = true; error = answer.text ? null : 'upstream'; }
    if (error) {
      if (error === 'refusal' || !answer.text) removeEntry(answer); else updateEntry(answer);
      pushEntry({ kind: 'err', n, code: error });
      ask.history.pop();
    } else {
      updateEntry(answer);
      ask.history.push({ role: 'assistant', content: answer.text });
    }
    setBusy(false);
  }

  function bindAsk() {
    logEl = $('#nb-log');
    setBusy(ask.busy);
    $('#nb-form').addEventListener('submit', e => {
      e.preventDefault();
      const input = $('#nb-q');
      if (ask.busy) return;
      const v = input.value;
      input.value = '';
      askQuestion(v);
    });
  }

  /* =======================================================================
     EASTER EGGS — código-fonte .tex, compilação encenada e histórico de versões
     ======================================================================= */
  const TEX_ESC = { '\\': '\\textbackslash{}', '{': '\\{', '}': '\\}', '$': '\\$', '&': '\\&', '#': '\\#', '^': '\\textasciicircum{}', '_': '\\_', '%': '\\%', '~': '\\textasciitilde{}', '−': '$-$', '—': '---', '–': '--', '→': '$\\to$', '≥': '$\\geq$' };
  const tex = v => String(t(v) ?? '').replace(/"([^"]*)"/g, "``$1''").replace(/[\\{}$&#^_%~−—–→≥]/g, c => TEX_ESC[c]);
  const REF = '\u0000';
  const texRefs = s => s.replace(/\u0000([\w:-]+)\u0000/g, '~\\ref{$1}');
  const SEC_ID = { intro: 'introducao', systems: 'sistemas', methods: 'metodos', exp: 'experiencia', edu: 'formacao' };

  function tikzFlow(flow) {
    const shape = sh => (SHAPE_KEYS.includes(sh) ? sh : 'proc');
    const nodes = [], edges = [];
    flow.forEach((n, i) => {
      const id = `s${i + 1}`;
      nodes.push(`    \\node[${shape(n.shape)}${i ? `, below=of s${i}` : ''}] (${id}) {${tex(n.text)}};`);
      if (i) edges.push(`    \\draw[next] (s${i}) -- ${n.edge ? `node[right, font=\\scriptsize] {${tex(n.edge)}} ` : ''}(${id});`);
      if (n.via) {
        nodes.push(`    \\node[${shape(n.via.shape)}, right=10mm of ${id}] (${id}v) {${tex(n.via.text)}};`);
        edges.push(`    \\draw[uses] (${id}v) -- (${id});`);
      }
      if (n.branch) {
        nodes.push(`    \\node[${shape(n.branch.shape)}, right=10mm of ${id}] (${id}b) {${tex(n.branch.text)}};`);
        edges.push(`    \\draw[next] (${id}) -- node[above, font=\\scriptsize] {${tex(n.branch.edge)}} (${id}b);`);
      }
    });
    return ['  \\begin{tikzpicture}[node distance=6mm]', ...nodes, ...edges, '  \\end{tikzpicture}'];
  }

  // O mesmo artigo, em LaTeX, montado a partir de content.js.
  function texSource() {
    const tl = paperTitle();
    const role = roleRow ? t(roleRow.v) : [t(C.role), currentJob && t(currentJob.org)].filter(Boolean).join(' · ');
    const base = baseRow ? t(baseRow.v) : '';
    const bio = t(C.about && C.about.bio) || [];
    const kws = String(t(C.focus) || '').split(/\s*·\s*/).filter(Boolean);
    const sec = u('sec'), col = u('col');
    const { askOn, refsOn } = sectionsPlan();
    let tab = 0, fig = 0;
    const o = [];

    o.push(
      '% !TEX program = pdflatex',
      `% portfolio.tex — ${C.name}, ${t(C.role)}`,
      `% ${u('srcNote')}`,
      '\\documentclass[11pt]{article}',
      '\\usepackage[utf8]{inputenc}',
      '\\usepackage[T1]{fontenc}',
      `\\usepackage[${lang === 'pt' ? 'brazil' : 'english'}]{babel}`,
      '\\usepackage{array,booktabs}',
      '\\usepackage{tikz}',
      '\\usetikzlibrary{shapes.geometric,shapes.symbols,shapes.misc,positioning,arrows.meta}',
      '\\usepackage[hidelinks]{hyperref}',
      '',
      `% ${u('legend')}: ${SHAPE_KEYS.map(k => `${k} = ${u('shapes')[k]}`).join(', ')}`,
      '\\tikzset{',
      '  box/.style={draw, align=center, font=\\small, text width=44mm, minimum height=9mm},',
      '  term/.style={box, rounded rectangle},',
      '  io/.style={box, trapezium, trapezium left angle=70, trapezium right angle=110, trapezium stretches body},',
      '  proc/.style={box, rectangle},',
      '  sub/.style={box, rectangle, double, double distance=1.2pt},',
      '  decision/.style={box, diamond, aspect=2.6, text width=26mm},',
      '  doc/.style={box, tape, tape bend top=none},',
      '  store/.style={box, cylinder, shape border rotate=90, shape aspect=.22, text width=32mm},',
      '  next/.style={-{Stealth}},',
      '  uses/.style={-{Stealth}, dashed},',
      '}',
      '',
      `\\title{${tex(tl.main)}${tl.sub ? `:\\\\[2pt]\n  \\large ${tex(tl.sub)}` : ''}\\thanks{${tex(u('titleNote'))}}}`,
      `\\author{${tex(C.name)}${role ? `\\\\\n  \\small ${tex(role)}` : ''}${base ? `\\\\\n  \\small ${tex(base)}` : ''}${L.email ? `\\\\\n  \\small\\href{mailto:${L.email}}{\\texttt{${tex(L.email)}}}` : ''}}`,
      '\\date{\\today}',
      '',
      '\\begin{document}',
      '\\maketitle',
      ''
    );
    if (bio.length) {
      o.push('\\begin{abstract}', bio.map(tex).join(' '), '\\end{abstract}');
      if (kws.length) o.push(`\\noindent\\textbf{\\textit{${tex(u('keywords'))} ---}} ${kws.map(tex).join(' · ')}`);
      o.push('');
    }

    // 1 Introdução
    const parts = ['systems', 'methods', 'exp', 'edu'].filter(k => secNo[k])
      .map(k => `${u('introParts')[k]} (${u('section')}${REF}${SEC_ID[k]}${REF})`);
    const askRef = askOn ? u('introAsk', `${u('appendixRef')}${REF}apendice-a${REF}`) : '';
    o.push(`\\section{${tex(sec.intro)}}\\label{introducao}`);
    if (parts.length) o.push(texRefs(tex(u('introLead', listJoin(parts)) + askRef)), '');
    const stats = (C.stats || []).filter(s => has(s.value));
    if (stats.length) {
      const n = ++tab;
      o.push(texRefs(tex(u('statsLead', `${u('table')}${REF}tab:${n}${REF}`))),
        '\\begin{table}[htbp]', '  \\centering', `  \\caption{${tex(u('statsCaption'))}}\\label{tab:${n}}`,
        `  \\begin{tabular}{@{}*{${stats.length}}{>{\\centering\\arraybackslash}p{${(0.92 / stats.length).toFixed(2)}\\linewidth}}@{}}`,
        '    \\toprule',
        `    ${stats.map(s => `\\Large ${tex(s.value)}`).join(' & ')} \\\\`,
        `    ${stats.map(s => `\\footnotesize ${tex(s.label)}`).join(' & ')} \\\\`,
        '    \\bottomrule', '  \\end{tabular}', '\\end{table}', '');
    }
    ((C.about && C.about.principles) || []).forEach((p, i) =>
      o.push(`\\paragraph{${tex(u('principle'))} ${i + 1} (${tex(p.title)}).} \\emph{${tex(p.text)}}`, ''));

    // 2 Sistemas
    if (secNo.systems) {
      o.push(`\\section{${tex(sec.systems)}}\\label{sistemas}`, tex(u('systemsLead')), '');
      C.projects.forEach((p, i) => {
        const pid = String(p.id || `prj-${pad2(i + 1)}`).toLowerCase();
        o.push(`\\subsection{${tex(p.title)}}\\label{${pid}}`,
          `% ${[p.id, p.year, t(p.org), t(p.status)].filter(Boolean).join(' · ')}`);
        if (has(p.summary)) o.push(tex(p.summary), '');
        if (has(p.problem)) o.push(`\\paragraph{${tex(u('problem'))}.} ${tex(p.problem)}`, '');
        if (has(p.solution)) o.push(`\\paragraph{${tex(u('solution'))}.} ${tex(p.solution)}`, '');
        const flow = (p.flow || []).filter(n => n && has(n.text));
        if (flow.length) {
          const n = ++fig;
          o.push('\\begin{figure}[htbp]', '  \\centering', ...tikzFlow(flow),
            `  \\caption{${tex(u('figCaption', t(p.title), flow.some(s => s.via)))}}\\label{fig:${n}}`, '\\end{figure}', '');
        }
        const ms = (p.metrics || []).filter(m => m && (m.value !== undefined || (m.before !== undefined && m.after !== undefined)));
        if (ms.length) {
          const n = ++tab;
          const ba = ms.some(m => m.value === undefined);
          const fmt = (m, v) => tex(`${m.prefix || ''}${fmtNum(v)}${t(m.unit)}`);
          o.push('\\begin{table}[htbp]', '  \\centering', `  \\caption{${tex(u('metricsCaption', t(p.title)))}}\\label{tab:${n}}`,
            `  \\begin{tabular}{@{}l${ba ? 'rrr' : 'r'}@{}}`, '    \\toprule',
            `    ${(ba ? [col.metric, col.before, col.after, col.delta] : [col.metric, col.value]).map(tex).join(' & ')} \\\\`, '    \\midrule',
            ...ms.map(m => `    ${tex(m.label)} & ${ba
              ? (m.value !== undefined ? `-- & ${fmt(m, m.value)} & --` : `${fmt(m, m.before)} & ${fmt(m, m.after)} & ${tex(has(m.delta) ? m.delta : '--')}`)
              : fmt(m, m.value)} \\\\`),
            '    \\bottomrule', '  \\end{tabular}', '\\end{table}', '');
        }
        if ((p.stack || []).length) o.push(`\\noindent\\textbf{${tex(u('stack'))}:} ${p.stack.map(x => `\\textsc{${tex(x)}}`).join(' · ')}`, '');
      });
    }

    // 3 Métodos
    if (secNo.methods) {
      const n = ++tab;
      const dotsTex = lvl => { const k = Math.max(0, Math.min(3, Number(lvl) || 0)); return `$${'\\bullet'.repeat(k)}${'\\circ'.repeat(3 - k)}$`; };
      const groups = C.skills.filter(g => (g.items || []).length);
      o.push(`\\section{${tex(sec.methods)}}\\label{metodos}`, texRefs(tex(u('methodsLead', `${u('table')}${REF}tab:${n}${REF}`))),
        '\\begin{table}[htbp]', '  \\centering', `  \\caption{${tex(u('skillsCaption'))}}\\label{tab:${n}}`,
        '  \\begin{tabular}{@{}lc@{}}', '    \\toprule');
      groups.forEach((g, gi) => {
        if (gi) o.push('    \\midrule');
        o.push(`    \\multicolumn{2}{@{}l}{\\textbf{${tex(g.group)}}} \\\\`, ...g.items.map(([name, lvl]) => `    ${tex(name)} & ${dotsTex(lvl)} \\\\`));
      });
      o.push('    \\bottomrule', '  \\end{tabular}', '',
        `  \\smallskip\\footnotesize ${[3, 2, 1].map(l => `${dotsTex(l)} ${tex(u('levels')[l])}`).join(' \\quad ')}`, '\\end{table}', '');
    }

    // 4 Experiência
    if (secNo.exp) {
      o.push(`\\section{${tex(sec.exp)}}\\label{experiencia}`, '\\begin{description}');
      C.experience.forEach((j, i) => {
        const bullets = t(j.bullets) || [];
        o.push(`  \\item[${tex(j.title)}, ${tex(j.org)}] \\hfill ${tex(fmtYM(j.start))} -- ${tex(j.end ? fmtYM(j.end) : u('present'))}\\label{${expId(i)}}`);
        if (bullets.length) o.push('    \\begin{itemize}', ...bullets.map(b => `      \\item ${tex(b)}`), '    \\end{itemize}');
      });
      o.push('\\end{description}', '');
    }

    // 5 Formação
    if (secNo.edu) {
      o.push(`\\section{${tex(sec.edu)}}\\label{formacao}`);
      const subs = [];
      if ((C.education || []).length) subs.push([u('education'), C.education]);
      if ((C.certifications || []).length) subs.push([u('certifications'), C.certifications]);
      if (C.activities && (C.activities.items || []).length) subs.push([t(C.activities.title), C.activities.items]);
      subs.forEach(([title, list]) => o.push(`\\subsection{${tex(title)}}`, '\\begin{itemize}',
        ...list.map(e => `  \\item \\textbf{${tex(e.title)}}${has(e.org) ? `. ${tex(e.org)}` : ''}${has(e.year) ? ` (${tex(e.year)})` : ''}.`), '\\end{itemize}', ''));
    }

    // Referências
    if (refsOn) {
      const lead = t(C.contact && C.contact.lead);
      if (lead) o.push(`\\paragraph{${tex(u('refsLead'))}.} ${tex(lead)}${L.email ? ` \\href{mailto:${L.email}}{\\texttt{${tex(L.email)}}}` : ''}`, '');
      const R = u('ref');
      const items = [];
      if (L.linkedin) items.push([R.linkedin, `\\url{${L.linkedin}}`]);
      if (cvHref('pt')) items.push([R.cvPt, `\\url{${cvHref('pt')}}`]);
      if (cvHref('en') && cvHref('en') !== cvHref('pt')) items.push([R.cvEn, `\\url{${cvHref('en')}}`]);
      if (L.github) items.push([R.github, `\\url{${L.github}}`]);
      if (L.email) items.push([R.email, `\\href{mailto:${L.email}}{\\texttt{${tex(L.email)}}}`]);
      o.push('\\begin{thebibliography}{9}',
        ...items.map(([title, url], i) => `  \\bibitem{ref${i + 1}} ${tex(authorShort).replace('. ', '.~')}. \\emph{${tex(title)}}. ${url}`),
        '\\end{thebibliography}', '');
    }

    // Apêndice A
    if (askOn) {
      o.push('\\appendix', `\\section{${tex(sec.ask)}}\\label{apendice-a}`, `% ${u('texAskNote')}`,
        `${tex(u('askLead'))}\\footnote{${tex(u('askNote'))}}`, '');
    }
    const { ontOn, suppOn, graphOn } = sectionsPlan();
    if (!askOn && (ontOn || suppOn || graphOn)) o.push('\\appendix');
    if (ontOn) o.push(`\\section{${tex(sec.ont)}}\\label{apendice-ont}`, tex(u('ontLead')), `% ${u('texEggNote')}`, '');
    if (suppOn) o.push(`\\section{${tex(sec.supp)}}\\label{apendice-b}`, `% ${u('texEggNote')}`, '');
    if (graphOn) o.push(`\\section{${tex(sec.graph)}}\\label{apendice-c}`, `% ${u('texEggNote')}`, '');
    o.push('\\end{document}', '');
    return o.join('\n');
  }

  // Realce de sintaxe: comandos, matemática, chaves e comentários.
  const TEX_TOKEN = /(\\[a-zA-Z@]+\*?|\\.)|(\$[^$]*\$)|([{}[\]])|(%.*$)/g;
  function highlightTex(src) {
    return src.split('\n').map(line => {
      let out = '', last = 0, m;
      TEX_TOKEN.lastIndex = 0;
      while ((m = TEX_TOKEN.exec(line))) {
        out += esc(line.slice(last, m.index));
        out += `<span class="${m[1] ? 'tx-c' : m[2] ? 'tx-m' : m[3] ? 'tx-b' : 'tx-k'}">${esc(m[0])}</span>`;
        last = TEX_TOKEN.lastIndex;
        if (m[4]) break;
      }
      return `<span class="ln">${out + esc(line.slice(last)) || ' '}</span>`;
    }).join('');
  }

  /* ---------- diálogo (código-fonte e diffs) ---------- */
  let dlg = null, dlgReturn = null;
  function openDialog(kind, html, label) {
    if (!dlg) {
      dlg = document.createElement('dialog');
      document.body.appendChild(dlg);
      dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener('close', () => { if (dlgReturn && document.contains(dlgReturn)) dlgReturn.focus(); });
      dlg.addEventListener('keydown', e => {
        if (!dlg.classList.contains('is-diff') || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
        const b = dlg.querySelector(`[data-diff-go][data-dir="${e.key === 'ArrowLeft' ? 'prev' : 'next'}"]:not(:disabled)`);
        if (b) { e.preventDefault(); openDiff(Number(b.dataset.diffGo), 'next' === b.dataset.dir ? 'next' : 'prev'); }
      });
    }
    dlg.className = `dlg is-${kind}`;
    dlg.setAttribute('aria-label', label);
    dlg.innerHTML = html;
    if (!dlg.open) { dlgReturn = document.activeElement; dlg.showModal(); }
  }
  const dlgClose = `<button type="button" class="dlg-btn dlg-x" data-close aria-label="${esc(u('close'))}" title="${esc(u('close'))}">✕</button>`;

  function openSource() {
    const src = texSource();
    openDialog('src', `
      <div class="dlg-in">
        <div class="dlg-bar">
          <p class="dlg-t"><span class="dlg-file">portfolio.tex</span> <span class="dlg-sub">${esc(u('srcLines', src.split('\n').length - 1))}</span></p>
          <div class="dlg-act">
            <button type="button" class="dlg-btn dlg-primary" data-compile>${icon('play')}<span>${esc(u('srcCompile'))}</span></button>
            <button type="button" class="dlg-btn" data-dl-tex>${icon('down')}<span>${esc(u('srcDownload'))}</span></button>
            ${dlgClose}
          </div>
        </div>
        <pre class="tex" tabindex="0" aria-label="portfolio.tex"><code>${highlightTex(src)}</code></pre>
        <p class="dlg-foot">${esc(u('srcNote'))}</p>
      </div>`, `portfolio.tex — ${u('texBtn')}`);
  }

  function downloadTex() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([texSource()], { type: 'application/x-tex;charset=utf-8' }));
    a.download = 'portfolio.tex';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  // Diff entre duas revisões consecutivas do "currículo": cargo, afiliação e destaques do novo cargo.
  function openDiff(k, focusDir) {
    const v = versions[k - 1];
    if (!v) return;
    const cur = v.j, prev = k > 1 ? versions[k - 2].j : null;
    const F = u('diffField');
    const rows = [];
    let ins = 0, del = 0;
    const field = (name, a, b) => {
      rows.push(['hunk', `@@ ${name} @@`]);
      if (a && a === b) return rows.push(['ctx', `  ${b}`]);
      if (a) { rows.push(['del', `- ${a}`]); del++; }
      if (b) { rows.push(['add', `+ ${b}`]); ins++; }
    };
    field(F.role, prev && t(prev.title), t(cur.title));
    field(F.org, prev && t(prev.org), t(cur.org));
    const notes = (t(cur.bullets) || []).slice(0, 3);
    if (notes.length) {
      rows.push(['hunk', `@@ ${F.notes} @@`]);
      notes.forEach(b => { rows.push(['add', `+ ${smart(b)}`]); ins++; });
    }
    const isHead = k === versions.length;
    const head = [
      ['commit', `commit v${k}${isHead ? ' (HEAD -> main)' : ''}`],
      ['meta', `Author: ${C.name}`],
      ['meta', `Date:   ${fmtYM(cur.start)}${cur.end ? ` – ${fmtYM(cur.end)}` : ` – ${u('present')}`}`],
      ['msg', `    ${t(cur.title)}, ${orgShort(cur)}`],
      ['', ''],
      ['file', prev ? `--- a/cv-v${k - 1}.tex` : '--- /dev/null'],
      ['file', `+++ b/cv-v${k}.tex`]
    ];
    const line = ([cls, txt]) => `<span class="dl${cls ? ` d-${cls}` : ''}">${esc(txt) || ' '}</span>`;
    const nav = (dir, to) => `<button type="button" class="dlg-btn" data-diff-go="${to}" data-dir="${dir}" ${to < 1 || to > versions.length ? 'disabled' : ''} aria-label="${esc(u(dir === 'prev' ? 'diffPrev' : 'diffNext'))}">${dir === 'prev' ? `← v${Math.max(1, to)}` : `v${Math.min(versions.length, to)} →`}</button>`;
    openDialog('diff', `
      <div class="dlg-in">
        <div class="dlg-bar">
          <p class="dlg-t"><span class="dlg-file">cv-v${k}.tex</span> <span class="dlg-sub">${esc(u('history'))}</span></p>
          <div class="dlg-act">${nav('prev', k - 1)}${nav('next', k + 1)}${dlgClose}</div>
        </div>
        <pre class="diff" tabindex="0"><code>${[...head, ...rows].map(line).join('')}</code></pre>
        <p class="dlg-foot"><span class="d-stat">${esc(u('diffStat', ins, del))}</span>
          <a href="#${expId(v.i)}" data-close>${esc(`${u('section')} ${secNo.exp} · EXP-${pad2(v.i + 1)}`)} ↓</a></p>
      </div>`, u('diffLabel', `v${k}`));
    const again = focusDir && dlg.querySelector(`[data-dir="${focusDir}"]:not(:disabled)`);
    (again || dlg.querySelector('[data-close]')).focus();
  }

  /* ---------- compilação encenada na abertura ---------- */
  const session = {
    get(k) { try { return sessionStorage.getItem(`artigo:${k}`); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(`artigo:${k}`, v); } catch (e) { /* armazenamento bloqueado */ } }
  };
  function bootLines() {
    const pages = $$('.page').length || 1;
    let bytes = 0;
    try { bytes = new Blob([document.documentElement.outerHTML]).size; } catch (e) { /* sem Blob */ }
    const marks = Array.from({ length: pages }, (_, i) => `[${i + 1}]`);
    return [
      ['cmd', '$ pdflatex portfolio.tex'],
      ['', 'This is pdfTeX, Version 3.141592653-2.6-1.40.26 (TeX Live 2024)'],
      ['', ' restricted \\write18 enabled.'],
      ['', 'entering extended mode'],
      ['', '(./portfolio.tex'],
      ['', 'LaTeX2e <2024-11-01>'],
      ['', 'Document Class: article 2024/06/29 v1.4n Standard LaTeX document class'],
      ['', '(./size11.clo) (./inputenc.sty) (./fontenc.sty) (./babel.sty)'],
      ['', '(./array.sty) (./booktabs.sty) (./tikz.sty) (./hyperref.sty)'],
      ['', 'No file portfolio.aux.'],
      ['', marks.slice(0, -1).join(' ')],
      ['warn', 'Overfull \\hbox (1.97pt too wide) in paragraph at lines 88--90'],
      ['', `${marks[marks.length - 1]} (./portfolio.aux) )`],
      ['ok', `Output written on portfolio.pdf (${pages} pages, ${bytes} bytes).`],
      ['', 'Transcript written on portfolio.log.']
    ];
  }
  let booting = null;
  function compileIntro(force) {
    if (booting) return;
    if (!force && (reducedMQ.matches || location.hash.length > 1 || session.get('compiled'))) return;
    session.set('compiled', '1');
    const lines = bootLines();
    const el = document.createElement('div');
    el.className = 'tex-boot';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<div class="tb-in"><pre class="tb-log"></pre><p class="tb-skip">${esc(u('bootSkip'))}</p></div>`;
    document.body.appendChild(el);
    const log = el.querySelector('.tb-log');
    const row = ([cls, txt]) => `<span class="tb-l${cls ? ` tb-${cls}` : ''}">${esc(txt)}</span>`;
    let i = 0, timer = 0;
    const finish = () => {
      if (!booting) return;
      clearTimeout(timer);
      removeEventListener('keydown', finish, true);
      removeEventListener('wheel', finish);
      log.innerHTML = lines.map(row).join('');
      el.classList.add('out');
      setTimeout(() => el.remove(), reducedMQ.matches ? 0 : 340);
      booting = null;
    };
    const step = () => {
      if (i >= lines.length) { timer = setTimeout(finish, 420); return; }
      log.insertAdjacentHTML('beforeend', row(lines[i++]));
      timer = setTimeout(step, i < 2 ? 260 : 58);
    };
    booting = finish;
    addEventListener('keydown', finish, true);
    addEventListener('wheel', finish, { passive: true });
    el.addEventListener('pointerdown', finish);
    if (reducedMQ.matches) { log.innerHTML = lines.map(row).join(''); timer = setTimeout(finish, 1600); } else step();
  }

  /* =======================================================================
     INTERAÇÕES
     ======================================================================= */
  function setLang(l) {
    if (!LANGS.includes(l) || l === lang) return;
    lang = l;
    store.set('lang', l);
    try {
      const url = new URL(location.href);
      url.searchParams.set('lang', l);
      history.replaceState(history.state, '', url);
    } catch (e) { /* URL somente leitura */ }
    const y = window.scrollY;
    const draft = $('#nb-q') ? $('#nb-q').value : '';
    render();
    if ($('#nb-q')) $('#nb-q').value = draft;
    window.scrollTo(0, y);
  }

  function flash(el) {
    if (!el) return;
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
    clearTimeout(el._flashT);
    el._flashT = setTimeout(() => el.classList.remove('flash'), 2600);
  }

  document.addEventListener('click', e => {
    const lb = e.target.closest('button[data-lang]');
    if (lb) return setLang(lb.dataset.lang);
    if (e.target.closest('#bar-tex, [data-open-src]')) return openSource();
    const hv = e.target.closest('[data-hist]');
    if (hv) return openDiff(Number(hv.dataset.hist));
    const go = e.target.closest('[data-diff-go]');
    if (go) return openDiff(Number(go.dataset.diffGo), go.dataset.dir);
    if (e.target.closest('[data-dl-tex]')) return downloadTex();
    if (e.target.closest('[data-compile]')) { if (dlg) dlg.close(); return compileIntro(true); }
    if (e.target.closest('[data-close]') && dlg && dlg.open) dlg.close();
    const chip = e.target.closest('[data-ask]');
    if (chip) { if (!ask.busy) askQuestion(chip.dataset.ask); return; }
    if (e.target.closest('#nb-restart')) {
      if (ask.busy) return;
      ask.entries = []; ask.history = []; ask.n = 0;
      renderLog();
      const input = $('#nb-q');
      if (input) input.focus();
      return;
    }
    const a = e.target.closest('a[href^="#"]');
    if (a && a.hash.length > 1) {
      const target = document.getElementById(decodeURIComponent(a.hash.slice(1)));
      if (target && (a.classList.contains('cite') || a.classList.contains('xref'))) flash(target);
    }
  });

  /* ---------- scroll spy ---------- */
  let spy = null;
  function setupSpy() {
    if (spy) spy.disconnect();
    if (!('IntersectionObserver' in window)) return;
    const links = $$('#nav-list a');
    const targets = navItems.map(it => document.getElementById(it.id)).filter(Boolean);
    spy = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => {
        const id = isApp(en.target.id) ? navItems.find(i => isApp(i.id)).id : en.target.id;
        const on = a.hash === `#${id}`;
        a.classList.toggle('on', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }), { rootMargin: '-35% 0px -60% 0px' });
    targets.forEach(s => spy.observe(s));
  }

  render();
  compileIntro(false);
})();
