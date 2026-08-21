/* =====================================================================
   SARSEN — aplicação do console
   Roteamento por hash, montagem de painéis e composição das vistas.
   ===================================================================== */

const S = window.SARSEN;
const D = S.dre;
const Q = [];                       /* fila de montagem de gráficos */
const after = fn => { Q.push(fn); };
const $ = sel => document.querySelector(sel);

/* --------------------------- micro componentes --------------------------- */
const delta = (v, { pp = false, inverso = false, sufixo = 'vs. jul/26' } = {}) => {
  const pos = inverso ? v < 0 : v > 0;
  const cls = v === 0 ? 'flat' : pos ? 'up' : 'down';
  const arrow = v === 0 ? '→' : v > 0 ? '▲' : '▼';
  const val = pp ? F.pp(v) : (v > 0 ? '+' : '−') + F.pct(Math.abs(v), 1);
  return `<span class="delta delta--${cls}">${arrow} ${val}</span><span class="kpi__ctx">${sufixo}</span>`;
};

function kpi({ label, value, unit, foot, spark, sparkColor, hero, id }) {
  const sid = id || 'k' + Math.random().toString(36).slice(2, 8);
  if (spark) after(() => sparkline(document.getElementById(sid), spark, sparkColor || (hero ? '#d9a05b' : '#3987e5')));
  return `<article class="panel kpi ${hero ? 'kpi--hero' : ''}">
    <div class="kpi__label">${label}</div>
    <div class="kpi__value">${value}${unit ? `<small>${unit}</small>` : ''}</div>
    <div class="kpi__foot">${foot || ''}</div>
    ${spark ? `<div class="kpi__spark chart" id="${sid}"></div>` : ''}
  </article>`;
}

function panel(title, note, body, { sub = '', cls = '' } = {}) {
  return `<section class="panel ${cls}">
    <div class="panel__head"><h3 class="panel__title">${title}</h3>${note ? `<span class="panel__note">${note}</span>` : ''}</div>
    ${sub ? `<p class="panel__sub">${sub}</p>` : ''}
    ${body}
  </section>`;
}

const chartBox = id => `<div class="chart" id="${id}"></div>`;
const legend = items => `<div class="legend">${items.map(i => `<span class="legend__item"><span class="legend__swatch${i.line ? ' legend__swatch--line' : ''}" style="background:${i.color}"></span>${i.name}</span>`).join('')}</div>`;
const statRows = rows => rows.map(r => `<div class="stat-row"><span class="stat-row__k">${r[0]}</span><span class="stat-row__v">${r[1]}</span></div>`).join('');

const MoM = arr => arr.at(-1) / arr.at(-2) - 1;
const YoY = arr => arr.at(-1) / arr[0] - 1;

/* ============================== 1. VISÃO GERAL ============================== */
function viewOverview() {
  const s = S.serie;
  const mixReceita = [
    { label: 'Enterprise', value: S.planos[2].mrr },
    { label: 'Pro', value: S.planos[1].mrr },
    { label: 'Core', value: S.planos[0].mrr },
    { label: 'Serviços de implantação', value: S.receita.servicos, color: '#6d727c' },
  ];

  after(() => {
    lineChart(document.getElementById('c-resultado'), {
      labels: S.meses, height: 300,
      series: [
        { name: 'Faturamento bruto', values: s.receita, color: PALETTE[0] },
        { name: 'Lucro bruto', values: s.lucroBruto, color: PALETTE[1] },
        { name: 'Lucro líquido', values: s.lucroLiquido, color: PALETTE[2] },
      ],
    });
    lineChart(document.getElementById('c-margens'), {
      labels: S.meses, height: 240, min: 0.5,
      fmt: v => F.pct(v, 1), yFmt: v => F.pct(v, 0),
      series: [
        { name: 'Margem bruta', values: s.margemBruta, color: PALETTE[0], area: false },
        { name: 'Margem EBITDA', values: s.margemEbitda, color: PALETTE[1], area: false },
        { name: 'Margem líquida', values: s.margemLiquida, color: PALETTE[2], area: false },
      ],
    });
    waterfall(document.getElementById('c-cascata'), {
      height: 320,
      items: [
        { label: 'Faturamento bruto', curto: 'Faturamento', valor: D.receitaBruta, tipo: 'base' },
        { label: 'Impostos', valor: D.deducoes[0].valor, nota: D.deducoes[0].nota },
        { label: 'Reembolsos', valor: D.deducoes[1].valor, nota: D.deducoes[1].nota },
        { label: 'CPV', valor: D.cpvTotal, nota: 'Cloud, inferência de LLM, implantação, adquirência e licenças' },
        { label: 'Despesas operacionais', curto: 'Despesas', valor: D.opexTotal, nota: 'Pessoal, marketing, comissões, tecnologia e G&A' },
        { label: 'D&A e resultado financeiro', curto: 'D&A e financ.', valor: D.da + D.receitaFinanceira + D.despesaFinanceira, nota: 'Depreciação, amortização e resultado financeiro líquido' },
        { label: 'Lucro líquido', curto: 'Lucro líq.', valor: D.lucroLiquido, tipo: 'total' },
      ],
    });
    donut(document.getElementById('c-mix'), {
      items: mixReceita, height: 220,
      centro: F.compact(D.receitaBruta), centroLabel: 'FATURAMENTO DO MÊS',
    });
  });

  return `
  <div class="view__intro">
    <h2>O mês em uma tela</h2>
    <p>Fechamento de <strong>${S.meta.periodo}</strong>. Faturamento bruto de ${F.brl(D.receitaBruta)}, lucro líquido de ${F.brl(D.lucroLiquido)} e margem líquida de ${F.pct(S.margens.liquida)} — o décimo terceiro mês consecutivo de expansão de margem.</p>
  </div>

  <div class="grid grid--kpi">
    ${kpi({ label: 'Faturamento bruto', value: F.compact(D.receitaBruta), hero: true, spark: s.receita, foot: delta(MoM(s.receita)) })}
    ${kpi({ label: 'Lucro bruto', value: F.compact(D.lucroBruto), spark: s.lucroBruto, sparkColor: PALETTE[1], foot: delta(MoM(s.lucroBruto)) })}
    ${kpi({ label: 'Lucro líquido', value: F.compact(D.lucroLiquido), hero: true, spark: s.lucroLiquido, foot: delta(MoM(s.lucroLiquido)) })}
    ${kpi({ label: 'Margem líquida', value: F.pct(S.margens.liquida), spark: s.margemLiquida, sparkColor: PALETTE[2], foot: delta(s.margemLiquida.at(-1) - s.margemLiquida.at(-2), { pp: true }) })}
  </div>

  <div class="grid grid--kpi mt">
    ${kpi({ label: 'MRR', value: F.compact(S.receita.mrr), spark: s.mrr, foot: delta(MoM(s.mrr)) })}
    ${kpi({ label: 'Run-rate anual', value: F.compact(S.receita.runRate), foot: `<span class="delta delta--up">▲ ${F.pct(YoY(s.receita))}</span><span class="kpi__ctx">vs. ago/25</span>` })}
    ${kpi({ label: 'Clientes ativos', value: F.int(S.retencao.clientesAtivos), spark: s.clientes, sparkColor: PALETTE[3], foot: `<span class="delta delta--up">▲ ${S.retencao.netAdds} contas</span><span class="kpi__ctx">líquidas no mês</span>` })}
    ${kpi({ label: 'NRR (12 meses)', value: F.pct(S.retencao.nrr), foot: `<span class="kpi__ctx">GRR ${F.pct(S.retencao.grr)} · churn ${F.pct(S.retencao.churnLogo)} a.m.</span>` })}
  </div>

  <div class="grid grid--2 mt">
    ${panel('Faturamento, lucro bruto e lucro líquido', '13 MESES · R$', chartBox('c-resultado') + legend([
      { name: 'Faturamento bruto', color: PALETTE[0], line: true },
      { name: 'Lucro bruto', color: PALETTE[1], line: true },
      { name: 'Lucro líquido', color: PALETTE[2], line: true },
    ]), { cls: 'span-2', sub: 'As três linhas abrem ao longo do período: o faturamento cresceu ' + F.pct(YoY(s.receita)) + ' em doze meses enquanto o lucro líquido cresceu ' + F.pct(YoY(s.lucroLiquido)) + ', efeito da alavancagem operacional.' })}

    ${panel('Do faturamento ao lucro líquido', 'AGO/26', chartBox('c-cascata'), { sub: 'Cada bloco é uma linha do resultado. De ' + F.brl(D.receitaBruta) + ' faturados, ' + F.brl(D.lucroLiquido) + ' chegam ao lucro.' })}

    ${panel('Margens', '% SOBRE FATURAMENTO BRUTO', chartBox('c-margens') + legend([
      { name: 'Margem bruta', color: PALETTE[0], line: true },
      { name: 'Margem EBITDA', color: PALETTE[1], line: true },
      { name: 'Margem líquida', color: PALETTE[2], line: true },
    ]), { sub: 'Ganho de ' + F.pp(s.margemLiquida.at(-1) - s.margemLiquida[0]) + ' de margem líquida em doze meses. As linhas de EBITDA e de margem líquida praticamente se sobrepõem — a diferença é o resultado financeiro.' })}

    ${panel('Composição do faturamento', 'AGO/26', chartBox('c-mix') + legend([
      { name: 'Enterprise · ' + F.compact(S.planos[2].mrr), color: PALETTE[2] },
      { name: 'Pro · ' + F.compact(S.planos[1].mrr), color: PALETTE[1] },
      { name: 'Core · ' + F.compact(S.planos[0].mrr), color: PALETTE[0] },
      { name: 'Serviços · ' + F.compact(S.receita.servicos), color: '#6d727c' },
    ]), { sub: '91,9% da receita é recorrente. Serviços de implantação respondem por ' + F.pct(S.receita.servicos / D.receitaBruta) + '.' })}

    ${panel('Destaques do mês', 'LEITURA RÁPIDA', statRows([
      ['Lucro líquido por dia útil', F.brl(D.lucroLiquido / 21)],
      ['Geração de caixa operacional', F.compact(S.caixa.geracaoOperacional)],
      ['Novos contratos', F.int(S.retencao.novosMes) + ' · ticket de entrada ' + F.brl(S.unit.ticketEntrada)],
      ['Net new MRR', '+' + F.brl(S.receita.mrr - S.serie.mrr.at(-2))],
      ['Receita por colaborador (ano)', F.compact(S.time.receitaPorFte)],
      ['Rule of 40', S.time.ruleOf40 + ' · cresc. ' + F.pct(S.time.crescimentoYoY, 0) + ' + EBITDA ' + F.pct(S.margens.ebitda, 0)],
      ['Caixa e aplicações', F.compact(S.caixa.caixaAplicacoes) + ' · dívida zero'],
    ]))}

    ${panel('Metas 2026', 'FECHAMENTO EM DEZ/26', S.metas.map(m => {
      const g = gaugeRow(m.atual, m.alvo, m.inverso);
      const f = v => m.formato === 'moeda' ? F.compact(v) : m.formato === 'pct' ? F.pct(v) : F.int(v);
      return `<div style="padding:11px 0;border-bottom:1px solid var(--hairline-soft)">
        <div class="stat-row" style="padding:0 0 7px;border:0">
          <span class="stat-row__k">${m.meta}</span>
          <span class="stat-row__v">${f(m.atual)} <span style="color:var(--ink-4)">/ ${f(m.alvo)}</span></span>
        </div>
        <div class="meter"><div class="meter__fill ${g.cls}" style="width:${(g.pct * 100).toFixed(0)}%"></div></div>
      </div>`;
    }).join(''))}
  </div>`;
}

