/* =====================================================================
   SARSEN — camada de visualização
   SVG puro, sem dependências. Paleta categórica de ordem fixa,
   validada para a superfície escura #121316.
   ===================================================================== */

const NS = 'http://www.w3.org/2000/svg';

const PALETTE = ['#c98500', '#3987e5', '#199e70', '#9085e9', '#d55181'];
const SEQ = ['#0d366b', '#184f95', '#256abf', '#3987e5', '#6da7ec', '#9ec5f4', '#cde2fb'];
const UP = '#199e70', DOWN = '#d03b3b', BASE = '#d9a05b';
const GRID = '#1e2026', AXIS = '#6d727c', INK = '#f0ece4';

/* ------------------------------ formato ------------------------------ */
const F = {
  brl: (v) => 'R$ ' + Math.round(v).toLocaleString('pt-BR'),
  brl2: (v) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  compact(v) {
    const a = Math.abs(v), s = v < 0 ? '−' : '';
    if (a >= 1e9) return s + 'R$ ' + (a / 1e9).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' bi';
    if (a >= 1e6) return s + 'R$ ' + (a / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' mi';
    if (a >= 1e3) return s + 'R$ ' + (a / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + ' mil';
    return s + 'R$ ' + a.toLocaleString('pt-BR');
  },
  axisBRL(v) {
    const a = Math.abs(v), s = v < 0 ? '−' : '';
    if (a >= 1e6) return s + (a / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'M';
    if (a >= 1e3) return s + (a / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + 'k';
    return s + a;
  },
  int: (v) => Math.round(v).toLocaleString('pt-BR'),
  pct: (v, d = 1) => (v * 100).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }) + '%',
  pp: (v, d = 1) => (v >= 0 ? '+' : '−') + Math.abs(v * 100).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }) + ' p.p.',
  mult: (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'x',
};

/* ------------------------------ util svg ------------------------------ */
function n(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function txt(parent, x, y, s, o = {}) {
  const t = n('text', {
    x, y, fill: o.fill || AXIS, 'font-size': o.size || 10.5,
    'font-family': o.mono === false ? "'Archivo', system-ui, sans-serif" : "'JetBrains Mono', monospace",
    'text-anchor': o.anchor || 'start', 'font-weight': o.weight || 400,
    'letter-spacing': o.ls || 0, opacity: o.opacity,
  }, parent);
  t.textContent = s;
  return t;
}
function roundedTop(x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h));
  return `M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z`;
}
function roundedRight(x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w, h / 2));
  return `M${x},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} L${x},${y + h} Z`;
}
const _mc = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
function fit(str, max, font = "12px 'Archivo', system-ui, sans-serif") {
  if (!_mc || max <= 0) return str;
  _mc.font = font;
  if (_mc.measureText(str).width <= max) return str;
  let lo = 0, hi = str.length;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (_mc.measureText(str.slice(0, mid) + '…').width <= max) lo = mid; else hi = mid - 1; }
  return str.slice(0, Math.max(1, lo)).trimEnd() + '…';
}

function niceTicks(min, max, count = 4) {
  const span = (max - min) || 1;
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm >= 7.5 ? 10 : norm >= 3.5 ? 5 : norm >= 1.5 ? 2 : 1) * mag;
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
  const out = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(+v.toFixed(6));
  return out;
}

/* ------------------------------ tooltip ------------------------------ */
let tipEl;
function tip() {
  if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'tip'; document.body.appendChild(tipEl); }
  return tipEl;
}
function showTip(html, ev) {
  const t = tip();
  t.innerHTML = html;
  t.dataset.show = '1';
  const r = t.getBoundingClientRect();
  let x = ev.clientX + 16, y = ev.clientY - r.height / 2;
  if (x + r.width > innerWidth - 10) x = ev.clientX - r.width - 16;
  y = Math.max(10, Math.min(y, innerHeight - r.height - 10));
  t.style.left = x + 'px'; t.style.top = y + 'px';
}
function hideTip() { if (tipEl) tipEl.dataset.show = '0'; }
function tipRows(title, rows, note) {
  return `<div class="tip__title">${title}</div>` +
    rows.map(r => `<div class="tip__row"><span class="tip__key">${r.color ? `<span class="legend__swatch" style="background:${r.color}"></span>` : ''}${r.k}</span><span class="tip__val">${r.v}</span></div>`).join('') +
    (note ? `<div class="tip__note">${note}</div>` : '');
}
addEventListener('scroll', hideTip, true);

