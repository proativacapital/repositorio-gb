# REMANSO

*Onde a água para, ela lembra.*

Um mar noturno em simulação de fluido real. Uma mão invisível desenha glifos de luz na água e a maré os desfaz. Você tem um dedo e dois verbos: **agitar** a água (mover o mouse) e **ficar parado** (pressionar e não mover). Debaixo da mão parada abre-se um *remanso*: dentro do círculo o tempo corre para trás e a tinta se recompõe; fora dele a maré continua. O que você consegue devolver ao formato original sobe ao céu como constelação. O que se perde vira névoa cinza para sempre. A manhã chega e ilumina o que você guardou.

## Como jogar

1. Abra `remanso.html` no navegador (clique duplo no arquivo). Não precisa de servidor nem internet para jogar sozinho.
2. Mova o mouse sobre a água para agitar. Pressione e fique parado por meio segundo para abrir o remanso. Segure para lembrar mais fundo (as contas do anel são o relógio). Solte para fechar.
3. Agitar contra a correnteza acalma a água. Água calma resiste à maré. Um glifo inteiro brilha e sobe ao céu.
4. Cinco atos, de oito a dez minutos. Sem placar, sem números: o céu é a pontuação.

Teclas opcionais: `M` silencia o som, `R` segurado por um segundo reinicia.

## A dois, cada um no seu computador

1. Os dois abrem o mesmo arquivo `remanso.html`.
2. Um clica em **a dois** (canto superior direito) e em **Criar um mar**. Aparece um código de seis letras.
3. O outro clica em **a dois**, **Entrar num mar**, digita o código e clica em **entrar**.
4. Os dois veem o mesmo mar. Um é a mão azul, o outro a rosa. As duas mãos agitam e lembram. Uma mão parada perto de onde a outra agita resiste mais à maré.

Se aparecer **o mar não respondeu**, clique em **trocar código à mão**: um copia o convite e manda pelo WhatsApp, o outro cola, gera a resposta e manda de volta. Funciona em qualquer rede que deixe os dois computadores se enxergarem.

### O que a rede faz, em uma frase

O arquivo usa a internet somente para o multiplayer: um relé público troca o aperto de mão inicial e a partir daí a conexão é direta entre os dois computadores (WebRTC). Jogando sozinho, o jogo não acessa nada.

### Limites honestos

- Sem servidor próprio, o jogo depende de relés públicos gratuitos para o código de sala e de STUN/TURN públicos para atravessar roteadores. Redes corporativas, universidades e algumas operadoras móveis bloqueiam conexões diretas. Nesses casos o modo manual resolve o relé, mas não o bloqueio de rede.
- O caminho do código de sala foi testado contra um relé simulado. O caminho ponto a ponto e o modo manual foram testados de ponta a ponta com dois navegadores. O relé público de verdade só pode ser testado por vocês, na internet de verdade.
- Os dois computadores rodam a mesma simulação, bit a bit. A ação do outro chega com uma fração de segundo de atraso. Se as simulações divergirem, o jogo corrige sozinho. Se um cair, o outro continua sozinho.

## Requisitos

Chrome, Edge ou Firefox atuais, em desktop. Funciona em celulares e tablets no modo solo (dois dedos na mesma tela também funcionam). O jogo se ajusta ao tamanho da janela e reduz a qualidade sozinho em máquinas fracas.

## Desenvolvimento

`dev/` guarda o documento de design, a especificação de rede, o harness de testes (Playwright + broker MQTT simulado) e os três builds candidatos. `dev/ACCEPTANCE.md` traz os números medidos na entrega.