/* ============================== 2. RESULTADO ============================== */
function viewFinanceiro() {
  const av = v => F.pct(Math.abs(v) / D.receitaBruta, 1);
  const linha = (label, valor, cls = '') => `<tr class="${cls}"><td>${label}</td><td class="num ${valor < 0 ? 'cell-neg' : ''}">${valor < 0 ? '(' + F.brl(Math.abs(valor)) + ')' : F.brl(valor)}</td><td class="num">${av(valor)}</td></tr>`;
  const sub = (label, valor) => `<tr class="row--sub"><td>${label}</td><td class="num cell-neg">(${F.brl(Math.abs(valor))})</td><td class="num">${av(valor)}</td></tr>`;

  after(() => {
    hBars(document.getElementById('c-custos'), {
      items: [...D.cpv, ...D.opex].map((c, i) => ({
        label: c.label.replace(/ \(.*\)/, ''), value: Math.abs(c.valor),
        color: i < D.cpv.length ? PALETTE[1] : PALETTE[0],
        extra: [{ k: 'Do faturamento', v: av(c.valor) }, { k: 'Natureza', v: i < D.cpv.length ? 'Custo do serviço (CPV)' : 'Despesa operacional' }],
      })).sort((a, b) => b.value - a.value),
      metric: 'Custo mensal', labelW: 210,
    });
    lineChart(document.getElementById('c-fin-serie'), {
      labels: S.meses, height: 260,
      series: [
        { name: 'Lucro bruto', values: S.serie.lucroBruto, color: PALETTE[1] },
        { name: 'Lucro líquido', values: S.serie.lucroLiquido, color: PALETTE[2] },
      ],
    });
  });

  return `
  <div class="view__intro">
    <h2>Resultado do exercício</h2>
    <p>Demonstração gerencial de ${S.meta.periodo}, com análise vertical sobre o faturamento bruto. Todas as linhas fecham entre si.</p>
  </div>

  <div class="grid grid--kpi">
    ${kpi({ label: 'Receita líquida', value: F.compact(D.receitaLiquida), foot: `<span class="kpi__ctx">${F.pct(D.receitaLiquida / D.receitaBruta)} do faturamento</span>` })}
    ${kpi({ label: 'Lucro bruto', value: F.compact(D.lucroBruto), hero: true, foot: `<span class="kpi__ctx">margem ${F.pct(S.margens.brutaSobreLiquida)} sobre receita líquida</span>` })}
    ${kpi({ label: 'EBITDA', value: F.compact(D.ebitda), foot: `<span class="kpi__ctx">margem ${F.pct(S.margens.ebitda)}</span>` })}
    ${kpi({ label: 'Lucro líquido', value: F.compact(D.lucroLiquido), hero: true, foot: `<span class="kpi__ctx">margem ${F.pct(S.margens.liquida)}</span>` })}
  </div>

  <div class="grid grid--2 mt">
    ${panel('Demonstração de resultado', 'GERENCIAL · AGO/26', `
      <div class="tbl-wrap"><table>
        <thead><tr><th>Linha</th><th>Valor</th><th>% do faturamento</th></tr></thead>
        <tbody>
          ${linha('Faturamento bruto', D.receitaBruta)}
          ${D.deducoes.map(d => sub(d.label, d.valor)).join('')}
          ${linha('Receita líquida', D.receitaLiquida, 'row--total')}
          ${D.cpv.map(c => sub(c.label, c.valor)).join('')}
          ${linha('Custo total do serviço (CPV)', D.cpvTotal)}
          ${linha('Lucro bruto', D.lucroBruto, 'row--total')}
          ${D.opex.map(o => sub(o.label, o.valor)).join('')}
          ${linha('Despesas operacionais', D.opexTotal)}
          ${linha('EBITDA', D.ebitda, 'row--total')}
          ${sub('Depreciação e amortização', D.da)}
          ${linha('EBIT', D.ebit)}
          ${linha('Receita financeira', D.receitaFinanceira)}
          ${sub('Despesas financeiras', D.despesaFinanceira)}
          ${linha('Lucro líquido', D.lucroLiquido, 'row--grand')}
        </tbody>
      </table></div>`, { cls: 'span-2' })}

    ${panel('Estrutura de custos e despesas', 'R$ / MÊS', chartBox('c-custos') + legend([
      { name: 'Custo do serviço (CPV)', color: PALETTE[1] },
      { name: 'Despesa operacional', color: PALETTE[0] },
    ]), { sub: 'CPV de ' + F.brl(Math.abs(D.cpvTotal)) + ' e despesas de ' + F.brl(Math.abs(D.opexTotal)) + ' — juntos, ' + F.pct((Math.abs(D.cpvTotal) + Math.abs(D.opexTotal)) / D.receitaBruta) + ' do faturamento.' })}

    ${panel('Lucro bruto e lucro líquido', '13 MESES', chartBox('c-fin-serie') + legend([
      { name: 'Lucro bruto', color: PALETTE[1], line: true },
      { name: 'Lucro líquido', color: PALETTE[2], line: true },
    ]))}

    ${panel('Caixa e balanço', 'POSIÇÃO EM 20/AGO', statRows([
      ['Caixa e aplicações financeiras', F.compact(S.caixa.caixaAplicacoes)],
      ['Geração de caixa operacional (mês)', F.compact(S.caixa.geracaoOperacional)],
      ['Investimento (capex)', F.compact(S.caixa.capex)],
      ['Fluxo de caixa livre', F.compact(S.caixa.fcf) + ' · ' + F.pct(S.caixa.fcfMargin)],
      ['Contas a receber', F.compact(S.caixa.contasReceber) + ' · DSO ' + S.caixa.dso + ' dias'],
      ['Receita diferida (anuais pré-pagos)', F.compact(S.caixa.receitaDiferida)],
      ['Dívida financeira', 'R$ 0'],
      ['Capital externo captado', 'R$ 0 · operação bootstrapped'],
    ]))}

    ${panel('Carga tributária', 'ALÍQUOTA EFETIVA 10,0%', `<div class="note">
      <strong>Como a alíquota efetiva fecha em 10,0%.</strong> A receita de software padronizado é tributada no Lucro Presumido com presunção de 8% para IRPJ e 12% para CSLL; os serviços de implantação, com presunção de 32%. Somam-se PIS/COFINS cumulativo de 3,65% e ISS de 2%. O mix de 85% software e 15% serviços produz ${F.brl(Math.abs(D.deducoes[0].valor))} no mês.
    </div>` + statRows([
      ['Impostos sobre vendas e resultado', F.brl(Math.abs(D.deducoes[0].valor))],
      ['Reembolsos e chargebacks', F.brl(Math.abs(D.deducoes[1].valor)) + ' · ' + F.pct(0.008)],
      ['Receita em contratos internacionais', F.compact(S.receita.receitaIntl) + ' · ' + F.pct(S.receita.receitaIntl / D.receitaBruta, 0)],
    ]))}
  </div>`;
}

