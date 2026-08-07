# Site institucional e de carreiras — Proativa Capital

Site de página única para `proativacapital.com.br`, em português, servindo dois
públicos: candidatos a vaga e quem quer entender o que o grupo faz.

**Branch com a versão atual: `claude/proativa-capital-homepage-Qfuqr`**
(o repositório não tem branch `main`; esta é a branch de trabalho.)

---

## Como publicar

Não há build, nem dependências, nem instalação. São arquivos estáticos: basta
servi-los. `index.html` é a raiz.

### Opção 1 — GitHub Pages

1. Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: `claude/proativa-capital-homepage-Qfuqr`, pasta `/ (root)`
4. Em Custom domain, informe `proativacapital.com.br`
5. No DNS do domínio, crie os registros que o GitHub indicar
   (`A` para os IPs do Pages, ou `CNAME` para `proativacapital.github.io`)

Exige repositório público ou plano pago.

### Opção 2 — Netlify / Vercel

Arraste a pasta em [netlify.com/drop](https://netlify.com/drop) e aponte o
domínio depois. Publica em segundos, sem configuração.

### Opção 3 — Hospedagem tradicional

Envie todo o conteúdo da raiz para `public_html/` (ou equivalente) por FTP.
Mantenha a estrutura de pastas — `assets/` precisa acompanhar.

---

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | O site. CSS e JavaScript embutidos, sem dependências externas além das fontes. |
| `privacidade.html` | Política de Privacidade (LGPD). **Ver pendências abaixo.** |
| `assets/` | Imagens. Veja `assets/README.md` para nomes e proporções esperadas. |
| `og-image.png` | Imagem de compartilhamento (WhatsApp, LinkedIn), 1200×630. |
| `robots.txt` | Libera buscadores e, de propósito, os robôs de IA (GPTBot, ClaudeBot, PerplexityBot). |
| `sitemap.xml` | Mapa do site. Enviar ao Google Search Console após publicar. |
| `llms.txt` | Resumo do grupo em texto limpo, para mecanismos de busca generativa. |

Ignore a pasta `proativa-capital-site/` e os arquivos soltos `script.js`,
`styles.css`: são de uma versão anterior, mantidos apenas por histórico.

---

## Pendências antes de ir ao ar

### 1. Política de Privacidade

`privacidade.html` tem **9 campos destacados em dourado** aguardando dados reais:
CNPJ, datas de vigência, prazos de guarda e o nome do encarregado (DPO). Também
há um ponto pedindo confirmação sobre ferramentas de analytics.

O texto é uma base sólida, cobrindo controlador, finalidades, bases legais do
art. 7º, compartilhamento, cookies, retenção e os direitos do art. 18 — **mas
precisa de revisão jurídica antes de publicar.**

### 2. Imagens faltando

Estes arquivos ainda não existem em `assets/`:

- `ceo-natalino.jpg` — retrato do CEO (seção "Nosso CEO")
- `predio-o2.jpg` — prédio O2 Corporate (seção "Sobre")
- `logo-proativa.png` — logo Proativa Capital, versão para fundo escuro
- `logo-simeao.png` — logo Simeão Advogados, versão para fundo escuro

**O site não quebra sem eles.** Cada `<img>` tem `onerror="this.remove()"`, então
a imagem ausente some e um marcador cinza aparece no lugar. Basta colocar os
arquivos com esses nomes exatos; não é preciso mexer no código.

O logo da GLP Gás (`assets/logo-glp.png`) já está aplicado — versão negativa
compacta, extraída do manual de marca oficial.

### 3. Telefone

Não há telefone em lugar nenhum do site. É a maior lacuna de SEO local: nome,
endereço e telefone consistentes é o tripé do ranqueamento regional. Vale
adicionar no rodapé e no bloco `ContactPoint` dos dados estruturados.

### 4. Google Business Profile

Sem perfil cadastrado, o grupo não aparece no mapa em buscas locais. É gratuito
e tem mais impacto que qualquer ajuste de código.

---

## Notas técnicas

- **Fontes:** Syne, Outfit e Playfair Display, carregadas do Google Fonts. Se
  precisar funcionar offline, embuta como `@font-face` com data URI.
- **Marca da GLP:** o manual define tamanho mínimo de reprodução por versão. A
  versão aplicada exige 80px de altura e o cartão a renderiza a 105px. Ao trocar
  por outra versão, confira o mínimo correspondente.
- **Cores da GLP:** Azul Institucional `#1F2E5A`, Azul Energia `#4F7FB3`, Verde
  Energia `#9EC541` — conforme o manual de marca v1.0.
- **Navegação:** âncoras reais (`#sobre`, `#carreiras`), rastreáveis por
  buscadores. O JavaScript apenas suaviza a rolagem; funciona sem ele.
- **Dados estruturados:** Organization, FAQPage e WebSite, em JSON-LD. O FAQPage
  é gerado a partir das perguntas reais da página — ao editar uma pergunta,
  atualize também o schema no `<head>`.
- **Acessibilidade:** SVGs decorativos com `aria-hidden`, textos alternativos
  escritos nas imagens, foco de teclado preservado.
