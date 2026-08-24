# Instruções do projeto — sites do Grupo Proativa Capital

Este arquivo orienta o Claude Code ao construir ou editar sites deste grupo.
Foi escrito a partir do site institucional da Proativa Capital; cada regra aqui
existe porque um problema real apareceu na prática.

## Contexto

O grupo tem três verticais em operação — **Proativa Capital** (BPO e gestão de
processos), **GLP Gás** (energia, empresa familiar com +30 anos) e **Simeão
Advogados** (jurídico). Natalino Simeão é CEO das três. A sede fica no O2
Corporate & Offices, Barra da Tijuca, Rio de Janeiro.

Uma construtora e uma imobiliária pertencem ao grupo mas **ainda não operam** —
não devem aparecer como verticais ativas em nenhum site até entrarem de fato.

Os sites atendem dois públicos ao mesmo tempo: candidatos a vaga e quem quer
entender o negócio. Nenhum dos dois pode ser sacrificado pelo outro.

---

## Stack e estrutura

HTML estático, sem build, sem framework, sem dependências. Um `index.html` com
CSS e JavaScript embutidos. É deliberado: o site precisa poder ser aberto por
duplo clique, enviado por WhatsApp e publicado em qualquer hospedagem.

```
index.html          o site inteiro
privacidade.html    política de privacidade (LGPD)
assets/             imagens, com README explicando nomes e proporções
og-image.png        1200×630, prévia em redes sociais
robots.txt          libera buscadores e robôs de IA explicitamente
sitemap.xml
llms.txt            resumo em texto limpo, para busca generativa
```

Escreva CSS com custom properties em `:root`. Nomeie por função, não por
aparência (`--navy-800`, não `--azul-escuro-2`).

---

## Marca

**Nunca invente cores, logos ou tipografia de uma marca.** Peça o manual.

Neste projeto, as cores da GLP Gás no site eram azuis puros inventados
(`#0050F0`) enquanto a marca real usa `#1F2E5A`, `#4F7FB3` e `#9EC541`. Só
apareceu quando o manual chegou.

Ao receber um manual de marca, extraia e aplique:

- A **paleta oficial**, com os nomes que o manual usa
- A **versão certa para o fundo** — negativa para fundo escuro, principal para
  claro. O manual diz qual é qual.
- O **tamanho mínimo de reprodução**. Cada versão tem o seu. Meça o que o
  layout realmente renderiza e compare — no site da Proativa a versão escolhida
  exigia 100px e renderizava entre 69px e 95px, reprovando em todas as telas.
  A versão compacta, de mínimo 80px, resolveu.

Cores oficiais já conhecidas:

| Marca | Cores |
|---|---|
| GLP Gás | Azul Institucional `#1F2E5A`, Azul Energia `#4F7FB3`, Verde Energia `#9EC541` |
| Proativa Capital | (sem manual — azul-marinho e dourado, confirmar) |
| Simeão Advogados | (sem manual — vinho e cinza, confirmar) |

---

## Conteúdo

Escreva **para ser escaneado, não lido**. O site da Proativa começou com 1.649
palavras (~8 minutos de leitura) e quase tudo em parágrafo corrido.

- Uma página de carreiras vive bem com **400 a 700 palavras visíveis**
- Use **divulgação progressiva**: linha do tempo, acordeão, botão "ler mais".
  A informação continua toda lá, mas não toda na tela de uma vez.
- Prefira estrutura a prosa: número, tag, marco, item. Uma história de 488
  palavras virou uma linha do tempo de 5 marcos com 148 palavras visíveis, sem
  perder nada — o texto completo ficou atrás de um clique.
- Numeração (01, 02, 03) só quando a ordem significa alguma coisa de verdade.

Antes de publicar, verifique **coerência factual** entre seções. O site afirmava
"construção" como vertical em 8 lugares — meta description, dados estruturados,
ticker, benefícios, FAQ, rodapé — enquanto os cards mostravam três verticais
diferentes.

---

## SEO e GEO

Sempre:

- **Âncoras reais** (`href="#secao"`), nunca `href="javascript:void(0)"` com
  `onclick`. Buscador não segue JavaScript. O site tinha 20 links assim, e para
  o Google era uma página sem estrutura interna. Use um listener delegado para
  a rolagem suave — o link continua funcionando sem JavaScript.
- `<title>` entre 50 e 60 caracteres, com a cidade quando o negócio for local
- `meta description` entre 150 e 160
- `og:image` apontando para um arquivo que **existe**. Sem ele, o link no
  WhatsApp e no LinkedIn aparece sem prévia.
- JSON-LD: `Organization`, `WebSite` e `FAQPage` quando houver FAQ. **Gere o
  FAQPage a partir do texto real da página**, por script, para não dessincronizar.
- `robots.txt` liberando **explicitamente** GPTBot, ClaudeBot, PerplexityBot,
  Google-Extended e OAI-SearchBot. Muita gente os bloqueia sem querer e some da
  busca por IA.