/* ============================ 3. RECEITA RECORRENTE ============================ */
function viewReceita() {
  after(() => {
    waterfall(document.getElementById('c-mrr-mov'), { items: S.mrrMovement, height: 320 });
    donut(document.getElementById('c-planos'), {
      items: S.planos.map((p, i) => ({ label: p.nome, value: p.mrr, color: PALETTE[i], extra: [{ k: 'Clientes', v: F.int(p.clientes) }, { k: 'Preço/mês', v: F.brl(p.preco) }] })).reverse(),
      centro: F.compact(S.receita.mrr), centroLabel: 'MRR TOTAL', height: 220,
    });
    hBars(document.getElementById('c-verticais'), {
      items: S.verticais.map(v => ({
        label: v.nome, value: v.receita,
        extra: [{ k: 'Clientes', v: F.int(v.clientes) }, { k: 'Churn mensal', v: F.pct(v.churn) }],
      })), metric: 'Receita no mês', labelW: 168,
    });
    lineChart(document.getElementById('c-mrr-serie'), {
      labels: S.meses, height: 250,
      series: [{ name: 'MRR', values: S.serie.mrr, color: PALETTE[0] }],
    });
  });

  const netNew = S.receita.mrr - S.serie.mrr.at(-2);
  return `
  <div class="view__intro">
    <h2>Receita recorrente</h2>
    <p>Assinatura anual com faturamento mensal ou pré-pago. ${F.pct(S.receita.mrr / D.receitaBruta)} da receita é contratada e previsível; o restante vem de implantações pontuais.</p>
  </div>

  <div class="grid grid--kpi">
    ${kpi({ label: 'MRR', value: F.compact(S.receita.mrr), hero: true, spark: S.serie.mrr, foot: delta(MoM(S.serie.mrr)) })}
    ${kpi({ label: 'Net new MRR', value: '+' + F.compact(netNew), foot: `<span class="kpi__ctx">novos, expansão e reativação menos perdas</span>` })}
    ${kpi({ label: 'ARPA', value: F.brl(S.receita.arpa), unit: '/mês', foot: `<span class="kpi__ctx">contrato anual médio de ${F.brl(S.receita.contratoAnualMedio)}</span>` })}
    ${kpi({ label: 'ARR contratado', value: F.compact(S.receita.arr), foot: `<span class="kpi__ctx">run-rate total ${F.compact(S.receita.runRate)}</span>` })}
  </div>

  <div class="grid grid--2 mt">
    ${panel('Movimentação do MRR', 'JUL/26 → AGO/26', chartBox('c-mrr-mov'), { cls: 'span-2', sub: 'Expansão e reativação somaram ' + F.brl(S.mrrMovement[2].valor + S.mrrMovement[3].valor) + ' contra ' + F.brl(Math.abs(S.mrrMovement[4].valor + S.mrrMovement[5].valor)) + ' de contração e churn — a base cresce mesmo antes de qualquer venda nova.' })}

    ${panel('MRR por plano', 'AGO/26', chartBox('c-planos') + legend([
      { name: 'Enterprise · ' + F.pct(S.planos[2].mrr / S.receita.mrr), color: PALETTE[2] },
      { name: 'Pro · ' + F.pct(S.planos[1].mrr / S.receita.mrr), color: PALETTE[1] },
      { name: 'Core · ' + F.pct(S.planos[0].mrr / S.receita.mrr), color: PALETTE[0] },
    ]), { sub: 'O Enterprise é 8,5% das contas e ' + F.pct(S.planos[2].mrr / S.receita.mrr) + ' do MRR.' })}

    ${panel('Planos e posicionamento', 'TABELA COMERCIAL', `
      <div class="tbl-wrap"><table>
        <thead><tr><th>Plano</th><th>Preço/mês</th><th>Clientes</th><th>MRR</th><th>% do MRR</th></tr></thead>
        <tbody>${S.planos.map((p, i) => `<tr>
          <td><span class="legend__swatch" style="display:inline-block;background:${PALETTE[i]};margin-right:8px"></span>${p.nome}<div style="color:var(--ink-3);font-size:11.5px;margin-top:2px">${p.alvo} · ${p.inclui}</div></td>
          <td class="num">${F.brl(p.preco)}</td><td class="num">${F.int(p.clientes)}</td><td class="num">${F.compact(p.mrr)}</td><td class="num">${F.pct(p.mrr / S.receita.mrr)}</td></tr>`).join('')}
          <tr class="row--total"><td>Total recorrente</td><td class="num">—</td><td class="num">${F.int(S.retencao.clientesAtivos)}</td><td class="num">${F.compact(S.receita.mrr)}</td><td class="num">100,0%</td></tr>
        </tbody>
      </table></div>`, { cls: 'span-2' })}

    ${panel('Receita por vertical', 'R$ / MÊS', chartBox('c-verticais'), { sub: 'Nenhuma vertical passa de 24% da receita — a concentração fica dentro do limite de risco definido pela diretoria.' })}

    ${panel('Evolução do MRR', '13 MESES', chartBox('c-mrr-serie'), { sub: 'Crescimento composto de 4,3% ao mês nos últimos doze meses.' })}

    ${panel('Qualidade da receita', 'INDICADORES', statRows([
      ['Receita recorrente', F.compact(S.receita.mrr) + ' · ' + F.pct(S.receita.mrr / D.receitaBruta)],
      ['Serviços de implantação', F.compact(S.receita.servicos) + ' · ' + F.pct(S.receita.servicos / D.receitaBruta)],
      ['Contratos anuais pré-pagos', F.pct(S.receita.prePagoAnual, 0) + ' da base'],
      ['Receita Brasil', F.compact(S.receita.receitaBR) + ' · ' + F.pct(S.receita.receitaBR / D.receitaBruta, 0)],
      ['Receita internacional (USD)', F.compact(S.receita.receitaIntl) + ' · ' + F.pct(S.receita.receitaIntl / D.receitaBruta, 0)],
      ['Receita diferida em balanço', F.compact(S.caixa.receitaDiferida)],
      ['NRR (12 meses)', F.pct(S.retencao.nrr)],
    ]))}
  </div>`;
}

