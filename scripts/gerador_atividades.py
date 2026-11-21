#!/usr/bin/env python3
"""Gerador determinístico (sem IA) de atividades de alfabetização.

Escaneia public/ (figuras, letras, frases e áudios), monta o curso
"Edukhanzinho Alfabetização" e grava um JSON pronto para o banco
(depois: npm run db:seed:gerado). Mesma entrada + mesma --seed = mesmo resultado.

Uso:  python scripts/gerador_atividades.py [--public public] [--out scripts/generated/curso-alfabetizacao.json] [--seed 7]
"""
import argparse, json, random, re, sys, unicodedata
from pathlib import Path

COURSE_ID, COURSE_TITLE, COURSE_IMG = 100, "Edukhanzinho Alfabetização", "/simbolo-5.jpg"

# arquivo (sem .png) -> (texto exibido, sílabas ou None). Arquivos novos entram sozinhos (sem sílabas).
WORDS = {
    "abacaxi": ("ABACAXI", ["A", "BA", "CA", "XI"]), "abelha": ("ABELHA", ["A", "BE", "LHA"]),
    "aviao": ("AVIÃO", ["A", "VI", "ÃO"]), "banana": ("BANANA", ["BA", "NA", "NA"]),
    "bola": ("BOLA", ["BO", "LA"]), "casa": ("CASA", ["CA", "SA"]), "dado": ("DADO", ["DA", "DO"]),
    "elefante": ("ELEFANTE", ["E", "LE", "FAN", "TE"]), "foca": ("FOCA", ["FO", "CA"]),
    "gato": ("GATO", ["GA", "TO"]), "hipopotamo": ("HIPOPÓTAMO", ["HI", "PO", "PÓ", "TA", "MO"]),
    "iguana": ("IGUANA", ["I", "GUA", "NA"]), "janela": ("JANELA", ["JA", "NE", "LA"]),
    "ketchup": ("KETCHUP", None), "leao": ("LEÃO", ["LE", "ÃO"]), "livro": ("LIVRO", ["LI", "VRO"]),
    "maca": ("MAÇÃ", ["MA", "ÇÃ"]), "navio": ("NAVIO", ["NA", "VI", "O"]), "oculos": ("ÓCULOS", ["Ó", "CU", "LOS"]),
    "pato": ("PATO", ["PA", "TO"]), "queijo": ("QUEIJO", ["QUEI", "JO"]), "rato": ("RATO", ["RA", "TO"]),
    "sapo": ("SAPO", ["SA", "PO"]), "tigre": ("TIGRE", ["TI", "GRE"]), "urso": ("URSO", ["UR", "SO"]),
    "vaca": ("VACA", ["VA", "CA"]), "vaso": ("VASO", ["VA", "SO"]), "wifi": ("WI-FI", ["WI", "FI"]),
    "xicara": ("XÍCARA", ["XÍ", "CA", "RA"]), "zebra": ("ZEBRA", ["ZE", "BRA"]),
}
SKIP_WORDS = {"yakult"}  # marca comercial: fora dos exercícios

# arquivo de frase -> frase correta (acentos não dá para adivinhar pelo nome do arquivo)
PHRASES = {
    "a_abelha_voa": "A abelha voa.", "a_arvore_e_verde": "A árvore é verde.", "a_bola_e_azul": "A bola é azul.",
    "a_estrela_brilha": "A estrela brilha.", "a_flor_e_rosa": "A flor é rosa.", "a_lua_e_amarela": "A lua é amarela.",
    "a_maca_e_vermelha": "A maçã é vermelha.", "a_nuvem_e_branca": "A nuvem é branca.",
    "o_cachorro_late": "O cachorro late.", "o_coelho_pula": "O coelho pula.", "o_gato_dorme": "O gato dorme.",
    "o_passaro_canta": "O pássaro canta.", "o_pato_nada": "O pato nada.", "o_peixe_nada": "O peixe nada.",
    "o_sol_brilha": "O sol brilha.",
}

# letras que as crianças mais confundem (usadas como distratores "inteligentes")
CONFUSABLE = [set("BDPQ"), set("MN"), set("FV"), set("CGK"), set("SZX"), set("TD"), set("LR"), set("AEIOU"), set("UV"), set("IJ")]
VOWELS, ALPHABET = "AEIOU", [chr(c) for c in range(65, 91)]
LETTER_GROUPS = ["AEIOU", "BCDF", "GJLM", "NPQR", "STVX", "ZKWY"]


def norm(s):  # sem acento, minúsculo, só a-z0-9_
    s = unicodedata.normalize("NFD", s)
    return re.sub(r"[^a-z0-9_]", "", "".join(c for c in s if unicodedata.category(c) != "Mn").lower())


def base_letter(word):
    return norm(word)[:1].upper()


