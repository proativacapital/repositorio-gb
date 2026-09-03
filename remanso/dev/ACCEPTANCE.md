# REMANSO — Relatório de aceitação (release candidate)

Arquivo: `remanso/remanso.html` (um único HTML autocontido, ~203 KB, 2.090 linhas). Medições feitas em Chromium headless com rasterização por software (SwiftShader) em uma máquina de 4 CPUs compartilhada. **FPS absoluto em headless não representa um navegador com GPU**; o que é representativo é o custo de JavaScript por frame medido dentro do jogo (`stats()`), a razão contra a página de baseline, a ausência de erros, a estabilidade de memória e os testes de determinismo e rede.

## Custo de JavaScript por frame (1920×1080, malha 192×108, qualidade máxima, ato 2 com arrasto contínuo)

| Métrica | Média | p95 | Máx |
|---|---|---|---|
| Passo da simulação (fluido, histórico, remanso, glifos) | 2.78 ms | 3.6 ms | 4.8 ms |
| Emissão de render (tone map + camadas) | 3.23 ms | 4 ms | 4.7 ms |
| Tone map isolado | 0.8 ms | | |

Total de JS ≈ 6 ms por frame, dentro do orçamento de 8 ms do GDD para 60 FPS. Heap: 33.5 MB.

## Sessões aleatórias (probe.js: cliques, arrastos, teclas, redimensionamento, travamento deliberado de 1,5 s)

| Viewport | Frames | ms médio | ms p95 | Heap MB (início → fim) | Erros |
|---|---|---|---|---|---|
| 1920×1080 aleatório 60 s | 4277 | 32.01 | 50.8 | 29.18 → 33.23 | 0 |
| 390×844 @2× toque 40 s | 4095 | 14.61 | 22.5 | 29.62 → 31.83 | 0 |
| 2560×1440 arrasto 30 s | 4128 | 51.39 | 68.5 | 29.45 → 32.25 | 0 |
| 1280×720 vsync 40 s | 3512 | 18.12 | 33.3 | 29.48 → 32.55 | 0 |

Baseline (uma `fillRect` de 2 Mpx + seis composites de tela cheia) a 1920×1080 no mesmo headless: p95 = 51,3 ms. O jogo mede p95 = 50.8 ms → razão 0.99× (critério: ≤ 2,2×). Crescimento de heap ao longo das sessões: < 10 MB, amostras planas após o aquecimento. Zero erros de console e de página em todas as sessões.

## Arco completo jogado por bot (eventos reais de mouse, timescale 2)

| Viewport / semente | Fases | Glifos salvos | Perdidos | G1 perdido | Erros |
|---|---|---|---|---|---|
| 1280×720 / 7 | calibrate → act0 → act1 → act2 → act3 → dawn | 5/6 | 1 | False | 0 |
| 1280×720 / 3 | calibrate → act0 → act1 → act2 → act3 → dawn | 5/6 | 1 | False | 0 |
| 390×844 @2× / 5 | calibrate → act0 → act1 → act2 → act3 → dawn | 5/6 | 1 | False | 0 |

Critério: chegar à aurora com ≥ 4 de 6 salvos e G1 nunca perdido. O bot é deliberadamente bruto (segura no centro); o glifo do ato 3, A Figura, exige carregar o círculo, que um humano faz e o bot não.

## Determinismo (det.js: duas páginas solo, 1280×720@1× e 1920×1080@2×, mesma semente e mesmas entradas por tick)

7.200 ticks: 15 hashes de estado comparados, divergência: nenhuma; malha idêntica nas duas páginas; erros: 0.

## Multiplayer online (net.js: duas páginas no mesmo Chromium, WebRTC por loopback, relé MQTT simulado)

- Código de sala via relé: conectado em ~4,0 s; 118 ticks comparados entre os dois pares sem nenhuma divergência; perturbação injetada no convidado → 1 ressincronização em cada lado e reconvergência; zero erros; único socket aberto é o do relé; zero requisições HTTP.
- Modo manual (troca de convite/resposta como texto): conectado sem nenhum socket; 85 ticks comparados sem divergência; ao fechar a página do convidado, o anfitrião entra em estado `lost` e continua sozinho (121 ticks nos 2 s seguintes); zero erros.
- Modo solo não abre nenhuma conexão de rede.

## Processo

- Conceito escolhido por painel: 5 designers, 3 juízes. Implementação por 3 engenheiros independentes; o build vencedor foi julgado por fidelidade ao GDD e completou 6/6 no bot.
- Caça a bugs em 3 rodadas com 6 lentes (simulação, rede, sessões aleatórias, bot, rede adversarial, UX de primeiro uso), triagem cética e correção uma a uma: 74 achados brutos, 57 verificados, 52 corrigidos e commitados individualmente.
- Arte: 5 passadas (3 de artistas técnicos, 1 de must-fix, 1 do diretor), com um juiz visual independente entre elas. O último juiz independente não pôde rodar por sobrecarga da API; a última rodada foi verificada visualmente pelo diretor em capturas de todos os atos.

## Limitações conhecidas (honestas)

1. **Relé público não testado daqui.** O ambiente de desenvolvimento não tem saída para `broker.emqx.io`, `broker.hivemq.com` e `test.mosquitto.org`. O caminho de código de sala foi testado contra um broker MQTT simulado que fala o mesmo protocolo. O primeiro teste na internet real é dos jogadores. Se falhar, o modo manual usa somente WebRTC direto.
2. **NAT/TURN.** Sem servidor TURN próprio, pares atrás de NAT simétrico ou redes corporativas podem não conectar. O relé TURN público listado é gratuito e sem garantia.
3. **Escada de qualidade em headless.** Em SwiftShader o jogo cai para o degrau mais baixo em segundos (comportamento previsto). Em um navegador com GPU a escada fica no degrau máximo.
4. **Proporção de tela online.** Os dois pares usam a malha do anfitrião (sincronizada). Um par em retrato e outro em paisagem veem a mesma simulação esticada de forma diferente; funciona, mas o ideal é janelas de proporção parecida.
5. **Ato 3 é difícil.** A Figura, com memória de 6 s e maré forte, exige carregar o remanso e sincronizar com a fase da maré. É intencional: é o clímax.
6. **Pendências de baixa severidade não corrigidas** (documentadas, sem impacto no jogo normal): reconexão automática ao relé se o sistema fechar o socket durante uma espera longa; pequeno vazamento de timers de áudio ao reiniciar exatamente durante a aurora; retângulo de foco nos campos do lobby ao abrir por teclado; após cancelar um join e reentrar o mesmo código em menos de 15 s o anfitrião pode responder "já tem duas mãos" até expirar; balanceamento do ato 3.
7. **Tamanho.** 203 KB contra os 120 KB previstos no GDD: a seção de rede (~350 linhas) e a passada de arte explicam a diferença.
