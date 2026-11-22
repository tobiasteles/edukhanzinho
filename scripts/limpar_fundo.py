#!/usr/bin/env python3
"""Remove o fundo "quadriculado falso" (branco + cinza-claro) que veio gravado dentro de PNGs.

NÃO altera os originais: grava as versões limpas em outra pasta. Precisa do Pillow: python -m pip install pillow

Uso:
  python scripts/limpar_fundo.py --entrada public/imageSrc/letras --saida public/imageSrc/letras_limpas
Depois rode o gerador: ele usa a pasta letras_limpas automaticamente quando ela existe.
"""
import argparse, sys
from collections import Counter, deque
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Falta o Pillow. Rode:  python -m pip install pillow")

NEIGH = ((1, 0), (-1, 0), (0, 1), (0, -1))


def is_light(p):  # quase branco/cinza muito claro e sem cor
    r, g, b = p[:3]
    return min(r, g, b) >= 236 and max(r, g, b) - min(r, g, b) <= 10


def close(p, c, tol=5):
    return all(abs(p[i] - c[i]) <= tol for i in range(3))


def clean(im):
    im = im.convert("RGBA"); w, h = im.size; px = im.load()
    cand = [[px[x, y][3] > 0 and is_light(px[x, y]) for x in range(w)] for y in range(h)]
    bg = [[False] * w for _ in range(h)]
    dq = deque((x, y) for y in range(h) for x in range(w) if (x in (0, w - 1) or y in (0, h - 1)) and cand[y][x])
    for x, y in dq: bg[y][x] = True
    while dq:  # 1) fundo ligado às bordas
        x, y = dq.popleft()
        for dx, dy in NEIGH:
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and cand[ny][nx] and not bg[ny][nx]:
                bg[ny][nx] = True; dq.append((nx, ny))
    colors = Counter(px[x, y][:3] for y in range(h) for x in range(w) if bg[y][x]).most_common(2)
    if len(colors) == 2:  # 2) quadriculado "preso" dentro da letra (buracos do O, A, B...)
        c1, c2 = colors[0][0], colors[1][0]; seen = [[False] * w for _ in range(h)]
        for sy in range(h):
            for sx in range(w):
                if not cand[sy][sx] or bg[sy][sx] or seen[sy][sx]: continue
                comp, dq = [], deque([(sx, sy)]); seen[sy][sx] = True
                while dq:
                    x, y = dq.popleft(); comp.append((x, y))
                    for dx, dy in NEIGH:
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h and cand[ny][nx] and not bg[ny][nx] and not seen[ny][nx]:
                            seen[ny][nx] = True; dq.append((nx, ny))
                n1 = sum(close(px[x, y], c1) for x, y in comp); n2 = sum(close(px[x, y], c2) for x, y in comp)
                if len(comp) >= 150 and (n1 + n2) >= 0.85 * len(comp) and min(n1, n2) >= 0.15 * len(comp):
                    for x, y in comp: bg[y][x] = True
    for y in range(h):
        for x in range(w):
            if bg[y][x]: px[x, y] = (255, 255, 255, 0)
    return im, sum(bg[y][x] for y in range(h) for x in range(w)) / (w * h)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--entrada", required=True); ap.add_argument("--saida", required=True)
    a = ap.parse_args()
    src, dst = Path(a.entrada), Path(a.saida)
    files = sorted(src.glob("*.png"))
    if not files: sys.exit(f"Nenhum PNG em {src}")
    dst.mkdir(parents=True, exist_ok=True)
    for f in files:
        im, frac = clean(Image.open(f))
        im.save(dst / f.name, optimize=True)
        print(f"{f.name}: {frac:.0%} do fundo removido")
    print(f"Pronto: {len(files)} imagens em {dst} (originais intactos).")


if __name__ == "__main__":
    main()
