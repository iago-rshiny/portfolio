/* =========================================================================
   content.js — TODO o conteúdo do portfolio fica aqui.
   Edite este arquivo; não precisa mexer em HTML/CSS.

   Textos bilíngues usam { pt: "...", en: "..." }.
   Textos iguais nos dois idiomas podem ser uma string simples.
   Este arquivo também é a base de conhecimento do assistente de IA (api/ask.js).
   ========================================================================= */

var PORTFOLIO = {
  // true = mostra o carimbo "AMOSTRA · DADOS FICTÍCIOS".
  demo: false,

  name: "Iago Vale",
  role: "Data Scientist & AI Engineer",
  focus: {
    pt: "Agentes de IA · RAG · Avaliação de LLMs · Observabilidade · Fine-tuning · Ciência de dados · Estatística",
    en: "AI agents · RAG · LLM evaluation · Observability · Fine-tuning · Data science · Statistics"
  },

  // Título do artigo. O que vem antes de ": " é o título; o resto vira o subtítulo.
  title: {
    pt: "Dos dados aos agentes: IA com rigor estatístico que automatiza operações reais de negócio",
    en: "From data to agents: statistically grounded AI that automates real business operations"
  },

  tagline: {
    pt: "Construo agentes de IA que automatizam operações reais de negócio — de pipelines de dados a orçamentos e atendimento a clientes.",
    en: "I build AI agents that automate real business operations — from data pipelines to estimating and client communication."
  },

  // Texto perfurado no cartão do topo. Máx. 80 caracteres, só A–Z, 0–9 e . , - / * & ( ) : ' + = etc.
  punchcard: "IAGO VALE * DATA SCIENTIST & AI ENGINEER * AI AGENTS * RAG * EVALS * PYTHON * SQL",

  links: {
    email: "imaurevale@gmail.com",
    linkedin: "https://www.linkedin.com/in/iago-vale-53299a190/",
    github: "",  // deixe vazio para esconder o botão
    site: "https://iago-rshiny.github.io/portfolio/",    // URL pública do site (preenchida depois do deploy; aparece no CV)
    // PDFs gerados do cv.html com tools/cv-pdf.sh (veja "CV em PDF" no README); vazio esconde o botão
    cv: { pt: "cv-iago-vale-pt.pdf", en: "cv-iago-vale-en.pdf" }
  },

  stats: [
    { value: "5+", label: { pt: "anos com dados & IA", en: "years in data & AI" } },
    { value: "2+", label: { pt: "anos com agentes de IA em produção", en: "years shipping AI agents" } },
    { value: "15h+", label: { pt: "de trabalho manual poupadas por semana", en: "of manual work saved per week" } },
    { value: "3", label: { pt: "idiomas: EN · PT · ES", en: "languages: EN · PT · ES" } }
  ],

  about: {
    bio: {
      pt: [
        "Sou Data Scientist e AI Engineer. Construo agentes de IA que automatizam operações reais de negócio, de pipelines de dados a orçamentos de obras e comunicação com clientes, e meço se eles realmente funcionam.",
        "Por dois anos coloquei agentes em produção para construtoras dos EUA (Realplan Construction e Akaza Builders): agentes com RAG e ontologia que pouparam, cada um, mais de 10 horas semanais de trabalho administrativo. Hoje, no Grupo Carone, construo uma plataforma de ETL agêntica, em que agentes orquestrados, com memória semântica e procedural, escrevem e mantêm os pipelines SQL/Python da empresa sob evals e observabilidade de ponta a ponta.",
        "Minha base é estatística: bacharelado pela UFES e mais de 5 anos em dados, como cientista e analista de dados, de modelos supervisionados e não supervisionados a BI. Por isso todo agente aqui vem com avaliação: a pergunta não é se a demo parece boa, e sim se a taxa de erro é pequena o bastante para confiar."
      ],
      en: [
        "I'm a Data Scientist and AI Engineer. I build AI agents that automate real business operations, from data pipelines to construction estimating and client communication, and I measure whether they actually work.",
        "For two years I shipped agents to production for U.S. builders (Realplan Construction and Akaza Builders): RAG- and ontology-grounded agents that each saved 10+ hours of admin work per week. Now, at Grupo Carone, I'm building an agentic ETL platform where orchestrated agents with semantic and procedural memory write and maintain the company's SQL/Python pipelines, under evals and end-to-end observability.",
        "My foundation is statistics: a B.Sc. from UFES and 5+ years in data as a Data Scientist and Data Analyst, from supervised and unsupervised models to BI. That is why every agent here comes with an evaluation: the question is not whether the demo looks good, but whether the error rate is low enough to trust."
      ]
    },
    principles: [
      {
        title: { pt: "Avaliação com rigor estatístico", en: "Statistically rigorous evaluation" },
        text: {
          pt: "Medir se a IA realmente funciona, e não só se a demo parece boa.",
          en: "Measuring whether the AI actually works, not just whether the demo looks good."
        }
      },
      {
        title: { pt: "Agentes ancorados nos dados da empresa", en: "Agents grounded in company data" },
        text: {
          pt: "RAG sobre regras de negócio, documentos e histórico, para respostas precisas no contexto de cada cliente.",
          en: "RAG over business rules, documents and history, for accurate answers in each client's context."
        }
      },
      {
        title: { pt: "Confiável para o dia a dia", en: "Reliable enough for daily use" },
        text: {
          pt: "Arquitetura de agentes e harness engineering (ferramentas, contexto e loop de execução) para saídas consistentes em produção.",
          en: "Agent architecture and harness engineering (tools, context and execution loop) for consistent output in production."
        }
      }
    ]
  },

  // Tabela "datasheet" da seção Sobre. cv: true = aparece também no cabeçalho do CV impresso.
  datasheet: [
    { k: { pt: "Função", en: "Role" }, v: "Data Scientist & AI Engineer" },
    { k: { pt: "Base", en: "Based in" }, v: { pt: "Vila Velha, ES · Brasil (UTC−3)", en: "Vila Velha, ES · Brazil (UTC−3)" }, cv: true },
    { k: { pt: "Cidadania", en: "Citizenship" }, v: { pt: "EUA · não precisa de patrocínio de visto", en: "U.S. · no visa sponsorship needed" }, cv: true },
    { k: { pt: "Experiência", en: "Experience" }, v: { pt: "5+ anos em dados e IA", en: "5+ years in data & AI" } },
    { k: { pt: "Idiomas", en: "Languages" }, v: { pt: "Inglês e português (nativos) · espanhol (fluente)", en: "English & Portuguese (native) · Spanish (fluent)" }, cv: true },
    { k: { pt: "Formação", en: "Education" }, v: { pt: "Bacharelado em Estatística (UFES)", en: "B.Sc. in Statistics (UFES)" } },
    { k: { pt: "Agora", en: "Now" }, v: { pt: "Construindo uma plataforma de ETL agêntica", en: "Building an agentic ETL platform" }, led: true }
  ],

  /* Projetos.
     metrics: { before, after } gera barras de antes/depois; { value } mostra um número só.
     flow: fluxograma de como o sistema funciona, de cima para baixo. Símbolos (shape):
       term = início/fim · io = entrada de dados · proc = processo · sub = processo principal
       decision = decisão · doc = documento · store = base de dados
     via: base consultada naquele passo (ao lado, seta tracejada entrando)
     branch: saída alternativa de uma decisão (ao lado, com edge) · edge: rótulo da seta que chega ao passo */
  projects: [
    {
      id: "PRJ-001",
      year: "2026",
      org: "Grupo Carone",
      stage: "building", // LED âmbar piscando
      status: { pt: "Em desenvolvimento", en: "In development" },
      title: { pt: "Plataforma de ETL agêntica", en: "Agentic ETL platform" },
      summary: {
        pt: "Uma plataforma em que agentes de IA orquestrados geram, testam e mantêm os pipelines SQL/Python de vendas, finanças, estoque/compras e operações.",
        en: "A platform where orchestrated AI agents generate, test and maintain the SQL/Python pipelines behind sales, finance, inventory/procurement and operations."
      },
      problem: {
        pt: "Cada área do negócio precisa de pipelines criados rápido, atualizados quando as fontes mudam e fiéis às definições da própria empresa para cada métrica. Feito à mão, isso vira fila; feito com um único prompt de LLM, não é confiável.",
        en: "Every business area needs pipelines that are built fast, kept current as sources change, and faithful to the company's own definition of each metric. Done by hand, that becomes a backlog; done with a single LLM prompt, it is not reliable."
      },
      solution: {
        pt: "Um agente orquestrador (LangGraph) planeja cada pipeline e distribui o trabalho para agentes especialistas (LLMs + n8n). Eles consultam, via RAG, o dicionário de dados, a documentação e as regras de negócio (memória semântica), reaproveitam padrões de pipeline que já funcionaram (memória procedural) e escrevem SQL/Python com um modelo ajustado por fine-tuning ao padrão da empresa. Todo pipeline passa por evals antes de entrar em produção, e cada execução dos agentes é rastreada de ponta a ponta (observabilidade).",
        en: "An orchestrator agent (LangGraph) plans each pipeline and hands the work to specialist agents (LLMs + n8n). They retrieve the data dictionary, documentation and business rules with RAG (semantic memory), reuse pipeline patterns that already worked (procedural memory), and write SQL/Python with a model fine-tuned to the company's standards. Every pipeline passes evals before it ships, and every agent run is traced end to end (observability)."
      },
      flow: [
        { shape: "io", text: { pt: "Dados de vendas, finanças, estoque e operações", en: "Sales, finance, inventory and operations data" } },
        { shape: "sub", text: { pt: "Agente orquestrador planeja o pipeline (LangGraph)", en: "Orchestrator agent plans the pipeline (LangGraph)" },
          via: { shape: "store", text: { pt: "Memória semântica: dicionário de dados e regras (RAG)", en: "Semantic memory: data dictionary & rules (RAG)" } } },
        { shape: "sub", text: { pt: "Agentes especialistas escrevem o SQL/Python (modelo com fine-tuning)", en: "Specialist agents write the SQL/Python (fine-tuned model)" },
          via: { shape: "store", text: { pt: "Memória procedural: padrões de pipeline aprovados", en: "Procedural memory: proven pipeline patterns" } } },
        { shape: "decision", text: { pt: "Passou nos evals?", en: "Passes evals?" },
          branch: { edge: { pt: "NÃO", en: "NO" }, shape: "proc", text: { pt: "Volta aos agentes com o feedback do eval", en: "Back to the agents with the eval feedback" } } },
        { shape: "proc", edge: { pt: "SIM", en: "YES" }, text: { pt: "Roda no n8n, rastreado de ponta a ponta", en: "Runs in n8n, traced end to end" } },
        { shape: "decision", text: { pt: "Carga falhou?", en: "Load failed?" },
          branch: { edge: { pt: "NÃO", en: "NO" }, shape: "term", text: { pt: "Dados prontos para o BI", en: "Data ready for BI" } } },
        { shape: "term", edge: { pt: "SIM", en: "YES" }, text: { pt: "Agente reprocessa e alerta o time de dados", en: "Agent reprocesses and alerts the data team" } }
      ],
      stack: ["LangGraph", "n8n", "LLMs", "RAG", { pt: "Memória semântica e procedural", en: "Semantic & procedural memory" }, "Fine-tuning", "Evals", { pt: "Observabilidade", en: "Observability" }, "Python", "SQL"]
    },
    {
      id: "PRJ-002",
      year: "2025–2026",
      org: { pt: "Akaza Builders · EUA", en: "Akaza Builders · USA" },
      status: { pt: "Entregue", en: "Shipped" },
      title: { pt: "Agentes de orçamento e propostas", en: "Estimating & proposal agents" },
      summary: {
        pt: "Agentes que transformam especificações e plantas em orçamentos precificados e propostas redigidas para uma construtora americana.",
        en: "Agents that turn specs and drawings into priced estimates and drafted proposals for a U.S. builder."
      },
      problem: {
        pt: "Cada concorrência exigia ler especificações e plantas, buscar preços em licitações anteriores, planilhas e cotações de fornecedores e subempreiteiros, e então redigir a proposta. Eram muitas horas de trabalho manual por semana, com o conhecimento de preços espalhado entre arquivos e pessoas.",
        en: "Every bid meant reading specs and drawings, looking up prices in past bids, pricing sheets and supplier and subcontractor quotes, and then writing the proposal. That took many hours of manual work every week, with pricing knowledge scattered across files and people."
      },
      solution: {
        pt: "O mesmo kit da plataforma de ETL, aplicado a orçamentos. Uma ontologia do domínio da construção (disciplinas, materiais, unidades e itens de custo) permite que um agente de extração ligue cada item das especificações a um item precificável. Um agente de orçamento precifica cada linha com RAG sobre licitações, planilhas de preço e cotações (memória semântica), seguindo o método de orçamento da empresa (memória procedural); um modelo com fine-tuning redige a proposta. Evals conferem cada orçamento antes de ele chegar ao cliente, e cada execução é rastreada (observabilidade).",
        en: "The same toolkit as the ETL platform, applied to estimating. An ontology of the construction domain (trades, materials, units and cost items) lets an extraction agent map every spec item to a priceable item. An estimating agent prices each line with RAG over past bids, pricing sheets and quotes (semantic memory), following the company's estimating method (procedural memory), and a fine-tuned model drafts the proposal. Evals check every estimate before it reaches the client, and every run is traced (observability)."
      },
      flow: [
        { shape: "term", text: { pt: "Novo projeto para orçar", en: "New project to estimate" } },
        { shape: "doc", text: { pt: "Especificações e plantas", en: "Specs and drawings" } },
        { shape: "sub", text: { pt: "Agente de extração liga cada item à ontologia", en: "Extraction agent maps each item to the ontology" },
          via: { shape: "store", text: { pt: "Ontologia: disciplinas, materiais e itens de custo", en: "Ontology: trades, materials & cost items" } } },
        { shape: "sub", text: { pt: "Agente de orçamento precifica cada linha", en: "Estimating agent prices each line" },
          via: { shape: "store", text: { pt: "RAG: licitações, preços e cotações", en: "RAG: past bids, pricing & quotes" } } },
        { shape: "decision", text: { pt: "Passou nos evals?", en: "Passes evals?" },
          branch: { edge: { pt: "NÃO", en: "NO" }, shape: "term", text: { pt: "Sinalizado para o orçamentista", en: "Flagged for the estimator" } } },
        { shape: "doc", edge: { pt: "SIM", en: "YES" }, text: { pt: "Orçamento e proposta redigidos", en: "Drafted estimate and proposal" } }
      ],
      metrics: [
        { label: { pt: "Trabalho de orçamento e admin poupado", en: "Estimating & admin work saved" }, value: "15+", unit: { pt: " h/semana", en: " h/week" } }
      ],
      stack: ["AI Agents", { pt: "Ontologia", en: "Ontology" }, "RAG", { pt: "Memória semântica e procedural", en: "Semantic & procedural memory" }, "Fine-tuning", "Evals", { pt: "Observabilidade", en: "Observability" }, "n8n", "LLMs", "Prompt engineering"]
    },
    {
      id: "PRJ-003",
      year: "2024–2025",
      org: { pt: "Realplan Construction · EUA", en: "Realplan Construction · USA" },
      status: { pt: "Entregue", en: "Shipped" },
      title: { pt: "Agentes de comunicação com clientes", en: "Client communication agents" },
      summary: {
        pt: "Agentes que cuidam da comunicação com clientes e subempreiteiros de uma construtora americana: triagem, respostas, follow-ups e agendamentos, com o contexto de cada obra.",
        en: "Agents that handle client and subcontractor communication for a U.S. builder: triage, replies, follow-ups and scheduling, with the context of each job."
      },
      problem: {
        pt: "Com várias obras ao mesmo tempo, chegava um fluxo constante de e-mails de clientes e subempreiteiros sobre prazos, documentos e próximos passos. Cada resposta dependia de contexto enterrado em conversas antigas, documentos de projeto e políticas da empresa, e os follow-ups acabavam esquecidos. O time perdia horas toda semana com isso.",
        en: "With several jobs running at once, a steady stream of emails arrived from clients and subcontractors about schedules, documents and next steps. Each reply depended on context buried in old threads, project documents and company policies, and follow-ups slipped through the cracks. The team lost hours every week to it."
      },
      solution: {
        pt: "O mesmo kit, aplicado à comunicação. Uma ontologia do negócio (obras, clientes, subempreiteiros, disciplinas e tipos de pedido) permite que um agente de triagem classifique cada e-mail e o ligue à obra certa. Um agente redige a resposta com RAG sobre o histórico de e-mails, os documentos de projeto e as políticas da empresa (memória semântica), seguindo o roteiro do time para follow-ups e agendamentos (memória procedural). Evals e rastreamento de cada execução mantêm as respostas precisas; o que não passa vai para uma pessoa do time.",
        en: "The same toolkit, applied to communication. An ontology of the business (jobs, clients, subcontractors, trades and request types) lets a triage agent classify each email and link it to the right job. A reply agent drafts the answer with RAG over email history, project documents and company policies (semantic memory), following the team's playbook for follow-ups and scheduling (procedural memory). Evals and per-run tracing keep replies accurate; anything that fails goes to a person on the team."
      },
      flow: [
        { shape: "io", text: { pt: "E-mail de cliente ou subempreiteiro", en: "Email from a client or subcontractor" } },
        { shape: "sub", text: { pt: "Agente de triagem liga o e-mail à obra e ao tipo de pedido", en: "Triage agent links it to the job and request type" },
          via: { shape: "store", text: { pt: "Ontologia: obras, partes e tipos de pedido", en: "Ontology: jobs, parties & request types" } } },
        { shape: "sub", text: { pt: "Agente redige a resposta", en: "Agent drafts the reply" },
          via: { shape: "store", text: { pt: "RAG: e-mails, documentos e políticas", en: "RAG: emails, docs & policies" } } },
        { shape: "decision", text: { pt: "Passou nos evals?", en: "Passes evals?" },
          branch: { edge: { pt: "NÃO", en: "NO" }, shape: "term", text: { pt: "Encaminhado a uma pessoa do time", en: "Routed to a person on the team" } } },
        { shape: "term", edge: { pt: "SIM", en: "YES" }, text: { pt: "Resposta, follow-up ou agendamento", en: "Reply, follow-up or scheduling" } }
      ],
      metrics: [
        { label: { pt: "Trabalho administrativo poupado", en: "Admin work saved" }, value: "10+", unit: { pt: " h/semana", en: " h/week" } }
      ],
      stack: ["AI Agents", { pt: "Ontologia", en: "Ontology" }, "RAG", { pt: "Memória semântica e procedural", en: "Semantic & procedural memory" }, "Evals", { pt: "Observabilidade", en: "Observability" }, "n8n", "LLMs", { pt: "Automação de e-mails", en: "Email automation" }]
    }
  ],

  /* Stack. level: 3 = uso em produção · 2 = proficiente · 1 = familiar.
     Os nomes batem com os "stack" de projetos e empregos (a ontologia do Apêndice A liga um ao outro). */
  skills: [
    {
      group: { pt: "Engenharia de IA", en: "AI Engineering" },
      items: [
        [{ pt: "Agentes de IA", en: "AI agents" }, 3], [{ pt: "Arquitetura de agentes", en: "Agent architecture" }, 3],
        ["RAG", 3], ["Prompt engineering", 3], ["Harness engineering", 3], ["Evals", 3],
        [{ pt: "Observabilidade", en: "Observability" }, 3], [{ pt: "Ontologia", en: "Ontology" }, 3],
        [{ pt: "Memória semântica e procedural", en: "Semantic & procedural memory" }, 2], ["Fine-tuning", 2]
      ]
    },
    {
      group: { pt: "LLMs & orquestração", en: "LLMs & orchestration" },
      items: [
        ["n8n", 3], ["LLMs", 3], [{ pt: "Orquestração multiagente", en: "Multi-agent orchestration" }, 3],
        ["LangGraph", 2], ["LangChain", 1], ["LangSmith", 1], ["Langflow", 1]
      ]
    },
    {
      group: { pt: "Ciência de dados", en: "Data science" },
      items: [
        ["Python", 3], ["R", 3], [{ pt: "Modelagem estatística", en: "Statistical modeling" }, 3],
        [{ pt: "Aprendizado supervisionado", en: "Supervised learning" }, 3], [{ pt: "Aprendizado não supervisionado", en: "Unsupervised learning" }, 3],
        [{ pt: "Séries temporais", en: "Time series" }, 2]
      ]
    },
    {
      group: { pt: "Engenharia de dados", en: "Data engineering" },
      items: [
        ["SQL", 3], [{ pt: "Pipelines ETL", en: "ETL pipelines" }, 3], [{ pt: "Tratamento de dados", en: "Data wrangling" }, 3]
      ]
    },
    {
      group: { pt: "BI & visualização", en: "BI & visualization" },
      items: [
        ["Qlik Sense", 3], ["Power BI", 3], ["Tableau", 2], ["R Shiny", 2], ["Excel", 3]
      ]
    }
  ],

  /* Experiência — ordem cronológica inversa. end: null = atual. Datas "AAAA-MM". */
  experience: [
    {
      start: "2026-09", end: null,
      org: "Grupo Carone",
      title: "AI Engineer",
      bullets: {
        pt: [
          "Construindo uma plataforma de ETL agêntica: agentes de IA orquestrados (LangGraph + n8n) geram e mantêm pipelines SQL/Python de vendas, finanças, estoque/compras e operações.",
          "RAG sobre o dicionário de dados, a documentação e as regras de negócio, mais memória semântica e procedural, para que toda transformação siga as definições da empresa e reaproveite padrões que já funcionaram.",
          "Evals em todo pipeline gerado antes de ir para produção, e rastreamento de ponta a ponta de cada execução dos agentes (observabilidade).",
          "Fine-tuning de um modelo para gerar SQL/Python no padrão de schemas e código da empresa.",
          "Orquestração e monitoramento em n8n: os agentes detectam cargas com falha, reprocessam e alertam o time de dados.",
          "Arquitetura de agentes e harness engineering (ferramentas, contexto e loop de execução) para que os pipelines gerados sejam confiáveis em produção."
        ],
        en: [
          "Building an agentic ETL platform where orchestrated AI agents (LangGraph + n8n) generate and maintain SQL/Python data pipelines for sales, finance, inventory/procurement and operations.",
          "Grounding agents with RAG over the data dictionary, documentation and business rules, plus semantic and procedural memory, so every transformation follows company definitions and reuses patterns that already worked.",
          "Gating every generated pipeline with evals before it ships, and tracing every agent run end to end (observability).",
          "Fine-tuning a model to generate SQL/Python that follows the company's schemas and coding standards.",
          "Designing orchestration and monitoring in n8n: agents detect failed loads, reprocess them and alert the data team.",
          "Applying agent architecture and harness engineering (tools, context and execution loop) to make agent-generated pipelines reliable enough for production."
        ]
      }
    },
    {
      start: "2025-11", end: "2026-08",
      org: { pt: "Akaza Builders · EUA (remoto)", en: "Akaza Builders · USA (remote)" },
      title: "AI Automation Engineer – Estimating & Proposals",
      bullets: {
        pt: [
          "Projetei e coloquei em produção agentes de IA que automatizam orçamentos de obras e a redação de propostas.",
          "Base de conhecimento com RAG sobre licitações anteriores, planilhas de preço, cotações de fornecedores e subempreiteiros, especificações e plantas, para orçamentos ancorados nos dados da própria empresa.",
          "Ontologia do domínio da construção (disciplinas, materiais, unidades e itens de custo) para que os agentes liguem cada item das especificações a um item precificável.",
          "Prompt engineering, harness design, evals e observabilidade para manter as saídas consistentes no uso diário.",
          "Mais de 15 horas semanais de trabalho de orçamento e administrativo poupadas."
        ],
        en: [
          "Designed and deployed AI agents that automate construction estimating and proposal drafting.",
          "Built a RAG knowledge base over past bids, pricing sheets, supplier and subcontractor quotes, project specs and drawings, so agents draft estimates grounded in the company's own data.",
          "Modeled the construction domain as an ontology (trades, materials, units and cost items) so agents map every spec item to a priceable item.",
          "Applied prompt engineering, agent harness design, evals and observability to keep outputs consistent enough for daily production use.",
          "Saved 15+ hours of estimating and admin work per week."
        ]
      }
    },
    {
      start: "2024-08", end: "2025-10",
      org: { pt: "Realplan Construction Inc · EUA (remoto)", en: "Realplan Construction Inc · USA (remote)" },
      title: "AI Automation Engineer – Client Operations",
      bullets: {
        pt: [
          "Agentes de IA que automatizam a comunicação com clientes e subempreiteiros: triagem de e-mails, rascunho de respostas, follow-ups e agendamentos.",
          "RAG sobre histórico de e-mails, documentos de projeto e políticas da empresa, para respostas com o contexto preciso de cada obra.",
          "Ontologia do negócio (obras, clientes, subempreiteiros e tipos de pedido) para a triagem ligar cada e-mail à obra certa, com evals e rastreamento de cada execução.",
          "Mais de 10 horas semanais de trabalho administrativo poupadas."
        ],
        en: [
          "Built AI agents that automate client and subcontractor communication: email triage, drafted replies, follow-ups and scheduling.",
          "Implemented RAG over email history, project documents and company policies so agents answer questions with accurate, project-specific context.",
          "Modeled the business as an ontology (jobs, clients, subcontractors and request types) so triage links every email to the right job, with evals and per-run tracing.",
          "Saved 10+ hours of administrative work per week."
        ]
      }
    },
    {
      start: "2023-10", end: "2024-09",
      org: "Grupo Carone",
      title: "Data Analyst",
      stack: ["SQL", { pt: "Pipelines ETL", en: "ETL pipelines" }, "Qlik Sense"],
      bullets: {
        pt: [
          "Dashboards e visualizações de dados em Qlik Sense.",
          "ETL e tratamento de dados em SQL, e análises que geram insights para a tomada de decisão.",
          "Automação de relatórios para ganhar eficiência.",
          "Mentoria de outros analistas de dados."
        ],
        en: [
          "Created data visualizations and dashboards in Qlik Sense.",
          "Built ETL and data wrangling in SQL, and analyses that generate actionable insights for decision-making.",
          "Automated reporting processes to improve efficiency.",
          "Mentored other data analysts."
        ]
      }
    },
    {
      start: "2023-04", end: "2023-09",
      org: "Autoglass",
      title: "Risk Analyst",
      stack: ["Excel", "Tableau"],
      bullets: {
        pt: [
          "Precificação de ativos de seguradora: avaliação e categorização de veículos por marca, modelo e ano.",
          "Estudo do comportamento da carteira: perfis de clientes, segmentação, padrões de consumo e impacto de estratégias de preço.",
          "Relatórios de oportunidades de negócio e propostas comerciais em Excel e Tableau."
        ],
        en: [
          "Priced insurance assets by evaluating and categorizing vehicles by brand, model and year.",
          "Studied portfolio behavior: customer profiles, segmentation, consumption patterns and the impact of pricing strategies.",
          "Built business-opportunity reports and sales proposals in Excel and Tableau."
        ]
      }
    },
    {
      start: "2021-08", end: "2023-04",
      org: "Apex Partners",
      title: "Data Scientist",
      stack: ["Python", "R", "SQL", { pt: "Aprendizado supervisionado", en: "Supervised learning" }, { pt: "Aprendizado não supervisionado", en: "Unsupervised learning" }, "Power BI"],
      bullets: {
        pt: [
          "Processos de ETL e tratamento de dados em Python e SQL.",
          "Análises com aprendizado supervisionado e não supervisionado (incluindo clusterização), em Python e R.",
          "Dashboards de visualização de dados em Power BI."
        ],
        en: [
          "Created ETL processes and performed data wrangling in Python and SQL.",
          "Ran supervised and unsupervised learning analyses, including clustering, in Python and R.",
          "Produced data visualization dashboards in Power BI."
        ]
      }
    }
  ],

  education: [
    {
      title: { pt: "Bacharelado em Estatística", en: "B.Sc. in Statistics" },
      org: "UFES — Universidade Federal do Espírito Santo",
      year: "2018 — 2023"
    }
  ],

  certifications: [],

  // Pesquisa, liderança e voluntariado (coluna ao lado de Formação)
  activities: {
    title: { pt: "Pesquisa & voluntariado", en: "Research & volunteering" },
    items: [
      {
        title: { pt: "Iniciação Científica em Estatística (bolsa)", en: "Undergraduate research scholarship, Statistics" },
        org: {
          pt: "UFES · modelos mistos com séries temporais sobre poluição do ar e doenças respiratórias infantis na Grande Vitória, em R e R Shiny",
          en: "UFES · mixed models with time series on air pollution and children's respiratory disease in Greater Vitória, in R and R Shiny"
        },
        stack: ["R", "R Shiny", { pt: "Séries temporais", en: "Time series" }],
        year: "2019 — 2020"
      },
      {
        title: { pt: "Vice-presidente do Centro Acadêmico de Estatística", en: "Vice-President, Statistics Student Association" },
        org: "CAEST · UFES",
        year: "2019 — 2020"
      },
      {
        title: "IT Advisor",
        org: { pt: "Educação Para a Liberdade (ONG) · estruturação do CRM Bitrix24 e treinamento da equipe", en: "Educação Para a Liberdade (NGO) · set up the Bitrix24 CRM and trained the team" },
        year: "2020 — 2021"
      }
    ]
  },

  contact: {
    lead: {
      pt: "Contratando para ciência de dados ou engenharia de IA, ou tem um processo que agentes podem automatizar? Um e-mail curto com o contexto é o melhor começo.",
      en: "Hiring for data science or AI engineering, or have a process that agents could automate? A short email with the context is the best way to start."
    }
  },

  /* Assistente "Pergunte ao meu currículo" (seção 05). Ele responde usando só
     os dados deste arquivo — e tudo aqui é público, inclusive as notas. */
  assistant: {
    enabled: true,
    sourceLang: "pt", // versão dos textos que o assistente usa como fonte dos fatos
    pronouns: null,   // opcional, ex.: "ele/dele (he/him)". Sem isso, ele se refere a você só pelo nome.
    // Fatos extras que não aparecem no site mas o assistente pode usar:
    notes: [
      "LangGraph: em uso na plataforma de ETL agêntica do Grupo Carone (2026). LangChain, LangSmith e Langflow: nível familiar (estudados, ainda não usados em produção).",
      "Memória semântica = fatos consultados pelos agentes (dicionário de dados, regras de negócio, documentos). Memória procedural = o \"como fazer\" reaproveitável (padrões de pipeline aprovados, roteiros e métodos do time).",
      "Ferramentas por emprego: Apex Partners (Data Scientist): Python, R, SQL, aprendizado supervisionado e não supervisionado, Power BI. Autoglass: Excel e Tableau. Grupo Carone (Data Analyst): SQL, ETL e Qlik Sense. Pesquisa na UFES: R e R Shiny."
    ],
    suggestions: [
      { pt: "Que experiência tem com agentes de IA em produção?", en: "What experience is there with AI agents in production?" },
      { pt: "Qual é a stack da plataforma de ETL agêntica?", en: "What is the stack of the agentic ETL platform?" },
      { pt: "Pode trabalhar para empresas dos EUA?", en: "Can Iago work for U.S. companies?" },
      { pt: "Como a estatística entra no trabalho com IA?", en: "How does statistics play into the AI work?" }
    ]
  }
};

// Permite que a função do servidor (api/ask.js) leia este mesmo arquivo.
if (typeof module !== "undefined") module.exports = PORTFOLIO;
