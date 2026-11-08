# Portfolio — AI Engineer

Site estático (HTML + CSS + JS, sem build, sem frameworks) apresentado como um **artigo científico**
(preprint em LaTeX): resumo, seções numeradas, figuras, tabelas booktabs, notas na margem e referências.
Inglês é o idioma padrão; português fica no botão PT.

## Estrutura

| Arquivo | O que é |
| --- | --- |
| `content.js` | **Todo o conteúdo** (PT/EN). É o único arquivo que você precisa editar. |
| `cv.html` | CV de 2 páginas gerado do `content.js` (`?lang=en` em Letter, `?lang=pt` em A4). |
| `cv-iago-vale-pt.pdf` / `-en.pdf` | PDFs do botão "Résumé / Currículo", gerados do `cv.html` por `tools/cv-pdf.sh`. |
| `index.html` | Esqueleto da página + metatags (SEO e preview do LinkedIn). |
| `styles.css` | Visual do artigo. Cores e fontes nos tokens de `:root` (claro) e no bloco `prefers-color-scheme: dark`. |
| `app.js` | Monta o artigo a partir de `content.js`: seções, fluxogramas, notebook do assistente, código-fonte `.tex`, histórico de versões. |
| `eggs/` | Easter eggs em módulos separados: k-means por área, suplemento estatístico, matriz de confusão, ontologia (RDF) e agente revisor em LangGraph. |
| `api/ask.js` | Função serverless do "Pergunte ao meu currículo" (chama a API do Claude). |
| `lib/knowledge.js` | Transforma `content.js` no system prompt do assistente. |
| `lib/ratelimit.js` | Limite de perguntas por IP e por dia. |
| `server.js` | Servidor local para desenvolvimento (site + `/api/ask`). |
| `og-image.png` | Imagem de preview ao compartilhar o link (1200×630). |
| `tools/og.html` | Modelo que gera o `og-image.png`. |

## Antes de publicar

1. Em `index.html`, troque `SEU-DOMINIO` nas tags `og:image` e `og:url` pela URL final.
2. Mudou algo em `content.js`? Os PDFs do CV **não** se atualizam sozinhos (veja "CV em PDF" abaixo).
3. Mudou nome, cargo ou título (`title` no `content.js`)? Gere de novo o `og-image.png` (abaixo).

## Rodar localmente

```sh
npm install
npm run dev:mock   # assistente com resposta simulada, sem gastar tokens
npm run dev        # assistente de verdade (precisa do .env com ANTHROPIC_API_KEY)
```

Abra http://localhost:3000 (porta ocupada? `PORT=4321 npm run dev:mock`). Abrir o `index.html` direto também funciona, mas aí o notebook do
Apêndice A mostra "offline", porque não tem servidor para responder.

Parâmetros úteis na URL:

- `?lang=pt` / `?lang=en` — força o idioma (bom para mandar a versão em português a recrutadores daqui)
- `#apendice-a`, `#sistemas`... — abre direto numa seção (e pula a "compilação" de abertura)

Sem parâmetro, o site abre em inglês (ou no último idioma escolhido pelo visitante) e segue o modo
claro/escuro do sistema.

## Publicar na Vercel (grátis)

O assistente precisa de uma função de servidor, então use a **Vercel** (detecta a pasta `api/` sozinha):

1. `npx vercel` na pasta do projeto (ou importe o repositório em vercel.com/new).
2. Em **Settings → Environment Variables**, cadastre `ANTHROPIC_API_KEY`
   (crie a chave no Console da Anthropic, em platform.claude.com).
3. Faça o deploy de novo para a variável valer: `npx vercel --prod`.

Em hosts só estáticos (GitHub Pages, Netlify Drop), o site funciona, mas o assistente fica offline.
Nesse caso, desligue o assistente com `assistant.enabled: false` em `content.js`.

## Assistente "Pergunte ao meu currículo"

- **Fonte:** só o que está em `content.js` (inclui `assistant.notes`). Tudo ali é público.
- **Citações:** o modelo cita `[PRJ-001]`, `[EXP-01]`, `[STACK]`... e o site transforma em links para a seção.
- **Modelo:** `claude-opus-5-5` por padrão, com esforço baixo e respostas curtas. Fica em torno de
  US$ 0,01 por pergunta (o system prompt usa prompt caching). Para ficar bem mais barato, defina
  `ASK_MODEL=claude-haiku-5-5`.
- **Recusas:** com Opus, o fallback no servidor (`fallbacks: "default"`) refaz automaticamente
  em outro modelo se o classificador de segurança recusar uma pergunta legítima por engano.
