# REMANSO — Game Design Document & Technical Specification (FINAL)

One self-contained `.html`, Canvas 2D only, no libraries, no network, works from `file://`. Target 60 FPS on a mid-range laptop at 1920x1080. Budget: 8 ms JS + 8 ms paint.

---

## 0. Decision record

**Winner: Remanso (concept #5, local time reversal of a fluid, triggered by stillness).** Aggregate leader (142), first pick of two of three judges, second for the third. No fatal flaw was found: the judges' objections are presentation (128x72 too coarse for the un-blur payoff), loop passivity (stillness is zero input), and the "memory of memory" ambiguity. All three are fixed below without diluting the identity. The title collision with #3 is moot (#3 is not built); the name stays.

Why not the runner-up ALOFT (137): its sim budget was overclaimed ~2x and it had no stakes; it would need both a rescue of its grid and a grafted loss model before it is a game. AMBER is passive and reads as a plot. FATHOM's cut gesture destroys novices' work. #3 is the genre default.

**Grafts accepted (source -> what it becomes here)**

| Source | Graft | Why it adds feeling |
|---|---|---|
| ALOFT | Curl-iridescent LUT (cyan for +curl, magenta for -curl) + calm-water sheen | Reversed vorticity inside the circle flips the sheen colour: the rewind is legible at a glance; calm water is visibly a place |
| ALOFT | Audio tell 0.5 s before each tide pulse and before a vortex enters a glyph's region | Turns a hidden sinusoid into a beat the player can time a hold against |
| ALOFT | Drone gains a partial per saved constellation; loss adds a sour partial | The sky is the score; the sound is too |
| ALOFT | Two pointers, two roles: one hand stirs, the other remembers | Makes the stir/hold tension a two-handed discovery on touch, zero extra code |
| AMBER | Beads on the rim showing reachable memory depth; beads bunch when the window shrinks in Act 3 | The clock is on the circle, never on a HUD |
| AMBER | Fossil canvas: every stroke and every held circle etched; re-lit at Dawn | The ending is the player's own history, not a colour crossfade |
| AMBER | Named adaptive-quality ladder | What actually keeps 60 FPS on integrated GPUs |
| FATHOM | Strain ramp on the rim (teal -> amber -> white) + pad pitch sharpening as flow erodes the circle | Pre-failure is heard and seen before it happens |
| FATHOM | Loss costs progress, not a screen: warning ramp, wisp state, partial re-lighting within the act | Stakes stay real but never cliff-edge |
| #3 (wind) | Counter-stroke as an explicit rule (stirring against local flow is 1.6x as strong) | Makes "still the water, then hold" a deliberate verb taught in Act 1 |
| #3 (wind) | Trail-layer hygiene (batched `rect()` buckets, periodic `destination-out` purge) + stuck-player nudge | Prevents grey mud; keeps zero-instruction players moving |

**Grafts rejected (scope without feeling):** ALOFT's breath-hold slow time and any required keyboard; FATHOM's self-`drawImage` refraction lenses (readback path; the remanso already IS the distortion); AMBER's predicted future ribbons (this game is about the past; a future ribbon dilutes the verb); MacCormack advection (see below); chromatic-offset post effect (two more full-screen composites for a cliche; the curl sheen already does the chromatic work).

**Judge disagreements, decided**

| Question | Decision |
|---|---|
| Hover-still opens a remanso on desktop? (concept: yes; judges 2, 3: no) | **No.** A press is required; the verb stays chosen. Discovery is guaranteed by the invisible hand's demonstration (section 7). |
| Ghost outline drifts with mean flow (judge 2) vs static mask (judge 3) | **Anchored ghost.** The place remembers; the ink drifts; stirring ink back onto the ghost is the skill. No contradiction remains. |
| MacCormack/BFECC for sharper restoration (judge 2) | **No.** Restored sharpness is bounded by the snapshot, which is written straight from the crisp stamp; forward diffusion only blurs the *before* state, which makes the un-blur more dramatic. Resolution is fixed by 192x108 and big, simple glyphs. |
| Rewinding is itself remembered (concept) vs freeze (judge 3) | **Freeze.** Snapshot writes stop while any remanso is open. "Time spent remembering is not itself remembered." Predictable, and poetic. |
| Grid 128x72 vs 192x108 | **192x108 default**, 160x90 and 128x72 as calibration rungs chosen by measurement at boot and **locked** (history cannot be resampled). |
| DPR cap 1.0 vs 1.5 | **Pixel-budget rule** (section 5.1): 1920x1080 lands at ~1.0, phones at 1.5, 2560x1440 at 1.0. |
| Rim erosion weighted by divergence (judge 3) | **No.** Speed only. The projection's bleed of reversed velocity across the rim is the frontier and looks right. |

---

## 1. Title, tagline, premise

**REMANSO** (Portuguese: the still backwater of a river, where the current does not reach.)

**Tagline:** *Onde a água para, ela lembra.* — Where the water stills, it remembers.

**Emotional premise:** Everything you loved is bioluminescent ink dissolving in a night tide, and the only way to have it back, briefly, is to stop moving while the rest of the world keeps flowing. Morning will come and give nothing back; it will only light what you managed to keep in the sky.

---

## 2. The mechanic

The screen is a night sea seen from above; the top quarter is sky with a horizon. An invisible hand draws a luminous glyph onto the water and the tide begins to pull it apart in a real fluid simulation. The player has one finger and two verbs.

**Stir.** Moving the pointer injects velocity along the stroke. Ink swirls, motes stream. Stirring *against* the local current is 1.6x as strong as stirring with it, so "stilling" the water by counter-stroking is a reliable verb, and the lee you create is visibly lighter (calm sheen).

**Hold still.** Press and stop. After ~0.4 s a circle of stillness opens under the finger: the *remanso*. Inside it time runs backward at 1x: eddies spin the other way, motes drift back along their paths, smeared ink re-condenses cell by cell from the water's memory, and the iridescent sheen flips from cyan to magenta because the curl has changed sign. The circle grows over 2 s; the longer you hold, the further back it reaches, up to the water's memory (12 s). Outside the circle the tide keeps flowing forward, so the rim is a live frontier: where the current is fast the rim turns amber, then white, flickers and breaks, and the past is eaten again. The circle can be **carried** at a walking pace (< 40 px/s) without closing it.

**What the water remembers.** A ring buffer holds 12 s of dye and velocity. Rewinding lerps the water inside the circle toward those snapshots. Ink that dispersed earlier than 12 s ago is not in memory; but the *place* remembers its shape: a faint ghost outline lingers where each glyph was drawn, visible only in calm water. Ink stirred back over the ghost and then held still **settles** onto the ghost's shape (mass-conserving redistribution; nothing appears from nothing). Memory is fast and exact and can un-mix two colours; settling is slow, needs raw ink nearby, and cannot un-mix. Both are one gesture.

**Goal.** When a glyph is whole enough it brightens, lifts out of the water as a small constellation and takes its place in the sky. When one is lost it turns grey and becomes a wisp in the water, forever. The sky is the score; the wisps are the cost.

### 2.1 Exact input mapping

Pointer Events only (`pointerdown/move/up/cancel`), `touch-action: none` on the canvas, `preventDefault` on `touchstart/touchmove` (`passive:false`) and on `contextmenu`, `-webkit-touch-callout: none`, `user-select: none`. Up to 2 simultaneous pointers (extra pointers ignored). Any `mouse`-type pointer event within 500 ms after a `touch` pointer event is ignored (compatibility-event guard).

| Input | Effect |
|---|---|
| Mouse move, no button | Gentle stir: velocity splat at 0.25x strength along the motion. Cursor ring (r 7 px, alpha 0.5) follows. |
| Press (button 0 / first touch) | Cursor ring fills. Stillness timer starts. Audio context created/resumed. |
| Drag while pressed | Strong stir at 1.0x: splat amplitude = clamp(pointer speed in cells/s, -45, 45) * 0.8, sub-splats every 1.5 cells along the segment (max 12/frame). Counter-stroke (dot(strokeDir, localVel) < 0): x1.6. Etched into the fossil canvas at alpha 0.05. |
| Hold still (150 ms mean speed < 40 px/s) | Stillness `s` rises at 2.5/s (open in 0.4 s). Remanso exists while `s > 0.02`. Radius R = (60 + 140 * easeOutCubic(min(holdTime, 2)/2)) * kScale, kScale = clamp(min(cssW, cssH)/1080, 0.42, 1.2), floor 44 px. Depth cursor d advances at 1.0 s per s, clamped to the window. Snapshot writes freeze while any remanso is open. |
| Slow drag while open (< 40 px/s) | The circle is carried; nothing else changes. |
| Speed >= 40 px/s while open | `s` falls at 6/s (closes in ~0.17 s); the pointer is stirring again. `d` resets to 0 when `s` reaches 0. |
| Release | `s` falls at 2/s (closes over 0.5 s); the rim dissolves into 24 sparks. Snapshot writes resume when no remanso is open. The final circle is etched into the fossil canvas (ring alpha 0.08, disc 0.02). |
| Second pointer (touch) | Independent: it may stir while the first holds, or hold its own remanso (max 2; cells under both take the larger weight). |
| Double-click / double-tap / wheel / right-click | Nothing. (Right-click and long-press menus are suppressed.) |
| Hover over sky band / press in sky band | No stir, no remanso. In the epilogue only: holding still in the sky band for 2 s restarts. |
| Keyboard (all optional) | `Space` held = virtual still pointer at the last pointer position (trackpad accessibility); `M` = mute toggle; `R` held 1 s = restart with a 2 s fade. No other keys. |

### 2.2 Recall kernel (per remanso, per sim step)

For each cell within R (<= ~600 cells at 192x108; ~1200 for two remansos):

```
dist  = |cell - center|            (cells)
w     = smoothstep(R, 0.6R, dist) * s * (1 - clamp(|v|/V_RES, 0, 1))      V_RES = 12 cells/s
hist  = lerp(slot[head - k], slot[head - k - 1], frac)   with k + frac = d * 20   (linear between 20 Hz snapshots)
for c in {dye0, dye1, dyeW}:  delta = hist.c - dye.c;  dye.c += w * 0.35 * delta;  recall = max(recall*0.94, w * min(1, 3*|delta|))
vel   = lerp(vel, -1.2 * hist.vel, w * 0.5)
```
Settle (same loop, after history): let `mask` be the thick mask of the glyph whose ghost overlaps the circle most (ties: the one with lower coherence). `gain = sum(dye.k inside circle) / max(1e-4, sum(mask inside circle))`; `dye.k += w * 0.08 * (mask * gain - dye.k)` for the channel k that glyph owns (for a wisp glyph, k = W). Mass inside the circle is conserved to first order; the shape sharpens toward the ghost only if ink is present. Cost: two sums plus one lerp per cell.

Rim strain (for colour and audio): 24 samples of `clamp(|v|/V_RES, 0, 1)` on the circle; `strainAvg` also shrinks the effective radius: `R_eff = R * (1 - 0.35 * strainAvg)`.

---

## 3. The arc

Coordinates below are **water-normalized**: (0,0) = top-left of the water rect, (1,1) = bottom-right. `Lmin = min(waterW, waterH)`. A glyph's extent `E` is a fraction of `Lmin`. Session: 8–10 minutes, five acts, no HUD, no numbers.

### 3.1 Glyph book (authored polylines, stamped over 2 s; G6 over 4 s)

| id | Name | Act | Slot / colour | Centre | E | Definition (P = centre) |
|---|---|---|---|---|---|---|
| G1 | Espiral | 0 | 0 amber | (0.50, 0.50) | 0.34 | t∈[0,1]: angle = 4πt, radius = E/2·(0.12 + 0.88t). One stroke, 2.5 turns. |
| G2 | Abraço (two arcs) | 1 | 0 amber | (0.38, 0.52) | 0.36 | Left arc: centre P+(−0.12E,0), r 0.42E, 110°→250°. Right arc mirrored (−70°→70°). Two strokes; the hand lifts between them. |
| G3 | Ramo (branch) | 1 | 1 rose | (0.64, 0.50) | 0.40 | Trunk P+(0,0.5E)→P+(0,−0.15E); branches from trunk points at y = +0.15E, 0, −0.15E going up-left 35°, up-right 35°, up-left 35°, lengths 0.28E, 0.24E, 0.20E. Four strokes. |
| G4 | Lua (crescent) | 2 | 0 amber | (0.34, 0.56) | 0.34 | Arc r 0.5E from 45° to 315° (open to the right). One stroke. |
| G5 | Onda (wave) | 2 | 1 rose | (0.66, 0.56) | 0.36 | P + (E(t−0.5), 0.22E·sin(3πt)), t∈[0,1]. One stroke. |
| G6 | A Figura | 3 | 0 moon-gold | (0.50, 0.52) | 0.62 | Composite: G1 at scale 0.45 at P; G2 at scale 0.9 around it; G3 at scale 0.5 at P+(0,−0.30E). Seven strokes, 4 s. |

Stroke stamp: Gaussian σ = 1.2 cells (visible width ≈ 3 cells ≈ 28 px at 1080p/192-wide). G4 and G5 centres are 0.32 water-widths apart: "a hand's width"; their inks bleed into each other.

### 3.2 Acts

| Act | Name | Length | Glyphs | Tide A (cells/s) / period | Vortices n / v_peak (cells/s) | Memory window | Sky | What it teaches / escalates | Exit |
|---|---|---|---|---|---|---|---|---|---|
| Calibrate | — | 1–3 s | — | 0 | 0 | — | #02030a | — | grid rung locked |
| 0 | Primeiro Fôlego / First Breath | 40–70 s | G1 | 0; from t = 12 s one vortex only | 1 / 2.5, drifts across G1 | 12 s | #02030a → violet on exit | hover stirs; press-hold reverses; a saved glyph goes to the sky | G1 set (cannot be lost in Act 0: fading disabled) |
| 1 | A Maré Sobe / The Tide Comes In | ~2 min, cap 150 s | G2, then G3 | 6 / 40 s | 1 / 5, path tuned to cross each ghost ~12 s after stamping and every ~25 s after | 12 s | #1a0f3a | rim erosion + pad sharpening; counter-stroke stills water; calm sheen; the ghost is anchored, ink must be stirred back | both resolved or cap |
| 2 | Duas de Uma Vez / Two at Once | ~3 min, cap 210 s | G4 + G5 together | 9 / 40 s | 2 / 8, counter-rotating pair centred between the glyphs | 12 s | #3a1a4a → #16357a at 50% of the act | choosing; inks bleed; memory un-mixes colours, settling cannot; losses happen | both resolved or cap |
| 3 | A Figura / The Figure | ~2 min, cap 180 s | G6 | 14 / 28 s | 3 / 12 | 6 s (beads bunch into half the rim) | #16357a, pre-dawn band at the horizon | shelter with counter-vortices; hold on the tide's phase; short memory | resolved or cap |
| 4 | Amanhecer / Dawn | 40 s | — | fades to 0 | fade | global | #16357a → #f2b27a → #fff1d6 | climax | timed |
| Epilogue | Remanso | open | — | 1.5 | 1 / 1.5 | none (remanso disabled) | #fff1d6 | sunlit toy; restart on the horizon | hold in the sky band 2 s, or R |

Weather ramps in over 10 s at each act start (easeInOutSine); it never snaps. Sky crossfades take 6 s.

**Cap behaviour ("morning approaches"):** in the last 15 s before an act's cap the tide slackens to 40%, the sky lightens 6%, and every unresolved glyph enters FADING regardless of coherence (ink cools). At the cap, unresolved glyphs become permanent wisps; 3 s pause; next act.

### 3.3 Glyph state machine (fail/retry model: gentle but real)

`coh_k = Σ min(dye_k, mask_k) / Σ mask_k` over the glyph's bbox, every 6 steps; `coh_n = coh / cohStamp` (normalized by the value measured at the end of stamping, so thresholds are grid-independent).

```
STAMPING (2 s | 4 s) → LIVE
LIVE: eligible once coh_n < 0.45 has happened or 20 s since stamp    (prevents an instant set)
LIVE → SET       : eligible && coh_n ≥ 0.70 for 1.0 s continuous → LIFTING (3 s) → STAR (brightness 1.0)
LIVE → FADING    : coh_n < 0.20 for 6 s.  Ink lerps toward grey (fade 0→0.6 over the ramp), ghost cools, pad root drops a step
FADING → LIVE    : coh_n ≥ 0.35
FADING → WISP    : coh_n < 0.08 for a further 12 s.  dye_k → dye_W everywhere; ghost alpha ×0.3; bass thud; detuned chord; sky −6 % for 2 s
WISP → RELIT     : within the same act, cohW_n ≥ 0.55 for 1 s (grey ink settled onto its ghost) → LIFTING → DIM STAR (0.45, grey-blue)
WISP at act end  → PERMANENT: a wisp source (grey splat 0.002/step, σ 3 cells) stays at the ghost centre forever; ghost removed
```
There is no game over. The ending always plays; the fullness of the sky and the grey in the water are the result. Restart: hold still in the sky band for 2 s (epilogue) or hold `R` 1 s anywhere → 2 s fade to black → Act 0 with all state reset in place (no reload; fossil cleared; history `count = 0`).

**Stuck nudge:** 60 s in an act with no glyph state change → the target ghost brightens ×2 for 8 s and weather targets are scaled ×0.4 within 2R of it for 8 s; repeats every 45 s. **Idle:** 120 s without input → the invisible hand demonstrates a 2 s remanso over the ghost.

### 3.4 Dawn (40 s) and epilogue

- 0–3 s: global rewind: the kernel with R = ∞, w = 1, `d` stepping at 4× through the whole window; tide fades; sky begins to lift.
- 3–8 s: dye blends (lerp 0.1/step) toward every glyph's stamp mask in its own colour — saved at full, dim at 45%, lost in grey — so the water shows everything the player ever tried to keep.
- 8–30 s: the fossil canvas rises from alpha 0.10 to 0.9 ('lighter'): every stroke and every circle the player ever made, as gold on the water. Drone partials glide to the final chord; bells replay in reverse order of saving.
- 30–40 s: sky to gold; ink and fossils bleach to 0; the wisps rise off the water as grey mist (400 motes, upward, 'lighter' 0.3); the constellations are the last things visible and fade 36–40 s. At 34 s the second line: *"A manhã não devolve. Só ilumina."* / *"Morning gives nothing back. It only lights."*
- Epilogue: sunlit pool (water gradient #1a2a4a → #2a4a6a), no ink, bright motes, gentle weather. Stirring works; pressing still shows a rim that dissolves into sparks after 0.5 s — there is nothing left to remember. Holding still in the sky band for 2 s begins again.

---

## 4. Physics spec

### 4.1 Grid, units, layout

Units: **cells** and **seconds**; velocity in cells/s; `DT = 1/60`. Square cells. Grid rungs by cell count: **rung 0: 20,736** (192×108 at 16:9), rung 1: 14,400 (160×90), rung 2: 9,216 (128×72). `W = floor(sqrt(cells·aspect))`, `H = floor(W/aspect)` where `aspect = waterW/waterH` (portrait phones get e.g. 124×166). One-cell padded border: interior loops run `1..W−2, 1..H−2`; index `i = x + y·W`; no bounds checks in inner loops.

All arrays allocated **once at boot for MAX = 20,736 cells**; smaller rungs use a prefix with stride `W`. Float32Array: `u, v, u0, v0, d0, d1, dW, t0, t1, tW, p, div, curl, speed, recall, uT, vT` (17 × 83 KB = 1.4 MB). Per glyph (6): `maskThick, maskThin` Float32Array at MAX (1.0 MB total), plus `bbox` (Int16×4), `cohStamp`. History: one `ArrayBuffer(240 · MAX · 5)` = 24.9 MB with views `dyeSnap = Uint8Array(buf, 0, 240·N·3)`, `velSnap = Int8Array(buf, 240·MAX·3, 240·N·2)`, stride recomputed at rung lock (`N = W·H`). Quantization: dye `min(d, 1.99)·128`, velocity `round(clamp(v·3, −127, 127))`.

### 4.2 Fixed step and loop

`requestAnimationFrame`; `dtReal = min(now − last, 0.05)`; `acc += dtReal`; `while (acc ≥ DT && steps < 2) { step(); acc −= DT; steps++ }`; if `acc > 2·DT` after the loop, `acc = 0` (excess discarded: the sea does not hurry). Render only if `steps > 0` (high-refresh displays) or a resize occurred. `visibilitychange` hidden → cancel rAF, `audio.suspend()`, release pointers; visible → `last = now, acc = 0`, resume. Sim step is 60 Hz (a 120 Hz substep doubles the dominant cost for no visible gain in a diffusive Eulerian solver; stability comes from semi-Lagrangian advection and Gauss-Seidel, both unconditionally stable).

### 4.3 Step order (per fixed step)

1. **Weather targets** (every 3rd step, cached in `uT, vT`): `uT = A·sin(2πt/P)·(0.6 + 0.4·sin(π·y/H))`; for each vortex k (Rankine, core `rc = 10` cells): `r = |cell − c_k|`, `vt = v_peak·(r < rc ? r/rc : rc/r)`, `(uT, vT) += spin_k · vt · perp(unit(cell − c_k))`. Vortex path: `c_k = (W·(0.5 + 0.36·sin(ω1 t + φ_k)), H·(0.5 + 0.32·sin(ω2 t + ψ_k)))`, `ω1 = 2π/47 s`, `ω2 = 2π/31 s`, `φ_k = 2.1k`, `ψ_k = 1.3k`, spins alternate. In Act 1, `φ` is solved at stamp time (scan t in 0.25 s steps) so the vortex passes within 6 cells of the ghost centre 12 s later. Plus residual life: `uT += 0.3·sin(0.011x + 0.7t)`, `vT += 0.3·cos(0.013y + 0.5t)`.
2. **Forces:** `u += K_TIDE·(uT − u)·DT`, `K_TIDE = 1.5/s` (same for v). Pointer splats (4.4). Hand splats while stamping. Wisp sources. Wall damping band: 3 cells from any wall, `u,v *= 0.97`.
3. **Vorticity confinement:** `curl = 0.5·((v[x+1] − v[x−1]) − (u[y+1] − u[y−1]))`; `N = ∇|curl| / (|∇|curl|| + 1e-6)`; `u += EPS·(N_y·curl)·DT`, `v −= EPS·(N_x·curl)·DT`, `EPS = 6.0` (tuned so vortex cores persist ~2× longer than without; keeps the reversed eddies visibly coherent).
4. **Damping and clamp:** `u,v *= 0.998`; if `u²+v² > 40²` scale to 40. Store `speed = sqrt(u²+v²)` (used by the tone map, the rim, and the recall weight).
5. **Advection (semi-Lagrangian, shared weights):** `bx = clamp(x − u·DT, 0.5, W−1.5)`, `by` likewise; compute the 4 bilinear weights once; sample `u0, v0, d0, d1, dW` (5 fields × 4 taps) into the swap buffers; swap.
6. **Projection:** `div = 0.5·(u[x+1] − u[x−1] + v[y+1] − v[y−1])`; `p = 0`; **10 Gauss-Seidel sweeps in place** (7 when degraded): `p = (p[x−1] + p[x+1] + p[y−1] + p[y+1] − div)/4`, Neumann copy on the border after each sweep; `u −= 0.5·(p[x+1] − p[x−1])`, `v −= 0.5·(p[y+1] − p[y−1])`. **Free-slip walls** on all four sides: normal component zeroed in wall cells, tangential copied. (No open boundary: this is a pool seen from above; the sky is not in the grid.)
7. **Dissipation:** `d0, d1 *= 0.9995` (half-life 23 s: ink lingers as fog), `dW *= 0.9998` (wisps outlast everything), `recall *= 0.94`.
8. **Remanso kernels** (≤ 2, section 2.2), including settle.
9. **Snapshot** every 3rd step unless any remanso is open (`s > 0.02` on any pointer): write `head = (head + 1) % 240`, `count = min(count + 1, 240)`.
10. **Motes** (1500): position in cells; `vel = bilinear(u, v)`; inside a remanso within `0.9R`: `vel = −1.5·hist.vel` (exaggerated backward drift, tagged cyan); `pos += vel·DT`; respawn at a random edge cell when out of the grid or `age > 20 s` (initial ages uniform 0–20 s to avoid a pulse).
11. **Coherence** every 6th step (bbox only, +4 cells).
12. **NaN sentinel:** if `!isFinite(u[centre])`, zero `u, v, u0, v0, p, div` and `console.warn` once.

### 4.4 Pointer and hand splats

Pointer: Gaussian `σ = 2.5` cells over radius `3σ` (≈ 177 cells); `amp = clamp(v_ptr, −45, 45)` cells/s (pointer velocity converted to cells/s, 150 ms mean) `× 0.8 × (pressed ? 1 : 0.25) × (counter ? 1.6 : 1)`, `counter = dot(v_ptr, v_local at the pointer cell) < 0`. `u += amp_x·g(r)`, `v += amp_y·g(r)`. Sub-splats along the frame's segment every 1.5 cells, at most 12 per step (rest dropped). **The pointer never injects dye**: the player never makes ink, only moves it.

Hand (stamping): arc-length parametrized; per step advance `len·DT/2 s` (G6: 4 s); dye `d_k = max(d_k, g(r))` with `σ = 1.2`, sub-splat spacing 0.7 cells; a velocity splat `0.3·v_hand` (σ 2 cells) so the drawing stirs slightly. Masks: `maskThick` identical stamp (max), `maskThin` σ 0.5. At stamp end `cohStamp` is measured (≈ 1.0).

### 4.5 Constants (initial values)

| Constant | Value | Constant | Value |
|---|---|---|---|
| DT | 1/60 s | MAX_STEPS / ACC_CLAMP | 2 / 50 ms |
| CELLS by rung | 20,736 / 14,400 / 9,216 | VMAX | 40 cells/s |
| V_RES (reversal resistance) | 12 cells/s | K_TIDE | 1.5 /s |
| EPS_CONFINE | 6.0 | GS_SWEEPS | 10 (7 degraded) |
| DISS_INK / DISS_WISP / VEL_DAMP | 0.9995 / 0.9998 / 0.998 per step | WALL_DAMP | 0.97, 3 cells |
| TIDE A by act | 0→2.5, 6, 9, 14, 0, 1.5 | TIDE P | 40 s (Act 3: 28 s) |
| VORTEX n / v_peak by act | 1/2.5, 1/5, 2/8, 3/12, 0, 1/1.5 | VORTEX rc | 10 cells |
| STIR σ / amp gain / hover / counter | 2.5 / 0.8 / 0.25 / 1.6 | STAMP σ / thin σ | 1.2 / 0.5 cells |
| STILL_SPEED / window | 40 px/s / 150 ms | s_rise / s_fall / s_release | 2.5 / 6 / 2 per s |
| R_min / R_max / grow | 60 / 200 px × kScale (floor 44) / 2 s easeOutCubic | kScale | clamp(min(cssW,cssH)/1080, 0.42, 1.2) |
| REWIND_RATE | 1.0 s/s (Dawn: 4.0) | WINDOW | 12 s (Act 3: 6 s) |
| SNAP_HZ / SLOTS | 20 / 240 | RECALL dye / vel / settle | 0.35 / 0.5 (target −1.2·hist) / 0.08 per step |
| RIM segments / beads | 24 / 12 | R_eff | R·(1 − 0.35·strainAvg) |
| MOTES | 1500 (900 degraded) | MOTE backward factor | 1.5 |
| COH sample | every 6 steps | SET / eligible | 0.70 for 1 s / coh_n < 0.45 once or 20 s |
| FADING / recover / WISP / RELIT | 0.20 for 6 s / 0.35 / 0.08 for 12 s / 0.55 for 1 s | WISP source | 0.002/step, σ 3 |
| NUDGE | 60 s, ×2 ghost, ×0.4 weather in 2R, 8 s | IDLE demo | 120 s |

### 4.6 Per-frame op budget (rung 0, 20,736 cells; one step per frame)

| Pass | ops/cell | Mops | Est. ms (1.0–1.3 ns/op) |
|---|---|---|---|
| Weather targets (amortized /3) | 15 | 0.31 | 0.3–0.4 |
| Forces + wall band | 6 | 0.12 | 0.1 |
| Confinement | 22 | 0.46 | 0.5–0.6 |
| Damping / clamp / speed | 8 | 0.17 | 0.2 |
| Advection (5 fields) | 62 | 1.29 | 1.3–1.7 |
| Projection (8 + 10×8 + 8) | 96 | 1.99 | 2.0–2.6 |
| Dissipation | 5 | 0.10 | 0.1 |
| Snapshot (amortized /3) | 2 | 0.04 | 0.1 |
| Tone map (render) | 30 | 0.62 | 0.6–0.8 |
| Remanso ≤ 2 × 600 cells × 45 | — | 0.05 | 0.05 |
| Motes 1500 × 30 | — | 0.05 | 0.05 |
| **Total** | ~246 | **5.2** | **5.3–6.7** |

Rung 1 ≈ 3.7–4.7 ms; rung 2 ≈ 2.4–3.0 ms. Draw-call issue ≈ 0.8–1.2 ms on top. The 8 ms JS budget holds at rung 0 on a mid-range laptop and the calibration (frames 10–70 after boot: fluid step p75 > 5.5 ms → next rung; at most two drops; `hardwareConcurrency ≤ 2` starts at rung 1) locks the rung before the first glyph is drawn. Rung changes afterwards happen only at act boundaries (history `count = 0`).

---

## 5. Render spec

### 5.1 Canvases

- **Main canvas:** CSS = viewport; backing = CSS × `scale`, `scale = clamp(min(DPR, 1.5, sqrt(2.6e6 / (cssW·cssH))), 0.75, 1.5)`; `ctx.setTransform(scale, 0, 0, scale, 0, 0)`. 1920×1080 @ DPR 2 → 1.12 (2.6 Mpx); 2560×1440 → 0.84; 360×640 @ DPR 3 → 1.5. Everything is soft, so fill-rate is spent where it shows (phones), not on retina laptops. Lines are ≥ 1.5 px so nothing aliases at scale ≈ 1.
- **Offscreens (fixed resolution, DPR-independent):** `ink` W×H (grid) with one reused `ImageData` + `Uint32Array` view; `bloomA` W/2×H/2; `bloomB` W/4×H/4; `motes` 960×round(960/aspect) (max 960×1280 portrait); `fossil` same size, never cleared except restart; `reflection` 256×64; sprites: star 32×32, hand glow 64×64, spark 16×16, bead 12×12, rim inner glow (8 radius steps); `grain` 256×256 tile (rung 0 only).
- Water rect: `x = 0, y = horizonY = 0.25·H (0.20·H if portrait), w = W, h = H − horizonY`.

### 5.2 Draw order (main canvas, per rendered frame) with cost at ~2.1–2.6 Mpx

| # | Layer | How | Composite | ms |
|---|---|---|---|---|
| 1 | Sky | `fillRect` with a cached vertical `CanvasGradient` (rebuilt on resize/act); during a 6 s crossfade the old and new gradients are drawn with complementary alpha | source-over | 0.2 |
| 2 | Horizon | 2 px line, sky-bottom colour lightened 30% | | ~0 |
| 3 | Water | `fillRect` cached gradient #050814 → #0b1330 (epilogue: #1a2a4a → #2a4a6a) | | 0.2 |
| 4 | Reflection | 30 horizontal slices of the mirrored sky (`reflection` canvas) into the top 15% of the water, alpha 0.12, x-offset `3·sin(1.3t + 0.4·slice)` px | source-over | 0.2 |
| 5 | Ink | `putImageData` → `ink`; `drawImage(ink → water rect)`, `imageSmoothingEnabled = true`, quality 'high' (bilinear upscale = the wet look for free) | lighter | 0.9 |
| 6 | Bloom | `ink → bloomA → bloomB` (smoothing on), `drawImage(bloomB → water rect)` alpha 0.45; rung 0 also `bloomA` alpha 0.2. A pure resampling pyramid: **no `ctx.filter` anywhere**, identical on every browser | lighter | 0.7 |
| 7 | Motes | on `motes`: `destination-out` `fillRect` alpha 0.14 (every 8th frame an extra 0.25 to kill 8-bit residue); 3 alpha buckets (0.25/0.45/0.70) + 1 cyan "backward" bucket, each `beginPath` + `rect()`×n + `fill` (4 draw calls for 1500 motes, 2×2 px); then `drawImage → water rect` | lighter | 1.0 |
| 8 | Fossil | `drawImage` alpha 0.10 during play, ramping to 0.9 at Dawn | lighter | 0.6 |
| 9 | Remanso rims (≤ 2) | dashed outer ring `lineDash [3,9]`, `lineDashOffset −= 90·dt` (counter-rotation); 24 strain segments (arcs) coloured from a 33-entry precomputed string table `round(strain·32)`: teal #7fe3ff → amber #ffb347 → white #ffffff, alpha `0.85·(1 − 0.8·strain)` + per-segment flicker when strain > 0.7 (segment skipped on 30% of frames); 12 beads at radius 0.82R, bead k at angle `−π/2 + 2π·k/12·(window/12 s)` (beads bunch when the window shrinks), lit (alpha 0.9, r 2.5 px) if `k < 12·d/window` else dim (0.25); inner glow disc sprite alpha 0.12·s | lighter | 0.3 |
| 10 | Sky constellations | star sprites alpha `brightness·(0.7 + 0.3·sin(0.7t + i))`; lines alpha 0.18 between consecutive stars; star-flight particles (pool 256) on eased Bezier arcs | lighter | 0.2 |
| 11 | Hand glow, pointer ring, sparks | sprites; ring r 7 px alpha 0.5, filled while pressed, contracts to r 4 while still | lighter | 0.1 |
| 12 | Vignette | `fillRect` with a cached radial gradient: transparent at r 0.55 → rgba(0,0,0,0.55) at r 1.0 (**source-over, not 'multiply'**) | source-over | 0.5 |
| 13 | Grain (rung 0) | `createPattern(grainTile)`, alpha 0.035, translated by `((frame >> 2)·37) mod 256` | source-over | 0.5 |
| 14 | Text | ≤ 2 moments in the whole game | | ~0 |

Total paint ≈ 5–6 ms at rung 0; ≈ 3.5 ms at rung 2 with scale 0.75. Full-rect texture composites per frame: 5 (6 on rung 0), never more.

### 5.3 Tone map (per cell, into the Uint32 view; ~30 ops)

```
a = d0[i]; b = d1[i]; g = dW[i]; r = recall[i]; c = curl[i]; sp = speed[i]
calm = max(0, 1 - sp/6)                              // still water is a lighter place
colA = lerp(COL[slot0], GREY, fade0);  colB = lerp(COL[slot1], GREY, fade1)   // fade: 0..0.6 while FADING
R = colA.r*a + colB.r*b + GREY.r*g + 0.045*calm + 0.45*r + ghost[i]*calm*0.12*0.55
G = colA.g*a + colB.g*b + GREY.g*g + 0.060*calm + 0.55*r + ghost[i]*calm*0.12*0.65
B = colA.b*a + colB.b*b + GREY.b*g + 0.090*calm + 0.60*r + ghost[i]*calm*0.12*0.80
sheen = min(1, |c|*0.35) * (a + b + g) * 0.5          // iridescent oil-on-water, only where there is ink
c > 0 ? (G += 0.6*sheen, B += 1.0*sheen) : (R += 1.0*sheen, G += 0.3*sheen, B += 0.7*sheen)   // sign flips inside a remanso
px = 0xFF000000 | KNEE[min(1023, (B*512)|0)] << 16 | KNEE[min(1023, (G*512)|0)] << 8 | KNEE[min(1023, (R*512)|0)]
```
`KNEE[i] = round(255 · x/(1 + 0.35x))`, `x = i/512` (soft highlight knee; 1024-entry Uint8). `ghost` = the sum of thin masks of live/wisp glyphs (rebuilt when a glyph changes state). COL: amber (1.00, 0.70, 0.42), rose (1.00, 0.44, 0.57), moon-gold (1.00, 0.91, 0.69); GREY (0.42, 0.45, 0.50); recall colour ≈ (0.75, 0.91, 1.0) scaled by 0.6.

### 5.4 Colour system

| Element | Colour | HSL |
|---|---|---|
| Water gradient | #050814 → #0b1330 | H 228–236°, S 60–70%, L 3–10% (never pure black) |
| Ink amber / rose / moon-gold | #ffb26b / #ff6f91 / #ffe9b0 | H 32° / 345° / 44°, S 100%, L 71 / 72 / 84% |
| Recalled ink flash | #bfe9ff | H 200°, S 100%, L 87% |
| Wisp grey | #6b7280 | H 220°, S 8%, L 45% |
| Motes | #cfd8e3 at 25–70% alpha; backward motes #bfe9ff at 80% | |
| Rim strain ramp | #7fe3ff → #ffb347 → #ffffff | H 197° → 32° → white |
| Sky by act | #02030a, #1a0f3a, #3a1a4a, #16357a, dawn #f2b27a, gold #fff1d6 | each a vertical gradient: listed colour at the top, 45% darker at the horizon; Dawn/gold inverted (bright at the horizon) |
| Stars / dim stars | #ffe9b0 / #9aa6c0 | |
| Text | #f2e8d5 (PT), same at 0.4 alpha (EN) | |

### 5.5 Typography

`font: 500 {size}px 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif`, `size = clamp(18, 2.4·vmin, 34)` px, letter-spacing 0.08 em (`ctx.letterSpacing` where supported, else per-glyph placement from cached `measureText` widths). PT line alpha ≤ 0.85; EN shadow line at 0.72× size, 1.4 em below, alpha ≤ 0.4. Fade in 1 s, hold 4 s, out 1.5 s (easeInOutSine). Opening line at `(0.5W, horizonY − 0.12H)`; Dawn line at `(0.5W, 0.14H)`. No fonts fetched.

### 5.6 Post effects and distortions

Vignette 0.5 ms (source-over gradient); grain 0.5 ms (rung 0 only, first thing the ladder drops); chromatic offset **rejected** (the curl sheen is the chromatic effect and it is physical); the only distortion is the remanso itself plus the reflection slice wobble. No `shadowBlur`, no `ctx.filter`, no per-pixel work outside the tone map.

---

## 6. Audio spec (procedural WebAudio, gentle, generative)

### 6.1 Graph

```
sources → bus (gain 0.8) → compressor (threshold −18 dB, knee 12, ratio 4, attack 0.01, release 0.25) → master (gain 0.5) → destination
bus → reverbSend (gain 0.3) → convolver (generated IR) → compressor
```
IR: stereo `AudioBuffer`, 2.5 s: white noise × `exp(−2.4t)` × `(1 − 0.6t/2.5)`, noise pre-filtered with a one-pole lowpass (coefficient 0.35) so highs decay faster; built once at init (~110k samples/channel, seeded PRNG).

### 6.2 Sources and how they react to state

| # | Source | Nodes | Reacts to |
|---|---|---|---|
| 1 | Water bed | two pink-noise loops (Voss-McCartney, 4 s buffers) → BP1 (180–400 Hz, Q 0.9, gain 0.10) and BP2 (900–2200 Hz, Q 1.2, gain 0.05) | `KE = mean(u²+v²)` sampled every 6 steps: `f1 = 180 + 220·clamp(KE/400)`, `f2 = 900 + 1300·clamp(KE/400)` via `setTargetAtTime` (τ 0.25 s); stirring adds `0.06·clamp(pointerSpeed/1500 px/s)` to BP2 gain (τ 0.1 s) |
| 2 | Remanso pad | 3 sines (root; +3 st, +5 cents; +7 st, −5 cents) → padGain → lowpass 900 Hz with LFO 0.3 Hz ± 250 Hz; plus a triangle at the root (strain partial) | open: padGain → 0.12 over 1.2 s (long attack); close: → 0 in 30 ms (abrupt stop = reversed envelope). Note from depth: D Dorian degrees `[D4, C4, A3, G3, F3, E3, D3][floor(d/window·6)]`. Strain: detune `+35·strainAvg` cents on all three; triangle gain `0.06·strainAvg` (bright and thin, never harsh). Rim segment break (strain > 0.95): bandpass-noise tick 3 kHz, 40 ms, gain 0.03, ≤ 6/s |
| 3 | Rim plinks | pooled sine + gain (8 voices) | a mote crossing a rim: random pentatonic degree (D F G A C), 80 ms exponential decay, gain 0.04, ≤ 3/s |
| 4 | Tells | bandpass noise sweep 1200 → 300 Hz, 0.6 s, gain 0.05; vortex swell: sine 55 Hz, gain 0 → 0.08 → 0 over 1.2 s | fired 0.5 s before a tide pulse crosses 50% rising; 0.5 s before a vortex centre comes within 1.5E of a live ghost (predicted from the analytic path) |
| 5 | Glyph SET | bloom chord: 4 sines (root, 5th, 9th, octave) through a lowpass sweeping 400 → 2500 Hz over 1.5 s, 4 s release; FM bell (carrier = the star's note, modulator ratio 2.4, index 3 → 0 over 2 s) | the star's drone partial fades in over 3 s |
| 6 | Glyph LOST | BP1 centre × 0.5 for 5 s; the pad chord replayed with ± 40 cents detune for 2 s; 45 Hz sine thud 200 ms gain 0.15 | |
| 7 | Drone partials | one sine per STAR, gain 0.02, ± 4 cents LFO 0.05 Hz, notes stacked from D3 F3 G3 A3 C4 D4; DIM STAR: same note an octave down, −12 cents, gain 0.015; PERMANENT WISP: D2 −18 cents, gain 0.012 (the sour note) | the well's sound thickens with every rescue and sours with every loss |
| 8 | Dawn | bells replay in reverse order of saving (1.5 s apart); partials glide over 8 s to the nearest tone of D F# A C#; a sustained major-seventh pad (4 sines) rises over 10 s with the light; everything but the bed fades over 20 s | |

Scheduling: one-shots on the context clock (`currentTime + 0.02`); all parameter moves via `setTargetAtTime` / `linearRampToValueAtTime`; minimum attack 15 ms; no per-frame node creation except the pooled one-shots (≤ 8 alive, stopped and disconnected `onended`). Total persistent nodes < 40.

Volume safety: every source gain ≤ 0.4; the compressor caps peaks; master 0.5; nothing is ever percussive. `M` toggles master 0 ↔ 0.5 over 50 ms. Hidden tab → `suspend()`. No `AudioContext`, or `resume()` rejected → silent mode behind an `audio.ok` flag (every audio call is a no-op; no errors).

Init: on the first `pointerdown` or `keydown`, synchronously inside the handler: `new (AudioContext || webkitAudioContext)()`, build graph + IR, `resume()`. On every later `pointerdown`: `if (ctx.state !== 'running') ctx.resume()`.

---

## 7. Onboarding: the first 30 seconds (clock starts at grid lock, 1–3 s after load)

| t | What happens |
|---|---|
| 0.0 | Black water (#050814 gradient), 1500 motes drifting on the residual field, sky #02030a, horizon a 2 px line at 4% brightness. OS cursor hidden (`cursor: none`); the pointer ring appears on the first move. Silence. |
| 0.5–7.0 | *"O que a água leva, a mão parada lembra."* with its English shadow *"What the water takes, the still hand remembers."* fades in (1 s), holds (4 s), out (1.5 s). |
| 3.0–5.0 | The invisible hand draws G1 (spiral) at the water centre, a 64 px glow leading the stroke; amber ink with a bloom halo; motes wake behind it. (Any pointerdown here starts audio; the bed fades in over 2 s.) |
| 5–12 | The spiral breathes. Hover stirs gently: the first mouse movement anywhere in the water makes ripples in the ink and mote streaks — curiosity is rewarded. Touch users see nothing until they touch, and any touch stirs. |
| 12 | One vortex (v_peak 2.5) drifts in from the left toward the spiral; the 55 Hz swell plays 0.5 s before it reaches the ghost; over the next 10 s the spiral visibly smears. |
| 12–16 | Most players click. Press + hold anywhere in the water: after 0.4 s the remanso opens (R growing over 2 s), beads light up one per second, eddies reverse, motes stream backward in cyan, the sheen flips cyan → magenta, the pad's long attack swells. Because the current is weak (w ≈ 0.8) the smear runs backward cleanly; a circle over the spiral reforms it within 3–5 s. |
| 16 | If no press has happened: the hand demonstrates — a rim opens over the spiral exactly as a player's would, holds 2 s while the smear runs backward, dissolves into sparks; the ghost pulses twice. Repeats every 30 s until the first press. |
| 18–26 | Typical first success: `coh_n ≥ 0.70` for 1 s → recall flash, water-rect flash (0.12 → 0 in 0.6 s), bloom chord + bell; ink drains 1.5 s while 200 star particles fly to the sky and settle as a 5-star constellation; the sky starts its 6 s crossfade to violet; the first drone partial fades in. |
| 26–30 | Act 1: the tide ramps in over 10 s; the hand draws G2 at left-centre; the tell rhythm becomes audible every 20 s. |

By 30 s the player has stirred, held, watched time run backward, and put one light in the sky — without reading a rule. Nothing in this table depends on the player having read the text.

---

## 8. Architecture

**Sections inside the single `<script>` (in this order):** `CONST` (every number in this document, one frozen object) · `UTIL` (seeded PRNG xorshift32, easing, lerp/smoothstep, colour tables) · `CANVAS` (main + offscreens, resize, scale rule) · `INPUT` (pointer map keyed by `pointerId`, 150 ms speed ring, stillness, virtual Space pointer, mouse-after-touch guard) · `FLUID` (fields, step passes) · `HISTORY` (ring buffer, freeze flag, interpolated read) · `REMANSO` (kernel, settle, rim state, sparks) · `GLYPHS` (glyph book, hand stamping, masks, coherence, state machine) · `WEATHER` (tide, vortices, Act-1 path solve, tells, nudge, idle demo) · `MOTES` · `SKY` (constellations, star flights) · `FOSSIL` · `RENDER` (tone map, layers) · `AUDIO` · `DIRECTOR` (acts, Dawn, epilogue, restart) · `LOOP` (rAF, accumulator, calibration, quality ladder, visibility) · `BOOT`.

**State machines.** Director: `BOOT → CALIBRATE → ACT0 → ACT1 → ACT2 → ACT3 → DAWN → EPILOGUE → (RESTART → ACT0)`. Glyph: `STAMPING → LIVE ⇄ FADING → WISP → RELIT | PERMANENT`, `LIVE → SET → LIFTING → STAR`. Transitions happen only in `director.update()` after the sim step, never inside render or input handlers (handlers only write to the pointer map).

**Zero allocation in hot paths.** All typed arrays allocated at BOOT for MAX cells; pools with free-list indices: motes 1500, sparks 64, star flights 256, mist (reuses motes, tagged), ripples 16, audio one-shots 8; 33 rim colour strings and 4 mote bucket strings precomputed; ImageData reused; gradients cached and rebuilt only on resize/act change; plain `for` loops, no closures, array literals, string concatenation or `Math.random` in step/render; `performance.now()` once per frame.

**Resize/DPR.** `resize` sets a dirty flag applied at the next frame start: CSS size from `innerWidth/innerHeight` (floored at 1), backing = CSS × scale, `setTransform`, water rect, gradients and vignette rebuilt. Fixed-resolution offscreens are untouched. If the water aspect changes by > 15% (orientation change), the grid dimensions, mote/fossil layer aspect and masks are re-derived at the next act boundary (fields cleared, history `count = 0`); mid-act the image just stretches.

**Pause/resume.** `visibilitychange` hidden → cancel rAF, `audio.suspend()`, release all pointers; visible → reset `last` and `acc`, resume audio. Window `blur` releases pointers. `pointercancel` handled like `pointerup`.

**Memory ceiling.** History 24.9 MB + fields 1.4 MB + masks 1.0 MB + pools < 0.3 MB + offscreens (motes 2 MB, fossil 2 MB, small ones < 0.2 MB) ≈ 32 MB JS-visible; main backing ≤ 2.6 Mpx ≈ 10 MB GPU. Hard ceiling 64 MB. Heap growth after boot < 10 MB over 3 minutes.

**Quality ladder** (30-frame rolling mean of rAF delta and measured JS time). Degrade one step when mean delta > 17.5 ms or JS > 9 ms for 30 frames: (1) grain off → (2) bloomA pass off → (3) motes 1500 → 900 → (4) GS sweeps 10 → 7 → (5) main scale → 0.75 → (6) grid rung −1 (act boundary only). Restore one step after 600 frames under 11 ms mean; never above the calibrated rung.

---

## 9. Feel & polish checklist

- **Easing:** remanso radius easeOutCubic over 2 s; close linear 0.5 s; sky crossfades easeInOutSine 6 s; weather ramps easeInOutSine 10 s; star flights easeInOutCubic along a quadratic Bezier (control point 35% of the way up, offset ± 0.1W); lift-off drain easeInQuad 1.5 s; text easeInOutSine; loss dim easeOutQuad; pad attack linear 1.2 s, release 30 ms.
- **Key-event screen effects:** SET → water-rect flash 'lighter' 0.12 → 0 in 0.6 s + expanding ring (r 0 → 0.3 Lmin, alpha 0.5 → 0, 1.2 s); LOST → sky −6% for 2 s, 60-mote grey puff; rim break → segment white for 2 frames + tick; open → 12 beads bloom 40 ms apart; close → 24 sparks (drag 0.9, 0.5 s life); stamping → glow sprite with 6 px jitter and a mote wake.
- **Particle counts:** motes 1500 (900 degraded); sparks ≤ 64; star flights ≤ 256; mist ≤ 400 at Dawn.
- **Idle:** the sea never stops (residual field, per-act weather); 60 s without progress → nudge; 120 s without input → the hand demonstrates; the cursor ring breathes (r 7 ± 1 px at 0.5 Hz); the ghost breathes at 0.2 Hz in calm water.
- **Rim:** counter-rotating dash at 90 px/s; strain colour per segment; beads as the clock; inner glow; sparks on close.
- **Motes:** inside a remanso stream backward at 1.5× in cyan-white; outside, alpha by speed; trails long in fast water, dots in calm water.
- **No hard edges anywhere:** every sprite is a radial gradient, every line ≥ 1.5 px, no alpha ever snaps, no `shadowBlur`.

---

## 10. Risk register

| # | Likely bug | Mitigation built from day one |
|---|---|---|
| 1 | NaN propagation in the fluid (confinement normalization by zero, huge splat, `0/0` in settle gain) | `+1e-6` in every normalization; `max(1e-4, ·)` in settle; velocity clamp 40; splat amplitude clamp; per-step NaN sentinel on the centre cell zeroes `u, v, u0, v0, p, div` and warns once |
| 2 | Resize to 0×0 or mid-frame resize | dirty flag applied at frame start; sizes floored at 1; gradients rebuilt in the same tick |
| 3 | Touch + mouse double events, stuck press | Pointer Events only; 500 ms mouse-after-touch guard; `pointercancel`, window `blur` and `visibilitychange` release all pointers |
| 4 | dt spikes / tab-hidden accumulation | 50 ms clamp, max 2 steps, accumulator discarded beyond 2 steps, loop stopped while hidden |
| 5 | GC spikes | zero allocation in step/render (pools, cached strings, reused ImageData); heap-growth acceptance test |
| 6 | Blur cost or missing `ctx.filter` | no `ctx.filter` at all: resampling-pyramid bloom |
| 7 | Audio autoplay / missing WebAudio / iOS silent switch | context created synchronously in the first gesture, resumed on every gesture; `audio.ok` no-op mode; the game is complete without sound |
| 8 | Retina fill-rate | pixel-budget scale; heavy layers at fixed resolution; ≤ 6 full-rect composites; no 'multiply' |
| 9 | Small screens / portrait | square-cell grid re-derived from the water aspect; radius floor 44 px; thresholds in CSS px; glyph extents relative to Lmin; text clamp |
| 10 | Ring-buffer semantics across freeze / restart / rung change | one `head` and one `count`; the cursor clamps to `min(window, count/20)`; restart and rung change set `count = 0`; a read with `count = 0` returns the current state (rewind does nothing rather than reading garbage) |
| 11 | 8-bit residue (grey mud) on the mote layer | `destination-out` 0.14/frame + 0.25 every 8th frame; fossil is never faded (it is meant to keep) |
| 12 | Coherence threshold unreachable at small grids | thresholds normalized by `cohStamp`; verified per rung by the bot |
| 13 | Weather herding all ink into a corner (unwinnable state) | free-slip walls + 3-cell damping band; nudge; settle works on any ink inside the circle |
| 14 | High-refresh displays (120/144 Hz) painting stale frames | render only after a sim step |

---

## 11. Acceptance criteria

1. Opens by double-click from `file://` in Chrome, Firefox, Safari and Edge; **zero console errors or warnings** in a scripted 3-minute random-input session (press/drag/hold sequences at 5–30 Hz, two pointers under touch emulation, a resize every 10 s, one visibility toggle).
2. **Performance:** in headless Chrome with SwiftShader at 1920×1080, p95 of (JS step + render issue) ≤ 2.2× the baseline of an empty frame consisting of one 2 Mpx `fillRect` and six full-rect `drawImage` composites, and the calibrated rung is logged; on an Intel Iris Xe-class laptop p95 frame time ≤ 16.7 ms at rung 0, or the ladder settles within 5 s and stays there.
3. **Memory:** JS heap growth < 10 MB between t = 30 s and t = 210 s (`performance.memory` where available, DevTools snapshots otherwise); total ≤ 64 MB.
4. **Layout:** playable and legible at 360×640 portrait, 768×1024, 1366×768, 1920×1080 (DPR 1 and 2) and 2560×1440; a remanso can always be opened with its rim fully visible at ≥ 44 px radius; text never clips.
5. **Arc completion by a scripted bot** (`window.__remansoBot`, exposed only when `location.hash` contains `bot`): it reads exposed state (glyph coherence, ghost centre, local speed), stirs counter to the local flow near the ghost for 2 s, then press-holds on the ghost centre. It must complete Acts 0–3 with ≥ 4 of 6 glyphs saved (bright or dim) within 12 minutes at every rung, never losing G1.
6. **Zero-instruction check:** 5 of 5 first-time mouse testers and 5 of 5 touch testers put the first constellation in the sky within 60 s without prompting.
7. **Determinism:** with `#seed=N` and a recorded input log, the final sky state is identical across runs on the same rung (weather, noise and IR use the seeded PRNG; `Math.random` is never called).
8. **Audio:** master never exceeds −6 dBFS (AnalyserNode in the bot harness); silence until the first gesture; `M` mutes within 50 ms; no click on pad release.
9. **Self-containment:** no network requests of any kind from `file://`; no fonts fetched; one `.html` under 120 KB.
10. **Size:** ≈ 1,400 lines; every constant lives in `CONST` with the initial values in this document, so tuning never touches a code path.