/* ============================== 4. CLIENTES ============================== */
function viewClientes() {
  after(() => {
    heatmap(document.getElementById('c-cohort'), {
      rows: S.cohorts, cols: ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'],
    });
    hBars(document.getElementById('c-health'), {
      items: S.healthScore.map((h, i) => ({
        label: h.faixa, value: h.clientes, color: PALETTE[1],
        extra: [{ k: 'MRR na faixa', v: F.compact(h.mrr) }, { k: '% da base', v: F.pct(h.clientes / S.retencao.clientesAtivos) }],
      })), metric: 'Clientes', fmt: F.int, labelW: 168,
    });
    barChart(document.getElementById('c-clientes-serie'), {
      labels: S.meses, height: 250, yFmt: F.int, fmt: F.int,
      series: [{ name: 'Clientes ativos', values: S.serie.clientes, color: PALETTE[3] }],
    });
  });

  return `
  <div class="view__intro">
    <h2>Clientes e retenção</h2>
    <p>${F.int(S.retencao.clientesAtivos)} empresas ativas. A retenção líquida de ${F.pct(S.retencao.nrr)} significa que a base de hoje valerá 18% a mais em doze meses mesmo sem nenhum cliente novo.</p>
  </div>

  <div class="grid grid--kpi">
    ${kpi({ label: 'Clientes ativos', value: F.int(S.retencao.clientesAtivos), hero: true, spark: S.serie.clientes, foot: `<span class="delta delta--up">▲ ${S.retencao.netAdds}</span><span class="kpi__ctx">contas líquidas</span>` })}
    ${kpi({ label: 'NRR · retenção líquida', value: F.pct(S.retencao.nrr), foot: `<span class="kpi__ctx">GRR de ${F.pct(S.retencao.grr)}</span>` })}
    ${kpi({ label: 'Churn de contas', value: F.pct(S.retencao.churnLogo), unit: '/mês', foot: `<span class="kpi__ctx">${S.retencao.cancelamentosMes} cancelamentos · vida média ${S.retencao.vidaMediaMeses} meses</span>` })}
    ${kpi({ label: 'NPS', value: S.retencao.nps, foot: `<span class="kpi__ctx">CSAT ${String(S.retencao.csat).replace('.', ',')}/5 · 1ª resposta em ${S.retencao.tempoPrimeiraResposta}</span>` })}
  </div>

  <div class="grid grid--2 mt">
    ${panel('Retenção de receita por safra', '% DA RECEITA ORIGINAL DA SAFRA', chartBox('c-cohort'), { cls: 'span-2', sub: 'Cada linha é uma safra de clientes; cada coluna, um mês depois da entrada. Valores acima de 100 indicam que a safra passou a pagar mais do que no primeiro mês.' })}

    ${panel('Base de clientes', '13 MESES', chartBox('c-clientes-serie'), { sub: 'De ' + F.int(S.serie.clientes[0]) + ' para ' + F.int(S.serie.clientes.at(-1)) + ' contas em doze meses.' })}

    ${panel('Saúde da carteira', 'HEALTH SCORE', chartBox('c-health'), { sub: F.pct(S.healthScore[0].clientes / S.retencao.clientesAtivos) + ' da base está na faixa saudável, concentrando ' + F.pct(S.healthScore[0].mrr / S.receita.mrr) + ' do MRR.' })}

    ${panel('Maiores contas', 'TOP 8 ENTERPRISE', `
      <div class="tbl-wrap"><table>
        <thead><tr><th>Conta</th><th>Vertical</th><th>MRR</th><th>Health</th><th>Expansão</th><th>Cliente desde</th></tr></thead>
        <tbody>${S.topContas.map(c => `<tr>
          <td>${c.conta}</td><td style="text-align:right;color:var(--ink-3)">${c.vertical}</td>
          <td class="num">${F.brl(c.mrr)}</td>
          <td class="num" style="color:${c.health >= 85 ? '#4ec48d' : c.health >= 70 ? '#fab219' : '#e08b8b'}">${c.health}</td>
          <td class="num">${F.mult(c.expansao)}</td><td class="num" style="color:var(--ink-3)">${c.desde}</td></tr>`).join('')}
          <tr class="row--total"><td>Soma do top 8</td><td></td><td class="num">${F.brl(S.topContas.reduce((s, c) => s + c.mrr, 0))}</td><td class="num">—</td><td class="num">—</td><td></td></tr>
        </tbody>
      </table></div>
      <p class="panel__sub" style="margin:12px 0 0">O top 8 responde por ${F.pct(S.topContas.reduce((s, c) => s + c.mrr, 0) / S.receita.mrr)} do MRR. Expansão indica quantas vezes a conta multiplicou o contrato de entrada.</p>`, { cls: 'span-2' })}

    ${panel('Churn por vertical', 'MENSAL', `
      <div class="tbl-wrap"><table>
        <thead><tr><th>Vertical</th><th>Clientes</th><th>Receita</th><th>Churn mensal</th></tr></thead>
        <tbody>${[...S.verticais].sort((a, b) => b.churn - a.churn).map(v => `<tr>
          <td>${v.nome}</td><td class="num">${F.int(v.clientes)}</td><td class="num">${F.compact(v.receita)}</td>
          <td class="num" style="color:${v.churn <= 0.01 ? '#4ec48d' : v.churn <= 0.016 ? '#fab219' : '#e08b8b'}">${F.pct(v.churn)}</td></tr>`).join('')}</tbody>
      </table></div>`)}

    ${panel('Retenção em uma linha', 'DECOMPOSIÇÃO', statRows([
      ['Novos clientes no mês', F.int(S.retencao.novosMes)],
      ['Cancelamentos no mês', F.int(S.retencao.cancelamentosMes)],
      ['Adições líquidas', '+' + F.int(S.retencao.netAdds)],
      ['Churn de receita', F.pct(S.retencao.churnReceita, 2) + ' ao mês'],
      ['ARPA dos cancelados', F.brl(Math.abs(S.mrrMovement[5].valor) / S.retencao.cancelamentosMes)],
      ['Concentração do churn', '81% no plano Core'],
      ['Time-to-value médio', S.retencao.timeToValue],
    ]))}
  </div>`;
}