- **Proteção de custo:** 15 perguntas por IP por hora e 300 por dia no total (`ASK_IP_LIMIT`,
  `ASK_DAILY_LIMIT`). Sem Redis, esses contadores ficam na memória de cada instância e zeram
  quando ela reinicia. Para limites firmes, crie um Redis grátis na Upstash e cadastre
  `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`.
- **Defina um limite de gasto mensal** no Console da Anthropic (Settings → Limits). É a
  garantia final contra abuso.
- **Logs:** cada resposta registra tokens usados e cache (sem o texto da pergunta) nos logs da função.
- **Trace:** o servidor manda um evento `usage` no fim do streaming, e cada resposta no notebook
  mostra um "trace" (latência até o 1º token, streaming, modelo e tokens).

## CV em PDF

O botão "Résumé / Currículo" baixa `cv-iago-vale-en.pdf` (Letter, para recrutadores dos EUA) e
`cv-iago-vale-pt.pdf` (A4). Os dois saem do `cv.html`, que monta um CV de 2 páginas a partir do
mesmo `content.js`. Para ver as folhas no navegador: `cv.html?lang=en` ou `cv.html?lang=pt`.

Mudou algo em `content.js`? Gere os PDFs de novo (precisa de Chrome/Chromium e de internet, por causa das fontes):

```sh
sh tools/cv-pdf.sh
# com outro Chrome/Chromium: CHROME=/caminho/do/chrome sh tools/cv-pdf.sh
```

Para cada idioma, o script roda o Chrome sem interface:

```sh
chrome --headless --no-pdf-header-footer --virtual-time-budget=10000 \
  --print-to-pdf=cv-iago-vale-en.pdf "file://$PWD/cv.html?lang=en"
```

- O tamanho do texto se ajusta sozinho (de 10,75 a 9,5 pt) para caber em exatamente 2 páginas. Se o
  conteúdo crescer além disso, aparece uma 3ª folha; aí é hora de enxugar os textos.
- Uma coluna, títulos de seção padrão, texto selecionável e fontes embutidas: bom para sistemas de triagem (ATS).
- `links.site` em `content.js` aparece no cabeçalho do CV quando preenchido.
- Imprimir o `cv.html` pelo navegador (sem cabeçalhos e rodapés) gera o mesmo resultado.

## Regerar a imagem de preview

Com Chrome/Chromium instalado:

```sh
chrome --headless --hide-scrollbars --virtual-time-budget=6000 \
  --window-size=1200,630 --screenshot=og-image.png "file://$PWD/tools/og.html"
```

Depois de publicar, valide o preview em https://www.linkedin.com/post-inspector/.

## Detalhes e easter eggs

- Os projetos viram "Figuras" com fluxogramas nos símbolos clássicos (IBM / ANSI X3.5), definidos em `flow` no `content.js`.
- **Compilação de abertura:** na primeira visita da sessão aparece por ~1,5 s um log do `pdflatex`
  (encenado; dá para pular com clique ou tecla). Some para quem desativa animações.
- **Código-fonte:** o botão TeX na barra mostra o artigo inteiro como `portfolio.tex`, gerado do
  mesmo `content.js`, com opção de baixar e de "compilar" de novo.
- **Histórico de versões:** cada emprego é uma revisão do artigo (v1 → atual); clicar abre um diff
  no estilo `git` com cargo, afiliação e destaques.
- **Apêndice A:** o assistente roda como um notebook (`In [1]:` / `Out[1]:`), com trace de cada resposta.
- **Seção 3:** k-means semeado (até 6 grupos, um por área de trabalho) sobre as ferramentas da Tabela 4, descritas
  pelas frases do artigo e pelos empregos em que foram usadas; animação das iterações, inércia e silhueta.
- **Apêndice A:** além do notebook, a ontologia (grafo de conhecimento gerado do `content.js`, com visão RDF/Turtle):
  empregos e pesquisa ligados às ferramentas (`stack` de cada emprego) e cada agente à sua base de conhecimento.
- **Apêndice B:** intervalo de Wilson para notas de eval e teste A/B de prompts (χ², Fisher exato, IC de Newcombe).
- **Apêndice C:** um agente revisor em LangGraph que roda no navegador (ciclo, `interrupt()`, checkpoints com
  viagem no tempo) e a aba com o código Python equivalente.
- **Referências:** matriz de confusão de uma triagem de currículos (1.000 candidatos simulados), com limiar τ
  ajustável, precisão/revocação/F1, curva ROC e o limiar de custo mínimo.
- Módulos em `eggs/`: cada um se registra em `window.ArtigoEggs` e o `app.js` chama na renderização.
- Respeita `prefers-reduced-motion` (sem animações) e funciona com teclado e leitores de tela.
