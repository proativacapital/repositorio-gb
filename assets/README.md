# Imagens do site

O `index.html` já está preparado para estas duas fotos. Basta colocá-las aqui
com **exatamente estes nomes** — não é preciso mexer no código.

| Arquivo | Onde aparece | Proporção ideal | Observação |
|---|---|---|---|
| `ceo-natalino.jpg` | Seção "Nosso CEO" | Retrato, 2:3 ou 3:4 | O recorte é vertical e mostra os ~22% do topo. Deixe o rosto no terço superior. |
| `predio-o2.jpg` | Seção "Sobre" | Paisagem, 3:2 ou 4:3 | Recorte centralizado. Sobra um pouco das laterais. |

## Enquanto os arquivos não existirem

O site **não quebra**. Cada `<img>` tem `onerror="this.remove()"`, então a imagem
ausente simplesmente some e o marcador cinza aparece no lugar. Nenhum ícone de
imagem quebrada, nenhum erro no console.

## Recomendações

- **Formato:** JPG para fotografia. Se quiser reduzir o peso, WebP também funciona
  (troque a extensão no `src` dentro do `index.html`).
- **Largura:** 900–1400 px basta. Acima disso só aumenta o peso da página sem
  ganho visível.
- **Peso:** mire abaixo de 300 KB por foto. Fotos direto da câmera costumam ter
  vários MB e derrubam a nota de performance.
- **Não é preciso** informar dimensões no HTML: os atributos `width` e `height`
  já estão definidos e servem apenas para reservar o espaço e evitar que o
  layout "pule" durante o carregamento.

## Texto alternativo

Já está escrito no HTML, e conta para acessibilidade e para SEO:

- CEO: *"Natalino Simeão, CEO da Proativa Capital, da GLP Gás e da Simeão Advogados"*
- Prédio: *"Sede da Proativa Capital no O2 Corporate & Offices, Barra da Tijuca, Rio de Janeiro"*

Se trocar a foto por outra bem diferente, vale ajustar essas descrições no
`index.html`.