def scan(public: Path):
    img = public / "imageSrc"
    words = {p.stem: f"/imageSrc/{p.name}" for p in sorted(img.glob("*.png")) if p.stem not in SKIP_WORDS}
    letters = {p.stem[-1].upper(): f"/imageSrc/letras/{p.name}" for p in sorted((img / "letras").glob("letra_*.png"))}
    phrases = {p.stem: f"/imageSrc/frases/{p.name}" for p in sorted((img / "frases").glob("*.png"))}
    audio = {}
    for p in sorted(list(public.glob("*.mp3")) + list((public / "audioSrc").rglob("*.mp3"))):
        key = re.sub(r"^(letra|som|audio|palavra)_", "", norm(p.stem))
        audio.setdefault(key, "/" + p.relative_to(public).as_posix())
    return words, letters, phrases, audio


class Builder:
    def __init__(self, seed):
        self.seed, self.units, self.lessons, self.challenges, self.options = seed, [], [], [], []
        self.signatures, self.skipped = set(), 0

    def rng(self, key):
        return random.Random(f"{self.seed}|{key}")

    def unit(self, title, desc):
        uid = 101 + len(self.units)
        self.units.append({"id": uid, "courseId": COURSE_ID, "title": title, "description": desc, "order": len(self.units) + 1})
        return uid

    def lesson(self, uid, title):
        n = 1 + sum(1 for l in self.lessons if l["unitId"] == uid)
        lid = uid * 100 + n
        self.lessons.append({"id": lid, "unitId": uid, "title": title, "order": n})
        return lid

    def challenge(self, lid, ctype, question, opts):
        """opts: lista de dicts text/imageSrc/audioSrc/correct. Ignora duplicatas e desafios inválidos."""
        sig = (ctype, question, tuple(sorted((o["text"], o.get("imageSrc") or "") for o in opts)))
        if sig in self.signatures or sum(o["correct"] for o in opts) != 1 or len(opts) < 2:
            self.skipped += 1
            return
        self.signatures.add(sig)
        order = 1 + sum(1 for c in self.challenges if c["lessonId"] == lid)
        cid = lid * 100 + order
        self.challenges.append({"id": cid, "lessonId": lid, "type": ctype, "question": question, "order": order})
        for k, o in enumerate(opts, 1):
            self.options.append({"id": cid * 10 + k, "challengeId": cid, "text": o["text"], "correct": o["correct"],
                                 "imageSrc": o.get("imageSrc"), "audioSrc": o.get("audioSrc")})


def pick_letters(rng, target, n=3):
    """target + (n-1) distratores: primeiro letras parecidas, depois aleatórias."""
    near = sorted(set().union(*[g for g in CONFUSABLE if target in g]) - {target})
    rng.shuffle(near)
    rest = [c for c in ALPHABET if c != target and c not in near]
    rng.shuffle(rest)
    return [target] + (near + rest)[: n - 1]


def chunks(items, size):
    return [items[i:i + size] for i in range(0, len(items), size)]