- `llms.txt` com um resumo factual do negócio, em texto limpo.

Para SEO local, **nome, endereço e telefone precisam ser consistentes** e existir
no site. Telefone ausente é a lacuna mais cara.

---

## Imagens

- Case a **proporção do contêiner com a da foto** e use `object-fit: contain`
  quando o cliente quiser ver a imagem inteira. `cover` corta as bordas — foi
  assim que o relógio e as mãos do CEO sumiram de um retrato.
- Sempre `width` e `height` nos atributos, para reservar espaço e evitar que o
  layout salte durante o carregamento.
- Sempre `onerror="this.remove()"` com um marcador visível por baixo. Assim o
  site fica apresentável antes e depois de as imagens chegarem, e nunca mostra
  ícone de imagem quebrada.
- Texto alternativo descritivo, com o nome da pessoa ou do lugar — conta para
  acessibilidade e para busca.
- Mire abaixo de 300 KB por foto. Foto de câmera tem vários MB.

---

## Armadilhas já encontradas

**Custom property inexistente falha em silêncio.** `var(--chrome-600)` sem
declaração faz a propriedade inteira ser descartada e o elemento herda outra
cor. Audite: extraia todo `var(--x)` e compare com o que existe em `:root`.

**O piso do `clamp()` corta texto.** `clamp(2.4rem, 6.5vw, 5.2rem)` para de
encolher abaixo de ~590px, e o título transbordava para 388px numa tela de
320px — cortado em silêncio pelo `overflow-x: hidden`. Meça a largura real dos
elementos em várias telas, não confie no visual.

**`<label>` é `display: inline`.** Um filho `position: absolute` com
`width: 100%` dentro dele resolve para zero. Ponha `display: block`.

**`scrollWidth` maior que a viewport nem sempre é defeito.** Com
`overflow-x: hidden` no `body`, o número continua grande mas ninguém consegue
rolar. Teste se a rolagem lateral **acontece de fato** antes de reportar.

**Um `</script>` dentro de string quebra o `<script>` que a contém.** Ao embutir
HTML dentro de HTML, use base64 e decodifique com `TextDecoder`.

---

## Páginas publicadas (artifacts)

- O **CSP bloqueia CDN de fontes**. Embuta as fontes como `@font-face` com data
  URI, senão a tipografia cai para a fonte do sistema sem avisar.
- O **sandbox bloqueia `window.open`**. Para pré-visualizar algo, use um
  `<iframe srcdoc>` na própria página — funciona; abrir aba nova, não.
- O publicador embrulha o arquivo em `<html><head></head><body>`. Envie só o
  conteúdo: sem `<!DOCTYPE>`, `<html>`, `<head>` ou `<body>`.

---

## Verificação

**Não entregue sem abrir num navegador de verdade.** O Chromium já está
instalado em `/opt/pw-browsers`; instale o Playwright com
`npm install playwright` e use `executablePath`.

Verifique sempre:

```js
// erros de JavaScript e requisições que falharam
page.on('pageerror', e => errs.push(e.message));
page.on('requestfailed', r => falhas.push(r.url()));

// as fontes carregaram mesmo, ou caíram para a do sistema?
await page.evaluate(async () => {
  await document.fonts.ready;
  return document.fonts.check('700 1rem NomeDaFonte');
});

// algum elemento transborda a viewport?
document.querySelectorAll('body *').forEach(el => {
  if (el.getBoundingClientRect().right > innerWidth + 1) /* ... */;
});
```

Teste em **320, 360, 390, 768, 1024, 1440 e 1920**. Os defeitos deste projeto
apareceram em 320, 360 e 1024 — nunca no desktop largo.

Ao tirar screenshot com o Chromium em modo headless direto, as transições CSS
podem congelar no meio e dar a impressão de defeito. Use Playwright com espera
real antes de concluir que algo está quebrado.

---

## Trabalhando com o cliente

**Imagem colada na conversa não vira arquivo no servidor. Arquivo anexado, sim.**
Se precisar de uma imagem, peça como anexo. Links do Google Drive são bloqueados
pela política de rede — não adianta tentar.

Quando um arquivo não puder chegar de jeito nenhum, uma saída que funciona é
entregar uma **ferramenta que roda no navegador do cliente**: ele arrasta os
arquivos e ela devolve o HTML com tudo embutido em base64.

Ao escrever documento com efeito jurídico (política de privacidade, termos),
**marque visualmente os campos que só o cliente sabe** — CNPJ, datas, prazos,
nome do encarregado — de um jeito impossível de publicar sem ver. E diga que
precisa de revisão jurídica.

Antes de dizer que um site está pronto para publicar, confira:

- [ ] Todos os links internos funcionam e apontam para algo que existe
- [ ] Nenhuma afirmação factual contradiz outra seção
- [ ] `og:image` existe
- [ ] Telefone e endereço presentes e consistentes
- [ ] Nenhuma imagem quebrada, mesmo com arquivos ausentes
- [ ] Testado em 320px
- [ ] Zero erros no console
