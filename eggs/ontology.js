/* eggs/ontology.js — Figura A.1: a ontologia sobre a qual o assistente raciocina.
   Grafo de conhecimento gerado do content.js (os mesmos dados do prompt de sistema do assistente):
   layout de forças determinístico (PRNG com semente fixa), SVG estático, vizinhança realçada no
   hover/foco e a vista RDF (Turtle) com as mesmas triplas. */
(function () {
  'use strict';

  // Research ⊑ schema:ResearchProject: as atividades com "stack" (a iniciação científica) entram no grafo.
  const CLS = ['Person', 'Position', 'Research', 'Degree', 'Organization', 'Project', 'Agent', 'KnowledgeBase', 'Skill'];
  const SUPER = { Person: 'Person', Position: 'EmployeeRole', Research: 'ResearchProject', Organization: 'Organization', Project: 'Project', Agent: 'SoftwareApplication', KnowledgeBase: 'Dataset', Skill: 'DefinedTerm', Degree: 'EducationalOccupationalCredential' };
  const PRED = ['holds', 'conducted', 'built', 'studied', 'at', 'builtAt', 'deploys', 'retrievesFrom', 'uses'];

  const S = {
    en: {
      cls: { Person: 'Person', Position: 'Position', Research: 'Research', Organization: 'Organization', Project: 'Project', Agent: 'Agent', KnowledgeBase: 'Knowledge base', Skill: 'Skill', Degree: 'Degree' },
      rel: { holds: 'holds', conducted: 'conducted', at: 'at', built: 'built', builtAt: 'built at', deploys: 'deploys', retrievesFrom: 'retrieves from', uses: 'uses', studied: 'studied', level: 'level' },
      graph: 'Graph', ttl: 'RDF (Turtle)', swipe: '↔ swipe to explore', scroll: 'Knowledge graph (scrolls sideways)', views: 'Figure view', present: 'present',
      hint: 'Hover, tap or focus a node to trace its relations. Arrow keys move between nodes, Enter pins a node, Esc clears.',
      svg: (n, m) => `Knowledge graph: ${n} entities, ${m} relations`,
      triples: n => `${n} triples`, dl: 'Download .ttl', file: 'ontology.ttl',
      code: 'The figure serialized as RDF (Turtle)', list: 'Relations in the figure', legend: 'Node classes',
      levelNote: '3 = used in production, 2 = proficient, 1 = familiar',
      head: (n, m, k) => ['Figure A.1 · the ontology the assistant reasons over', `generated from content.js: ${n} entities, ${m} relations, ${k} triples`],
      sec: ['Classes', 'Properties'],
      words: ['no', 'a', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
      noun: { Position: ['position', 'positions'], Project: ['project', 'projects'], Degree: ['degree', 'degrees'], Research: ['research project', 'research projects'] }, and: 'and',
      cap: (n, m, f) => `The ontology the assistant reasons over: ${n} entities and ${m} relations generated from ${f}, the same data its system prompt is built from.`,
      capAgents: x => ` As in the flowcharts of ${x || 'the paper'}, agents are double-barred boxes and retrieve (dashed arrows) from knowledge bases (cylinders).`,
      capOrg: (o, parts) => ` Organizations are merged across sources: ${o} is a single node shared by ${parts}.`,
      capSkill: (o, parts) => ` Skills are merged by name too, so the arrows show where each tool was used: ${o} is one node, used by ${parts}.`,
      section: 'Section'
    },
    pt: {
      cls: { Person: 'Pessoa', Position: 'Cargo', Research: 'Pesquisa', Organization: 'Organização', Project: 'Projeto', Agent: 'Agente', KnowledgeBase: 'Base de conhecimento', Skill: 'Competência', Degree: 'Diploma' },
      rel: { holds: 'ocupa', conducted: 'conduziu', at: 'em', built: 'construiu', builtAt: 'desenvolvido em', deploys: 'implanta', retrievesFrom: 'consulta', uses: 'usa', studied: 'cursou', level: 'nível' },
      graph: 'Grafo', ttl: 'RDF (Turtle)', swipe: '↔ deslize para explorar', scroll: 'Grafo de conhecimento (rola para os lados)', views: 'Vista da figura', present: 'atual',
      hint: 'Passe o mouse, toque ou foque um nó para seguir suas relações. As setas movem entre nós, Enter fixa um nó, Esc limpa.',
      svg: (n, m) => `Grafo de conhecimento: ${n} entidades, ${m} relações`,
      triples: n => `${n} triplas`, dl: 'Baixar .ttl', file: 'ontologia.ttl',
      code: 'A figura serializada em RDF (Turtle)', list: 'Relações da figura', legend: 'Classes dos nós',
      levelNote: '3 = uso em produção, 2 = proficiente, 1 = familiar',
      head: (n, m, k) => ['Figura A.1 · a ontologia sobre a qual o assistente raciocina', `gerada do content.js: ${n} entidades, ${m} relações, ${k} triplas`],
      sec: ['Classes', 'Propriedades'],
      words: ['nenhum', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'],
      noun: { Position: ['cargo', 'cargos'], Project: ['projeto', 'projetos'], Degree: ['diploma', 'diplomas'], Research: ['projeto de pesquisa', 'projetos de pesquisa'] }, and: 'e',
      cap: (n, m, f) => `A ontologia sobre a qual o assistente raciocina: ${n} entidades e ${m} relações geradas do ${f}, os mesmos dados que compõem o seu prompt de sistema.`,
      capAgents: x => ` Como nos fluxogramas ${x ? `da ${x}` : 'do artigo'}, agentes são caixas com barras duplas e consultam (setas tracejadas) bases de conhecimento (cilindros).`,
      capOrg: (o, parts) => ` Organizações são unificadas entre as fontes: ${o} é um único nó, compartilhado por ${parts}.`,
      capSkill: (o, parts) => ` Competências também são unificadas pelo nome, e as setas mostram onde cada ferramenta foi usada: ${o} é um único nó, usado por ${parts}.`,
      section: 'Seção'
    }
  };

  /* ---------- content.js → entidades e relações ---------- */
  const enOf = v => (v == null ? '' : typeof v === 'object' ? String(v.en ?? v.pt ?? '') : String(v));
  const slug = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\./g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'x';
  const head = s => String(s).split(/\s+[·—–|]\s+|\s*\(/)[0].trim();
  const years = s => (String(s || '').match(/\d{4}/g) || []).slice(0, 2);

  function build(C, t, lang) {
    const N = [], E = [], ids = new Set(), orgs = new Map(), skills = new Map(), kbs = new Map(), levels = new Map();
    const txt = v => String(t(v) || '').trim();
    (C.skills || []).forEach(g => (g.items || []).forEach(it => { if (Array.isArray(it)) levels.set(enOf(it[0]).trim().toLowerCase(), it); }));
    const add = (cls, base, label, v, extra) => {
      let id = slug(base), k = 2;
      while (ids.has(id)) id = `${slug(base)}-${k++}`;
      ids.add(id);
      const n = Object.assign({ i: N.length, cls, id, label: String(label).trim(), tag: v && typeof v === 'object' ? (lang === 'pt' ? 'pt-BR' : 'en') : '' }, extra);
      N.push(n);
      return n;
    };
    const link = (a, p, b) => { if (a && b && !E.some(e => e.s === a.i && e.p === p && e.o === b.i)) E.push({ s: a.i, p, o: b.i }); };
    // "Realplan Construction Inc · USA (remote)" e "Realplan Construction · USA" viram um nó (nome normalizado).
    const org = v => {
      const full = txt(v);
      if (!full) return null;
      const key = slug(head(enOf(v))).replace(/-(inc|llc|ltd|ltda|sa|corp|co)$/, '');
      const name = head(full), alt = full.split(/\s+—\s+/)[1];
      let o = orgs.get(key);
      if (!o) { o = add('Organization', `org-${key}`, name, null, { alt: new Set() }); orgs.set(key, o); }
      else if (name.length < o.label.length) { o.alt.add(o.label); o.label = name; }
      else if (name !== o.label) o.alt.add(name);
      if (alt) o.alt.add(alt.trim());
      return o;
    };
    // Competências: um nó por nome (em inglês), venha de cargo, pesquisa ou projeto; o nível vem de C.skills.
    // O rótulo canônico (bilíngue) também vem de C.skills: "AI Agents" num projeto vira "Agentes de IA" em PT.
    const uses = (a, list) => (list || []).forEach(s => {
      const key = enOf(s).trim().toLowerCase(), [v, level] = levels.get(key) || [s];
      if (!txt(v)) return;
      if (!skills.has(key)) skills.set(key, add('Skill', `skill-${enOf(v)}`, txt(v), v, { level }));
      link(a, 'uses', skills.get(key));
    });
    const me = add('Person', C.name || 'person', C.name || '', null, { role: t(C.role) });
    (C.experience || []).forEach(j => {
      if (!j || !txt(j.title)) return;
      const p = add('Position', `pos ${head(enOf(j.title))} ${String(j.start || '').slice(0, 4)}`, txt(j.title), j.title, { start: j.start, end: j.end });
      link(me, 'holds', p);
      link(p, 'at', org(j.org));
      uses(p, j.stack);
    });
    (C.projects || []).forEach((p, k) => {
      if (!p || !txt(p.title)) return;
      const pid = slug(p.id || `prj-${k + 1}`);
      const pr = add('Project', pid, txt(p.title), p.title, { code: p.id || '', year: p.year });
      link(me, 'built', pr);
      link(pr, 'builtAt', org(p.org));
      // Cada passo "sub" é um agente próprio, ligado à base que ele consulta (via).
      let na = 0, nb = 0;
      (p.flow || []).forEach(s => {
        if (!s) return;
        let ag = null;
        if (s.shape === 'sub' && txt(s.text)) { ag = add('Agent', `${pid}-agent-${++na}`, txt(s.text), s.text); link(pr, 'deploys', ag); }
        const v = s.via;
        if (v && v.shape === 'store' && txt(v.text)) {
          const key = slug(enOf(v.text));
          if (!kbs.has(key)) kbs.set(key, add('KnowledgeBase', `${pid}-kb-${++nb}`, txt(v.text), v.text));
          link(ag || pr, 'retrievesFrom', kbs.get(key));
        }
      });
      uses(pr, p.stack);
    });
    (C.education || []).forEach(e => {
      if (!e || !txt(e.title)) return;
      const d = add('Degree', `deg-${enOf(e.title)}`, txt(e.title), e.title, { year: e.year });
      link(me, 'studied', d);
      link(d, 'at', org(e.org));
    });
    // "UFES · modelos mistos..." → nó UFES (o mesmo da formação) + descrição da pesquisa.
    ((C.activities || {}).items || []).forEach((a, k) => {
      if (!a || !txt(a.title) || !(a.stack || []).length) return;
      const r = add('Research', `research-${k + 1}`, txt(a.title), a.title, { year: a.year, desc: txt(a.org).split(/\s+·\s+/).slice(1).join(' · ') });
      link(me, 'conducted', r);
      link(r, 'at', org(a.org));
      uses(r, a.stack);
    });
    return { N, E };
  }

  /* ---------- RDF (Turtle) ---------- */
  const lit = s => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')}"`;

  function turtle(G, L, lang) {
    const tl = s => `${lit(s)}@${lang === 'pt' ? 'pt-BR' : 'en'}`;
    const dt = v => `${lit(v)}^^xsd:${/^\d{4}-\d{2}$/.test(v) ? 'gYearMonth' : /^\d{4}$/.test(v) ? 'gYear' : 'string'}`;
    const ref = n => `:${n.id}`;
    let T = 0;
    // Um sujeito com sua lista de predicados (";") e objetos (",").
    const st = (subj, pairs, inline) => {
      const ps = pairs.filter(p => p[1].length);
      return ps.reduce((out, [p, os], k) => {
        T += os.length;
        return `${out}${k ? (inline ? ' ' : '\n    ') : ' '}${p} ${os.join(os.length > 2 ? ' ,\n        ' : ' , ')}${k === ps.length - 1 ? ' .' : ' ;'}`;
      }, subj);
    };
    const used = CLS.filter(c => G.N.some(n => n.cls === c));
    const out = [`# ${L.sec[0]}`, ...used.map(c => st(`ont:${c}`, [['a', ['rdfs:Class']], ['rdfs:label', [tl(L.cls[c])]], ['rdfs:subClassOf', [`schema:${SUPER[c]}`]]], true)), '', `# ${L.sec[1]}`];
    PRED.forEach(p => {
      const es = G.E.filter(e => e.p === p), set = f => [...new Set(es.map(e => `ont:${G.N[e[f]].cls}`))];
      if (es.length) out.push(st(`ont:${p}`, [['a', ['rdf:Property']], ['rdfs:label', [tl(L.rel[p])]], ['schema:domainIncludes', set('s')], ['schema:rangeIncludes', set('o')]]));
    });
    if (G.N.some(n => n.level != null)) out.push(st('ont:level', [['a', ['rdf:Property']], ['rdfs:label', [tl(L.rel.level)]], ['rdfs:comment', [tl(L.levelNote)]], ['schema:domainIncludes', ['ont:Skill']], ['schema:rangeIncludes', ['xsd:integer']]]));
    used.forEach(c => {
      out.push('', `# ${L.cls[c]}`);
      G.N.filter(n => n.cls === c).forEach(n => {
        const y = years(n.year), start = n.start || y[0], end = n.end || y[1];
        const pairs = [['a', [`ont:${c}`]], ['rdfs:label', [lit(n.label) + (n.tag ? `@${n.tag}` : '')]],
          ['schema:jobTitle', n.role ? [lit(n.role)] : []], ['schema:identifier', n.code ? [lit(n.code)] : []],
          ['schema:startDate', start ? [dt(start)] : []], ['schema:endDate', end ? [dt(end)] : []],
          ['schema:alternateName', n.alt ? [...n.alt].map(lit) : []], ['schema:description', n.desc ? [tl(n.desc)] : []], ['ont:level', n.level != null ? [String(Number(n.level) | 0)] : []]];
        PRED.forEach(p => pairs.push([`ont:${p}`, G.E.filter(e => e.s === n.i && e.p === p).map(e => ref(G.N[e.o]))]));
        out.push(st(ref(n), pairs));
      });
    });
    const pre = [[':', '#'], ['ont:', 'ont#'], ['schema:', 'https://schema.org/'], ['rdf:', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'],
      ['rdfs:', 'http://www.w3.org/2000/01/rdf-schema#'], ['xsd:', 'http://www.w3.org/2001/XMLSchema#']].map(([p, i]) => `@prefix ${p.padEnd(7)} <${i}> .`);
    const top = L.head(G.N.length, G.E.length, T).map(s => `# ${s}`);
    return { text: [...top, '', ...pre, '', ...out, ''].join('\n'), count: T };
  }

  const TTL = /("(?:[^"\\\n]|\\.)*")(@[A-Za-z]+(?:-[A-Za-z0-9]+)*|\^\^[A-Za-z]+:[A-Za-z]+)?|(#.*$)|(<[^>\s]*>)|(@prefix\b)|(^|\s)(a)(?=\s)|([A-Za-z][\w-]*)?:([A-Za-z0-9][\w-]*)?|([;,.])/g;
  function highlight(src, esc) {
    const sp = (c, s) => `<span class="on-k-${c}">${esc(s)}</span>`;
    return src.split('\n').map(line => {
      let out = '', last = 0;
      line.replace(TTL, (m, str, sfx, com, iri, dir, ws, a, pfx, loc, pun, off) => {
        out += esc(line.slice(last, off));
        last = off + m.length;
        out += str ? sp('s', str) + (sfx ? sp('l', sfx) : '') : com ? sp('c', com) : iri ? sp('i', iri) : dir ? sp('d', dir) : a ? ws + sp('d', a)
          : pun ? sp('x', pun) : sp(off === 0 ? 'subj' : pfx === 'ont' ? 'o' : pfx ? 'v' : 'n', m);
        return m;
      });
      return `<span class="on-ln">${out + esc(line.slice(last))}\n</span>`;
    }).join('');
  }

  /* ---------- formas: as mesmas convenções dos fluxogramas do artigo ---------- */
  // Agente = processo principal (barras duplas, --fig-sub); base = cilindro (--fig-store); pessoa = terminal (pílula).
  const SPEC = {
    Person: { fs: 13.5, max: 150, pad: [17, 17, 7, 7], c: 'on-t on-sc on-b' },
    Position: { fs: 11, max: 118, pad: [9, 9, 6, 6], c: 'on-t' },
    Research: { fs: 11, max: 112, pad: [10, 14, 6, 6], c: 'on-t' },
    Organization: { fs: 11, max: 106, pad: [15, 15, 5, 5], c: 'on-t on-sc' },
    Project: { fs: 11.5, max: 122, pad: [10, 10, 10, 6], c: 'on-t on-it' },
    Agent: { fs: 11, max: 128, pad: [16, 16, 6, 6], c: 'on-t' },
    KnowledgeBase: { fs: 11, max: 96, pad: [10, 10, 12, 7], c: 'on-t' },
    Skill: { fs: 10.5, max: 120, pad: [13, 8, 3, 4], c: 'on-t on-sc' },
    Degree: { fs: 11, max: 112, pad: [10, 10, 6, 11], c: 'on-t' }
  };
  // Template que arredonda os números interpolados (0,1 px).
  const R = (s, ...v) => s.reduce((a, x, i) => a + (typeof v[i - 1] === 'number' ? Math.round(v[i - 1] * 10) / 10 : v[i - 1]) + x);

  function shape(c, w, h) {
    const x = -w / 2, y = -h / 2;
    switch (c) {
      case 'Person': return R`<rect class="on-s on-s-term" x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}"/>`;
      case 'Organization': { const k = Math.min(10, h * .42); return R`<path class="on-s" d="M${x} 0L${x + k} ${y}H${-x - k}L${-x} 0L${-x - k} ${-y}H${x + k}Z"/>`; }
      case 'Project': { const b = 4, tw = Math.min(30, w * .3); return R`<path class="on-s on-s-prj" d="M${x} ${y}H${x + tw}L${x + tw + b} ${y + b}H${-x}V${-y}H${x}Z"/><path class="on-l" d="M${x + tw + b} ${y + b}H${x}"/>`; }
      case 'Research': { const k = Math.min(9, h * .3); return R`<path class="on-s" d="M${x} ${y}H${-x - k}L${-x} ${y + k}V${-y}H${x}Z"/><path class="on-l" d="M${-x - k} ${y}V${y + k}H${-x}"/>`; }
      case 'Agent': return R`<rect class="on-s on-s-sub" x="${x}" y="${y}" width="${w}" height="${h}"/><path class="on-l" d="M${x + 6} ${y}V${-y}M${-x - 6} ${y}V${-y}"/>`;
      case 'KnowledgeBase': { const ry = Math.min(5, h * .14); return R`<path class="on-s on-s-store" d="M${x} ${y + ry}V${-y - ry}A${-x} ${ry} 0 0 0 ${-x} ${-y - ry}V${y + ry}A${-x} ${ry} 0 0 0 ${x} ${y + ry}Z"/><path class="on-l" d="M${x} ${y + ry}A${-x} ${ry} 0 0 0 ${-x} ${y + ry}"/>`; }
      case 'Skill': { const k = h * .42; return R`<path class="on-s on-s-tag" d="M${x + k} ${y}H${-x}V${-y}H${x + k}L${x} 0Z"/><circle class="on-l" cx="${x + k * .95}" cy="0" r="1.3"/>`; }
      case 'Degree': { const a = Math.min(5, h * .12), yb = -y - a; return R`<path class="on-s" d="M${x} ${y}H${-x}V${yb}Q${-x / 2} ${yb + 2 * a} 0 ${yb}T${x} ${yb}Z"/>`; }
      default: return R`<rect class="on-s" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
    }
  }
  // Contorno (polígono) para recortar cada aresta na borda da forma.
  function outline(n) {
    const x = n.w / 2, y = n.h / 2, k = n.h * .42;
    if (n.cls === 'Organization') { const q = Math.min(10, k); return [[-x, 0], [-x + q, -y], [x - q, -y], [x, 0], [x - q, y], [-x + q, y]]; }
    if (n.cls === 'Skill') return [[-x + k, -y], [x, -y], [x, y], [-x + k, y], [-x, 0]];
    if (n.cls === 'Person') return [-1, 1].flatMap(s => [-.5, -.25, 0, .25, .5].map(a => [s * (x - y + Math.cos(a * Math.PI) * y), s * Math.sin(a * Math.PI) * y]));
    const yb = n.cls === 'Degree' ? y - Math.min(5, n.h * .12) / 2 : y;
    return [[-x, -y], [x, -y], [x, yb], [-x, yb]];
  }
  function rayHit(n, ux, uy) {
    const P = n.poly || (n.poly = outline(n));
    let best = Math.max(n.w, n.h);
    P.forEach(([ax, ay], k) => {
      const [bx, by] = P[(k + 1) % P.length], ex = bx - ax, ey = by - ay, den = ux * ey - uy * ex;
      if (Math.abs(den) < 1e-9) return;
      const tt = (ax * ey - ay * ex) / den, s = (ax * uy - ay * ux) / den;
      if (tt > 0 && s >= -1e-6 && s <= 1 + 1e-6 && tt < best) best = tt;
    });
    return best;
  }

  /* ---------- layout de forças determinístico ---------- */
  function rng(a) {
    return () => {
      a = (a + 0x6D2B79F5) | 0;
      let q = Math.imul(a ^ (a >>> 15), 1 | a);
      q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q;
      return ((q ^ (q >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Sementes por classe no eixo u (x): competências da carreira | cargos, pesquisa, diploma | pessoa | competências
  // dos projetos | projetos | agentes | bases. Competências de ambos (Mix) ficam entre a pessoa e os cargos.
  // Organizações compartilhadas pelas duas alas ficam nas pontas do eixo v (y), fazendo a ponte entre elas.
  const U = { Person: -.3, Position: -.62, Degree: -.62, Research: -.62, Organization: -.95, Project: .32, Skill: .02, Mix: -.4, Car: -.97, Agent: .64, KnowledgeBase: .93, pv: .8, pk: .12, ak: .05 };
  const GAP = { holds: 34, built: 34, studied: 34, conducted: 34, at: 26, builtAt: 26, deploys: 22, retrievesFrom: 18, uses: 26 };
  const ext = (n, ux, uy) => Math.min(Math.abs(ux) > 1e-6 ? n.w / 2 / Math.abs(ux) : 1e9, Math.abs(uy) > 1e-6 ? n.h / 2 / Math.abs(uy) : 1e9);
  const unit = (a, b) => { const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || .01; return [dx / d, dy / d, d]; };
  const gapOf = (a, b) => { const [ux, uy, d] = unit(a, b); return [ux, uy, d - ext(a, ux, uy) - ext(b, ux, uy)]; };

  function plan(G) {
    const { N, E } = G, P = N.map(n => ({ u: U[n.cls], v: 0, sv: null, ok: false })), mem = new Map(), side = new Map();
    N.forEach(n => {
      if (!['Position', 'Project', 'Degree', 'Research'].includes(n.cls)) return;
      const e = E.find(x => x.s === n.i && (x.p === 'at' || x.p === 'builtAt')), o = e ? e.o : -1 - n.i;
      mem.set(o, (mem.get(o) || []).concat(n.i));
    });
    let a = 0, b = 0;
    [...mem.keys()].filter(o => o >= 0 && mem.get(o).some(i => N[i].cls === 'Project') && mem.get(o).some(i => N[i].cls !== 'Project'))
      .sort((x, y) => mem.get(y).length - mem.get(x).length)
      .forEach(o => { const k = mem.get(o).length; if (a <= b) { side.set(o, -1); a += k; } else { side.set(o, 1); b += k; } });
    const car = [], wrk = [];
    [-1, 0, 1].forEach(sd => mem.forEach((ms, o) => { if ((side.get(o) || 0) === sd) ms.forEach(i => (N[i].cls === 'Project' ? wrk : car).push(i)); }));
    const spread = (list, r) => list.forEach((i, k) => { P[i].v = list.length > 1 ? -r + (2 * r * k) / (list.length - 1) : 0; P[i].ok = true; });
    spread(car, .8);
    spread(wrk, U.pv);
    P[0].ok = true;
    ['Organization', 'Agent', 'KnowledgeBase', 'Skill'].forEach(c => N.forEach(n => {
      if (n.cls !== c) return;
      const p = P[n.i];
      if (side.has(n.i)) { p.u = U.Person; p.v = p.sv = side.get(n.i) * .94; }
      else {
        const js = E.filter(e => e.s === n.i || e.o === n.i).map(e => (e.s === n.i ? e.o : e.s)).filter(j => j && P[j].ok);
        p.v = js.length ? js.reduce((x, j) => x + P[j].v, 0) / js.length : 0;
        if (c === 'Skill') { const k = js.filter(j => N[j].cls === 'Project').length; p.u = k === js.length ? U.Skill : k ? U.Mix : U.Car; }
      }
      p.ok = true;
    }));
    return P;
  }

  function simulate(N, E, F, P, seed) {
    const rnd = rng(seed), { W, H } = F, cx = W / 2, cy = H / 2, AX = W / 2 - 30, AY = H / 2 - 20, IT = 300;
    const adj = N.map(() => []);
    E.forEach(e => { adj[e.s].push(e.o); adj[e.o].push(e.s); });
    N.forEach(n => {
      n.x = cx + (P[n.i].u + (rnd() - .5) * .08) * AX;
      n.y = cy + (P[n.i].v + (rnd() - .5) * (seed === 1 ? 0 : .22)) * AY;
    });
    for (let it = 0; it < IT; it++) {
      const late = it > IT * .25;
      N.forEach(n => { n.fx = 0; n.fy = 0; });
      const push = (a, b, ux, uy, f) => { a.fx -= ux * f; a.fy -= uy * f; b.fx += ux * f; b.fy += uy * f; };
      for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) {
        const [ux, uy, g] = gapOf(N[i], N[j]), q = Math.max(0, g) + 12;
        push(N[i], N[j], ux, uy, 220 / (q * q));
      }
      E.forEach(e => {
        const a = N[e.s], b = N[e.o], [ux, uy, g] = gapOf(a, b), d = (a.y - b.y) * .06;
        push(a, b, ux, uy, -.045 * (g - GAP[e.p]));
        if (e.p === 'retrievesFrom') { b.fy += d; a.fy -= d / 3; } // agente → base: seta tracejada na horizontal
      });
      // Arestas não atravessam nós: afasta o nó do segmento.
      if (late) E.forEach(e => {
        const a = N[e.s], b = N[e.o], vx = b.x - a.x, vy = b.y - a.y, L2 = vx * vx + vy * vy || 1;
        N.forEach(n => {
          const u = ((n.x - a.x) * vx + (n.y - a.y) * vy) / L2;
          if (n === a || n === b || u < .02 || u > .98) return;
          let px = n.x - a.x - u * vx, py = n.y - a.y - u * vy;
          const d = Math.sqrt(px * px + py * py) || .01;
          px /= d; py /= d;
          const r = ext(n, px, py) + 9;
          if (d < r) { const f = .32 * (r - d); n.fx += px * f; n.fy += py * f; a.fx -= px * f * .3; a.fy -= py * f * .3; b.fx -= px * f * .3; b.fy -= py * f * .3; }
        });
      });
      // Arestas do mesmo nó não se sobrepõem: separa vizinhos em ângulos muito próximos.
      if (late) N.forEach(o => {
        const ns = adj[o.i];
        for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) {
          const p = N[ns[i]], q = N[ns[j]], a1 = Math.atan2(p.y - o.y, p.x - o.x), a2 = Math.atan2(q.y - o.y, q.x - o.x);
          const d = Math.atan2(Math.sin(a2 - a1), Math.cos(a2 - a1));
          if (Math.abs(d) > .26) continue;
          const f = (.26 - Math.abs(d)) * 6 * Math.sign(d || 1);
          p.fx += Math.sin(a1) * f; p.fy -= Math.cos(a1) * f; q.fx -= Math.sin(a2) * f; q.fy += Math.cos(a2) * f;
        }
      });
      // Âncoras de classe (fracas) no eixo das alas; pontes presas às pontas do eixo transversal.
      N.forEach(n => {
        const p = P[n.i], ku = n.i ? .03 : .2, kv = p.sv != null ? .04 : !n.i ? .2 : n.cls === 'Project' ? U.pk : /Agent|Know|Skill/.test(n.cls) ? U.ak : .002;
        n.fx += (p.u - (n.x - cx) / AX) * ku * AX;
        n.fy += ((p.sv != null ? p.sv : n.i ? p.v : 0) - (n.y - cy) / AY) * kv * AY;
      });
      const lim = 1.5 + 16 * (1 - it / IT);
      N.forEach(n => {
        const m = Math.sqrt(n.fx * n.fx + n.fy * n.fy), s = m > lim ? lim / m : 1;
        n.x = Math.max(n.w / 2 + 2, Math.min(W - n.w / 2 - 2, n.x + n.fx * s));
        n.y = Math.max(n.h / 2 + 2, Math.min(H - n.h / 2 - 2, n.y + n.fy * s));
      });
    }
    resolve(N, E, W, H);
  }
  // Colisão: retângulos com folga nunca se sobrepõem, e toda aresta fica com um trecho visível.
  function resolve(N, E, W, H) {
    const px = 10, py = 7, cl = n => {
      n.x = Math.max(n.w / 2 + 2, Math.min(W - n.w / 2 - 2, n.x));
      n.y = Math.max(n.h / 2 + 2, Math.min(H * 1.4 - n.h / 2, n.y));
    };
    for (let pass = 0; pass < 300; pass++) {
      let moved = false;
      if (pass < 150) E.forEach(e => {
        const a = N[e.s], b = N[e.o], [ux, uy, g] = gapOf(a, b), k = (15 - g) / 2;
        if (g < 15) { a.x -= ux * k; a.y -= uy * k; b.x += ux * k; b.y += uy * k; cl(a); cl(b); }
      });
      for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) {
        const a = N[i], b = N[j], ox = (a.w + b.w) / 2 + px - Math.abs(b.x - a.x), oy = (a.h + b.h) / 2 + py - Math.abs(b.y - a.y);
        if (ox <= 0 || oy <= 0) continue;
        moved = true;
        const ax = a.x, bx = b.x;
        if (ox < oy * 1.6) {
          const s = (b.x >= a.x ? 1 : -1) * (ox / 2 + .1);
          a.x -= s; b.x += s; cl(a); cl(b);
          if ((a.w + b.w) / 2 + px - Math.abs(b.x - a.x) <= .5) continue;
          a.x = ax; b.x = bx; // encostou na borda: separa na vertical
        }
        const s = (b.y >= a.y ? 1 : -1) * (oy / 2 + .1);
        a.y -= s; b.y += s; cl(a); cl(b);
      }
      if (!moved) break;
    }
  }
  // Pontuação estética (menor é melhor): cruzamentos, arestas sobre nós, arestas quase colineares, sobreposição.
  function score(N, E) {
    const side = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
    const hits = (a, b, n) => {
      let t0 = 0, t1 = 1;
      const dx = b.x - a.x, dy = b.y - a.y;
      return [[-dx, a.x - n.x + n.w / 2 + 2], [dx, n.x + n.w / 2 + 2 - a.x], [-dy, a.y - n.y + n.h / 2 + 2], [dy, n.y + n.h / 2 + 2 - a.y]].every(([p, q]) => {
        if (!p) return q >= 0;
        const r = q / p;
        if (p < 0) { if (r > t1) return false; t0 = Math.max(t0, r); } else { if (r < t0) return false; t1 = Math.min(t1, r); }
        return true;
      });
    };
    let s = 0;
    E.forEach((a, i) => {
      const A = N[a.s], B = N[a.o];
      E.forEach((b, j) => {
        if (j <= i) return;
        const c = [a.s, a.o].find(k => k === b.s || k === b.o);
        if (c == null) { if (side(A, B, N[b.s]) * side(A, B, N[b.o]) < 0 && side(N[b.s], N[b.o], A) * side(N[b.s], N[b.o], B) < 0) s += 1; return; }
        const p = N[a.s === c ? a.o : a.s], q = N[b.s === c ? b.o : b.s], o = N[c];
        const d = Math.abs(Math.atan2(p.y - o.y, p.x - o.x) - Math.atan2(q.y - o.y, q.x - o.x));
        if (Math.min(d, 2 * Math.PI - d) < .14) s += 2;
      });
      N.forEach(n => { if (n !== A && n !== B && hits(A, B, n)) s += 3; });
    });
    N.forEach((a, i) => N.forEach((b, j) => { if (j > i && Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2) s += 20; }));
    return s;
  }

  // Várias sementes fixas; fica a de melhor pontuação. Uma semente por tarefa, sem travar a página.
  function layout(G, W, alive, done) {
    const P = plan(G), seeds = [1, 7, 13, 29, 42, 61, 87, 101, 131, 167, 211, 257];
    // Altura proporcional à área das caixas (com folga), para o grafo crescer com o conteúdo.
    const A = G.N.reduce((s, n) => s + (n.w + 16) * (n.h + 14), 0) / W;
    const F = { W, H: Math.round(Math.max(W * .55, A * 2.2)) };
    let best = null;
    const step = k => {
      if (!alive()) return;
      simulate(G.N, G.E, F, P, seeds[k]);
      const s = score(G.N, G.E);
      if (!best || s < best.s) best = { s, pos: G.N.map(n => [n.x, n.y]) };
      if (k + 1 < seeds.length) { setTimeout(() => step(k + 1), 0); return; }
      G.N.forEach((n, i) => { [n.x, n.y] = best.pos[i]; });
      // Enquadramento: centraliza na horizontal e corta a altura no conteúdo.
      const b = f => Math[f > 0 ? 'max' : 'min'](...G.N.map(n => (Math.abs(f) === 1 ? n.x + f * n.w / 2 : n.y + Math.sign(f) * n.h / 2)));
      const x0 = b(-1), y0 = b(-2), sx = (W - (b(1) - x0)) / 2 - x0, h = b(2) - y0;
      G.N.forEach(n => { n.x += sx; n.y += 6 - y0; });
      done({ W, H: Math.ceil(h + 12), score: best.s });
    };
    step(0);
  }

  /* ---------- desenho ---------- */
  const MINW = 720;
  let seq = 0;
  function measurer(host) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), tx = document.createElementNS(svg.namespaceURI, 'text'), cache = new Map();
    svg.setAttribute('class', 'on-svg on-measure');
    svg.setAttribute('aria-hidden', 'true');
    svg.appendChild(tx);
    host.appendChild(svg);
    return {
      w(s, c, fs) {
        const k = `${c}|${fs}|${s}`;
        if (!cache.has(k)) { tx.setAttribute('class', c); tx.setAttribute('font-size', fs); tx.textContent = s; cache.set(k, tx.getComputedTextLength()); }
        return cache.get(k);
      },
      done() { svg.remove(); }
    };
  }
  // Quebra equilibrada: mesma quantidade de linhas, com a menor largura possível.
  function wrap(m, str, max, c, fs) {
    const words = String(str).split(/\s+/).filter(Boolean);
    const greedy = w => {
      const out = [];
      let cur = '';
      words.forEach(x => { const nx = cur ? `${cur} ${x}` : x; if (!cur || m.w(nx, c, fs) <= w) cur = nx; else { out.push(cur); cur = x; } });
      return cur ? out.concat(cur) : out;
    };
    const base = greedy(max);
    let lo = max * .4, hi = max, best = base;
    for (let k = 0; base.length > 1 && k < 7; k++) {
      const mid = (lo + hi) / 2, ls = greedy(mid);
      if (ls.length <= base.length && ls.every(l => m.w(l, c, fs) <= mid + .5)) { best = ls; hi = mid; } else lo = mid;
    }
    return best;
  }

  function sizeNodes(G, m, L) {
    G.N.forEach(n => {
      const sp = SPEC[n.cls], fs = sp.fs, mfs = 9, [pl, pr, pt, pb] = sp.pad;
      // Base "Memória semântica: dicionário…" → tipo em versalete numa linha, conteúdo embaixo.
      const kb = n.cls === 'KnowledgeBase' && n.label.match(/^([^:]{2,28}):\s+(.+)$/), text = kb ? kb[2] : n.label;
      const lines = wrap(m, text, sp.max, sp.c, fs).map(s => ({ s, c: sp.c, fs, lh: Math.round(fs * 1.24) }));
      if (kb) lines.unshift({ s: kb[1], c: 'on-t on-sc on-kd', fs: mfs, lh: Math.round(mfs * 1.5) });
      const sub = n.cls === 'Position' ? `${n.start || ''} – ${n.end || L.present}` : n.cls === 'Project' ? [n.code, n.year].filter(Boolean).join(' · ') : /Degree|Research/.test(n.cls) ? years(n.year).join('–') : '';
      if (sub) lines[n.cls === 'Project' ? 'unshift' : 'push']({ s: sub, c: 'on-t on-m', fs: mfs, lh: Math.round(mfs * 1.45) });
      n.lines = lines;
      n.w = Math.max(n.cls === 'Organization' ? 64 : 0, Math.ceil(Math.max(...lines.map(l => m.w(l.s, l.c, l.fs))) + pl + pr));
      n.h = Math.ceil(lines.reduce((a, l) => a + l.lh, 0) + pt + pb);
      n.dx = (pl - pr) / 2;
      n.top = -n.h / 2 + pt;
      n.poly = null;
    });
  }

  function svgMarkup(G, F, uid, L, esc) {
    const mk = (id, c) => `<marker id="${id}" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto"><path class="${c}" d="M0 1.2 10 5 0 8.8 2.6 5z"/></marker>`;
    let s = `<svg class="on-svg" width="${F.W}" height="${F.H}" viewBox="0 0 ${F.W} ${F.H}" role="group" aria-label="${esc(L.svg(G.N.length, G.E.length))}"><defs>${mk(`${uid}-a`, 'on-ah')}${mk(`${uid}-b`, 'on-ah on-ah-hl')}</defs><g class="on-es" aria-hidden="true">`;
    G.E.forEach((e, i) => {
      // Recorta a aresta na borda das duas formas; a ponta da seta para 1 px antes do traço.
      const a = G.N[e.s], b = G.N[e.o], [ux, uy] = unit(a, b), ta = rayHit(a, ux, uy), tb = rayHit(b, -ux, -uy) + 1;
      Object.assign(e, { x1: a.x + ux * ta, y1: a.y + uy * ta, x2: b.x - ux * tb, y2: b.y - uy * tb });
      s += R`<line class="on-e${e.p === 'retrievesFrom' ? ' on-dash' : e.p === 'uses' ? ' on-u' : ''}" data-e="${i}" x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" marker-end="url(#${uid}-a)"/>`;
    });
    s += '</g><g class="on-ns">';
    G.N.forEach(n => {
      let y = n.top;
      const tx = n.lines.map(l => { y += l.lh; return R`<text class="${l.c}" x="${n.dx}" y="${y - l.lh / 2 + l.fs * .34}" font-size="${l.fs}" text-anchor="middle">${esc(l.s)}</text>`; }).join('');
      s += R`<g class="on-n on-c-${n.cls}" data-i="${n.i}" transform="translate(${n.x} ${n.y})" tabindex="${n.i ? '-1' : '0'}" role="button" aria-pressed="false" aria-label="${esc(n.aria)}"><rect class="on-ring" x="${-n.w / 2 - 4}" y="${-n.h / 2 - 4}" width="${n.w + 8}" height="${n.h + 8}" rx="5"/>${shape(n.cls, n.w, n.h)}${tx}</g>`;
    });
    return `${s}</g><g class="on-ls" aria-hidden="true"></g></svg>`;
  }

  // Rótulos das arestas só na vizinhança realçada, desviando de nós e de outros rótulos.
  function placeLabels(G, edges, focus) {
    const placed = [];
    const over = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
    return edges.map(i => {
      const e = G.E[i], w = e.p.length * 4.6 + 6, dx = e.x2 - e.x1, dy = e.y2 - e.y1, len = Math.sqrt(dx * dx + dy * dy) || 1;
      let best = null;
      [.5, .4, .6, .3, .7].forEach(t => [0, 9, -9, 16, -16].forEach(o => {
        const x = e.x1 + dx * t - (dy / len) * o, y = e.y1 + dy * t + (dx / len) * o, r = [x - w / 2, y - 6, x + w / 2, y + 6];
        let c = Math.abs(t - .5) * 10 + Math.abs(o) * 1.5;
        placed.forEach(p => { c += over(r, p) * 6; });
        G.N.forEach(n => { c += over(r, [n.x - n.w / 2, n.y - n.h / 2, n.x + n.w / 2, n.y + n.h / 2]) * (focus.has(n.i) ? 3 : 1); });
        if (!best || c < best.c) best = { c, x, y, r };
      }));
      placed.push(best.r);
      return R`<text class="on-el" x="${best.x}" y="${best.y + 3.2}" text-anchor="middle">${e.p}</text>`;
    }).join('');
  }

  function captionHTML(G, L, esc) {
    let s = esc(L.cap(G.N.length, G.E.length, '\u0000')).replace('\u0000', '<code class="on-code-i">content.js</code>');
    if (G.E.some(e => e.p === 'retrievesFrom')) {
      const sn = document.querySelector('#sistemas-h .sec-n'), n = sn ? sn.textContent.trim() : '';
      s += esc(L.capAgents(n ? '\u0001' : '')).replace('\u0001', `<a class="xref" href="#sistemas">${esc(L.section)}&nbsp;${esc(n)}</a>`);
    }
    // A organização e a competência mais compartilhadas (mais classes de origem, depois mais arestas)
    // ilustram a resolução de entidades.
    [['Organization', L.capOrg], ['Skill', L.capSkill]].forEach(([cls, f]) => {
      let top = null;
      G.N.filter(n => n.cls === cls).forEach(o => {
        const by = {};
        G.E.forEach(e => { if (e.o === o.i && L.noun[G.N[e.s].cls]) by[G.N[e.s].cls] = (by[G.N[e.s].cls] || 0) + 1; });
        const c = Object.values(by).reduce((a, b) => a + b, 0), k = Object.keys(by).length * 99 + c;
        if (c > 1 && (!top || k > top.k)) top = { o, by, k };
      });
      if (!top) return;
      const parts = Object.keys(top.by).map(c => `${L.words[top.by[c]] || top.by[c]} ${L.noun[c][top.by[c] === 1 ? 0 : 1]}`);
      s += esc(f(top.o.label, parts.length > 1 ? `${parts.slice(0, -1).join(', ')} ${L.and} ${parts[parts.length - 1]}` : parts[0]));
    });
    return s;
  }

  /* ---------- módulo ---------- */
  (window.ArtigoEggs = window.ArtigoEggs || {}).ontology = function (el, ctx) {
    const { lang, C, t, esc } = ctx;
    const L = S[lang] || S.en;
    const G = build(C, t, lang);
    if (G.N.length < 2) { el.remove(); return; }
    const uid = `on-${++seq}`, ttl = turtle(G, L, lang), counts = {};
    const rel = e => `${G.N[e.s].label} ${L.rel[e.p]} ${G.N[e.o].label}`;
    G.N.forEach(n => {
      counts[n.cls] = (counts[n.cls] || 0) + 1;
      const det = n.cls === 'Position' ? ` (${n.start || ''} – ${n.end || L.present})` : n.code ? ` (${n.code})` : '';
      n.aria = `${L.cls[n.cls]}: ${n.label}${det}. ${G.E.filter(e => e.s === n.i || e.o === n.i).map(rel).join('; ')}.`;
    });
    const glyph = c => `<svg class="on-svg on-glyph" width="28" height="18" viewBox="-14 -9 28 18" aria-hidden="true" focusable="false">${shape(c, c === 'Skill' ? 22 : 24, c === 'Person' ? 12 : 14)}</svg>`;

    el.innerHTML = `
      <figure class="fig on-fig${ctx.reduced ? ' on-still' : ''}" id="on-fig" aria-labelledby="${uid}-cap">
        <div class="on-bar">
          <span class="on-swipe" aria-hidden="true" hidden>${esc(L.swipe)}</span>
          <div class="on-views" role="group" aria-label="${esc(L.views)}">
            <button type="button" class="on-v" data-v="g" aria-pressed="true" aria-controls="${uid}-g">${esc(L.graph)}</button>
            <button type="button" class="on-v" data-v="t" aria-pressed="false" aria-controls="${uid}-t">${esc(L.ttl)}</button>
          </div>
        </div>
        <div class="on-pane" id="${uid}-g">
          <div class="on-canvas"></div>
          <ul class="on-legend" aria-label="${esc(L.legend)}">${CLS.filter(c => counts[c]).map(c => `<li><button type="button" class="on-lg" data-c="${c}" aria-pressed="false">${glyph(c)}<span class="on-lg-t">${esc(L.cls[c])}</span><span class="on-lg-n">${counts[c]}</span></button></li>`).join('')}</ul>
          <p class="on-hint">${esc(L.hint)}</p>
          <ol class="sr-only" aria-label="${esc(L.list)}">${G.E.map(e => `<li>${esc(rel(e))}</li>`).join('')}</ol>
        </div>
        <div class="on-pane on-ttl" id="${uid}-t" hidden>
          <div class="on-ttl-bar"><span class="on-file">${esc(L.file)}</span><span class="on-count">${esc(L.triples(ttl.count))}</span><button type="button" class="on-dl">${esc(L.dl)}</button></div>
          <pre class="on-pre" tabindex="0" role="region" aria-label="${esc(L.code)}"><code>${highlight(ttl.text, esc)}</code></pre>
        </div>
        <figcaption class="cap" id="${uid}-cap"><span class="cap-l">${esc(ctx.figure)} ${esc(ctx.n)}:</span> ${captionHTML(G, L, esc)}</figcaption>
      </figure>`;

    const $ = s => el.querySelector(s), $$ = s => el.querySelectorAll(s);
    const fig = $('.on-fig'), canvas = $('.on-canvas'), swipe = $('.on-swipe');
    $$('.on-v').forEach(b => b.addEventListener('click', () => {
      $$('.on-v').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      $(`#${uid}-g`).hidden = b.dataset.v !== 'g';
      $(`#${uid}-t`).hidden = b.dataset.v !== 't';
      if (b.dataset.v === 'g') draw(false);
    }));
    $('.on-dl').addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([ttl.text], { type: 'text/turtle' }));
      a.download = L.file;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    });

    // Realce: hover/foco (temporário) ou fixado (clique, Enter); { n } = nó e vizinhança, { c } = classe.
    let hover = null, pin = null, svg = null, lastW = 0, job = 0;
    const nbr = G.N.map(() => []);
    G.E.forEach((e, i) => { nbr[e.s].push(i); nbr[e.o].push(i); });
    function apply() {
      if (!svg) return;
      const cur = hover || pin, nodes = new Set(), edges = cur && cur.n != null ? nbr[cur.n] : [];
      if (cur && cur.n != null) { nodes.add(cur.n); edges.forEach(i => { nodes.add(G.E[i].s); nodes.add(G.E[i].o); }); }
      if (cur && cur.c) G.N.forEach(n => { if (n.cls === cur.c) nodes.add(n.i); });
      svg.classList.toggle('on-dim', !!cur);
      svg.querySelectorAll('.on-n').forEach(g => {
        const i = +g.dataset.i;
        g.classList.toggle('on-hl', nodes.has(i));
        g.classList.toggle('on-focus', !!cur && cur.n === i);
        g.setAttribute('aria-pressed', String(!!pin && pin.n === i));
      });
      svg.querySelectorAll('.on-e').forEach(l => {
        const on = edges.includes(+l.dataset.e);
        l.classList.toggle('on-hl', on);
        l.setAttribute('marker-end', `url(#${uid}-${on ? 'b' : 'a'})`);
      });
      svg.querySelector('.on-ls').innerHTML = edges.length ? placeLabels(G, edges, nodes) : '';
      $$('.on-lg').forEach(b => b.setAttribute('aria-pressed', String(!!pin && pin.c === b.dataset.c)));
    }
    const same = (a, b) => !!a && !!b && a.n === b.n && a.c === b.c;
    const toggle = k => { pin = same(pin, k) ? null : k; apply(); };
    const listen = (node, k) => {
      ['pointerenter', 'focus'].forEach(ev => node.addEventListener(ev, e => { if (e.pointerType !== 'touch') { hover = k; apply(); } }));
      ['pointerleave', 'blur'].forEach(ev => node.addEventListener(ev, () => { if (same(hover, k)) { hover = null; apply(); } }));
      node.addEventListener('click', e => { e.stopPropagation(); toggle(k); });
    };
    $$('.on-lg').forEach(b => listen(b, { c: b.dataset.c }));

    // Teclado: um só ponto de tabulação (tabindex móvel); as setas vão ao nó mais próximo naquela direção.
    function bind() {
      const gs = [...svg.querySelectorAll('.on-n')];
      const go = j => { if (j < 0) return; gs.forEach(g => g.setAttribute('tabindex', +g.dataset.i === j ? '0' : '-1')); gs[j].focus(); };
      const next = (a, dx, dy) => G.N.reduce((best, n) => {
        const vx = n.x - a.x, vy = n.y - a.y, along = vx * dx + vy * dy, sc = along + Math.abs(vx * dy - vy * dx) * 3;
        return n !== a && along > 2 && sc < best[1] ? [n.i, sc] : best;
      }, [-1, Infinity])[0];
      gs.forEach(g => {
        const i = +g.dataset.i;
        listen(g, { n: i });
        g.addEventListener('keydown', ev => {
          const k = ev.key, D = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[k];
          if (D || k === 'Home' || k === 'End' || k === 'Enter' || k === ' ') ev.preventDefault();
          if (D) go(next(G.N[i], D[0], D[1]));
          else if (k === 'Home' || k === 'End') go(k === 'Home' ? 0 : gs.length - 1);
          else if (k === 'Enter' || k === ' ') toggle({ n: i });
          else if (k === 'Escape') { pin = null; hover = null; apply(); }
        });
      });
      svg.addEventListener('click', () => { if (pin) { pin = null; apply(); } });
    }

    function draw(force) {
      if (!el.isConnected) return false;
      // Abaixo de MINW o grafo mantém a largura mínima e a tela rola na horizontal (como as tabelas).
      const cw = Math.floor(canvas.clientWidth), W = Math.min(960, Math.max(MINW, cw)), wide = W > cw + 1;
      canvas.classList.toggle('on-scroll', wide);
      swipe.hidden = !wide;
      ['tabindex', 'role', 'aria-label'].forEach((a, k) => (wide ? canvas.setAttribute(a, ['0', 'region', L.scroll][k]) : canvas.removeAttribute(a)));
      if (!cw || (!force && W === lastW)) return true;
      lastW = W;
      const my = ++job, m = measurer(canvas);
      sizeNodes(G, m, L);
      m.done();
      layout(G, W, () => my === job && el.isConnected, F => {
        canvas.innerHTML = svgMarkup(G, F, uid, L, esc);
        canvas.style.minHeight = '';
        svg = canvas.querySelector('.on-svg');
        fig.dataset.score = F.score;
        bind();
        apply();
      });
      return true;
    }

    canvas.style.minHeight = `${Math.round(Math.min(960, canvas.clientWidth || 620) * .62)}px`;
    const start = () => {
      if (!draw(true) || !('ResizeObserver' in window)) return;
      let tm = 0;
      const ro = new ResizeObserver(() => { clearTimeout(tm); tm = setTimeout(() => { if (!draw(false)) ro.disconnect(); }, 120); });
      ro.observe(canvas);
    };
    // As caixas são medidas com as fontes reais: espera Newsreader e Inconsolata (no máx. 2,5 s).
    const FONTS = ['400 11px Newsreader', 'italic 400 11px Newsreader', '600 13px Newsreader', '400 9px Inconsolata'];
    if (!document.fonts || !document.fonts.load || FONTS.every(f => document.fonts.check(f))) start();
    else Promise.race([Promise.all(FONTS.map(f => document.fonts.load(f))).catch(() => null), new Promise(r => setTimeout(r, 2500))]).then(start);
  };
})();
