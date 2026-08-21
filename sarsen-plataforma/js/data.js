/* =====================================================================
   SARSEN — Plataforma de Inteligência de Negócio
   Fonte única de dados. TODOS os números são ILUSTRATIVOS e foram
   construídos para fechar aritmeticamente entre si.
   Âncoras definidas pelo negócio:
     · Faturamento bruto do mês ....... R$ 8.565.000
     · Lucro bruto .................... R$ 7.000.000
     · Lucro líquido .................. R$ 5.900.000  (68,9%)
   ===================================================================== */

const SARSEN = {
  meta: {
    empresa: 'Sarsen',
    tese: 'Plataforma de implementação de IA para empresas',
    periodo: 'Agosto / 2026',
    periodoCurto: 'ago/26',
    atualizado: '21 ago 2026 · 06:40 BRT',
    entidades: ['Consolidado', 'Sarsen Brasil', 'Sarsen Inc. (US)'],
  },

  /* ---------- 1. DRE do mês (fecha linha a linha) ---------- */
  dre: {
    receitaBruta: 8565000,
    deducoes: [
      { label: 'Impostos sobre vendas e resultado', valor: -856500, nota: 'Alíquota efetiva combinada de 10,0% — mix de software padronizado (Lucro Presumido 8%/12%) e serviços' },
      { label: 'Reembolsos, cancelamentos e chargebacks', valor: -68500, nota: '0,8% do faturamento bruto' },
    ],
    receitaLiquida: 7640000,
    cpv: [
      { label: 'Infraestrutura cloud e inferência de LLM', valor: -243000 },
      { label: 'Implantação, onboarding e suporte técnico', valor: -198000 },
      { label: 'Gateway, adquirência e antifraude', valor: -121000 },
      { label: 'Licenças e APIs de terceiros', valor: -78000 },
    ],
    cpvTotal: -640000,
    lucroBruto: 7000000,
    opex: [
      { label: 'Pessoal e encargos (46 FTEs)', valor: -598000 },
      { label: 'Marketing e aquisição', valor: -245000 },
      { label: 'Comissões comerciais', valor: -118000 },
      { label: 'Tecnologia e software interno', valor: -63000 },
      { label: 'G&A (jurídico, contábil, seguros, facilities)', valor: -86000 },
    ],
    opexTotal: -1110000,
    ebitda: 5890000,
    da: -54000,
    ebit: 5836000,
    receitaFinanceira: 92000,
    despesaFinanceira: -28000,
    lucroLiquido: 5900000,
  },

  margens: {
    bruta: 0.817,          // sobre faturamento bruto
    brutaSobreLiquida: 0.916,
    ebitda: 0.688,
    liquida: 0.689,
    contribuicao: 0.916,
  },

  /* ---------- 2. Série histórica (13 meses) ---------- */
  meses: ['ago/25','set/25','out/25','nov/25','dez/25','jan/26','fev/26','mar/26','abr/26','mai/26','jun/26','jul/26','ago/26'],
  serie: {
    receita:     [5150000,5280000,5545000,5910000,6120000,6395000,6640000,7010000,7185000,7520000,7910000,8215000,8565000],
    lucroBruto:  [4068000,4184000,4408000,4712000,4890000,5123000,5332000,5643000,5798000,6084000,6415000,6685000,7000000],
    lucroLiquido:[3100000,3210000,3410000,3690000,3860000,4085000,4290000,4585000,4750000,5025000,5340000,5600000,5900000],
    mrr:         [4712000,4840000,5096000,5437000,5630000,5884000,6112000,6452000,6614000,6921000,7281000,7554000,7869400],
    clientes:    [1362,1401,1449,1508,1556,1611,1668,1731,1785,1846,1901,1957,1988],
    margemLiquida:[0.602,0.608,0.615,0.624,0.631,0.639,0.646,0.654,0.661,0.668,0.675,0.682,0.689],
    margemBruta: [0.790,0.792,0.795,0.797,0.799,0.801,0.803,0.805,0.807,0.809,0.811,0.814,0.817],
    margemEbitda:[0.601,0.607,0.614,0.622,0.629,0.637,0.644,0.652,0.659,0.666,0.673,0.681,0.688],
  },

  /* ---------- 3. Receita recorrente ---------- */
  receita: {
    mrr: 7869400,
    servicos: 695600,
    total: 8565000,
    arr: 94432800,           // MRR x 12
    runRate: 102780000,      // faturamento x 12
    arpa: 3958,
    contratoAnualMedio: 47501,
    receitaBR: 6680700,      // 78%
    receitaIntl: 1884300,    // 22%
    prePagoAnual: 0.68,
  },

  mrrMovement: [
    { label: 'MRR jul/26',        valor: 7554000, tipo: 'base' },
    { label: 'Novos contratos',   valor: 210500,  tipo: 'up',   nota: '58 novos clientes · ticket de entrada R$ 3.629' },
    { label: 'Expansão / upsell', valor: 152700,  tipo: 'up',   nota: 'Upgrade de plano, assentos e add-ons' },
    { label: 'Reativação',        valor: 18200,   tipo: 'up',   nota: '6 contas recuperadas' },
    { label: 'Contração',         valor: -27200,  tipo: 'down', nota: 'Downgrades e redução de assentos' },
    { label: 'Churn',             valor: -38800,  tipo: 'down', nota: '27 cancelamentos — 81% no plano Core' },
    { label: 'MRR ago/26',        valor: 7869400, tipo: 'total' },
  ],

  planos: [
    { nome: 'Core',       preco: 1890,  clientes: 1180, mrr: 2230200, alvo: 'PMEs de 10 a 80 pessoas',   inclui: 'Builder, biblioteca de soluções, trilhas, comunidade' },
    { nome: 'Pro',        preco: 4900,  clientes: 640,  mrr: 3136000, alvo: 'Scale-ups de 80 a 400',     inclui: 'Core + squad de implantação, mentorias, SLA 8h' },
    { nome: 'Enterprise', preco: 14900, clientes: 168,  mrr: 2503200, alvo: 'Corporações 400+',          inclui: 'Pro + ambiente dedicado, SSO, governança, SLA 2h' },
  ],

  verticais: [
    { nome: 'Varejo e E-commerce',  receita: 2056000, clientes: 512, churn: 0.012 },
    { nome: 'Serviços financeiros', receita: 1542000, clientes: 288, churn: 0.008 },
    { nome: 'Saúde',                receita: 1285000, clientes: 301, churn: 0.011 },
    { nome: 'Indústria',            receita: 1199000, clientes: 246, churn: 0.009 },
    { nome: 'Jurídico',             receita: 942000,  clientes: 268, churn: 0.016 },
    { nome: 'Educação',             receita: 771000,  clientes: 214, churn: 0.019 },
    { nome: 'Outros',               receita: 770000,  clientes: 159, churn: 0.021 },
  ],

  /* ---------- 4. Clientes e retenção ---------- */
  retencao: {
    clientesAtivos: 1988,
    novosMes: 58,
    cancelamentosMes: 27,
    netAdds: 31,
    churnLogo: 0.014,
    churnReceita: 0.0051,
    nrr: 1.183,
    grr: 0.900,
    vidaMediaMeses: 71,
    nps: 74,
    csat: 4.8,
    tempoPrimeiraResposta: '7 min',
    timeToValue: '11 dias',
  },

  healthScore: [
    { faixa: 'Saudável (80-100)', clientes: 1272, mrr: 5470000 },
    { faixa: 'Estável (60-79)',   clientes: 481,  mrr: 1782000 },
    { faixa: 'Atenção (40-59)',   clientes: 174,  mrr: 496400 },
    { faixa: 'Risco (0-39)',      clientes: 61,   mrr: 121000 },
  ],

  cohorts: [
    { nome: 'jan/26', valores: [100,102,105,108,112,115,118,121] },
    { nome: 'fev/26', valores: [100,101,104,107,110,114,117] },
    { nome: 'mar/26', valores: [100,103,106,109,113,116] },
    { nome: 'abr/26', valores: [100,102,104,108,111] },
    { nome: 'mai/26', valores: [100,103,107,110] },
    { nome: 'jun/26', valores: [100,101,105] },
    { nome: 'jul/26', valores: [100,104] },
    { nome: 'ago/26', valores: [100] },
  ],

  topContas: [
    { conta: 'Grupo Ateneu',        vertical: 'Varejo',      plano: 'Enterprise', mrr: 68400, health: 94, desde: 'mar/24', expansao: 2.4 },
    { conta: 'Meridiano Bank',      vertical: 'Financeiro',  plano: 'Enterprise', mrr: 59800, health: 91, desde: 'jul/24', expansao: 2.1 },
    { conta: 'Vertiva Saúde',       vertical: 'Saúde',       plano: 'Enterprise', mrr: 47200, health: 88, desde: 'jan/25', expansao: 1.9 },
    { conta: 'Norvix Indústria',    vertical: 'Indústria',   plano: 'Enterprise', mrr: 41600, health: 82, desde: 'set/24', expansao: 1.6 },
    { conta: 'Caravela Log',        vertical: 'Logística',   plano: 'Enterprise', mrr: 38900, health: 90, desde: 'abr/25', expansao: 2.2 },
    { conta: 'Orbitum Educação',    vertical: 'Educação',    plano: 'Enterprise', mrr: 32500, health: 71, desde: 'nov/24', expansao: 1.3 },
    { conta: 'Pátria Jurídico',     vertical: 'Jurídico',    plano: 'Enterprise', mrr: 29800, health: 86, desde: 'fev/25', expansao: 1.8 },
    { conta: 'Solaris Energia',     vertical: 'Energia',     plano: 'Enterprise', mrr: 27400, health: 79, desde: 'mai/25', expansao: 1.4 },
  ],

  /* ---------- 5. Vendas e aquisição ---------- */
  funil: [
    { etapa: 'Visitantes únicos',   valor: 214000 },
    { etapa: 'Leads capturados',    valor: 13600 },
    { etapa: 'MQLs qualificados',   valor: 3240 },
    { etapa: 'Reuniões agendadas',  valor: 810 },
    { etapa: 'Reuniões realizadas', valor: 604 },
    { etapa: 'Propostas enviadas',  valor: 196 },
    { etapa: 'Contratos fechados',  valor: 58 },
  ],

  canais: [
    { canal: 'Comunidade e indicação', novos: 20, investimento: 64000,  cac: 3200 },
    { canal: 'Conteúdo orgânico',      novos: 16, investimento: 102400, cac: 6400 },
    { canal: 'Tráfego pago',           novos: 11, investimento: 272800, cac: 24800 },
    { canal: 'Outbound / SDR',         novos: 7,  investimento: 137200, cac: 19600 },
    { canal: 'Parcerias e afiliados',  novos: 4,  investimento: 49200,  cac: 12300 },
  ],

  unit: {
    cac: 10790,
    investimentoAquisicao: 625600,
    margemContribuicaoMes: 3626,
    payback: 3.0,
    ltv: 130500,
    ltvCac: 12.1,
    cicloDias: 21,
    winRateProposta: 0.296,
    pipelineAberto: 4740000,
    coberturaPipeline: 3.2,
    ticketEntrada: 3629,
  },

  /* ---------- 6. Produto ---------- */
  produto: {
    agentesProducao: 12480,
    agentesNovosMes: 1870,
    execucoesMes: 4210000,
    custoPorExecucao: 0.058,
    solucoes: 184,
    cases: 610,
    horasEconomizadas: 186400,
    roiMedio: 7.4,
    adocao: 0.784,
    wauMau: 0.62,
    uptime: 0.9997,
    latenciaP95: '1,8 s',
  },

  modulos: [
    { nome: 'Sarsen Builder',        desc: 'Construtor no-code de agentes de IA com versionamento, testes e deploy em 1 clique.', adocao: 0.78, sinal: '1.870 agentes novos no mês' },
    { nome: 'Biblioteca de Soluções',desc: '184 soluções plug & play prontas para instalar por área e por vertical.',            adocao: 0.91, sinal: '6.240 instalações no mês' },
    { nome: 'Trilhas e Formações',   desc: 'Currículo prático de IA aplicada — do fundamento à operação em produção.',           adocao: 0.64, sinal: '11.400 aulas concluídas' },
    { nome: 'Casos e Playbooks',     desc: '610 casos reais documentados com número de antes e depois.',                          adocao: 0.57, sinal: '38 novos casos publicados' },
    { nome: 'Mentorias ao vivo',     desc: '24 encontros por mês de implementação assistida por especialista.',                   adocao: 0.42, sinal: '812 participações' },
    { nome: 'Comunidade Sarsen',     desc: 'Rede de operadores de IA — 2.940 membros ativos por semana.',                         adocao: 0.69, sinal: '2.940 MAU na comunidade' },
    { nome: 'Sarsen Score',          desc: 'Diagnóstico de maturidade em IA com plano de ação priorizado por ROI.',               adocao: 0.83, sinal: '1.104 diagnósticos ativos' },
    { nome: 'Marketplace',           desc: 'Especialistas certificados publicam e vendem agentes com revenue share.',             adocao: 0.21, sinal: 'Piloto com 34 parceiros' },
    { nome: 'Sarsen Copilot',        desc: 'Copiloto interno de suporte — resolve 71% dos tickets sem humano.',                   adocao: 0.74, sinal: '71% de deflexão de tickets' },
  ],

  usoSerie: {
    execucoes: [1180000,1340000,1520000,1780000,1960000,2240000,2510000,2860000,3080000,3410000,3720000,3960000,4210000],
    agentes:   [3980,4620,5310,6140,6820,7610,8390,9280,10010,10840,11520,11980,12480],
  },

  /* ---------- 7. Time e eficiência ---------- */
  time: {
    headcount: 46,
    custoMedioFte: 13000,
    receitaPorFte: 2234348,
    lucroPorFte: 1539130,
    ruleOf40: 135.1,
    crescimentoYoY: 0.663,
    magicNumber: 6.0,
    areas: [
      { area: 'Engenharia e Produto', pessoas: 14, custo: 224000 },
      { area: 'CS e Implantação',     pessoas: 11, custo: 132000 },
      { area: 'Vendas',               pessoas: 8,  custo: 118000 },
      { area: 'Marketing',            pessoas: 6,  custo: 68000 },
      { area: 'Conteúdo e Educação',  pessoas: 4,  custo: 34000 },
      { area: 'G&A',                  pessoas: 3,  custo: 22000 },
    ],
  },

  /* ---------- 8. Caixa e balanço ---------- */
  caixa: {
    caixaAplicacoes: 21400000,
    geracaoOperacional: 6420000,
    capex: 310000,
    fcf: 6110000,
    fcfMargin: 0.713,
    contasReceber: 9800000,
    dso: 38,
    receitaDiferida: 28600000,
    dividaFinanceira: 0,
    capitalCaptado: 0,
  },

  /* ---------- 9. Metas 2026 ---------- */
  metas: [
    { meta: 'ARR (run-rate)',   atual: 102780000, alvo: 118000000, formato: 'moeda' },
    { meta: 'Clientes ativos',  atual: 1988,      alvo: 2400,      formato: 'num' },
    { meta: 'Margem líquida',   atual: 0.689,     alvo: 0.70,      formato: 'pct' },
    { meta: 'NRR',              atual: 1.183,     alvo: 1.25,      formato: 'pct' },
    { meta: 'Churn logo mensal',atual: 0.014,     alvo: 0.009,     formato: 'pct', inverso: true },
  ],

  /* ---------- 10. Estratégias ---------- */
  estrategias: [
    { nome: 'Land & Expand Enterprise', curto: 'Enterprise', tipo: 'MRR', dono: 'Head de Enterprise', horizonte: '6 meses', status: 'Em execução', progresso: 0.62, impacto: 1200000,
      tese: 'Squad dedicado às 168 contas Enterprise com plano de expansão por departamento. Cada conta entra por uma área e abre outras três.',
      alavanca: 'NRR Enterprise de 118% para 142%' },
    { nome: 'Marketplace do Builder', curto: 'Marketplace', tipo: 'Receita', dono: 'Head de Produto', horizonte: '9 meses', status: 'Piloto', progresso: 0.35, impacto: 480000,
      tese: 'Especialistas certificados publicam agentes na plataforma com revenue share de 30%. A oferta cresce sem custo marginal de engenharia.',
      alavanca: '34 parceiros no piloto → 260 em 9 meses' },
    { nome: 'Programa Embaixadores', curto: 'Embaixadores', tipo: 'CAC', dono: 'Head de Growth', horizonte: '4 meses', status: 'Em execução', progresso: 0.48, impacto: 110000,
      tese: 'Indicação já é o canal mais barato (CAC R$ 3.200) e responde por 34,5% dos novos. Formalizar o incentivo empurra para 45%.',
      alavanca: 'CAC blended de R$ 10.790 para R$ 8.900' },
    { nome: 'Pricing híbrido (assinatura + consumo)', curto: 'Pricing híbrido', tipo: 'MRR', dono: 'Head de Monetização', horizonte: '9 meses', status: 'Design', progresso: 0.25, impacto: 320000,
      tese: 'Franquia de execuções incluída no plano e cobrança por excedente. A receita passa a acompanhar o uso real do cliente.',
      alavanca: '+6 p.p. de NRR' },
    { nome: 'Vertical Packs', curto: 'Vertical Packs', tipo: 'Vendas', dono: 'Head de Soluções', horizonte: '6 meses', status: 'Em execução', progresso: 0.55, impacto: 210000,
      tese: 'Pacotes fechados por vertical (Saúde, Jurídico, Indústria, Varejo) encurtam a prova de valor e sobem a taxa de fechamento.',
      alavanca: 'Win rate de 29,6% para 36%' },
    { nome: 'Onboarding em 7 dias', curto: 'Onboarding 7d', tipo: 'Retenção', dono: 'Head de CS', horizonte: '5 meses', status: 'Em execução', progresso: 0.71, impacto: 165000,
      tese: 'O churn se concentra em contas que não colocaram um agente em produção nos primeiros 30 dias. Encurtar o time-to-value ataca a causa.',
      alavanca: 'Churn logo de 1,4% para 0,9% ao mês' },
    { nome: 'Expansão LATAM em USD', curto: 'LATAM USD', tipo: 'Receita', dono: 'Diretoria', horizonte: '12 meses', status: 'Planejado', progresso: 0.18, impacto: 640000,
      tese: 'México e Colômbia com o mesmo produto e contrato em dólar — receita internacional de 22% para 32% e hedge natural de câmbio.',
      alavanca: 'Receita internacional de R$ 1,88M para R$ 2,74M/mês' },
    { nome: 'AI Cost Engineering', curto: 'AI Cost Eng.', tipo: 'Margem', dono: 'Head de Engenharia', horizonte: '4 meses', status: 'Em execução', progresso: 0.44, impacto: 111000,
      tese: 'Roteamento multi-modelo, cache semântico e batelada noturna derrubam o custo de inferência sem perda de qualidade.',
      alavanca: 'CPV de 7,5% para 6,2% do faturamento' },
  ],

  riscos: [
    { risco: 'Concentração no canal orgânico', nivel: 'Médio', mitigacao: '62% dos novos vêm de comunidade e conteúdo. Parcerias e outbound sobem para 30% do mix até dez/26.' },
    { risco: 'Dependência de modelos de terceiros', nivel: 'Alto', mitigacao: 'Roteador multi-modelo com três provedores ativos e fallback automático; nenhum provedor acima de 55% das execuções.' },
    { risco: 'Churn concentrado no plano Core', nivel: 'Médio', mitigacao: '81% dos cancelamentos estão no Core. Onboarding em 7 dias e ativação assistida atacam a faixa.' },
    { risco: 'Exposição cambial (22% em USD)', nivel: 'Baixo', mitigacao: 'Custo de inferência também em USD — hedge natural de aproximadamente 40% da exposição.' },
  ],

  premissas: [
    ['Regime tributário', 'Lucro Presumido com presunção de 8% (IRPJ) e 12% (CSLL) sobre a parcela de software padronizado, e 32% sobre serviços de implantação. PIS/COFINS cumulativo 3,65% e ISS 2%. Alíquota efetiva combinada de 10,0% do faturamento.'],
    ['Reconhecimento de receita', 'Contratos anuais pré-pagos (68% da base) reconhecidos pro rata ao longo de 12 meses. O caixa recebido antecipadamente aparece em receita diferida no balanço, não no resultado.'],
    ['Margem bruta', '91,6% sobre a receita líquida. O CPV inclui inferência de LLM, cloud, implantação, adquirência e licenças de terceiros — não inclui pessoal de produto e engenharia, que está em despesa operacional.'],
    ['LTV', 'Calculado como margem de contribuição mensal (R$ 3.626) multiplicada por um teto conservador de 36 meses, embora o churn de 1,4% ao mês implique vida média de 71 meses.'],
    ['CAC', 'Inclui mídia, comissões e a folha das áreas de vendas e marketing (R$ 625.600 no mês), dividida pelos 58 contratos fechados.'],
    ['Estrutura enxuta', 'Receita por colaborador de R$ 2,23 milhões ao ano. A premissa é de uma operação nativa de IA, com 62% da aquisição vinda de canais orgânicos e de comunidade, o que sustenta um S&M de 7,3% do faturamento.'],
    ['Natureza dos dados', 'Todos os números desta plataforma são ilustrativos e foram construídos para fechar aritmeticamente entre si. Não representam demonstrações financeiras auditadas.'],
  ],
};

if (typeof window !== 'undefined') window.SARSEN = SARSEN;
