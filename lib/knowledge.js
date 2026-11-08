/* =========================================================================
   lib/knowledge.js — monta o system prompt do assistente a partir de content.js.
   O texto é determinístico (sem datas nem IDs variáveis) para o prompt caching
   reaproveitar o mesmo prefixo em todas as perguntas.
   ========================================================================= */
'use strict';

const C = require('../content.js');

const A = C.assistant || {};
const L = A.sourceLang === 'en' ? 'en' : 'pt';
const t = v => (v && typeof v === 'object' && !Array.isArray(v) ? v[L] ?? v.pt ?? v.en : v) ?? '';

// Mesmos IDs que main.js usa para ancorar as citações no site.
const expId = i => `EXP-${String(i + 1).padStart(2, '0')}`;
const SECTION_TAGS = ['ABOUT', 'STACK', 'EDU', 'CONTACT'];

function metricLine(m) {
  const fmt = v => `${m.prefix || ''}${t(v)}${t(m.unit)}`;
  return m.value !== undefined
    ? `  - ${t(m.label)}: ${fmt(m.value)}`
    : `  - ${t(m.label)}: ${fmt(m.before)} -> ${fmt(m.after)}`;
}

function portfolioData() {
  const out = [];
  const L_ = C.links || {};

  out.push(
    '[ABOUT]',
    `Name: ${C.name}`,
    `Role: ${t(C.role)}`,
    `Focus: ${t(C.focus)}`,
    C.title && `Paper title: ${t(C.title)}`,
    `Headline: ${t(C.tagline)}`,
    'Bio:', ...t(C.about.bio).map(p => `  ${p}`),
    'Working principles:', ...C.about.principles.map(p => `  - ${t(p.title)}: ${t(p.text)}`),
    'Profile:', ...C.datasheet.map(r => `  - ${t(r.k)}: ${t(r.v)}`),
    'Headline numbers:', ...C.stats.map(s => `  - ${t(s.value)} ${t(s.label)}`)
  );
  if (A.notes && A.notes.length) out.push('Additional notes:', ...A.notes.map(n => `  - ${t(n)}`));

  for (const p of C.projects) {
    out.push(
      '',
      `[${p.id}] ${t(p.title)} (${[p.org && t(p.org), p.year, t(p.status)].filter(Boolean).join(', ')})`,
      `Summary: ${t(p.summary)}`,
      `Problem: ${t(p.problem)}`,
      `Solution: ${t(p.solution)}`
    );
    if (p.flow && p.flow.length) {
      out.push('How it works (flowchart, top to bottom):', ...p.flow.map((n, i) =>
        `  ${i + 1}. ${n.edge ? `(${t(n.edge)}) ` : ''}${t(n.text)}${n.via ? ` <- uses ${t(n.via.text)}` : ''}` +
        (n.branch ? ` (${t(n.branch.edge)}: ${t(n.branch.text)})` : '')));
    }
    if (p.metrics && p.metrics.length) out.push('Results:', ...p.metrics.map(metricLine));
    out.push(`Stack: ${(p.stack || []).map(t).join(', ')}`);
    const links = (p.links || []).filter(l => l.url && l.url !== '#');
    if (links.length) out.push(`Links: ${links.map(l => `${t(l.label)} ${l.url}`).join(' · ')}`);
  }

  C.experience.forEach((j, i) => {
    out.push('', `[${expId(i)}] ${t(j.title)} at ${t(j.org)} (${j.start} to ${j.end || 'present'})`,
      ...t(j.bullets).map(b => `  - ${b}`));
    if (j.stack && j.stack.length) out.push(`  Tools: ${j.stack.map(t).join(', ')}`);
  });

  out.push('', '[STACK] Skill level: 3 = used in production, 2 = proficient, 1 = familiar',
    ...C.skills.map(g => `  ${t(g.group)}: ${g.items.map(([n, lvl]) => `${t(n)} (${lvl})`).join(', ')}`));

  const entry = e => `  - ${t(e.title)}, ${t(e.org)} (${e.year})${e.stack && e.stack.length ? `; tools: ${e.stack.map(t).join(', ')}` : ''}`;
  out.push('', '[EDU]', ...C.education.map(entry));
  if (C.certifications && C.certifications.length) out.push('Certifications:', ...C.certifications.map(entry));
  if (C.activities && C.activities.items.length) out.push(`${t(C.activities.title)}:`, ...C.activities.items.map(entry));

  out.push('', '[CONTACT]', ...[
    L_.email && `Email: ${L_.email}`,
    L_.linkedin && `LinkedIn: ${L_.linkedin}`,
    L_.github && `GitHub: ${L_.github}`,
    L_.cv && 'CV: downloadable on the site'
  ].filter(Boolean));

  return out.filter(line => typeof line === 'string').join('\n');
}

const tags = [...C.projects.map(p => p.id), ...C.experience.map((_, i) => expId(i)), ...SECTION_TAGS];
const email = (C.links && C.links.email) || 'the contact section';

const SYSTEM_PROMPT = `You are the assistant on the portfolio website of ${C.name}, ${t(C.role)}. Visitors are mostly recruiters and hiring managers. Answer their questions about ${C.name}'s experience, projects, skills and availability using only the portfolio data below.

How to answer:
- Reply in the language of the visitor's question (Portuguese or English). If it's unclear, use the site language given at the end.
- Keep it short: two to five sentences, or a brief hyphen list. Plain text only. The answer appears in a retro terminal, so no Markdown headings, bold, tables or links.
- Cite the source of each claim with its tag in square brackets, like [${C.projects[0] ? C.projects[0].id : 'ABOUT'}] or [${expId(0)}]. Valid tags: ${tags.join(', ')}. Visitors can click a tag to jump to that part of the site.
- Refer to ${C.name} by name in the third person. ${A.pronouns ? `Pronouns: ${A.pronouns}.` : `Pronouns aren't specified, so avoid gendered pronouns and gendered adjectives; in Portuguese, rephrase around the name.`}
- If the data doesn't answer the question (salary, references, personal life, anything not listed), say so plainly and suggest contacting ${C.name} at ${email} [CONTACT]. Never invent employers, dates, numbers, links or skills.
- You can summarize and compare across the data, and if someone pastes a job description, give an honest read of the fit based only on the data, including gaps.
- For requests unrelated to ${C.name}'s professional profile, say briefly that you only answer questions about this portfolio.${C.demo ? `
- The portfolio currently holds placeholder sample data. Mention that once, briefly, in your first answer.` : ''}

<portfolio_data>
${portfolioData()}
</portfolio_data>`;

module.exports = { SYSTEM_PROMPT, expId };
