/* eggs/confusion.js — matriz de confusão do recrutador (Referências): triagem de currículos como
   classificador binário em 1.000 candidaturas SIMULADAS (semente fixa), com r = custo(FN)/custo(FP). */
(function () {
  'use strict';

  /* --- simulação --- */
  const SEED = 1345, N = 1000, NP = 200, NN = N - NP, M0 = 45, M1 = 62, SD = 12;
  const R = [1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20];
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // notas inteiras em [0, 100]; TPc[t] / FPc[t] = positivos / negativos com nota ≥ t
  const SIM = (() => {
    const rnd = mulberry32(SEED);
    const gauss = () => { let u = 0; while (!u) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };
    const pos = new Array(101).fill(0), neg = new Array(101).fill(0);
    for (let i = 0; i < N; i++) {
      const y = i < NP, s = Math.max(0, Math.min(100, Math.round((y ? M1 : M0) + SD * gauss())));
      (y ? pos : neg)[s]++;
    }
    const TPc = new Array(102).fill(0), FPc = new Array(102).fill(0);
    for (let t = 100; t >= 0; t--) { TPc[t] = TPc[t + 1] + pos[t]; FPc[t] = FPc[t + 1] + neg[t]; }
    // AUC empírica = Mann–Whitney com empates valendo 1/2 (= trapézios da ROC em degraus)
    let auc = 0, below = 0;
    for (let s = 0; s <= 100; s++) { auc += pos[s] * (below + neg[s] / 2); below += neg[s]; }
    return { TPc, FPc, auc: auc / (NP * NN) };
  })();
  const cm = t => { const TP = SIM.TPc[t], FP = SIM.FPc[t]; return { TP, FN: NP - TP, FP, TN: NN - FP }; };
  const cost = (t, r) => { const c = cm(t); return r * c.FN + c.FP; };
  // limiar de custo mínimo; empates vão para o τ mais alto (mesmo custo, menos conversas)
  function tauStar(r) {
    let best = 0, bc = Infinity;
    for (let t = 0; t <= 101; t++) { const c = cost(t, r); if (c <= bc + 1e-9) { bc = c; best = t; } }
    return Math.min(100, best);
  }
  const ratio = (a, b) => (b ? a / b : NaN);
  function metrics(c) {
    return {
      prec: ratio(c.TP, c.TP + c.FP), rec: ratio(c.TP, c.TP + c.FN), spec: ratio(c.TN, c.TN + c.FP),
      f1: ratio(2 * c.TP, 2 * c.TP + c.FP + c.FN), acc: (c.TP + c.TN) / N
    };
  }
  const nPdf = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));

  /* --- formatação --- */
  function fmt(lang) {
    const pt = lang === 'pt', dec = pt ? ',' : '.', grp = pt ? '.' : ',';
    const num = (v, d = 0) => {
      if (!isFinite(v)) return '—';
      const s = Math.abs(v).toFixed(d), [i, f] = s.split('.');
      return (v < 0 && +s ? '−' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, grp) + (f ? dec + f : '');
    };
    const rr = r => num(r, r % 1 ? 1 : 0);
    return { num, rr };
  }

  /* --- textos --- */
  const T = {
    en: {
      table: 'Table',
      ab: { TP: 'TP', FN: 'FN', FP: 'FP', TN: 'TN' }, full: { TP: 'true positive', FN: 'false negative', FP: 'false positive', TN: 'true negative' },
      lead: ref => `Every résumé screen is a binary classifier, whether or not anyone has computed its confusion matrix. ${ref} computes one for a simulated screen: 1,000 fictitious applicants, 20% of them strong fits, each with a noisy screening score. The rule is to interview whoever scores at least <var>τ</var>. No threshold avoids both kinds of error, so the real question is which one to pay for.`,
      title: 'Confusion matrix of a résumé screen on 1,000 simulated applicants.',
      drag: 'Drag <var>τ</var> to trade false positives for false negatives.',
      capMore: `<i>Note.</i> Scores are drawn with a fixed seed from <span class="cm-nw">N(45, 12²)</span> for the 800 applicants who are not a fit and <span class="cm-nw">N(62, 12²)</span> for the 200 strong fits, then rounded; nobody here is real. (a) Class-conditional score densities (the generating curves; the counts above are one draw from them): the shaded areas are the false-negative rate, 1 − recall, and the false-positive rate, 1 − specificity. (b) Empirical ROC curve: ● marks the current threshold, ○ the cost-optimal one, and the dashed line through ○ is its iso-cost line.`,
      tauL: 'Interview if score ≥ <var>τ</var>',
      rL: 'A missed great hire costs <var>r</var> wasted calls',
      tauVT: (t, k) => `τ = ${t}, ${k} interviewed`, rVT: r => `r = ${r}: a missed great hire costs ${r} wasted calls`,
      opt: t => `Use the optimal <var>τ</var>* = ${t}`, optOn: t => `<var>τ</var> = <var>τ</var>* = ${t}, cost-optimal`,
      matCap: t => `Confusion matrix at τ = ${t}`, metCap: 'Derived metrics',
      decision: 'Screen decision', actual: 'Actual', yes: 'Interviewed', no: 'Skipped', total: 'Total',
      strong: 'Strong fit', notfit: 'Not a fit',
      h: { TP: 'interviewed, great hire', FN: 'skipped a great candidate', FP: 'a 30-minute call that went nowhere', TN: 'correctly skipped' },
      metric: 'Metric', def: 'Definition', value: 'Value',
      m: { prec: 'Precision', rec: 'Recall (sensitivity)', spec: 'Specificity', f1: 'F<sub>1</sub>', acc: 'Accuracy', cost: 'Cost' },
      read: 'Reading.',
      r1: (t, k, tp, fp, fn) => `At <var>τ</var> = ${t} the screen interviews ${k} of 1,000 applicants: ${tp} of the 200 strong fits, plus ${fp} ${fp === '1' ? 'call that goes' : 'calls that go'} nowhere; ${fn} strong ${fn === '1' ? 'fit is' : 'fits are'} skipped.`,
      rNone: (t) => `At <var>τ</var> = ${t} nobody is interviewed: precision is 0/0, undefined rather than perfect, and all 200 strong fits are skipped.`,
      rCost: (r, c, ts, cs) => ` At <var>r</var> = ${r} this costs ${c} wasted-call equivalents; <var>τ</var>* = ${ts} would cost ${cs}.`,
      rOpt: (r, c) => ` At <var>r</var> = ${r} this costs ${c} wasted-call equivalents, the minimum: <var>τ</var> is cost-optimal.`,
      remark: 'Remark.',
      coda: (t1, k1, t10, k10) => `If a missed great hire costs <var>r</var> wasted calls, the expected cost of the screen is <var>r</var>·FN + FP. On these data its minimiser moves from <var>τ</var>* = ${t1} at <var>r</var> = 1 (${k1} interviews) to <var>τ</var>* = ${t10} at <var>r</var> = 10 (${k10} interviews). The direction is general: the costlier a false negative is relative to a false positive, the lower the optimal threshold, so the optimal policy interviews more borderline candidates. Equivalently, interview whenever the likelihood ratio <span class="cm-nw"><var>f</var><sub>1</sub>(<var>s</var>)/<var>f</var><sub>0</sub>(<var>s</var>)</span> exceeds <span class="cm-nw">(1 − <var>π</var>)/(<var>π</var> <var>r</var>)</span>, here 4/<var>r</var>. A false positive, by construction, costs <span class="cm-nw">one 30-minute call.</span>`,
      cta: 'Risk a false positive', subject: 'Risking a false positive: a 30-minute call',
      pa: '(a) Score density by class', pb: '(b) ROC curve',
      axS: 'screening score', axF: '1 − specificity', axT: 'recall',
      cNot: 'not a fit', cStrong: 'strong fit',
      desc: (t, ts, fnr, fpr, auc) => `Chart (a): two overlapping bell curves of scores, not a fit centred at 45 and strong fit at 62, standard deviation 12. A line marks τ = ${t}; shaded below it under the strong-fit curve is the false-negative rate (${fnr} in this sample), and shaded above it under the not-a-fit curve the false-positive rate (${fpr}). A dashed line marks the cost-optimal τ* = ${ts}. Chart (b): empirical ROC curve, recall against 1 − specificity, area ${auc}; a filled dot marks τ, an open dot τ*.`
    },
    pt: {
      table: 'Tabela',
      ab: { TP: 'VP', FN: 'FN', FP: 'FP', TN: 'VN' }, full: { TP: 'verdadeiro positivo', FN: 'falso negativo', FP: 'falso positivo', TN: 'verdadeiro negativo' },
      lead: ref => `Toda triagem de currículos é um classificador binário, quer alguém tenha calculado sua matriz de confusão, quer não. A ${ref} calcula uma para uma triagem simulada: 1.000 candidaturas fictícias, 20% delas de perfil forte, cada uma com uma nota de triagem ruidosa. A regra é entrevistar quem tirar pelo menos <var>τ</var>. Nenhum limiar evita os dois tipos de erro; a questão real é qual deles pagar.`,
      title: 'Matriz de confusão de uma triagem de currículos em 1.000 candidaturas simuladas.',
      drag: 'Arraste <var>τ</var> para trocar falsos positivos por falsos negativos.',
      capMore: `<i>Nota.</i> As notas são sorteadas com semente fixa de <span class="cm-nw">N(45, 12²)</span> para as 800 candidaturas sem aderência e de <span class="cm-nw">N(62, 12²)</span> para as 200 de perfil forte, depois arredondadas; ninguém aqui é real. (a) Densidades das notas por classe (as curvas geradoras; as contagens acima são um sorteio delas): as áreas sombreadas são a taxa de falsos negativos, 1 − revocação, e a taxa de falsos positivos, 1 − especificidade. (b) Curva ROC empírica: ● marca o limiar atual, ○ o de custo mínimo, e a reta tracejada por ○ é a sua linha de isocusto.`,
      tauL: 'Entrevistar se nota ≥ <var>τ</var>',
      rL: 'Perder uma ótima contratação custa <var>r</var> conversas',
      tauVT: (t, k) => `τ = ${t}, ${k} entrevistas`, rVT: r => `r = ${r}: perder uma ótima contratação custa ${r} conversas desperdiçadas`,
      opt: t => `Usar o <var>τ</var>* ótimo = ${t}`, optOn: t => `<var>τ</var> = <var>τ</var>* = ${t}, custo mínimo`,
      matCap: t => `Matriz de confusão em τ = ${t}`, metCap: 'Métricas derivadas',
      decision: 'Decisão da triagem', actual: 'Classe real', yes: 'Entrevista', no: 'Descarte', total: 'Total',
      strong: 'Perfil forte', notfit: 'Sem aderência',
      h: { TP: 'entrevista que virou contratação', FN: 'ótima candidatura descartada', FP: '30 minutos de conversa que não deram em nada', TN: 'descarte correto' },
      metric: 'Métrica', def: 'Definição', value: 'Valor',
      m: { prec: 'Precisão', rec: 'Revocação (sensibilidade)', spec: 'Especificidade', f1: 'F<sub>1</sub>', acc: 'Acurácia', cost: 'Custo' },
      read: 'Leitura.',
      r1: (t, k, tp, fp, fn) => `Com <var>τ</var> = ${t}, a triagem entrevista ${k} de 1.000 candidaturas: ${tp} das 200 de perfil forte, mais ${fp} ${fp === '1' ? 'conversa que não dá' : 'conversas que não dão'} em nada; ${fn} de perfil forte ${fn === '1' ? 'fica' : 'ficam'} de fora.`,
      rNone: (t) => `Com <var>τ</var> = ${t}, ninguém vai para entrevista: a precisão é 0/0, indefinida e não perfeita, e as 200 candidaturas de perfil forte ficam de fora.`,
      rCost: (r, c, ts, cs) => ` Com <var>r</var> = ${r}, isso custa o equivalente a ${c} conversas desperdiçadas; <var>τ</var>* = ${ts} custaria ${cs}.`,
      rOpt: (r, c) => ` Com <var>r</var> = ${r}, isso custa o equivalente a ${c} conversas desperdiçadas, o mínimo: <var>τ</var> é o limiar ótimo.`,
      remark: 'Observação.',
      coda: (t1, k1, t10, k10) => `Se perder uma ótima contratação custa <var>r</var> conversas desperdiçadas, o custo esperado da triagem é <var>r</var>·FN + FP. Nestes dados, o minimizador vai de <var>τ</var>* = ${t1} com <var>r</var> = 1 (${k1} entrevistas) para <var>τ</var>* = ${t10} com <var>r</var> = 10 (${k10} entrevistas). A direção é geral: quanto mais caro o falso negativo em relação ao falso positivo, menor o limiar ótimo, e a política ótima entrevista mais candidaturas limítrofes. Equivalentemente, entreviste sempre que a razão de verossimilhança <span class="cm-nw"><var>f</var><sub>1</sub>(<var>s</var>)/<var>f</var><sub>0</sub>(<var>s</var>)</span> passar de <span class="cm-nw">(1 − <var>π</var>)/(<var>π</var> <var>r</var>)</span>, aqui 4/<var>r</var>. Um falso positivo custa, por construção, uma conversa de 30&nbsp;minutos.`,
      cta: 'Arriscar um falso positivo', subject: 'Arriscando um falso positivo: uma conversa de 30 minutos',
      pa: '(a) Densidade das notas por classe', pb: '(b) Curva ROC',
      axS: 'nota de triagem', axF: '1 − especificidade', axT: 'revocação',
      cNot: 'sem aderência', cStrong: 'perfil forte',
      desc: (t, ts, fnr, fpr, auc) => `Gráfico (a): duas curvas em sino sobrepostas, sem aderência centrada em 45 e perfil forte em 62, desvio-padrão 12. Uma linha marca τ = ${t}; sombreada abaixo dela, sob a curva de perfil forte, está a taxa de falsos negativos (${fnr} nesta amostra), e acima dela, sob a curva sem aderência, a de falsos positivos (${fpr}). Uma linha tracejada marca o τ* de custo mínimo, ${ts}. Gráfico (b): curva ROC empírica, revocação contra 1 − especificidade, área ${auc}; um ponto cheio marca τ, um vazado τ*.`
    }
  };

  /* --- estado (sobrevive à troca de idioma) --- */
  const ST = { ri: 0, tau: tauStar(R[0]) };

  /* --- gráfico --- */
  let mctx = null;
  function tw(s, fs, it) {
    if (!mctx) mctx = document.createElement('canvas').getContext('2d');
    mctx.font = `${it ? 'italic ' : ''}${fs}px Newsreader, Georgia, serif`;
    return mctx.measureText(s).width;
  }
  const f1 = v => v.toFixed(1);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const txt = (x, y, s, cls, anchor, fs) => `<text x="${f1(x)}" y="${f1(y)}" class="${cls}" text-anchor="${anchor || 'middle'}" font-size="${fs}">${s}</text>`;

  // dens: faixa do painel (a), para arrastar τ
  function chart(W, s, F) {
    const r = R[ST.ri], t = ST.tau, ts = tauStar(r), c = cm(t), cs = cm(ts);
    const wide = W >= 560, fs = wide ? 12.5 : 11.5, sfs = fs - 0.5;
    const top = 44, ph = wide ? 150 : 138;                 // faixa útil dos painéis
    const gap = 30, rocS = wide ? Math.min(ph, Math.round(W * 0.27)) : Math.min(ph + 40, W - 64);
    // painel (a)
    const ax0 = 10, ax1 = wide ? W - rocS - gap - 44 : W - 10, base = top + ph;
    const X = v => ax0 + v / 100 * (ax1 - ax0);
    const peak = nPdf(0, 0, SD), Y = f => base - f / peak * (ph - 8);
    const curve = (m, a, b, close) => {
      let d = '';
      const n = Math.max(2, Math.ceil((b - a) / 0.5));
      for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; d += `${i ? 'L' : 'M'}${f1(X(x))} ${f1(Y(nPdf(x, m, SD)))}`; }
      return close ? `${d}L${f1(X(b))} ${base}L${f1(X(a))} ${base}Z` : d;
    };
    let o = `<defs><clipPath id="cm-clip"><rect x="${ax0}" y="0" width="${f1(ax1 - ax0)}" height="${base + 1}"/></clipPath></defs><g clip-path="url(#cm-clip)">`;
    // uma candidatura com nota s é entrevistada se s ≥ τ; com notas inteiras, a fronteira contínua fica em τ − 0,5
    const tb = clamp(t - 0.5, 0, 100);
    if (tb > 0) o += `<path class="cm-fn" d="${curve(M1, 0, tb, true)}"/>`;
    if (tb < 100) o += `<path class="cm-fp" d="${curve(M0, tb, 100, true)}"/>`;
    o += `<path class="cm-cv" d="${curve(M0, 0, 100)}"/><path class="cm-cv cm-cv1" d="${curve(M1, 0, 100)}"/></g>`;
    // rótulos das curvas: nos flancos externos (longe dos picos e da região de sobreposição)
    const fl = 1.25 * SD, hFl = Y(nPdf(fl, 0, SD));
    const labs = txt(X(M0 - fl) - 5, hFl - 4, s.cNot, 'cm-it cm-halo', 'end', sfs) + txt(X(M1 + fl) + 5, hFl - 4, s.cStrong, 'cm-it cm-halo', 'start', sfs);
    // FN / FP (só quando a área tem altura para o rótulo)
    const hAt = (x, m) => base - Y(nPdf(x, m, SD));
    const xl = X(tb) - 5, xr = X(tb) + 5, vl = (xl - ax0) / (ax1 - ax0) * 100, vr = (xr - ax0) / (ax1 - ax0) * 100;
    const wAb = k => tw(k, sfs, false) + 2;
    if (vl > 2 && hAt(vl - 2, M1) > 15 && xl - wAb(s.ab.FN) > ax0) o += txt(xl, base - 5, s.ab.FN, 'cm-sc cm-fnt cm-halo', 'end', sfs);
    if (vr < 98 && hAt(vr + 2, M0) > 15 && xr + wAb(s.ab.FP) < ax1) o += txt(xr, base - 5, s.ab.FP, 'cm-sc cm-fpt cm-halo', 'start', sfs);
    // τ* (tracejado) e τ (cheio)
    const xt = X(tb), xs = X(clamp(ts - 0.5, 0, 100));
    const yT = 13, yS = 29;
    if (ts !== t) {
      o += `<path class="cm-star" d="M${f1(xs)} ${yS + 5}V${base}"/>`;
      const ls = `τ* = ${F.num(ts)}`, w = tw(ls, sfs, false);
      o += txt(clamp(xs, ax0 + w / 2, ax1 - w / 2), yS, ls, 'cm-halo', 'middle', sfs);
    }
    o += `<path class="cm-tau" d="M${f1(xt)} ${yT + 6}V${base}"/>`;
    const lt = ts === t ? `τ = τ* = ${F.num(t)}` : `τ = ${F.num(t)}`, wt = tw(lt, fs, false);
    o += txt(clamp(xt, ax0 + wt / 2, ax1 - wt / 2), yT, lt, 'cm-ink', 'middle', fs);
    // eixo
    o += `<path class="cm-ax" d="M${ax0} ${base + 0.5}H${f1(ax1)}"/>`;
    const step = (ax1 - ax0) > 380 ? 10 : 20;
    for (let v = 0; v <= 100; v += step) o += `<path class="cm-ax" d="M${f1(X(v))} ${base}V${base + 5}"/>` + txt(X(v), base + 18, F.num(v), '', 'middle', sfs);
    o += labs;
    o += txt((ax0 + ax1) / 2, base + 36, s.axS, 'cm-it', 'middle', fs);
    o += txt((ax0 + ax1) / 2, base + 58, s.pa, 'cm-ink', 'middle', fs);

    // painel (b): ROC
    const rx0 = wide ? W - rocS - 6 : Math.round((W - rocS) / 2) + 16, ry0 = wide ? top + ph - rocS : base + 92;
    const rx1 = rx0 + rocS, ry1 = ry0 + rocS;
    const RX = v => rx0 + v * rocS, RY = v => ry1 - v * rocS;
    let roc = '';
    for (let k = 101; k >= 0; k--) {
      const q = cm(k), x = RX(q.FP / NN), y = RY(q.TP / NP);
      roc += `${k === 101 ? 'M' : 'L'}${f1(x)} ${f1(y)}`;
    }
    o += `<path class="cm-auc" d="${roc}L${f1(RX(1))} ${f1(RY(0))}Z"/>`;
    o += `<path class="cm-diag" d="M${f1(RX(0))} ${f1(RY(0))}L${f1(RX(1))} ${f1(RY(1))}"/>`;
    o += `<rect class="cm-box" x="${f1(rx0)}" y="${f1(ry0)}" width="${rocS}" height="${rocS}"/>`;
    // linha de isocusto pelo ponto ótimo: TPR = TPR* + m (FPR − FPR*), m = NN / (NP r)
    const m = NN / (NP * r), fx = cs.FP / NN, fy = cs.TP / NP;
    const seg = [];
    const push = (x, y) => { if (x >= -1e-9 && x <= 1 + 1e-9 && y >= -1e-9 && y <= 1 + 1e-9) seg.push([clamp(x, 0, 1), clamp(y, 0, 1)]); };
    push(0, fy - m * fx); push(1, fy + m * (1 - fx)); push(fx - fy / m, 0); push(fx + (1 - fy) / m, 1);
    seg.sort((a, b) => a[0] - b[0]);
    if (seg.length >= 2) o += `<path class="cm-iso" d="M${f1(RX(seg[0][0]))} ${f1(RY(seg[0][1]))}L${f1(RX(seg[seg.length - 1][0]))} ${f1(RY(seg[seg.length - 1][1]))}"/>`;
    o += `<path class="cm-roc" d="${roc}"/>`;
    o += `<circle class="cm-po" cx="${f1(RX(fx))}" cy="${f1(RY(fy))}" r="4.2"/>`;
    o += `<circle class="cm-pc" cx="${f1(RX(c.FP / NN))}" cy="${f1(RY(c.TP / NP))}" r="3.3"/>`;
    o += txt(RX(0.96), RY(0.06), `AUC = ${F.num(SIM.auc, 2)}`, 'cm-halo', 'end', sfs);
    // ticks
    for (const v of [0, 0.5, 1]) {
      o += `<path class="cm-ax" d="M${f1(RX(v))} ${ry1}V${ry1 + 4}M${rx0} ${f1(RY(v))}H${rx0 - 4}"/>`;
      o += txt(RX(v), ry1 + 17, F.num(v, v % 1 ? 1 : 0), '', 'middle', sfs);
      o += txt(rx0 - 7, RY(v) + 4, F.num(v, v % 1 ? 1 : 0), '', 'end', sfs);
    }
    o += txt(rx0 + rocS / 2, ry1 + 36, s.axF, 'cm-it', 'middle', fs);
    const yl = (ry0 + ry1) / 2, xl0 = rx0 - 33;
    o += `<text x="${f1(xl0)}" y="${f1(yl)}" class="cm-it" text-anchor="middle" font-size="${fs}" transform="rotate(-90 ${f1(xl0)} ${f1(yl)})">${s.axT}</text>`;
    o += txt(rx0 + rocS / 2, ry1 + 58, s.pb, 'cm-ink', 'middle', fs);

    const H = Math.ceil((wide ? base : ry1) + 64);
    const pct = v => `${F.num(v * 100, 0)}%`;
    return {
      svg: `<svg class="cm-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">${o}</svg>`,
      desc: s.desc(F.num(t), F.num(ts), pct(c.FN / NP), pct(c.FP / NN), F.num(SIM.auc, 2)),
      dens: { x0: ax0, x1: ax1, y1: base + 8 }
    };
  }

  let ro = null, onResize = null;

  (window.ArtigoEggs = window.ArtigoEggs || {}).confusion = function (el, ctx) {
    const lang = ctx.lang === 'pt' ? 'pt' : 'en', s = T[lang], F = fmt(lang), esc = ctx.esc || (x => String(x));
    const C = ctx.C || {}, L = C.links || {};
    const n = ctx.n || '', tab = ctx.table || s.table;
    const nb = x => String(x).replace(/ /g, '&nbsp;');
    const ab = s.ab;
    el.classList.add('cm');
    el.classList.toggle('cm-still', !!ctx.reduced);
    const cell = (k, cls) => `<td class="cm-c ${cls}"><span class="cm-cn"><abbr class="cm-ab" title="${s.full[k]}">${ab[k]}</abbr> <span class="cm-k" id="cm-${k}"></span></span><span class="cm-h">${esc(s.h[k])}</span></td>`;
    const def = {
      prec: `${ab.TP} / (${ab.TP} + ${ab.FP})`, rec: `${ab.TP} / (${ab.TP} + ${ab.FN})`, spec: `${ab.TN} / (${ab.TN} + ${ab.FP})`,
      f1: `2${ab.TP} / (2${ab.TP} + ${ab.FP} + ${ab.FN})`, acc: `(${ab.TP} + ${ab.TN}) / <var>N</var>`, cost: `<var>r</var>·${ab.FN} + ${ab.FP}`
    };
    const href = L.email ? `mailto:${L.email}?subject=${encodeURIComponent(s.subject)}` : '';
    el.innerHTML = `
<p class="cm-lead">${s.lead(`<a class="xref" href="#cm-tab">${nb(esc(tab))}&nbsp;${esc(n)}</a>`)}</p>
<figure class="tbl cm-fig" id="cm-tab">
<figcaption class="cap"><span class="cap-l">${esc(tab)} ${esc(n)}:</span> ${s.title} ${s.drag}</figcaption>
<div class="cm-ctrl">
<label class="cm-lab" for="cm-tau">${s.tauL}</label>
<input type="range" class="cm-range" id="cm-tau" min="0" max="100" step="1" value="${ST.tau}">
<output class="cm-out" id="cm-tau-o" for="cm-tau"></output>
<label class="cm-lab" for="cm-r">${s.rL}</label>
<input type="range" class="cm-range" id="cm-r" min="0" max="${R.length - 1}" step="1" value="${ST.ri}">
<output class="cm-out" id="cm-r-o" for="cm-r"></output>
<button type="button" class="cm-opt" id="cm-opt"></button>
</div>
<div class="tbl-wrap cm-wrap">
<table class="bt cm-mat">
<caption class="sr-only" id="cm-mcap"></caption>
<thead>
<tr class="cm-h1"><td></td><th scope="colgroup" colspan="2" class="cm-grp">${esc(s.decision)}</th><td></td></tr>
<tr class="cm-h2"><th scope="col">${esc(s.actual)}</th><th scope="col">${esc(s.yes)} <span class="cm-cond">(≥&nbsp;<var>τ</var>)</span></th><th scope="col">${esc(s.no)} <span class="cm-cond">(&lt;&nbsp;<var>τ</var>)</span></th><th scope="col" class="r">${esc(s.total)}</th></tr>
</thead>
<tbody>
<tr><th scope="row">${esc(s.strong)}</th>${cell('TP', 'cm-ok')}${cell('FN', 'cm-err cm-fnc')}<td class="r cm-tot">${F.num(NP)}</td></tr>
<tr><th scope="row">${esc(s.notfit)}</th>${cell('FP', 'cm-err cm-fpc')}${cell('TN', 'cm-ok')}<td class="r cm-tot">${F.num(NN)}</td></tr>
<tr class="cm-sum"><th scope="row">${esc(s.total)}</th><td class="cm-tot" id="cm-yes"></td><td class="cm-tot" id="cm-no"></td><td class="r cm-tot">${F.num(N)}</td></tr>
</tbody>
</table>
<table class="bt cm-met">
<caption class="sr-only">${esc(s.metCap)}</caption>
<thead><tr><th scope="col">${esc(s.metric)}</th><th scope="col">${esc(s.def)}</th><th scope="col" class="r">${esc(s.value)}</th></tr></thead>
<tbody>${['prec', 'rec', 'spec', 'f1', 'acc', 'cost'].map(k => `<tr${k === 'cost' ? ' class="cm-costr"' : ''}><th scope="row">${s.m[k]}</th><td class="cm-fx">${def[k]}</td><td class="r cm-v" id="cm-m-${k}"></td></tr>`).join('')}</tbody>
</table>
</div>
<p class="cm-read" id="cm-read"></p>
<p class="sr-only" aria-live="polite" id="cm-live"></p>
<div class="cm-plot" id="cm-plot"></div>
<p class="sr-only" id="cm-desc"></p>
<p class="cap cm-cap2">${s.capMore}</p>
</figure>
<p class="cm-coda"><span class="run-in">${s.remark}</span> ${s.coda(F.num(tauStar(1)), F.num(cm(tauStar(1)).TP + cm(tauStar(1)).FP), F.num(tauStar(10)), F.num(cm(tauStar(10)).TP + cm(tauStar(10)).FP))}${href ? ` <a class="cm-cta" href="${esc(href)}"><span aria-hidden="true">→</span> ${esc(s.cta)}</a>` : ''}</p>`;

    const $ = id => el.querySelector(`#${id}`);
    const tauIn = $('cm-tau'), rIn = $('cm-r'), opt = $('cm-opt'), plot = $('cm-plot');
    const fill = (inp, v, max) => inp.style.setProperty('--cm-p', `${(v / max) * 100}%`);
    let dens = null, lastW = 0, liveT = 0;

    function draw() {
      const W = Math.floor(plot.clientWidth);
      if (!W) return;
      const g = chart(W, s, F);
      plot.innerHTML = g.svg; dens = g.dens;
      $('cm-desc').textContent = g.desc;
    }
    function update(live) {
      const t = ST.tau, r = R[ST.ri], ts = tauStar(r), c = cm(t), mt = metrics(c), k = c.TP + c.FP;
      ['TP', 'FN', 'FP', 'TN'].forEach(q => { $(`cm-${q}`).textContent = F.num(c[q]); });
      $('cm-yes').textContent = F.num(k); $('cm-no').textContent = F.num(N - k);
      $('cm-mcap').textContent = s.matCap(F.num(t));
      const cst = cost(t, r), cstS = cost(ts, r), cd = r % 1 ? 1 : 0;
      const mf = { prec: F.num(mt.prec, 3), rec: F.num(mt.rec, 3), spec: F.num(mt.spec, 3), f1: F.num(mt.f1, 3), acc: F.num(mt.acc, 3) };
      Object.keys(mf).forEach(q => { $(`cm-m-${q}`).textContent = mf[q]; });
      $('cm-m-cost').textContent = F.num(cst, cd);
      tauIn.value = t; rIn.value = ST.ri;
      fill(tauIn, t, 100); fill(rIn, ST.ri, R.length - 1);
      tauIn.setAttribute('aria-valuetext', s.tauVT(F.num(t), F.num(k)));
      rIn.setAttribute('aria-valuetext', s.rVT(F.rr(r)));
      $('cm-tau-o').innerHTML = `<var>τ</var> = ${F.num(t)}`;
      $('cm-r-o').innerHTML = `<var>r</var> = ${F.rr(r)}`;
      const on = ts === t;
      opt.innerHTML = on ? s.optOn(F.num(ts)) : s.opt(F.num(ts));
      opt.classList.toggle('cm-on', on);
      opt.setAttribute('aria-pressed', String(on));
      let rd = k ? s.r1(F.num(t), F.num(k), F.num(c.TP), F.num(c.FP), F.num(c.FN)) : s.rNone(F.num(t));
      rd += on ? s.rOpt(F.rr(r), F.num(cst, cd)) : s.rCost(F.rr(r), F.num(cst, cd), F.num(ts), F.num(cstS, cd));
      $('cm-read').innerHTML = `<span class="run-in">${s.read}</span> ${rd}`;
      if (live) {
        clearTimeout(liveT);
        // resumo para leitor de tela, montado da própria tabela (com atraso, para não falar a cada passo)
        liveT = setTimeout(() => {
          if (!el.isConnected) return;
          const cn = [...el.querySelectorAll('.cm-cn')].map(x => x.textContent.trim()).join(', ');
          const mt = [...el.querySelectorAll('.cm-met tbody tr')].map(tr => `${tr.cells[0].textContent} ${tr.cells[2].textContent}`).join('; ');
          $('cm-live').textContent = `τ = ${F.num(t)}. ${cn}. ${mt}.`;
        }, 450);
      }
      draw();
    }

    tauIn.addEventListener('input', () => { ST.tau = clamp(Math.round(+tauIn.value), 0, 100); update(true); });
    rIn.addEventListener('input', () => { ST.ri = clamp(Math.round(+rIn.value), 0, R.length - 1); update(true); });
    opt.addEventListener('click', () => { ST.tau = tauStar(R[ST.ri]); update(true); });

    // arrastar a linha de τ no painel (a); o controle acessível continua sendo o slider
    let dragging = false;
    const tauAt = e => {
      const b = plot.getBoundingClientRect(), x = e.clientX - b.left;
      return clamp(Math.round((x - dens.x0) / (dens.x1 - dens.x0) * 100 + 0.5), 0, 100);
    };
    const inDens = e => {
      if (!dens) return false;
      const b = plot.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
      return x >= dens.x0 - 6 && x <= dens.x1 + 6 && y >= 0 && y <= dens.y1;
    };
    plot.addEventListener('pointerdown', e => {
      if (e.button !== 0 || !inDens(e)) return;
      dragging = true; plot.setPointerCapture(e.pointerId); plot.classList.add('cm-drag');
      const v = tauAt(e); if (v !== ST.tau) { ST.tau = v; update(true); }
      e.preventDefault();
    });
    plot.addEventListener('pointermove', e => {
      if (!dragging) { plot.classList.toggle('cm-hot', inDens(e)); return; }
      const v = tauAt(e); if (v !== ST.tau) { ST.tau = v; update(true); }
    });
    const end = () => { dragging = false; plot.classList.remove('cm-drag'); };
    plot.addEventListener('pointerup', end); plot.addEventListener('pointercancel', end);
    plot.addEventListener('pointerleave', () => { if (!dragging) plot.classList.remove('cm-hot'); });

    update(false);
    lastW = Math.floor(plot.clientWidth);
    const redraw = force => {
      if (!el.isConnected) { if (ro) ro.disconnect(); return; }
      const W = Math.floor(plot.clientWidth);
      if (W && (force || W !== lastW)) { lastW = W; draw(); }
    };
    if (ro) ro.disconnect();
    if (onResize) window.removeEventListener('resize', onResize);
    if ('ResizeObserver' in window) { ro = new ResizeObserver(() => redraw(false)); ro.observe(el); } else { onResize = () => redraw(false); window.addEventListener('resize', onResize); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => redraw(true));
  };
})();