def build(public: Path, seed: int):
    words, letters, phrases, audio = scan(public)
    b = Builder(seed)
    info = {k: WORDS.get(k, (k.upper(), None)) for k in words}
    by_letter = {}
    for k, (txt, _) in info.items():
        by_letter.setdefault(base_letter(txt), []).append(k)

    def letter_opt(c, correct):
        return {"text": c, "correct": correct, "imageSrc": letters.get(c), "audioSrc": audio.get(c.lower())}

    # ---- Unidade 1: letras
    u = b.unit("Unidade 1: Conhecendo as Letras", "Descubra as letras do alfabeto, ouça o som de cada uma e ache a letra inicial das palavras.")
    for group in LETTER_GROUPS:
        lid = b.lesson(u, "Letras " + " ".join(group))
        items = []
        for c in group:
            if c in letters:
                items.append(("id", c))
            if c in by_letter:
                items.append(("ini", c))
        r = b.rng(f"u1-{group}"); r.shuffle(items)
        for kind, c in items[:8]:
            rng = b.rng(f"u1-{kind}-{c}")
            opts = [letter_opt(x, x == c) for x in pick_letters(rng, c)]
            if kind == "id":
                rng.shuffle(opts); b.challenge(lid, "SELECT", f"Toque na letra {c}", opts)
            else:
                k = rng.choice(by_letter[c]); w = info[k][0]
                for o in opts: o["imageSrc"] = None
                rng.shuffle(opts); b.challenge(lid, "SELECT", f"Com qual letra começa a palavra {w}?", opts)

    # ---- Unidade 2: palavras e figuras
    u = b.unit("Unidade 2: Palavras e Figuras", "Leia a palavra e encontre a figura certa.")
    keys = sorted(words)
    b.rng("u2").shuffle(keys)
    for i, grp in enumerate(chunks(keys, 6), 1):
        lid = b.lesson(u, f"Figuras {i}")
        for k in grp:
            rng = b.rng(f"u2-{k}")
            far = [x for x in keys if x != k and base_letter(info[x][0]) != base_letter(info[k][0])]  # fáceis: inicial diferente
            rng.shuffle(far)
            opts = [{"text": "", "correct": x == k, "imageSrc": words[x], "audioSrc": audio.get(x)} for x in [k] + far[:2]]
            rng.shuffle(opts); b.challenge(lid, "SELECT", f"Toque na figura: {info[k][0]}", opts)

    # ---- Unidade 3: sílabas (só sílabas simples consoante+vogal)
    cv = re.compile(r"^[BCDFGJLMNPQRSTVXZ][AEIOU]$")
    syl_words = [(k, [i for i, s in enumerate(info[k][1]) if cv.match(s)]) for k in sorted(words) if info[k][1] and any(cv.match(s) for s in info[k][1])]
    u = b.unit("Unidade 3: Sílabas", "Junte as sílabas e complete as palavras.")
    for i, grp in enumerate(chunks(syl_words, 6), 1):
        lid = b.lesson(u, f"Sílabas {i}")
        for k, idxs in grp:
            rng = b.rng(f"u3-{k}"); syls = info[k][1]; j = rng.choice(idxs); t = syls[j]
            same_c = [t[0] + v for v in VOWELS if t[0] + v != t]; same_v = [c + t[1] for c in "BCDFGLMNPRSTV" if c + t[1] != t]
            rng.shuffle(same_c); rng.shuffle(same_v)
            wrong = [same_c[0], same_v[0]]
            shown = "-".join("__" if x == j else s for x, s in enumerate(syls))
            opts = [{"text": s, "correct": s == t, "audioSrc": None} for s in [t] + wrong]
            rng.shuffle(opts); b.challenge(lid, "SELECT", f"Que sílaba completa a palavra? {shown}", opts)

    # ---- Unidade 4: completar letra que falta (só palavras sem acento)
    plain = [k for k in sorted(words) if info[k][0] == norm(info[k][0]).upper() and any(c in VOWELS for c in info[k][0][1:])]
    u = b.unit("Unidade 4: Completando Palavras", "Descubra a letra que está faltando.")
    for i, grp in enumerate(chunks(plain, 6), 1):
        lid = b.lesson(u, f"Letra que falta {i}")
        for k in grp:
            rng = b.rng(f"u4-{k}"); w = info[k][0]
            j = rng.choice([x for x in range(1, len(w)) if w[x] in VOWELS]); t = w[j]
            wrong = [v for v in VOWELS if v != t]; rng.shuffle(wrong)
            opts = [letter_opt(c, c == t) for c in [t] + wrong[:2]]
            rng.shuffle(opts)
            b.challenge(lid, "SELECT", "Que letra falta? " + " ".join("_" if x == j else ch for x, ch in enumerate(w)), opts)

    # ---- Unidade 5: frases
    u = b.unit("Unidade 5: Frases", "Leia as frases e combine com os desenhos.")
    pk = sorted(k for k in phrases if k in PHRASES)
    b.rng("u5").shuffle(pk)
    for i, grp in enumerate(chunks(pk, 5), 1):
        lid = b.lesson(u, f"Frases {i}")
        for k in grp:  # frase -> desenho
            rng = b.rng(f"u5a-{k}"); others = [x for x in pk if x != k]; rng.shuffle(others)
            opts = [{"text": "", "correct": x == k, "imageSrc": phrases[x]} for x in [k] + others[:2]]
            rng.shuffle(opts); b.challenge(lid, "SELECT", f"Toque no desenho da frase: {PHRASES[k]}", opts)
    for i, grp in enumerate(chunks(pk, 5), 1):  # completar a frase
        lid = b.lesson(u, f"Completar frases {i}")
        for k in grp:
            rng = b.rng(f"u5b-{k}"); text = PHRASES[k]; head, last = text[:-1].rsplit(" ", 1)
            pool = sorted({PHRASES[x][:-1].rsplit(" ", 1)[1] for x in pk if (" é " in PHRASES[x]) == (" é " in text) and x != k} - {last})
            rng.shuffle(pool)
            opts = [{"text": w, "correct": w == last} for w in [last] + pool[:2]]
            rng.shuffle(opts); b.challenge(lid, "SELECT", f"Complete a frase: {head} ___.", opts)

    course = {"id": COURSE_ID, "title": COURSE_TITLE, "imageSrc": COURSE_IMG}
    lessons = [l for l in b.lessons if any(c["lessonId"] == l["id"] for c in b.challenges)]  # sem lições vazias
    units = [x for x in b.units if any(l["unitId"] == x["id"] for l in lessons)]
    stats = {"unidades": len(units), "licoes": len(lessons), "desafios": len(b.challenges), "opcoes": len(b.options),
             "ignorados_duplicados": b.skipped, "figuras": len(words), "letras": len(letters), "frases": len(pk),
             "audios_encontrados": len(audio), "palavras_sem_silabas": sorted(k for k, v in info.items() if not v[1])}
    return {"course": course, "units": units, "lessons": lessons, "challenges": b.challenges, "options": b.options, "stats": stats}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--public", default="public"); ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--out", default="scripts/generated/curso-alfabetizacao.json")
    a = ap.parse_args()
    public = Path(a.public)
    if not (public / "imageSrc").is_dir():
        sys.exit(f"Pasta {public}/imageSrc não encontrada. Rode a partir da raiz do projeto.")
    data = build(public, a.seed)
    out = Path(a.out); out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(data["stats"], ensure_ascii=False, indent=2)); print(f"Gerado: {out}")


if __name__ == "__main__":
    main()
