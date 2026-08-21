# Sarsen — Console de Performance

Plataforma interna de acompanhamento de performance da **Sarsen**, empresa de
implementação de IA para empresas. Nove telas cobrindo resultado financeiro,
receita recorrente, carteira de clientes, aquisição, produto, time e plano
estratégico.

> **Todos os números são ilustrativos.** Foram construídos para fechar
> aritmeticamente entre si a partir de três âncoras definidas pela empresa:
> faturamento bruto de R$ 8.565.000/mês, lucro bruto de R$ 7.000.000 e lucro
> líquido de R$ 5.900.000. Não representam demonstrações auditadas, e os nomes de
> contas citados são fictícios.

## Como abrir

Não há build nem dependências. Abra `index.html` no navegador, ou sirva a pasta:

```bash
python3 -m http.server 8080 --directory sarsen-plataforma
# http://localhost:8080
```

## Estrutura

```
sarsen-plataforma/
├── index.html          casca da aplicação (trilho lateral, barra superior)
├── css/console.css     folha de estilo do console
└── js/
    ├── data.js         fonte única de dados — todos os números vivem aqui
    ├── charts.js       biblioteca de gráficos em SVG puro, sem dependências
    └── app.js          composição das nove telas e roteamento por hash
```

Para mudar qualquer número, edite **apenas `js/data.js`**. Todas as telas,
gráficos e percentuais derivam dele.

## Telas

| Rota | Conteúdo |
|---|---|
| `#/visao-geral` | KPIs do mês, série de 13 meses, cascata do faturamento ao lucro, margens, metas |
| `#/resultado` | DRE gerencial completa com análise vertical, estrutura de custos, caixa e balanço |
| `#/receita` | Movimentação do MRR, planos, verticais, qualidade da receita |
| `#/clientes` | Retenção por safra, health score, maiores contas, churn por vertical |
| `#/vendas` | Funil, canais de aquisição, CAC por canal, economia unitária, pipeline |
| `#/produto` | Uso do Builder, nove módulos da plataforma, acervo, confiabilidade |
| `#/time` | Headcount por área, receita e lucro por colaborador, Rule of 40 |
| `#/estrategias` | Ponte do faturamento em 12 meses, oito iniciativas, metas e riscos |
| `#/premissas` | Modelo de referência pesquisado, premissas do modelo e leitura crítica |

## Modelo de negócio

Assinatura anual B2B com três planos (Core R$ 1.890, Pro R$ 4.900,
Enterprise R$ 14.900 por mês) mais serviços de implantação. A arquitetura de
produto replica o modelo da Viver de IA: construtor de agentes, biblioteca de
soluções plug & play, trilhas de formação, casos documentados, mentorias ao vivo,
comunidade, diagnóstico de maturidade, marketplace e copiloto de suporte.

## Decisões de visualização

- Paleta categórica de ordem fixa, validada para daltonismo na superfície escura
  do console (`#121316`): âmbar, azul, aqua, violeta, magenta.
- Uma medida, uma cor: gráficos de barra de série única usam hue única em vez de
  ciclar a paleta.
- Escalas separadas e rotuladas no funil, porque topo e base diferem em ordem de
  grandeza.
- Rampa sequencial de um único hue no heatmap de safras.
- Legenda presente sempre que há duas ou mais séries; rótulos diretos nas barras.