/* ============================ 5. VENDAS E AQUISIÇÃO ============================ */
function viewVendas() {
  const topo = S.funil.slice(0, 4), comercial = S.funil.slice(3);
  after(() => {
    funnel(document.getElementById('c-funil-topo'), { stages: topo });
    funnel(document.getElementById('c-funil-com'), { stages: comercial });
    hBars(document.getElementById('c-canais'), {
      items: S.canais.map(c => ({
        label: c.canal, value: c.novos,
        extra: [{ k: 'CAC do canal', v: F.brl(c.cac) }, { k: 'Investimento', v: F.brl(c.investimento) }],
      })), metric: 'Novos clientes', fmt: F.int, labelW: 190,
    });
    hBars(document.getElementById('c-cac'), {
      items: [...S.canais].sort((a, b) => a.cac - b.cac).map(c => ({
        label: c.canal, value: c.cac, color: PALETTE[0],
        extra: [{ k: 'Novos no mês', v: F.int(c.novos) }],
        note: c.cac < S.unit.cac ? 'Abaixo do CAC médio' : 'Acima do CAC médio',
      })), metric: 'CAC', fmt: F.brl, labelW: 190,
      ref: { value: S.unit.cac, label: 'média ' + F.brl(S.unit.cac) },
    });
  });

  return `
  <div class="view__intro">
    <h2>Vendas e aquisição</h2>
    <p>${F.int(S.retencao.novosMes)} contratos fechados no mês a um custo médio de ${F.brl(S.unit.cac)} por cliente. O investimento em aquisição se paga em ${String(S.unit.payback).replace('.', ',')} meses.</p>
  </div>

  <div class="grid grid--kpi">
    ${kpi({ label: 'Novos contratos', value: F.int(S.retencao.novosMes), hero: true, foot: `<span class="kpi__ctx">ticket de entrada ${F.brl(S.unit.ticketEntrada)}/mês</span>` })}
    ${kpi({ label: 'CAC', value: F.brl(S.unit.cac), foot: `<span class="kpi__ctx">${F.brl(S.unit.investimentoAquisicao)} investidos no mês</span>` })}
    ${kpi({ label: 'LTV / CAC', value: F.mult(S.unit.ltvCac), hero: true, foot: `<span class="kpi__ctx">LTV de ${F.compact(S.unit.ltv)} com teto de 36 meses</span>` })}
    ${kpi({ label: 'Payback do CAC', value: String(S.unit.payback).replace('.', ',') + ' meses', foot: `<span class="kpi__ctx">margem de contribuição ${F.brl(S.unit.margemContribuicaoMes)}/mês</span>` })}
  </div>

  <div class="grid grid--2 mt">
    ${panel('Topo de funil', 'AGO/26 · ESCALA PRÓPRIA', chartBox('c-funil-topo'), { sub: 'Volumes de audiência e captura. A coluna à direita traz a conversão de cada etapa.' })}
    ${panel('Funil comercial', 'AGO/26 · ESCALA PRÓPRIA', chartBox('c-funil-com'), { sub: 'Da reunião agendada ao contrato assinado. Os dois painéis usam escalas separadas porque a ordem de grandeza é diferente.' })}

    ${panel('Novos clientes por canal', 'AGO/26', chartBox('c-canais'), { sub: '62% dos novos contratos vêm de comunidade, indicação e conteúdo orgânico.' })}
    ${panel('CAC por canal', 'R$ POR CLIENTE', chartBox('c-cac'), { sub: 'Indicação custa 7,8 vezes menos que tráfego pago — a tese por trás do programa de embaixadores.' })}

    ${panel('Economia unitária', 'POR CLIENTE', statRows([
      ['CAC médio (blended)', F.brl(S.unit.cac)],
      ['Investimento em aquisição', F.brl(S.unit.investimentoAquisicao) + ' · ' + F.pct(S.unit.investimentoAquisicao / D.receitaBruta) + ' do faturamento'],
      ['Margem de contribuição mensal', F.brl(S.unit.margemContribuicaoMes)],
      ['Payback', String(S.unit.payback).replace('.', ',') + ' meses'],
      ['LTV (teto de 36 meses)', F.brl(S.unit.ltv)],
      ['LTV / CAC', F.mult(S.unit.ltvCac)],
      ['Ciclo médio de vendas', S.unit.cicloDias + ' dias'],
      ['Taxa de fechamento sobre proposta', F.pct(S.unit.winRateProposta)],
    ]))}

    ${panel('Pipeline', 'ACV EM ABERTO', statRows([
      ['Pipeline aberto', F.compact(S.unit.pipelineAberto)],
      ['Cobertura sobre a meta do mês', F.mult(S.unit.coberturaPipeline)],
      ['Reuniões realizadas', F.int(S.funil[4].valor)],
      ['Propostas enviadas', F.int(S.funil[5].valor)],
      ['Contratos fechados', F.int(S.funil[6].valor)],
      ['Conversão de lead a cliente', F.pct(S.funil[6].valor / S.funil[1].valor, 2)],
      ['Comissionamento do mês', F.brl(Math.abs(D.opex[2].valor))],
    ]) + `<div class="note" style="margin-top:14px">Regra de cobertura: o pipeline em aberto precisa valer ao menos 3 vezes a meta do mês. Hoje está em ${F.mult(S.unit.coberturaPipeline)}.</div>`)}
  </div>`;
}

