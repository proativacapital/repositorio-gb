#!/usr/bin/env python3
"""Empacota o console em um único arquivo HTML autocontido.

Uso: python3 build-single-file.py [destino.html]
O arquivo gerado não inclui <!doctype>, <html>, <head> ou <body> — ele é
consumido pelo publicador de Artifacts, que envolve o conteúdo.
"""
import re, sys, pathlib

base = pathlib.Path(__file__).parent
dest = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else base / 'dist' / 'sarsen-console.html')
dest.parent.mkdir(parents=True, exist_ok=True)

html = (base / 'index.html').read_text(encoding='utf-8')
css = (base / 'css' / 'console.css').read_text(encoding='utf-8')
js = '\n'.join((base / 'js' / f).read_text(encoding='utf-8') for f in ('data.js', 'charts.js', 'app.js'))

body = re.search(r'<body>(.*)</body>', html, re.S).group(1)
body = re.sub(r'<script src=[^>]*></script>\s*', '', body)

fonts = re.search(r'<link href="https://fonts\.googleapis[^>]*>', html).group(0)

out = f'''<title>Sarsen Console</title>
<meta name="description" content="Console de performance da Sarsen — resultado, receita recorrente, retenção, aquisição, produto e plano estratégico. Números ilustrativos.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
{fonts}
<style>
{css}
</style>
{body.strip()}
<script>
{js}
</script>
'''
dest.write_text(out, encoding='utf-8')
print(f'{dest} · {len(out) / 1024:.0f} KB')
