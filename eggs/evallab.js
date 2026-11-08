/* eggs/evallab.js — Apêndice B, "Suplemento estatístico" (Figuras B.1 e B.2).
   Sem bibliotecas: toda a estatística é
   calculada aqui e foi conferida contra uma implementação independente em Python
   (math.erfc, combinatória exata com Fractions, exemplo publicado de Newcombe 1998). */
(function () {
  'use strict';
  const E = (window.ArtigoEggs = window.ArtigoEggs || {});

  /* ============================== numérica ============================== */
  const Z = 1.959963984540054;          // Φ⁻¹(0,975)
  const ZB = 0.8416212335729143;        // Φ⁻¹(0,80)
  const LNG_HALF = 0.5723649429247001;  // ln Γ(1/2) = ln √π

  // Q(1/2, x): gama incompleta regularizada superior. Série para x < 1,5; fração contínua (Lentz) acima.
  function qHalf(x) {
    if (!(x > 0)) return 1;
    if (!isFinite(x)) return 0;
    const pre = Math.exp(-x + 0.5 * Math.log(x) - LNG_HALF);
    if (x < 1.5) {
      let ap = 0.5, del = 2, sum = 2;
      for (let i = 0; i < 200; i++) { ap += 1; del *= x / ap; sum += del; if (del < sum * 1e-17) break; }
      return 1 - sum * pre;
    }
    const TINY = 1e-300;
    let b = x + 0.5, c = 1 / TINY, d = 1 / b, h = d;
    for (let i = 1; i < 300; i++) {
      const an = -i * (i - 0.5);
      b += 2;
      d = an * d + b; if (Math.abs(d) < TINY) d = TINY;
      c = b + an / c; if (Math.abs(c) < TINY) c = TINY;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 1e-15) break;
    }
    return pre * h;
  }
  const erfc = x => (x >= 0 ? qHalf(x * x) : 2 - qHalf(x * x));
  const Phi = x => 0.5 * erfc(-x / Math.SQRT2);
  const chiSf = x => qHalf(x / 2);                                   // P(χ²₁ ≥ x) = erfc(√(x/2))
  const chiPdf = x => Math.exp(-x / 2) / Math.sqrt(2 * Math.PI * x);
  const nPdf = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));

  function wilson(k, n) {
    const p = k / n, z2 = Z * Z, den = 1 + z2 / n;
    const c = (p + z2 / (2 * n)) / den, h = Z / den * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n));
    return [k === 0 ? 0 : c - h, k === n ? 1 : c + h];
  }
  const wald = (k, n) => { const p = k / n, h = Z * Math.sqrt(p * (1 - p) / n); return [p - h, p + h]; };
  const nMargin = (p, e) => Math.ceil(Z * Z * p * (1 - p) / (e * e) - 1e-9);

  // ln n! acumulado (exato o bastante para N ≤ 40 000)
  const LF = [0];
  const lf = n => { for (let i = LF.length; i <= n; i++) LF[i] = LF[i - 1] + Math.log(i); return LF[n]; };
  // Fisher bilateral: soma das tabelas hipergeométricas com P ≤ P(observada)·(1 + 1e−7), como o R.
  function fisher(a, b, c, d) {
    const r1 = a + b, c1 = a + c, N = a + b + c + d;
    const base = lf(r1) + lf(N - r1) + lf(c1) + lf(N - c1) - lf(N);
    const lp = x => base - lf(x) - lf(r1 - x) - lf(c1 - x) - lf(N - r1 - c1 + x);
    const obs = lp(a);
    let p = 0;
    for (let x = Math.max(0, r1 + c1 - N); x <= Math.min(r1, c1); x++) { const l = lp(x); if (l <= obs + 1e-7) p += Math.exp(l); }
    return Math.min(1, p);
  }
  // IC de 95% para p1 − p2: escore híbrido de Newcombe (1998, método 10)
  function newcombe(x1, n1, x2, n2) {
    const p1 = x1 / n1, p2 = x2 / n2, [l1, u1] = wilson(x1, n1), [l2, u2] = wilson(x2, n2), d = p1 - p2;
    return [d - Math.hypot(p1 - l1, u2 - p2), d + Math.hypot(u1 - p1, p2 - l2)];
  }
  // n por braço para poder de 80%, α = 0,05 bilateral (aproximação normal, sem correção de continuidade)
  function nPerArm(p1, p2) {
    const pb = (p1 + p2) / 2, dd = Math.abs(p1 - p2);
    if (dd < 1e-12) return Infinity;
    const v = Z * Math.sqrt(2 * pb * (1 - pb)) + ZB * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2));
    return Math.ceil(v * v / (dd * dd) - 1e-9);
  }
  function analyze(t) {
    const [a, b, c, d] = t, nA = a + b, nB = c + d, N = nA + nB, cP = a + c, cF = b + d;
    const r = { a, b, c, d, nA, nB, N, cP, cF };
    if (!nA || !nB) { r.err = 'row'; return r; }
    r.pA = a / nA; r.pB = c / nB; r.diff = r.pB - r.pA;
    r.ci = newcombe(c, nB, a, nA);
    r.fisher = fisher(a, b, c, d);
    if (!cP || !cF) { r.err = 'col'; return r; }
    const den = nA * nB * cP * cF, ad = Math.abs(a * d - b * c), adY = Math.max(0, ad - N / 2);
    r.chi = N * ad * ad / den; r.pChi = chiSf(r.chi);
    r.chiY = N * adY * adY / den; r.pChiY = chiSf(r.chiY);
    r.minE = Math.min(nA, nB) * Math.min(cP, cF) / N;
    r.useF = r.minE < 5;
    r.p = r.useF ? r.fisher : r.pChi;
    r.same = a * nB === c * nA;
    r.nReq = nPerArm(r.pA, r.pB);
    // a fórmula normal só é crível se, no n sugerido, as contagens esperadas forem ≥ 5
    const pb = (r.pA + r.pB) / 2;
    r.nOk = isFinite(r.nReq) && r.nReq * Math.min(pb, 1 - pb) >= 5;
    return r;
  }

  /* ============================== formatação ============================== */
  function fmt(lang) {
    const pt = lang === 'pt', dec = pt ? ',' : '.', grp = pt ? '.' : ',';
    const num = (v, d = 0, sign = false) => {
      const s = Math.abs(v).toFixed(d), zero = +s === 0, [i, f] = s.split('.');
      return (v < 0 && !zero ? '−' : sign && !zero ? '+' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, grp) + (f ? dec + f : '');
    };
    const pct = (v, d = 1) => `${num(v * 100, d)}%`;
    const pv = p => (p < 0.001 ? `&lt; ${num(0.001, 3)}` : p >= 0.9995 ? (p > 1 - 1e-9 ? '= 1' : `&gt; ${num(0.999, 3)}`) : `= ${num(p, 3)}`);
    return { num, pct, pv };
  }
  const P = '<i>p</i>';

  /* ============================== textos ============================== */
  const S = {
    en: {
      principle: 'Principle', figure: 'Figure',
      lead: (pr, f1, f2) => `${pr ? `${pr} promises to measure whether the AI actually works, not just whether the demo looks good. ` : ''}These are the tools I use to judge whether an LLM eval result is real: how much uncertainty surrounds a single score (${f1}), and whether a gap between two prompts is signal or noise (${f2}). Both compute live in your browser: change the counts and every interval, curve and verdict updates.`,
      t1: 'How sure is an eval score?',
      cap1: 'Each curve is the normal approximation <span class="ev-nw">N(<i>p</i>, <i>p</i>(1 − <i>p</i>)/<i>n</i>)</span> to the sampling distribution of the observed accuracy, with the true accuracy <i>p</i> placed at one end of the 95% Wilson interval (shaded band). The observed score falls exactly at each curve’s outer 2.5% tail (filled), so the interval holds every true accuracy under which this score would not be surprising. Dashed: the Wald interval, symmetric by construction, which collapses to a point at 0% or 100%.',
      nL: 'Eval cases', kL: 'Correct', nR: 'Eval cases, logarithmic slider', kR: 'Accuracy',
      nVal: n => `${n} cases`, kVal: (k, n, p) => `${k} of ${n}, ${p}`,
      read: 'Reading.', observed: 'observed', trueEq: 'true =', axis1: 'accuracy',
      r1: (k, n, ph, L, U) => `With ${k}/${n} correct (${ph}), the true accuracy is plausibly between ${L} and ${U} (95% Wilson).`,
      waldZero: (ph, n) => ` Wald says exactly ${ph}, with zero width: certainty from ${n} cases, which is precisely how it misbehaves at the boundary.`,
      waldClip: (l, u, edge, raw) => ` Wald gives ${l} to ${u}, but only after clipping at ${edge}; unclipped it would reach ${raw}.`,
      waldOk: (l, u) => ` Wald gives ${l} to ${u}.`,
      margin: m => ` For a ±3-point margin at this accuracy you’d need <i>n</i> ≈ ${m} cases.`,
      marginEdge: (ph, m) => ` For a ±3-point margin, <i>z</i>²<i>p</i>(1 − <i>p</i>)/<i>e</i>² gives <i>n</i> ≈ 0 at ${ph}, the same boundary failure; the conservative <i>p</i> = 50% gives <i>n</i> ≈ ${m}.`,
      d1: (lo, hi, L, U, ph, wl, wu, tail) => `Chart: accuracy axis from ${lo} to ${hi}. A shaded band marks the 95% Wilson interval, ${L} to ${U}. A vertical line marks the observed accuracy, ${ph}. Normal curves centred on each end of the interval show the sampling distribution there; the observed value cuts off ${tail} in each outer tail. A dashed line marks the Wald interval, ${wl} to ${wu}.`,
      t2: 'Did prompt B really beat prompt A?',
      cap2: 'Edit the 2 × 2 table of eval outcomes. The curve is the χ² density with 1 degree of freedom, the distribution of Pearson’s statistic when both prompts share one pass rate; the filled tail beyond the observed value is its <i>p</i>-value, and the dashed line marks the 5% critical value, 3.84. Fisher’s test is exact (hypergeometric, two-sided); the interval for the difference is Newcombe’s hybrid score interval; the sample size uses the normal approximation with the observed rates taken as true. All of this assumes the prompts ran on independent sets of cases: if they ran on the same cases, the data are paired and McNemar’s test on the discordant pairs is the right tool.',
      ctCap: 'Eval outcomes by prompt (editable)', sumCap: 'Test results',
      pass: 'Pass', fail: 'Fail', total: 'Total', prompt: 'Prompt', pA: 'Prompt A', pB: 'Prompt B',
      cellL: (pr, col) => `${pr}, ${col}`,
      stat: 'Statistic', value: 'Value',
      rates: 'Pass rate, A / B', diff: 'Difference, B − A', ci: '95% CI (Newcombe)', pp: 'pp', to: 'to',
      pearson: 'Pearson χ²', yates: 'Yates-corrected χ²', fisher: 'Fisher’s exact, two-sided', power: 'Cases per prompt, 80% power',
      verdict: 'Verdict.', axis2: 'Pearson χ² statistic (df = 1)', crit: '5%: 3.84', undef: 'χ² undefined: a margin is zero',
      testP: 'Pearson χ²', testF: 'Fisher’s exact test; an expected count is below 5',
      vInvalid: 'Counts must be whole numbers from 0 to 10,000.',
      vRow: 'Each prompt needs at least one case before there is anything to compare.',
      vCol: allPass => `Every case ${allPass ? 'passed' : 'failed'} under both prompts, so the table carries no information about a difference: χ² is undefined and Fisher’s ${P} = 1. ${allPass ? 'Harder' : 'Easier'} cases would tell the prompts apart.`,
      vSame: (rate, ci) => `Identical pass rates (${rate}): there is no observed difference to test. The 95% CI for the difference, ${ci} points, shows how large a gap these counts could still hide.`,
      vSig: (pv, test, up, dd, ci) => `${P} ${pv} (${test}): B’s pass rate is significantly ${up ? 'higher' : 'lower'} than A’s at α = 0.05, by ${dd} percentage points (95% CI ${ci}). ${up ? 'Before shipping B, confirm the gain on fresh cases.' : 'Keep prompt A.'}`,
      vNon: (pv, test, up, ci) => `${P} ${pv} (${test}): not enough evidence that B ${up ? 'beats' : 'trails'} A at α = 0.05. That is not evidence they are equal either: the 95% CI for the difference runs from ${ci} percentage points. Collect more cases.`,
      vPow: (n, dd) => ` About ${n} cases per prompt would detect a ${dd}-point difference with 80% power.`,
      vPowNo: ' For a gap this extreme on so few cases, the normal-approximation sample size is not trustworthy.',
      vSplit: (pc, pf) => ` Caution: Pearson’s ${P} ${pc} and Fisher’s exact ${P} ${pf} fall on opposite sides of 0.05, so treat this as borderline.`,
      d2: (xmax, chi, pv) => `Chart: chi-square density with 1 degree of freedom, from 0 to ${xmax}. ${chi ? `A vertical line marks the observed statistic, ${chi}; the shaded right tail beyond it has area ${pv}, the p-value.` : 'No statistic is marked because a margin of the table is zero.'} A dashed line marks the 5% critical value, 3.84.`
    },
    pt: {
      principle: 'Princípio', figure: 'Figura',
      lead: (pr, f1, f2) => `${pr ? `O ${pr} promete medir se a IA realmente funciona, e não só se a demo parece boa. ` : ''}Estas são as ferramentas que uso para julgar se o resultado de uma avaliação de LLM é real: quanta incerteza cerca uma única nota (${f1}) e se a diferença entre dois prompts é sinal ou ruído (${f2}). As duas calculam ao vivo, no seu navegador: mude as contagens e cada intervalo, curva e veredito se atualiza.`,
      t1: 'Quão confiável é a nota de uma avaliação?',
      cap1: 'Cada curva é a aproximação normal <span class="ev-nw">N(<i>p</i>, <i>p</i>(1 − <i>p</i>)/<i>n</i>)</span> da distribuição amostral da acurácia observada, com a acurácia real <i>p</i> numa das pontas do intervalo de Wilson de 95% (faixa sombreada). A nota observada cai exatamente na cauda externa de 2,5% de cada curva (preenchida); assim, o intervalo contém toda acurácia real sob a qual essa nota não seria surpreendente. Tracejado: o intervalo de Wald, simétrico por construção, que colapsa num ponto em 0% ou 100%.',
      nL: 'Casos', kL: 'Acertos', nR: 'Casos, controle logarítmico', kR: 'Acurácia',
      nVal: n => `${n} casos`, kVal: (k, n, p) => `${k} de ${n}, ${p}`,
      read: 'Leitura.', observed: 'observado', trueEq: 'real =', axis1: 'acurácia',
      r1: (k, n, ph, L, U) => `Com ${k}/${n} acertos (${ph}), a acurácia real está plausivelmente entre ${L} e ${U} (Wilson, 95%).`,
      waldZero: (ph, n) => ` Wald diz exatamente ${ph}, com largura zero: certeza a partir de ${n} casos, que é justamente como ele falha na fronteira.`,
      waldClip: (l, u, edge, raw) => ` Wald dá ${l} a ${u}, mas só depois de cortar em ${edge}; sem o corte, chegaria a ${raw}.`,
      waldOk: (l, u) => ` Wald dá ${l} a ${u}.`,
      margin: m => ` Para uma margem de ±3 pontos com essa acurácia, você precisaria de <i>n</i> ≈ ${m} casos.`,
      marginEdge: (ph, m) => ` Para uma margem de ±3 pontos, <i>z</i>²<i>p</i>(1 − <i>p</i>)/<i>e</i>² dá <i>n</i> ≈ 0 em ${ph}, a mesma falha na fronteira; com o conservador <i>p</i> = 50%, <i>n</i> ≈ ${m}.`,
      d1: (lo, hi, L, U, ph, wl, wu, tail) => `Gráfico: eixo de acurácia de ${lo} a ${hi}. Uma faixa sombreada marca o intervalo de Wilson de 95%, de ${L} a ${U}. Uma linha vertical marca a acurácia observada, ${ph}. Curvas normais centradas em cada ponta do intervalo mostram a distribuição amostral ali; o valor observado deixa ${tail} em cada cauda externa. Uma linha tracejada marca o intervalo de Wald, de ${wl} a ${wu}.`,
      t2: 'O prompt B superou mesmo o prompt A?',
      cap2: 'Edite a tabela 2 × 2 de resultados da avaliação. A curva é a densidade χ² com 1 grau de liberdade, a distribuição da estatística de Pearson quando os dois prompts têm a mesma taxa de aprovação; a cauda preenchida além do valor observado é o valor-<i>p</i>, e a linha tracejada marca o valor crítico de 5%, 3,84. O teste de Fisher é exato (hipergeométrico, bilateral); o intervalo para a diferença é o de escore híbrido de Newcombe; o tamanho amostral usa a aproximação normal, tomando as taxas observadas como verdadeiras. Tudo isso supõe que os prompts rodaram em conjuntos independentes de casos: se rodaram nos mesmos casos, os dados são pareados e a ferramenta certa é o teste de McNemar nos pares discordantes.',
      ctCap: 'Resultados da avaliação por prompt (editável)', sumCap: 'Resultados dos testes',
      pass: 'Passou', fail: 'Falhou', total: 'Total', prompt: 'Prompt', pA: 'Prompt A', pB: 'Prompt B',
      cellL: (pr, col) => `${pr}, ${col}`,
      stat: 'Estatística', value: 'Valor',
      rates: 'Aprovação, A / B', diff: 'Diferença, B − A', ci: 'IC 95% (Newcombe)', pp: 'p.p.', to: 'a',
      pearson: 'χ² de Pearson', yates: 'χ² com correção de Yates', fisher: 'Fisher exato, bilateral', power: 'Casos por prompt, poder 80%',
      verdict: 'Veredito.', axis2: 'estatística χ² de Pearson (1 g.l.)', crit: '5%: 3,84', undef: 'χ² indefinido: uma margem é zero',
      testP: 'χ² de Pearson', testF: 'teste exato de Fisher; há contagem esperada abaixo de 5',
      vInvalid: 'As contagens devem ser números inteiros de 0 a 10.000.',
      vRow: 'Cada prompt precisa de ao menos um caso para haver o que comparar.',
      vCol: allPass => `Todos os casos ${allPass ? 'passaram' : 'falharam'} nos dois prompts, então a tabela não traz informação sobre diferença: o χ² é indefinido e o ${P} de Fisher = 1. Casos mais ${allPass ? 'difíceis' : 'fáceis'} separariam os prompts.`,
      vSame: (rate, ci) => `Taxas de aprovação idênticas (${rate}): não há diferença observada a testar. O IC de 95% para a diferença, de ${ci} pontos, mostra o tamanho da diferença que essas contagens ainda poderiam esconder.`,
      vSig: (pv, test, up, dd, ci) => `${P} ${pv} (${test}): a taxa de aprovação de B é significativamente ${up ? 'maior' : 'menor'} que a de A a α = 0,05, por ${dd} pontos percentuais (IC 95% ${ci}). ${up ? 'Antes de colocar B em produção, confirme o ganho em casos novos.' : 'Fique com o prompt A.'}`,
      vNon: (pv, test, up, ci) => `${P} ${pv} (${test}): não há evidência suficiente de que B ${up ? 'supera' : 'fica atrás de'} A a α = 0,05. Isso também não é evidência de que sejam iguais: o IC de 95% para a diferença vai de ${ci} pontos percentuais. Colete mais casos.`,
      vPow: (n, dd) => ` Cerca de ${n} casos por prompt detectariam uma diferença de ${dd} pontos com poder de 80%.`,
      vPowNo: ' Para uma diferença tão extrema com tão poucos casos, o tamanho amostral pela aproximação normal não é confiável.',
      vSplit: (pc, pf) => ` Cuidado: o ${P} de Pearson (${pc.replace(/^= /, '')}) e o ${P} exato de Fisher (${pf.replace(/^= /, '')}) ficam em lados opostos de 0,05; trate como resultado limítrofe.`,
      d2: (xmax, chi, pv) => `Gráfico: densidade qui-quadrado com 1 grau de liberdade, de 0 a ${xmax}. ${chi ? `Uma linha vertical marca a estatística observada, ${chi}; a cauda direita sombreada além dela tem área ${pv}, o valor-p.` : 'Nenhuma estatística é marcada porque uma margem da tabela é zero.'} Uma linha tracejada marca o valor crítico de 5%, 3,84.`
    }
  };

  /* ============================== estado (sobrevive à troca de idioma) ============================== */
  const ST = { n: 50, k: 45, acc: 0.9, t: [38, 12, 44, 6] };
  const N_MIN = 10, N_MAX = 2000, LR = Math.log(N_MAX / N_MIN), CMAX = 10000;
  const n2s = n => Math.round(1000 * Math.log(n / N_MIN) / LR);
  const s2n = v => Math.round(N_MIN * Math.exp(v / 1000 * LR));
  const isInt = (s, lo, hi) => /^\s*\d+\s*$/.test(s) && +s >= lo && +s <= hi;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  let mctx = null;
  function tw(s, fs, it) {
    if (!mctx) mctx = document.createElement('canvas').getContext('2d');
    mctx.font = `${it ? 'italic ' : ''}${fs}px Newsreader, Georgia, serif`;
    return mctx.measureText(s).width;
  }
  const f1 = v => v.toFixed(1);
  const svg = (W, H, inner) => `<svg class="ev-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">${inner}</svg>`;
  const txt = (x, y, s, cls, anchor, fs) => `<text x="${f1(x)}" y="${f1(y)}" class="${cls}" text-anchor="${anchor || 'middle'}" font-size="${fs}">${s}</text>`;

  /* ---------- Figura B.1: Wilson por inversão do teste de escore ---------- */
  function chart1(W, n, k, s, F) {
    const ph = k / n, [L, U] = wilson(k, n), [w0, w1] = wald(k, n), wl = Math.max(0, w0), wu = Math.min(1, w1);
    const sdL = Math.sqrt(L * (1 - L) / n), sdU = Math.sqrt(U * (1 - U) / n);
    const narrow = W < 460, fs = narrow ? 11.5 : 12.5, pl = 16, pr = 16, iw = W - pl - pr;
    const a0 = Math.max(0, Math.min(L - 3.4 * sdL, wl)), b0 = Math.min(1, Math.max(U + 3.4 * sdU, wu));
    const maxT = Math.max(3, Math.floor(iw / (narrow ? 52 : 62)));
    let lo = 0, hi = 1, step = 0.2;
    for (const st of [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2]) {
      step = st;
      lo = Math.max(0, Math.floor(a0 / st + 1e-9) * st); hi = Math.min(1, Math.ceil(b0 / st - 1e-9) * st);
      if ((hi - lo) / st <= maxT + 1e-9) break;
    }
    const H = narrow ? 228 : 244, yObs = 13, yW = 34, yD = 52, top = 70, base = H - 46;
    const X = v => pl + (v - lo) / (hi - lo) * iw;
    const cs = [];
    if (k > 0) cs.push({ m: L, s: sdL, t0: ph, t1: Math.min(hi, L + 5 * sdL) });
    if (k < n) cs.push({ m: U, s: sdU, t0: Math.max(lo, U - 5 * sdU), t1: ph });
    const peak = Math.max(...cs.map(c => 1 / (c.s * Math.sqrt(2 * Math.PI))));
    const Y = f => base - f / peak * (base - top - 16);
    const path = (c, x0, x1, close) => {
      let d = '';
      for (let i = 0; i <= 160; i++) { const x = x0 + (x1 - x0) * i / 160; d += `${i ? 'L' : 'M'}${f1(X(x))} ${f1(Y(nPdf(x, c.m, c.s)))}`; }
      return close ? `${d}L${f1(X(x1))} ${base}L${f1(X(x0))} ${base}Z` : d;
    };
    let o = `<rect class="ev-band" x="${f1(X(L))}" y="${yW - 11}" width="${f1(Math.max(1, X(U) - X(L)))}" height="${base - yW + 11}"/>`;
    cs.forEach(c => { if (c.t1 > c.t0) o += `<path class="ev-tail" d="${path(c, c.t0, c.t1, true)}"/>`; });
    cs.forEach(c => { o += `<path class="ev-cv" d="${path(c, Math.max(lo, c.m - 4.6 * c.s), Math.min(hi, c.m + 4.6 * c.s))}"/>`; });
    // fronteira em 0% / 100%: a aproximação normal "vaza" para fora do possível e é cortada ali
    if (cs.some(c => c.m + 4.6 * c.s > 1) && hi === 1) o += `<path class="ev-wall" d="M${f1(X(1))} ${top - 4}V${base}"/>`;
    if (cs.some(c => c.m - 4.6 * c.s < 0) && lo === 0) o += `<path class="ev-wall" d="M${f1(X(0))} ${top - 4}V${base}"/>`;
    // rótulos das curvas, sem colisão
    const labs = cs.map(c => ({ x: X(c.m), y: Y(1 / (c.s * Math.sqrt(2 * Math.PI))) - 8, s: `${s.trueEq} ${F.pct(c.m)}`, a: 'middle' }));
    labs.forEach(l => { l.w = tw(l.s, fs - 0.5, true); });
    if (labs.length === 2 && labs[0].x + labs[0].w / 2 + 8 > labs[1].x - labs[1].w / 2) {
      labs[0].a = 'end'; labs[0].x += 6; labs[1].a = 'start'; labs[1].x -= 6;
    }
    labs.forEach(l => {
      if (l.a === 'middle') l.x = clamp(l.x, 2 + l.w / 2, W - 2 - l.w / 2);
      else if (l.a === 'end') l.x = Math.max(l.x, 2 + l.w); else l.x = Math.min(l.x, W - 2 - l.w);
      o += txt(l.x, l.y, l.s, 'ev-t ev-it ev-halo', l.a, fs - 0.5);
    });
    // linha da acurácia observada (com seta de massa pontual quando k = 0 ou k = n)
    const xo = X(ph);
    o += `<path class="ev-obs" d="M${f1(xo)} ${yObs + 6}V${base}"/>`;
    if (k === 0 || k === n) o += `<path class="ev-ah" d="M${f1(xo - 4)} ${top + 8}L${f1(xo)} ${top - 1}L${f1(xo + 4)} ${top + 8}Z"/>`;
    const ol = `${s.observed} ${F.pct(ph)}`, ow = tw(ol, fs, false);
    o += txt(clamp(xo, 2 + ow / 2, W - 2 - ow / 2), yObs, ol, 'ev-t ev-ink', 'middle', fs);
    // intervalos (estilo forest plot)
    const row = (x0, x1, y, cls, lab) => {
      let r = x1 - x0 < 1.5 ? `<circle class="ev-pt" cx="${f1(x0)}" cy="${y}" r="3"/>`
        : `<path class="${cls}" d="M${f1(x0)} ${y}H${f1(x1)}M${f1(x0)} ${y - 5}V${y + 5}M${f1(x1)} ${y - 5}V${y + 5}"/>`;
      const w = tw(lab.toUpperCase(), fs, false) * 0.8 + lab.length * fs * 0.06 + 2; // versalete + espaçamento
      if (x0 - 7 - w >= 1) r += txt(x0 - 7, y + 4, lab, 'ev-t ev-sc', 'end', fs);
      else if (x1 + 7 + w <= W - 1) r += txt(x1 + 7, y + 4, lab, 'ev-t ev-sc', 'start', fs);
      else r += txt(Math.max(1, x0 - 7 - w), y - 7, lab, 'ev-t ev-sc', 'start', fs);
      return r;
    };
    o += row(X(L), X(U), yW, 'ev-wil', 'Wilson');
    o += row(X(wl), X(wu), yD, 'ev-wald', 'Wald');
    // eixo
    o += `<path class="ev-ax" d="M${pl} ${base + 0.5}H${W - pr}"/>`;
    const dec = step >= 0.01 ? 0 : 1, nt = Math.round((hi - lo) / step);
    for (let i = 0; i <= nt; i++) {
      const v = lo + i * step, x = X(v);
      o += `<path class="ev-ax" d="M${f1(x)} ${base}V${base + 5}"/>` + txt(x, base + 18, F.pct(v, dec), 'ev-t', 'middle', fs - 0.5);
    }
    o += txt(pl + iw / 2, base + 37, s.axis1, 'ev-t ev-it', 'middle', fs);
    // área da cauda externa (deve ser 2,5%: confere a construção ao vivo)
    const tail = F.pct(k > 0 ? 1 - Phi((ph - L) / sdL) : Phi((ph - U) / sdU));
    return { svg: svg(W, H, o), desc: s.d1(F.pct(lo, dec), F.pct(hi, dec), F.pct(L), F.pct(U), F.pct(ph), F.pct(wl), F.pct(wu), tail) };
  }

  /* ---------- Figura B.2: densidade χ²₁ ---------- */
  function chart2(W, r, s, F) {
    const narrow = W < 460, fs = narrow ? 11.5 : 12.5, H = narrow ? 186 : 196, pl = 16, pr = 16, iw = W - pl - pr;
    const top = 40, base = H - 46, ok = r.chi !== undefined;
    const xmax = ok && r.chi > 6.4 ? Math.min(16, Math.ceil(r.chi * 1.25 / 2) * 2) : 8;
    const X = v => pl + v / xmax * iw, YM = 0.5, Y = f => base - Math.min(f, YM * 1.3) / YM * (base - top);
    let curve = '';
    for (let i = 1; i <= 200; i++) { const x = xmax * (i / 200) ** 2; curve += `${i > 1 ? 'L' : 'M'}${f1(X(x))} ${f1(Y(chiPdf(x)))}`; }
    let o = `<defs><clipPath id="ev-clip2"><rect x="0" y="${top - 6}" width="${W}" height="${base - top + 6}"/></clipPath></defs>`;
    if (ok && r.chi < xmax) {
      let tl = `M${f1(X(r.chi))} ${base}`;
      for (let i = 0; i <= 80; i++) { const x = r.chi + (xmax - r.chi) * i / 80; tl += `L${f1(X(x))} ${f1(Y(chiPdf(Math.max(x, 1e-6))))}`; }
      o += `<path class="ev-tail" clip-path="url(#ev-clip2)" d="${tl}L${f1(X(xmax))} ${base}Z"/>`;
    }
    o += `<path class="ev-cv" clip-path="url(#ev-clip2)" d="${curve}"/>`;
    // valor crítico
    const xc = X(3.841458820694124), cw = tw(s.crit, fs - 0.5, false);
    const xo = ok ? X(Math.min(r.chi, xmax)) : -1e3;
    o += `<path class="ev-crit" d="M${f1(xc)} ${top + 4}V${base}"/>`;
    const leftC = xo > xc && xo < xc + cw + 12;
    o += txt(leftC ? xc - 5 : xc + 5, top + 14, s.crit, 'ev-t ev-halo', leftC ? 'end' : 'start', fs - 0.5);
    // estatística observada
    if (ok) {
      const lab = `χ² = ${F.num(r.chi, 2)}, <tspan font-style="italic">p</tspan> ${F.pv(r.pChi)}`;
      const lw = tw(`χ² = ${F.num(r.chi, 2)}, p ${F.pv(r.pChi).replace(/&[lg]t;/, '<')}`, fs, false);
      o += `<path class="ev-obs" d="M${f1(xo)} 20V${base}"/>`;
      if (r.chi > xmax) o += `<path class="ev-ah" d="M${f1(xo - 9)} ${top + 18}L${f1(xo)} ${top + 22}L${f1(xo - 9)} ${top + 26}Z"/>`;
      o += txt(clamp(xo, 2 + lw / 2, W - 2 - lw / 2), 13, lab, 'ev-t ev-ink', 'middle', fs);
    } else {
      o += txt(pl + iw * 0.62, top + 34, s.undef, 'ev-t ev-it', 'middle', fs);
    }
    o += `<path class="ev-ax" d="M${pl} ${base + 0.5}H${W - pr}"/>`;
    for (let v = 0; v <= xmax; v += 2) o += `<path class="ev-ax" d="M${f1(X(v))} ${base}V${base + 5}"/>` + txt(X(v), base + 18, F.num(v), 'ev-t', 'middle', fs - 0.5);
    o += txt(pl + iw / 2, base + 37, s.axis2, 'ev-t ev-it', 'middle', fs);
    return { svg: svg(W, H, o), desc: s.d2(F.num(xmax), ok ? F.num(r.chi, 2) : '', ok ? F.num(r.pChi, 3) : '') };
  }

  let evRO = null, evResize = null;

  E.evallab = function (el, ctx) {
    const lang = ctx.lang === 'pt' ? 'pt' : 'en', s = S[lang], F = fmt(lang), esc = ctx.esc, C = ctx.C || {};
    const N = ctx.n || 'B', figW = ctx.figure || s.figure;
    const tr = v => (ctx.t ? ctx.t(v) : v);
    const pi = ((C.about && C.about.principles) || []).findIndex(p => /statist|estat/i.test(String(tr(p.title))));
    const nb = x => x.replace(/ /g, '&nbsp;');
    const xr = (id, label) => `<a class="xref" href="#${id}">${nb(esc(label))}</a>`;
    const prRef = pi >= 0 && document.getElementById(`principio-${pi + 1}`) ? xr(`principio-${pi + 1}`, `${s.principle} ${pi + 1}`) : '';
    el.classList.add('ev');
    el.classList.toggle('ev-still', !!ctx.reduced);
    const cell = (id, i, pr, col) => `<input type="number" class="ev-num ev-cell" id="${id}" min="0" max="${CMAX}" step="1" inputmode="numeric" value="${ST.t[i]}" aria-label="${esc(s.cellL(pr, col))}">`;
    el.innerHTML = `
      <p class="ev-lead">${s.lead(prRef, xr('ev-fig-1', `${figW} ${N}.1`), xr('ev-fig-2', `${figW} ${N}.2`))}</p>
      <figure class="fig ev-fig" id="ev-fig-1">
        <div class="ev-ctrl">
          <label class="ev-lab" for="ev-n">${s.nL}, <i>n</i></label>
          <input type="number" class="ev-num" id="ev-n" min="${N_MIN}" max="${N_MAX}" step="1" inputmode="numeric" value="${ST.n}">
          <input type="range" class="ev-range" id="ev-nr" min="0" max="1000" step="1" aria-label="${esc(s.nR)}">
          <span class="ev-out" aria-hidden="true"></span>
          <label class="ev-lab" for="ev-k">${s.kL}, <i>k</i></label>
          <input type="number" class="ev-num" id="ev-k" min="0" step="1" inputmode="numeric" value="${ST.k}">
          <input type="range" class="ev-range" id="ev-kr" min="0" step="1" aria-label="${esc(s.kR)}">
          <output class="ev-out" id="ev-acc" for="ev-k ev-kr"></output>
        </div>
        <p class="ev-read" id="ev-r1" aria-live="polite"></p>
        <div class="ev-plot" id="ev-p1"></div>
        <p class="sr-only" id="ev-d1"></p>
        <figcaption class="cap"><span class="cap-l">${esc(figW)} ${esc(N)}.1:</span> <span class="ev-ct">${s.t1}</span> ${s.cap1}</figcaption>
      </figure>
      <figure class="fig ev-fig" id="ev-fig-2">
        <div class="ev-tabs">
          <table class="bt ev-tbl ev-cont">
            <caption class="sr-only">${s.ctCap}</caption>
            <thead><tr><th scope="col"><span class="sr-only">${s.prompt}</span></th><th scope="col" class="r">${s.pass}</th><th scope="col" class="r">${s.fail}</th><th scope="col" class="r">${s.total}</th></tr></thead>
            <tbody>
              <tr><th scope="row">${s.pA}</th><td class="r">${cell('ev-a', 0, s.pA, s.pass)}</td><td class="r">${cell('ev-b', 1, s.pA, s.fail)}</td><td class="r" id="ev-nA"></td></tr>
              <tr><th scope="row">${s.pB}</th><td class="r">${cell('ev-c', 2, s.pB, s.pass)}</td><td class="r">${cell('ev-d', 3, s.pB, s.fail)}</td><td class="r" id="ev-nB"></td></tr>
              <tr class="ev-tot"><th scope="row">${s.total}</th><td class="r" id="ev-cP"></td><td class="r" id="ev-cF"></td><td class="r" id="ev-N"></td></tr>
            </tbody>
          </table>
          <table class="bt ev-tbl ev-sum">
            <caption class="sr-only">${s.sumCap}</caption>
            <thead><tr><th scope="col">${s.stat}</th><th scope="col" class="r">${s.value}</th></tr></thead>
            <tbody id="ev-sum"></tbody>
          </table>
        </div>
        <p class="ev-read ev-verdict" aria-live="polite"><span class="run-in">${s.verdict}</span> <span id="ev-v"></span></p>
        <div class="ev-plot" id="ev-p2"></div>
        <p class="sr-only" id="ev-d2"></p>
        <figcaption class="cap"><span class="cap-l">${esc(figW)} ${esc(N)}.2:</span> <span class="ev-ct">${s.t2}</span> ${s.cap2}</figcaption>
      </figure>`;

    const $ = id => el.querySelector(`#${id}`);
    const nIn = $('ev-n'), nR = $('ev-nr'), kIn = $('ev-k'), kR = $('ev-kr'), accOut = $('ev-acc');
    const cells = ['ev-a', 'ev-b', 'ev-c', 'ev-d'].map($);
    const fill = (r, v, max) => r.style.setProperty('--ev-p', `${max ? (v / max) * 100 : 0}%`);
    let lastW = 0;

    function draw1() {
      const W = Math.floor($('ev-p1').clientWidth);
      if (!W) return;
      const c = chart1(W, ST.n, ST.k, s, F);
      $('ev-p1').innerHTML = c.svg; $('ev-d1').textContent = c.desc;
    }
    function draw2() {
      const W = Math.floor($('ev-p2').clientWidth);
      if (!W) return;
      const r = ST.bad ? { err: 'invalid' } : analyze(ST.t);
      const c = chart2(W, r, s, F);
      $('ev-p2').innerHTML = c.svg; $('ev-d2').textContent = c.desc;
    }

    function update1(src) {
      const { n, k } = ST, ph = k / n, [L, U] = wilson(k, n), [w0, w1] = wald(k, n);
      if (src !== nIn) { nIn.value = n; nIn.removeAttribute('aria-invalid'); }
      if (src !== kIn) { kIn.value = k; kIn.removeAttribute('aria-invalid'); }
      kIn.max = n; kR.max = n;
      if (src !== nR) nR.value = n2s(n);
      if (src !== kR) kR.value = k;
      fill(nR, +nR.value, 1000); fill(kR, k, n);
      nR.setAttribute('aria-valuetext', s.nVal(F.num(n)));
      kR.setAttribute('aria-valuetext', s.kVal(F.num(k), F.num(n), F.pct(ph)));
      accOut.textContent = F.pct(ph);
      let t = s.r1(F.num(k), F.num(n), F.pct(ph), F.pct(L), F.pct(U));
      if (k === 0 || k === n) t += s.waldZero(F.pct(ph), F.num(n));
      else if (w0 < 0 || w1 > 1) t += s.waldClip(F.pct(Math.max(0, w0)), F.pct(Math.min(1, w1)), w1 > 1 ? '100%' : '0%', F.pct(w1 > 1 ? w1 : w0));
      else t += s.waldOk(F.pct(w0), F.pct(w1));
      t += k === 0 || k === n ? s.marginEdge(F.pct(ph, 0), F.num(nMargin(0.5, 0.03))) : s.margin(F.num(nMargin(ph, 0.03)));
      $('ev-r1').innerHTML = `<span class="run-in">${s.read}</span> ${t}`;
      draw1();
    }

    function update2() {
      const tds = { 'ev-nA': 0, 'ev-nB': 0, 'ev-cP': 0, 'ev-cF': 0, 'ev-N': 0 };
      const sum = $('ev-sum'), v = $('ev-v');
      const rowsHTML = rows => rows.map(([k, val]) => `<tr><th scope="row">${k}</th><td class="r">${val}</td></tr>`).join('');
      const dash = '—';
      if (ST.bad) {
        Object.keys(tds).forEach(id => { $(id).textContent = dash; });
        sum.innerHTML = rowsHTML([[s.rates, dash], [s.diff, dash], [s.ci, dash], [s.pearson, dash], [s.yates, dash], [s.fisher, dash], [s.power, dash]]);
        v.innerHTML = s.vInvalid;
        draw2();
        return;
      }
      const r = analyze(ST.t);
      $('ev-nA').textContent = F.num(r.nA); $('ev-nB').textContent = F.num(r.nB);
      $('ev-cP').textContent = F.num(r.cP); $('ev-cF').textContent = F.num(r.cF); $('ev-N').textContent = F.num(r.N);
      const pp = x => F.num(x * 100, 1, true);
      const ciT = r.ci ? `${pp(r.ci[0])} ${s.to} ${pp(r.ci[1])}` : dash;
      const chiT = (x, p) => (x === undefined ? dash : `${F.num(x, 3)}, ${P} ${F.pv(p)}`);
      sum.innerHTML = rowsHTML([
        [s.rates, r.err === 'row' ? dash : `${F.pct(r.pA)} / ${F.pct(r.pB)}`],
        [s.diff, r.err === 'row' ? dash : `${pp(r.diff)} ${s.pp}`],
        [s.ci, r.err === 'row' ? dash : `${ciT} ${s.pp}`],
        [s.pearson, chiT(r.chi, r.pChi)],
        [s.yates, chiT(r.chiY, r.pChiY)],
        [s.fisher, r.fisher === undefined ? dash : `${P} ${F.pv(r.fisher)}`],
        [s.power, r.nOk ? F.num(r.nReq) : dash]
      ]);
      let t;
      if (r.err === 'row') t = s.vRow;
      else if (r.err === 'col') t = s.vCol(r.cF === 0);
      else if (r.same) t = s.vSame(F.pct(r.pA), ciT);
      else {
        const test = r.useF ? s.testF : s.testP, up = r.diff > 0, dd = F.num(Math.abs(r.diff) * 100, 1);
        t = r.p < 0.05 ? s.vSig(F.pv(r.p), test, up, dd, ciT) : s.vNon(F.pv(r.p), test, up, ciT) + (r.nOk ? s.vPow(F.num(r.nReq), dd) : s.vPowNo);
        if ((r.pChi < 0.05) !== (r.fisher < 0.05)) t += s.vSplit(F.pv(r.pChi), F.pv(r.fisher));
      }
      v.innerHTML = t;
      draw2();
    }

    // B.1: entradas
    const setN = (n, src) => { ST.n = n; ST.k = clamp(Math.round(ST.acc * n), 0, n); update1(src); };
    nIn.addEventListener('input', () => {
      if (!isInt(nIn.value, N_MIN, N_MAX)) { nIn.setAttribute('aria-invalid', 'true'); return; }
      nIn.removeAttribute('aria-invalid'); setN(+nIn.value, nIn);
    });
    nIn.addEventListener('change', () => { const v = Math.round(+nIn.value); setN(nIn.value.trim() === '' || !isFinite(v) ? ST.n : clamp(v, N_MIN, N_MAX)); });
    nR.addEventListener('input', () => setN(clamp(s2n(+nR.value), N_MIN, N_MAX), nR));
    const setK = (k, src) => { ST.k = k; ST.acc = k / ST.n; update1(src); };
    kIn.addEventListener('input', () => {
      if (!isInt(kIn.value, 0, ST.n)) { kIn.setAttribute('aria-invalid', 'true'); return; }
      kIn.removeAttribute('aria-invalid'); setK(+kIn.value, kIn);
    });
    kIn.addEventListener('change', () => { const v = Math.round(+kIn.value); setK(kIn.value.trim() === '' || !isFinite(v) ? ST.k : clamp(v, 0, ST.n)); });
    kR.addEventListener('input', () => setK(+kR.value, kR));

    // B.2: tabela editável
    const readCells = () => {
      let bad = false;
      cells.forEach((c, i) => {
        if (isInt(c.value, 0, CMAX)) { c.removeAttribute('aria-invalid'); ST.t[i] = +c.value; } else { c.setAttribute('aria-invalid', 'true'); bad = true; }
      });
      ST.bad = bad;
      update2();
    };
    cells.forEach((c, i) => {
      c.addEventListener('input', readCells);
      c.addEventListener('change', () => {
        const v = Math.round(+c.value);
        c.value = c.value.trim() === '' || !isFinite(v) ? ST.t[i] : clamp(v, 0, CMAX);
        readCells();
      });
    });
    ST.bad = false;

    update1(); update2();
    lastW = Math.floor(el.clientWidth);

    const redraw = force => {
      if (!el.isConnected) { if (evRO) evRO.disconnect(); return; }
      const W = Math.floor(el.clientWidth);
      if (W && (force || W !== lastW)) { lastW = W; draw1(); draw2(); }
    };
    if (evRO) evRO.disconnect();
    if (evResize) window.removeEventListener('resize', evResize);
    if ('ResizeObserver' in window) { evRO = new ResizeObserver(() => redraw(false)); evRO.observe(el); } else { evResize = () => redraw(false); window.addEventListener('resize', evResize); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => redraw(true));
  };
})();