/* ============================== 6. PRODUTO ============================== */
function viewProduto() {
  const P = S.produto;
  after(() => {
    barChart(document.getElementById('c-execucoes'), {
      labels: S.meses, height: 250,
      yFmt: v => (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'M', fmt: F.int,
      series: [{ name: 'Execuções de agentes', values: S.usoSerie.execucoes, color: PALETTE[1] }],
    });
    lineChart(document.getElementById('c-agentes'), {
      labels: S.meses, height: 230, fmt: F.int, yFmt: F.int, min: 0,
      series: [{ name: 'Agentes em produção', values: S.usoSerie.agentes, color: PALETTE[0] }],
    });
  });

  return `
  <div class="view__intro">
    <h2>Produto e uso</h2>
    <p>A plataforma entrega implementação, não conteúdo. O indicador que importa é agente em produção — ${F.int(P.agentesProducao)} rodando na base, ${F.int(P.execucoesMes)} execuções no mês.</p>
  </div>

  <div class="grid grid--kpi">
    ${kpi({ label: 'Agentes em produção', value: F.int(P.agentesProducao), hero: true, spark: S.usoSerie.agentes, foot: `<span class="delta delta--up">▲ ${F.int(P.agentesNovosMes)}</span><span class="kpi__ctx">criados no mês</span>` })}
    ${kpi({ label: 'Execuções no mês', value: (P.execucoesMes / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 }), unit: 'milhões', spark: S.usoSerie.execucoes, sparkColor: PALETTE[1], foot: delta(MoM(S.usoSerie.execucoes)) })}
    ${kpi({ label: 'Custo por execução', value: F.brl2(P.custoPorExecucao), foot: `<span class="kpi__ctx">${F.brl(Math.abs(D.cpv[0].valor))} de infraestrutura no mês</span>` })}
    ${kpi({ label: 'ROI médio declarado', value: F.mult(P.roiMedio), hero: true, foot: `<span class="kpi__ctx">${F.int(P.horasEconomizadas)} horas/mês economizadas na base</span>` })}
  </div>

  <div class="grid grid--2 mt">
    ${panel('Execuções de agentes', '13 MESES', chartBox('c-execucoes'), { sub: 'O consumo cresce mais rápido que a receita — base da tese de preço híbrido por consumo.' })}
    ${panel('Agentes em produção', '13 MESES', chartBox('c-agentes'), { sub: 'Cada agente é um processo que saiu do slide e entrou na operação do cliente.' })}
  </div>

  <div class="grid grid--3 mt">
    ${S.modulos.map((m, i) => `<section class="panel">
      <div class="mod">
        <div class="mod__name"><span class="mod__idx">${String(i + 1).padStart(2, '0')}</span>${m.nome}</div>
        <p class="mod__desc">${m.desc}</p>
        <div class="meter"><div class="meter__fill ${m.adocao > .7 ? 'meter__fill--good' : m.adocao < .35 ? 'meter__fill--warn' : ''}" style="width:${(m.adocao * 100).toFixed(0)}%"></div></div>
        <div class="mod__foot"><span>Adoção ${F.pct(m.adocao, 0)}</span><span>${m.sinal}</span></div>
      </div>
    </section>`).join('')}
  </div>

  <div class="grid grid--2 mt">
    ${panel('Acervo da plataforma', 'BIBLIOTECA', statRows([
      ['Soluções plug & play', F.int(P.solucoes)],
      ['Casos documentados', F.int(P.cases)],
      ['Agentes em produção na base', F.int(P.agentesProducao)],
      ['Clientes com ao menos um agente em produção', F.pct(P.adocao)],
      ['Uso semanal sobre mensal (WAU/MAU)', F.pct(P.wauMau, 0)],
    ]))}
    ${panel('Confiabilidade', 'SLA E QUALIDADE', statRows([
      ['Disponibilidade', F.pct(P.uptime, 2)],
      ['Latência p95', P.latenciaP95],
      ['Deflexão de tickets pelo Copilot', '71%'],
      ['Tempo de primeira resposta', S.retencao.tempoPrimeiraResposta],
      ['NPS', S.retencao.nps],
      ['CSAT', String(S.retencao.csat).replace('.', ',') + ' / 5'],
    ]))}
  </div>`;
}

/* ============================== 7. TIME ============================== */
function viewTime() {
  const T = S.time;
  after(() => {
    hBars(document.getElementById('c-areas'), {
      items: T.areas.map(a => ({
        label: a.area, value: a.pessoas,
        extra: [{ k: 'Folha da área', v: F.brl(a.custo) }, { k: 'Custo médio', v: F.brl(a.custo / a.pessoas) }],
      })), metric: 'Pessoas', fmt: F.int, labelW: 190,
    });
    hBars(document.getElementById('c-folha'), {
      items: T.areas.map(a => ({ label: a.area, value: a.custo, color: PALETTE[1] })),
      metric: 'Folha mensal', fmt: F.brl, labelW: 190,
    });
  });

  return `
  <div class="view__intro">
    <h2>Time e eficiência</h2>
    <p>${T.headcount} pessoas sustentando um run-rate de ${F.compact(S.receita.runRate)}. A premissa central da operação é uma estrutura nativa de IA: cada pessoa opera com automações que antes exigiriam um time.</p>
  </div>

  <div class="grid grid--kpi">
    ${kpi({ label: 'Headcount', value: F.int(T.headcount), foot: `<span class="kpi__ctx">custo médio de ${F.brl(T.custoMedioFte)}/mês por pessoa</span>` })}
    ${kpi({ label: 'Receita por colaborador', value: F.compact(T.receitaPorFte), unit: '/ano', hero: true, foot: `<span class="kpi__ctx">run-rate dividido pelo headcount</span>` })}
    ${kpi({ label: 'Lucro por colaborador', value: F.compact(T.lucroPorFte), unit: '/ano', hero: true, foot: `<span class="kpi__ctx">lucro líquido anualizado</span>` })}
    ${kpi({ label: 'Rule of 40', value: T.ruleOf40, foot: `<span class="kpi__ctx">crescimento ${F.pct(T.crescimentoYoY, 0)} + margem EBITDA ${F.pct(S.margens.ebitda, 0)}</span>` })}
  </div>

  <div class="grid grid--2 mt">
    ${panel('Pessoas por área', 'AGO/26', chartBox('c-areas'), { sub: '54% do time está em produto, engenharia e implantação — as áreas que entregam valor direto ao cliente.' })}
    ${panel('Folha por área', 'R$ / MÊS', chartBox('c-folha'), { sub: 'Folha total de ' + F.brl(Math.abs(D.opex[0].valor)) + ', equivalente a ' + F.pct(Math.abs(D.opex[0].valor) / D.receitaBruta) + ' do faturamento.' })}

    ${panel('Indicadores de eficiência', 'BENCHMARK INTERNO', statRows([
      ['Receita por colaborador (ano)', F.compact(T.receitaPorFte)],
      ['Lucro líquido por colaborador (ano)', F.compact(T.lucroPorFte)],
      ['Folha sobre faturamento', F.pct(Math.abs(D.opex[0].valor) / D.receitaBruta)],
      ['S&M sobre faturamento', F.pct(S.unit.investimentoAquisicao / D.receitaBruta)],
      ['CPV sobre faturamento', F.pct(Math.abs(D.cpvTotal) / D.receitaBruta)],
      ['Magic number', F.mult(T.magicNumber)],
      ['Rule of 40', T.ruleOf40],
      ['Clientes por pessoa de CS', F.int(S.retencao.clientesAtivos / T.areas[1].pessoas)],
    ]))}

    ${panel('Como a margem se sustenta', 'LEITURA', `<div class="note">
      <strong>Três alavancas explicam a margem de ${F.pct(S.margens.liquida)}.</strong>
      <br><br>1. <strong>Custo marginal quase nulo.</strong> A mesma biblioteca de ${F.int(S.produto.solucoes)} soluções atende 20 ou 2.000 clientes; o CPV é ${F.pct(Math.abs(D.cpvTotal) / D.receitaBruta)} do faturamento e cai com o roteamento multi-modelo.
      <br><br>2. <strong>Aquisição barata.</strong> 62% dos novos clientes chegam por comunidade, indicação e conteúdo. O S&M fica em ${F.pct(S.unit.investimentoAquisicao / D.receitaBruta)} do faturamento, contra 30% a 50% típicos de SaaS que compram crescimento.
      <br><br>3. <strong>Estrutura enxuta.</strong> ${T.headcount} pessoas e nenhuma captação — não há diluição nem queima de caixa a financiar.
    </div>`)}
  </div>`;
}

/* ============================== 8. ESTRATÉGIAS ============================== */
function viewEstrategias() {
  const receitaItens = S.estrategias.filter(e => ['MRR', 'Receita', 'Vendas', 'Retenção'].includes(e.tipo));
  const margemItens = S.estrategias.filter(e => ['Margem', 'CAC'].includes(e.tipo));
  const somaReceita = receitaItens.reduce((s, e) => s + e.impacto, 0);
  const somaMargem = margemItens.reduce((s, e) => s + e.impacto, 0);
  const projetado = D.receitaBruta + somaReceita;
  const lucroProjetado = D.lucroLiquido + somaReceita * 0.72 + somaMargem;

  after(() => {
    waterfall(document.getElementById('c-plano'), {
      height: 340,
      items: [
        { label: 'Faturamento ago/26', curto: 'Hoje', valor: D.receitaBruta, tipo: 'base' },
        ...receitaItens.map(e => ({ label: e.nome, curto: e.curto, valor: e.impacto, nota: e.alavanca })),
        { label: 'Faturamento projetado ago/27', curto: 'Projetado', valor: projetado, tipo: 'total' },
      ],
    });
    hBars(document.getElementById('c-impacto'), {
      items: [...S.estrategias].sort((a, b) => b.impacto - a.impacto).map(e => ({
        label: e.nome, value: e.impacto,
        color: ['MRR', 'Receita', 'Vendas'].includes(e.tipo) ? PALETTE[0] : e.tipo === 'Retenção' ? PALETTE[3] : PALETTE[2],
        extra: [{ k: 'Tipo de ganho', v: e.tipo }, { k: 'Progresso', v: F.pct(e.progresso, 0) }],
        note: e.alavanca,
      })), metric: 'Impacto mensal', labelW: 210,
    });
  });

  return `
  <div class="view__intro">
    <h2>Plano estratégico</h2>
    <p>Oito iniciativas em curso, com dono, prazo e impacto estimado. Somadas, levam o faturamento mensal de ${F.compact(D.receitaBruta)} para ${F.compact(projetado)} em doze meses — um run-rate de ${F.compact(projetado * 12)}.</p>
  </div>

  <div class="grid grid--kpi">
    ${kpi({ label: 'Impacto em receita', value: '+' + F.compact(somaReceita), unit: '/mês', hero: true, foot: `<span class="kpi__ctx">seis iniciativas de receita em 12 meses</span>` })}
    ${kpi({ label: 'Impacto em margem', value: '+' + F.compact(somaMargem), unit: '/mês', foot: `<span class="kpi__ctx">custo de inferência e CAC</span>` })}
    ${kpi({ label: 'Run-rate projetado', value: F.compact(projetado * 12), foot: `<span class="delta delta--up">▲ ${F.pct(projetado / D.receitaBruta - 1)}</span><span class="kpi__ctx">sobre o run-rate atual</span>` })}
    ${kpi({ label: 'Lucro líquido projetado', value: F.compact(lucroProjetado), unit: '/mês', hero: true, foot: `<span class="kpi__ctx">margem de ${F.pct(lucroProjetado / projetado)}</span>` })}
  </div>

  <div class="grid grid--2 mt">
    ${panel('Ponte do faturamento — 12 meses', 'AGO/26 → AGO/27', chartBox('c-plano'), { cls: 'span-2', sub: 'Somente as iniciativas que criam receita entram na ponte. Ganhos de margem e de CAC aparecem direto na linha de lucro e estão no painel abaixo.' })}

    ${panel('Impacto mensal por iniciativa', 'R$ / MÊS EM 12 MESES', chartBox('c-impacto') + legend([
      { name: 'Receita nova', color: PALETTE[0] },
      { name: 'Retenção', color: PALETTE[3] },
      { name: 'Margem e CAC', color: PALETTE[2] },
    ]), { cls: 'span-2' })}
  </div>

  <div class="grid grid--2 mt">
    ${S.estrategias.map(e => {
      const tagCls = e.status === 'Em execução' ? 'tag--exec' : e.status === 'Piloto' ? 'tag--pilot' : 'tag--plan';
      return `<section class="panel">
        <div class="strat">
          <div class="strat__top">
            <div>
              <div class="strat__name">${e.nome}</div>
              <div class="strat__meta" style="margin-top:6px"><span class="tag ${tagCls}">${e.status}</span><span class="tag">${e.tipo}</span></div>
            </div>
            <div class="strat__impact"><b>+${F.compact(e.impacto)}</b><span>Impacto / mês</span></div>
          </div>
          <p class="strat__tese">${e.tese}</p>
          <div class="meter"><div class="meter__fill ${e.progresso > .6 ? 'meter__fill--good' : e.progresso < .3 ? 'meter__fill--warn' : ''}" style="width:${(e.progresso * 100).toFixed(0)}%"></div></div>
          <div class="strat__meta">
            <span>Progresso <strong style="color:var(--ink)">${F.pct(e.progresso, 0)}</strong></span>
            <span>Dono: ${e.dono}</span>
            <span>Horizonte: ${e.horizonte}</span>
          </div>
          <div class="note" style="font-size:12.5px">Alavanca: ${e.alavanca}</div>
        </div>
      </section>`;
    }).join('')}
  </div>

  <div class="grid grid--2 mt">
    ${panel('Metas 2026', 'ACOMPANHAMENTO', S.metas.map(m => {
      const g = gaugeRow(m.atual, m.alvo, m.inverso);
      const f = v => m.formato === 'moeda' ? F.compact(v) : m.formato === 'pct' ? F.pct(v) : F.int(v);
      return `<div style="padding:11px 0;border-bottom:1px solid var(--hairline-soft)">
        <div class="stat-row" style="padding:0 0 7px;border:0"><span class="stat-row__k">${m.meta}</span>
        <span class="stat-row__v">${f(m.atual)} <span style="color:var(--ink-4)">/ ${f(m.alvo)}</span> · ${(g.pct * 100).toFixed(0)}%</span></div>
        <div class="meter"><div class="meter__fill ${g.cls}" style="width:${(g.pct * 100).toFixed(0)}%"></div></div>
      </div>`;
    }).join(''))}

    ${panel('Riscos monitorados', 'COMITÊ MENSAL', `
      <div class="tbl-wrap"><table>
        <thead><tr><th>Risco</th><th>Nível</th></tr></thead>
        <tbody>${S.riscos.map(r => `<tr>
          <td>${r.risco}<div style="color:var(--ink-3);font-size:11.5px;margin-top:3px">${r.mitigacao}</div></td>
          <td><span class="tag tag--${r.nivel.toLowerCase().replace('é', 'e')}">${r.nivel}</span></td></tr>`).join('')}</tbody>
      </table></div>`)}
  </div>`;
}

/* ============================ 9. MODELO E PREMISSAS ============================ */
function viewPremissas() {
  return `
  <div class="view__intro">
    <h2>Modelo e premissas</h2>
    <p>De onde vem cada número desta plataforma e qual referência de mercado foi usada para desenhar o modelo de negócio.</p>
  </div>

  <div class="grid grid--2">
    ${panel('Modelo de referência estudado', 'PESQUISA', `<div style="font-size:13.5px;color:var(--ink-2);display:grid;gap:12px">
      <p>A arquitetura de produto da Sarsen replica o modelo da <strong style="color:var(--ink)">Viver de IA</strong>, empresa brasileira fundada por Rafael Milagre e hoje uma das maiores operações de implementação de IA para empresas do país.</p>
      <p><strong style="color:var(--ink)">Como aquele modelo funciona:</strong> é uma plataforma B2B de assinatura anual, com ticket médio divulgado na casa de R$ 3.500 por mês, mais de mil empresas na carteira e projeção pública de R$ 100 milhões de faturamento. A entrega combina uma ferramenta proprietária de construção de agentes — o Builder —, uma biblioteca de soluções prontas para instalar, trilhas de formação, mentorias ao vivo de implementação, uma comunidade e um acervo de casos reais documentados. A tese comercial não é vender curso: é vender redução de custo, ganho de produtividade e receita nova destravada por automação.</p>
      <p><strong style="color:var(--ink)">O que a Sarsen replica:</strong> os nove módulos do painel de Produto espelham essa estrutura — Builder, biblioteca de soluções, trilhas, casos, mentorias, comunidade, diagnóstico de maturidade, marketplace de especialistas e copiloto de suporte. O motor comercial também: assinatura anual, aquisição majoritariamente orgânica via conteúdo e comunidade, expansão dentro da conta e uma camada de serviços de implantação para as contas maiores.</p>
      <p style="color:var(--ink-3);font-size:12.5px">Fontes consultadas: página institucional da Viver de IA (viverdeia.ai), coluna do InfoMoney sobre a projeção de R$ 100 milhões para 2026 e materiais públicos do Viver de IA Club.</p>
    </div>`, { cls: 'span-2' })}

    ${panel('Premissas do modelo financeiro', 'METODOLOGIA', `<dl>${S.premissas.map(p => `<div class="def"><dt>${p[0]}</dt><dd>${p[1]}</dd></div>`).join('')}</dl>`, { cls: 'span-2' })}

    ${panel('Âncoras aritméticas', 'O QUE FECHA COM O QUÊ', `
      <div class="tbl-wrap"><table>
        <thead><tr><th>Verificação</th><th>Resultado</th></tr></thead>
        <tbody>
          <tr><td>Faturamento − impostos − reembolsos</td><td class="num">${F.brl(D.receitaLiquida)} = receita líquida</td></tr>
          <tr><td>Receita líquida − CPV</td><td class="num">${F.brl(D.lucroBruto)} = lucro bruto</td></tr>
          <tr><td>Lucro bruto − despesas operacionais</td><td class="num">${F.brl(D.ebitda)} = EBITDA</td></tr>
          <tr><td>EBITDA − D&A + resultado financeiro</td><td class="num">${F.brl(D.lucroLiquido)} = lucro líquido</td></tr>
          <tr><td>Soma dos três planos (preço × clientes)</td><td class="num">${F.brl(S.receita.mrr)} = MRR</td></tr>
          <tr><td>MRR + serviços de implantação</td><td class="num">${F.brl(D.receitaBruta)} = faturamento</td></tr>
          <tr><td>Soma das sete verticais</td><td class="num">${F.brl(D.receitaBruta)} = faturamento</td></tr>
          <tr><td>Movimentação do MRR (jul → ago)</td><td class="num">${F.brl(S.receita.mrr)} = MRR de ago/26</td></tr>
          <tr><td>Investimento em aquisição ÷ novos contratos</td><td class="num">${F.brl(S.unit.cac)} = CAC</td></tr>
          <tr><td>Infraestrutura ÷ execuções do mês</td><td class="num">${F.brl2(S.produto.custoPorExecucao)} = custo por execução</td></tr>
        </tbody>
      </table></div>`)}

    ${panel('Onde a Sarsen difere do padrão de mercado', 'LEITURA CRÍTICA', `<div class="note">
      <strong>Uma margem líquida de ${F.pct(S.margens.liquida)} está muito acima do padrão de SaaS.</strong> Empresas de software com esse porte costumam operar entre 10% e 30% de margem líquida, porque compram crescimento com vendas e marketing. O modelo aqui só fecha por três escolhas explícitas: aquisição predominantemente orgânica (S&M em ${F.pct(S.unit.investimentoAquisicao / D.receitaBruta)} do faturamento contra 30% a 50% do mercado), estrutura de ${S.time.headcount} pessoas para um run-rate de ${F.compact(S.receita.runRate)}, e enquadramento tributário de software padronizado.
      <br><br>São premissas agressivas, e estão listadas justamente para poderem ser questionadas. Trocar qualquer uma delas derruba a margem — o que este painel entrega é o modelo fechando de ponta a ponta, não uma previsão.
    </div>` + statRows([
      ['Margem líquida Sarsen', F.pct(S.margens.liquida)],
      ['Margem líquida típica de SaaS B2B', '10% a 30%'],
      ['S&M Sarsen sobre faturamento', F.pct(S.unit.investimentoAquisicao / D.receitaBruta)],
      ['S&M típico de SaaS em crescimento', '30% a 50%'],
      ['Margem bruta Sarsen', F.pct(S.margens.brutaSobreLiquida)],
      ['Margem bruta típica de SaaS', '70% a 85%'],
      ['Rule of 40 Sarsen', S.time.ruleOf40],
      ['Rule of 40 considerado bom', 'acima de 40'],
    ]))}
  </div>

  <div class="grid mt">
    ${panel('Aviso', 'NATUREZA DOS DADOS', `<div class="note">
      Todos os números desta plataforma são <strong>ilustrativos</strong>. Foram construídos para fechar aritmeticamente entre si a partir de três âncoras definidas pela empresa — faturamento mensal de ${F.brl(D.receitaBruta)}, lucro bruto de ${F.brl(D.lucroBruto)} e lucro líquido de ${F.brl(D.lucroLiquido)} — e não representam demonstrações financeiras auditadas nem clientes reais. Os nomes de contas citados no painel de clientes são fictícios.
    </div>`)}
  </div>`;
}

/* ============================== ROTEAMENTO ============================== */
const VIEWS = {
  'visao-geral':  { title: 'Visão geral',        crumb: 'Painel executivo',  render: viewOverview },
  'resultado':    { title: 'Resultado',          crumb: 'Finanças',          render: viewFinanceiro },
  'receita':      { title: 'Receita recorrente', crumb: 'Finanças',          render: viewReceita },
  'clientes':     { title: 'Clientes',           crumb: 'Carteira',          render: viewClientes },
  'vendas':       { title: 'Vendas e aquisição', crumb: 'Carteira',          render: viewVendas },
  'produto':      { title: 'Produto e uso',      crumb: 'Operação',          render: viewProduto },
  'time':         { title: 'Time e eficiência',  crumb: 'Operação',          render: viewTime },
  'estrategias':  { title: 'Estratégias',        crumb: 'Plano',             render: viewEstrategias },
  'premissas':    { title: 'Modelo e premissas', crumb: 'Plano',             render: viewPremissas },
};

function navigate(hash) {
  const key = (hash || '').replace(/^#\/?/, '') || 'visao-geral';
  const v = VIEWS[key] ? key : 'visao-geral';
  Q.length = 0;
  const host = $('#view');
  host.innerHTML = VIEWS[v].render();
  $('#topbar-title').textContent = VIEWS[v].title;
  $('#topbar-crumb').textContent = 'Sarsen · ' + VIEWS[v].crumb;
  document.querySelectorAll('.navlink').forEach(a => {
    if (a.getAttribute('href') === '#/' + v) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  document.title = VIEWS[v].title + ' · Sarsen';
  requestAnimationFrame(() => { Q.forEach(fn => fn()); host.scrollIntoView({ block: 'start' }); window.scrollTo({ top: 0 }); });
}

function boot() {
  $('#periodo').textContent = S.meta.periodo;
  $('#atualizado').textContent = S.meta.atualizado;
  navigate(location.hash);
}

addEventListener('hashchange', () => navigate(location.hash));
if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot);
else boot();