/* ------------------------- montagem responsiva ------------------------- */
const mounted = [];
function mount(node, draw, ratio) {
  const render = () => {
    if (!node.isConnected) return;
    const w = node.clientWidth || node.parentElement.clientWidth || 600;
    if (!w) return;
    node.innerHTML = '';
    const h = typeof ratio === 'function' ? ratio(w) : ratio;
    const svg = n('svg', { viewBox: `0 0 ${w} ${h}`, width: w, height: h, role: 'img' }, node);
    draw(svg, w, h);
  };
  render();
  mounted.push({ node, render });
}
function liveCharts() {
  for (let i = mounted.length - 1; i >= 0; i--) if (!mounted[i].node.isConnected) mounted.splice(i, 1);
  return mounted;
}
let rTimer;
addEventListener('resize', () => { clearTimeout(rTimer); rTimer = setTimeout(() => liveCharts().forEach(m => m.render()), 140); });
function redrawAll() { liveCharts().forEach(m => m.render()); }

/* ============================== SPARKLINE ============================== */
function sparkline(node, values, color = BASE) {
  mount(node, (svg, w, h) => {
    const min = Math.min(...values), max = Math.max(...values), pad = 3;
    const X = i => (i / (values.length - 1)) * w;
    const Y = v => h - pad - ((v - min) / ((max - min) || 1)) * (h - pad * 2);
    const line = values.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
    const gid = 'sg' + Math.random().toString(36).slice(2, 8);
    const g = n('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, n('defs', {}, svg));
    n('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': .28 }, g);
    n('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': 0 }, g);
    n('path', { d: `${line} L${w},${h} L0,${h} Z`, fill: `url(#${gid})` }, svg);
    n('path', { d: line, fill: 'none', stroke: color, 'stroke-width': 1.75, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
    n('circle', { cx: X(values.length - 1), cy: Y(values.at(-1)), r: 2.6, fill: color, stroke: '#121316', 'stroke-width': 2 }, svg);
  }, 34);
}

/* ========================= LINHA / ÁREA + CROSSHAIR ========================= */
function lineChart(node, cfg) {
  const { labels, series, fmt = F.compact, height = 260 } = cfg;
  mount(node, (svg, w) => {
    const h = height, P = { l: 52, r: 14, t: 16, b: 26 };
    const iw = w - P.l - P.r, ih = h - P.t - P.b;
    const all = series.flatMap(s => s.values);
    const ticks = niceTicks(cfg.min !== undefined ? cfg.min : Math.min(...all) * .92, Math.max(...all), 4);
    const lo = ticks[0], hi = ticks.at(-1);
    const X = i => P.l + (labels.length === 1 ? iw / 2 : (i / (labels.length - 1)) * iw);
    const Y = v => P.t + ih - ((v - lo) / ((hi - lo) || 1)) * ih;

    ticks.forEach(t => {
      n('line', { x1: P.l, x2: w - P.r, y1: Y(t), y2: Y(t), stroke: GRID, 'stroke-width': 1 }, svg);
      txt(svg, P.l - 9, Y(t) + 3.5, cfg.yFmt ? cfg.yFmt(t) : F.axisBRL(t), { anchor: 'end', size: 9.5, fill: '#5c616b' });
    });

    const defs = n('defs', {}, svg);
    series.forEach((s, si) => {
      const color = s.color || PALETTE[si];
      const d = s.values.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
      if (s.area !== false) {
        const gid = 'lg' + si + Math.random().toString(36).slice(2, 7);
        const g = n('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
        n('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': s.fill ?? .2 }, g);
        n('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': 0 }, g);
        n('path', { d: `${d} L${X(labels.length - 1)},${P.t + ih} L${P.l},${P.t + ih} Z`, fill: `url(#${gid})` }, svg);
      }
      n('path', { d, fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': s.dashed ? '5 4' : null }, svg);
      n('circle', { cx: X(s.values.length - 1), cy: Y(s.values.at(-1)), r: 4, fill: color, stroke: '#121316', 'stroke-width': 2 }, svg);
    });

    const every = Math.max(1, Math.ceil(labels.length / Math.max(3, Math.floor(iw / 58))));
    labels.forEach((l, i) => {
      if (i % every && i !== labels.length - 1) return;
      txt(svg, X(i), h - 7, l, { anchor: 'middle', size: 9.5, fill: '#5c616b' });
    });

    /* crosshair */
    const cross = n('g', { opacity: 0 }, svg);
    const cline = n('line', { y1: P.t, y2: P.t + ih, stroke: '#4a4e57', 'stroke-width': 1, 'stroke-dasharray': '3 3' }, cross);
    const dots = series.map((s, si) => n('circle', { r: 4.5, fill: s.color || PALETTE[si], stroke: '#0a0a0c', 'stroke-width': 2 }, cross));
    const hit = n('rect', { x: P.l, y: P.t, width: iw, height: ih, fill: 'transparent', class: 'chart__hit' }, svg);
    hit.addEventListener('pointermove', ev => {
      const box = svg.getBoundingClientRect();
      const rel = (ev.clientX - box.left) * (w / box.width);
      const i = Math.max(0, Math.min(labels.length - 1, Math.round(((rel - P.l) / iw) * (labels.length - 1))));
      cross.setAttribute('opacity', 1);
      cline.setAttribute('x1', X(i)); cline.setAttribute('x2', X(i));
      series.forEach((s, si) => { dots[si].setAttribute('cx', X(i)); dots[si].setAttribute('cy', Y(s.values[i])); });
      showTip(tipRows(labels[i], series.map((s, si) => ({ k: s.name, v: (s.fmt || fmt)(s.values[i]), color: s.color || PALETTE[si] }))), ev);
    });
    hit.addEventListener('pointerleave', () => { cross.setAttribute('opacity', 0); hideTip(); });
  }, height);
}

/* =============================== BARRAS =============================== */
function barChart(node, cfg) {
  const { labels, series, stacked = false, fmt = F.compact, height = 260 } = cfg;
  mount(node, (svg, w) => {
    const h = height, P = { l: 52, r: 14, t: 16, b: 26 };
    const iw = w - P.l - P.r, ih = h - P.t - P.b;
    const totals = labels.map((_, i) => stacked ? series.reduce((s, x) => s + x.values[i], 0) : Math.max(...series.map(x => x.values[i])));
    const ticks = niceTicks(0, Math.max(...totals), 4);
    const hi = ticks.at(-1);
    const Y = v => P.t + ih - (v / hi) * ih;
    const slot = iw / labels.length;
    const bw = Math.min(stacked ? 34 : 46, slot * .68);

    ticks.forEach(t => {
      n('line', { x1: P.l, x2: w - P.r, y1: Y(t), y2: Y(t), stroke: GRID }, svg);
      txt(svg, P.l - 9, Y(t) + 3.5, cfg.yFmt ? cfg.yFmt(t) : F.axisBRL(t), { anchor: 'end', size: 9.5, fill: '#5c616b' });
    });

    labels.forEach((lab, i) => {
      const cx = P.l + slot * i + slot / 2;
      if (stacked) {
        let acc = 0;
        series.forEach((s, si) => {
          const v = s.values[i], y0 = Y(acc + v), y1 = Y(acc);
          const hgt = Math.max(0, y1 - y0 - (si ? 2 : 0));       /* espaçador de 2px entre segmentos */
          const top = si === series.length - 1;
          const x = cx - bw / 2;
          const p = n('path', { d: top ? roundedTop(x, y0, bw, hgt, 4) : `M${x},${y0} h${bw} v${hgt} h${-bw} Z`, fill: s.color || PALETTE[si] }, svg);
          p.style.cursor = 'pointer';
          p.addEventListener('pointermove', ev => showTip(tipRows(lab, series.map((ss, k) => ({ k: ss.name, v: (ss.fmt || fmt)(ss.values[i]), color: ss.color || PALETTE[k] }))), ev));
          p.addEventListener('pointerleave', hideTip);
          acc += v;
        });
      } else {
        const gw = bw / series.length;
        series.forEach((s, si) => {
          const v = s.values[i], y = Y(v);
          const x = cx - bw / 2 + gw * si + (si ? 1 : 0);
          const p = n('path', { d: roundedTop(x, y, gw - (series.length > 1 ? 2 : 0), P.t + ih - y, 4), fill: s.color || PALETTE[si] }, svg);
          p.style.cursor = 'pointer';
          p.addEventListener('pointermove', ev => showTip(tipRows(lab, series.map((ss, k) => ({ k: ss.name, v: (ss.fmt || fmt)(ss.values[i]), color: ss.color || PALETTE[k] }))), ev));
          p.addEventListener('pointerleave', hideTip);
        });
      }
      const every = Math.max(1, Math.ceil(labels.length / Math.max(3, Math.floor(iw / 52))));
      if (i % every === 0 || i === labels.length - 1) txt(svg, cx, h - 7, lab, { anchor: 'middle', size: 9.5, fill: '#5c616b' });
    });
    n('line', { x1: P.l, x2: w - P.r, y1: P.t + ih, y2: P.t + ih, stroke: '#2c313a' }, svg);
  }, height);
}

/* ========================= BARRAS HORIZONTAIS ========================= */
function hBars(node, cfg) {
  const { items, fmt = F.compact, color, rowH = 34, ramp, ref } = cfg;
  mount(node, (svg, w) => {
    const max = Math.max(...items.map(d => d.value), ref ? ref.value : 0);
    const labelW = Math.min(cfg.labelW || 168, Math.round(w * 0.46));
    const valW = Math.min(120, Math.max(...items.map(d => _mc ? (_mc.font = "12px 'JetBrains Mono', monospace", _mc.measureText(fmt(d.value)).width) : 70)) + 12);
    const trackX = labelW, trackW = Math.max(40, w - labelW - valW);
    items.forEach((d, i) => {
      const y = i * rowH + 8, bh = 15;
      const lab = txt(svg, 0, y + bh - 3, fit(d.label, labelW - 12), { size: 12, fill: '#a3a7b0', mono: false });
      if (lab.textContent !== d.label) { const t = n('title', {}, lab); t.textContent = d.label; }
      n('rect', { x: trackX, y, width: trackW, height: bh, rx: 2, fill: '#1a1c21' }, svg);
      const bw = Math.max(3, (d.value / max) * trackW);
      const fill = d.color || (ramp ? SEQ[Math.min(SEQ.length - 1, 6 - i)] : color || PALETTE[1]);
      const p = n('path', { d: roundedRight(trackX, y, bw, bh, 4), fill }, svg);
      p.style.cursor = 'pointer';
      p.addEventListener('pointermove', ev => showTip(tipRows(d.label, [{ k: cfg.metric || 'Valor', v: fmt(d.value), color: fill }, ...(d.extra || [])], d.note), ev));
      p.addEventListener('pointerleave', hideTip);
      txt(svg, w, y + bh - 3, fmt(d.value), { anchor: 'end', size: 11.5, fill: INK });
    });
    if (ref) {
      const rx = trackX + (ref.value / max) * trackW;
      n('line', { x1: rx, x2: rx, y1: 2, y2: items.length * rowH + 2, stroke: '#a3a7b0', 'stroke-width': 1, 'stroke-dasharray': '3 3' }, svg);
      txt(svg, rx, items.length * rowH + 14, ref.label, { anchor: rx > w * .6 ? 'end' : 'start', size: 10, fill: '#a3a7b0' });
    }
  }, () => items.length * rowH + 14 + (ref ? 14 : 0));
}

/* ============================== CASCATA ============================== */
function waterfall(node, cfg) {
  const { items, fmt = F.compact, height = 300 } = cfg;
  mount(node, (svg, w) => {
    const h = height, slotW = (w - 66) / items.length, rot = slotW < 88;
    const P = { l: 52, r: 14, t: 22, b: rot ? 78 : 46 };
    const iw = w - P.l - P.r, ih = h - P.t - P.b;
    let acc = 0; const spans = [];
    items.forEach(it => {
      if (it.tipo === 'base' || it.tipo === 'total') { spans.push({ ...it, from: 0, to: it.valor }); acc = it.valor; }
      else { spans.push({ ...it, from: acc, to: acc + it.valor }); acc += it.valor; }
    });
    const hi = niceTicks(0, Math.max(...spans.map(s => Math.max(s.from, s.to))), 4).at(-1);
    const Y = v => P.t + ih - (v / hi) * ih;
    niceTicks(0, hi, 4).forEach(t => {
      n('line', { x1: P.l, x2: w - P.r, y1: Y(t), y2: Y(t), stroke: GRID }, svg);
      txt(svg, P.l - 9, Y(t) + 3.5, F.axisBRL(t), { anchor: 'end', size: 9.5, fill: '#5c616b' });
    });
    const slot = iw / spans.length, bw = Math.min(46, slot * .62);
    spans.forEach((s, i) => {
      const x = P.l + slot * i + (slot - bw) / 2;
      const y0 = Y(Math.max(s.from, s.to)), y1 = Y(Math.min(s.from, s.to));
      const fill = s.tipo === 'base' ? '#4a4e57' : s.tipo === 'total' ? BASE : s.valor >= 0 ? UP : DOWN;
      const p = n('path', { d: roundedTop(x, y0, bw, Math.max(2, y1 - y0), 4), fill }, svg);
      p.style.cursor = 'pointer';
      p.addEventListener('pointermove', ev => showTip(tipRows(s.label, [{ k: s.tipo === 'base' || s.tipo === 'total' ? 'Saldo' : 'Variação', v: (s.tipo === 'base' || s.tipo === 'total' ? '' : s.valor > 0 ? '+' : '') + fmt(s.valor), color: fill }], s.nota), ev));
      p.addEventListener('pointerleave', hideTip);
      if (i < spans.length - 1 && s.tipo !== 'total') {
        const yEnd = Y(s.to);
        n('line', { x1: x + bw, x2: P.l + slot * (i + 1) + (slot - bw) / 2, y1: yEnd, y2: yEnd, stroke: '#4a4e57', 'stroke-width': 1, 'stroke-dasharray': '3 3' }, svg);
      }
      txt(svg, x + bw / 2, y0 - 7, (s.tipo === 'base' || s.tipo === 'total' ? '' : s.valor > 0 ? '+' : '−') + F.axisBRL(Math.abs(s.tipo === 'base' || s.tipo === 'total' ? s.to : s.valor)),
        { anchor: 'middle', size: 10, fill: s.tipo === 'total' ? BASE : INK, weight: 500 });
      const nome = s.curto || s.label;
      if (rot) {
        const t = txt(svg, x + bw / 2, P.t + ih + 14, fit(nome, 92, "9.5px 'JetBrains Mono', monospace"), { anchor: 'end', size: 9.5, fill: '#5c616b' });
        t.setAttribute('transform', `rotate(-34 ${x + bw / 2} ${P.t + ih + 14})`);
        const ttl = n('title', {}, t); ttl.textContent = s.label;
      } else {
        const words = nome.split(' ');
        const lines = words.length > 2 ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : [nome];
        lines.forEach((ln, li) => txt(svg, x + bw / 2, P.t + ih + 16 + li * 11, fit(ln, slot - 4, "9.5px 'JetBrains Mono', monospace"), { anchor: 'middle', size: 9.5, fill: '#5c616b' }));
      }
    });
    n('line', { x1: P.l, x2: w - P.r, y1: P.t + ih, y2: P.t + ih, stroke: '#2c313a' }, svg);
  }, height);
}

/* =============================== FUNIL =============================== */
function funnel(node, cfg) {
  const { stages, rowH = 46 } = cfg;
  mount(node, (svg, w) => {
    const max = stages[0].valor, labelW = Math.min(156, Math.round(w * 0.4)), trackW = Math.max(60, w - labelW - 104);
    stages.forEach((s, i) => {
      const y = i * rowH + 6, bh = 22;
      txt(svg, 0, y + 15, fit(s.etapa, labelW - 12), { size: 12, fill: '#a3a7b0', mono: false });
      n('rect', { x: labelW, y, width: trackW, height: bh, rx: 2, fill: '#1a1c21' }, svg);
      const bw = Math.max(4, (s.valor / max) * trackW);
      const fill = SEQ[Math.max(1, 6 - i)];
      const p = n('path', { d: roundedRight(labelW, y, bw, bh, 4), fill }, svg);
      p.style.cursor = 'pointer';
      const conv = i ? s.valor / stages[i - 1].valor : 1;
      p.addEventListener('pointermove', ev => showTip(tipRows(s.etapa, [
        { k: 'Volume', v: F.int(s.valor), color: fill },
        ...(i ? [{ k: 'Conversão da etapa', v: F.pct(conv, 1) }] : []),
        { k: 'Do topo', v: F.pct(s.valor / max, 2) },
      ]), ev));
      p.addEventListener('pointerleave', hideTip);
      txt(svg, labelW + trackW + 10, y + 15, F.int(s.valor), { size: 12, fill: INK });
      if (i) txt(svg, w, y + 15, F.pct(conv, 1), { anchor: 'end', size: 10.5, fill: conv > .5 ? '#4ec48d' : '#a3a7b0' });
    });
  }, () => stages.length * rowH + 8);
}

/* ============================== HEATMAP ============================== */
function heatmap(node, cfg) {
  const { rows, cols, cellH = 30, labelW = 62 } = cfg;
  mount(node, (svg, w) => {
    const gap = 3, cw = (w - labelW - gap * (cols.length - 1)) / cols.length;
    const all = rows.flatMap(r => r.valores);
    const lo = Math.min(...all), hi = Math.max(...all);
    cols.forEach((c, j) => txt(svg, labelW + j * (cw + gap) + cw / 2, 12, c, { anchor: 'middle', size: 9.5, fill: '#5c616b' }));
    rows.forEach((r, i) => {
      const y = 22 + i * (cellH + gap);
      txt(svg, 0, y + cellH / 2 + 4, r.nome, { size: 10.5, fill: '#a3a7b0' });
      r.valores.forEach((v, j) => {
        const t = (v - lo) / ((hi - lo) || 1);
        const fill = SEQ[Math.min(SEQ.length - 1, Math.max(0, Math.round(t * 5) + 1))];
        const rect = n('rect', { x: labelW + j * (cw + gap), y, width: cw, height: cellH, rx: 2, fill }, svg);
        rect.style.cursor = 'pointer';
        rect.addEventListener('pointermove', ev => showTip(tipRows(`Safra ${r.nome} · ${cols[j]}`, [{ k: 'Receita retida', v: v + '%', color: fill }], j ? `Variação sobre a safra original: ${v - 100 >= 0 ? '+' : '−'}${Math.abs(v - 100)} p.p.` : 'Mês de entrada da safra'), ev));
        rect.addEventListener('pointerleave', hideTip);
        txt(svg, labelW + j * (cw + gap) + cw / 2, y + cellH / 2 + 4, v, { anchor: 'middle', size: 10.5, fill: t > .55 ? '#0b1220' : '#dfe6f2', weight: 500 });
      });
    });
  }, () => rows.length * 33 + 26);
}

/* =============================== ROSCA =============================== */
function donut(node, cfg) {
  const { items, fmt = F.compact, centro, centroLabel, height = 210 } = cfg;
  mount(node, (svg, w) => {
    const h = height, cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 8, r = R * .62;
    const total = items.reduce((s, d) => s + d.value, 0);
    let a0 = -Math.PI / 2;
    items.forEach((d, i) => {
      const sweep = (d.value / total) * Math.PI * 2;
      const a1 = a0 + sweep - .022;   /* espaçador de superfície entre fatias */
      const P = (ang, rad) => [cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad];
      const [x0, y0] = P(a0, R), [x1, y1] = P(a1, R), [x2, y2] = P(a1, r), [x3, y3] = P(a0, r);
      const big = sweep > Math.PI ? 1 : 0;
      const fill = d.color || PALETTE[i % PALETTE.length];
      const p = n('path', { d: `M${x0},${y0} A${R},${R} 0 ${big} 1 ${x1},${y1} L${x2},${y2} A${r},${r} 0 ${big} 0 ${x3},${y3} Z`, fill }, svg);
      p.style.cursor = 'pointer';
      p.addEventListener('pointermove', ev => showTip(tipRows(d.label, [{ k: 'Valor', v: fmt(d.value), color: fill }, { k: 'Participação', v: F.pct(d.value / total, 1) }, ...(d.extra || [])]), ev));
      p.addEventListener('pointerleave', hideTip);
      a0 += sweep;
    });
    txt(svg, cx, cy - 2, centro, { anchor: 'middle', size: 19, fill: INK, weight: 600 });
    txt(svg, cx, cy + 14, centroLabel, { anchor: 'middle', size: 9.5, fill: '#5c616b', ls: '.08em' });
  }, height);
}

/* =========================== MEDIDOR DE META =========================== */
function gaugeRow(atual, alvo, inverso) {
  const p = inverso ? Math.min(1, alvo / atual) : Math.min(1, atual / alvo);
  return { pct: p, cls: p >= .95 ? 'meter__fill--good' : p >= .8 ? '' : 'meter__fill--warn' };
}

if (typeof window !== 'undefined') Object.assign(window, { F, PALETTE, SEQ, sparkline, lineChart, barChart, hBars, waterfall, funnel, heatmap, donut, gaugeRow, redrawAll });
