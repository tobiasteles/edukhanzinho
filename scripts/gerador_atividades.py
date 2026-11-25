#!/usr/bin/env python3
"""Gerador determinístico (sem IA) de atividades de alfabetização — a cada execução cria um CURSO NOVO.

Cada execução lê o JSON anterior, gera a mesma quantidade de desafios NOVOS (nunca repete um que já existe)
e os coloca num curso novo ("Edukhanzinho Alfabetização 2", "3"...). Depois: npm run db:seed:gerado

Uso:
  python scripts/gerador_atividades.py                  # novo curso com 150 desafios (30 por unidade)
  python scripts/gerador_atividades.py --quantidade 100
  python scripts/gerador_atividades.py --reiniciar      # recomeça do zero (rodada 1)
Entradas: public/imageSrc, public/audioSrc e (opcional) scripts/entradas/palavras-extras.csv
"""
import argparse, csv, json, math, random, re, sys, unicodedata
from pathlib import Path

COURSE_ID, COURSE_TITLE, COURSE_IMG = 100, "Edukhanzinho Alfabetização", "/simbolo-5.jpg"
PER_LESSON = 6
# capas dos cursos: cada curso gerado usa uma figura diferente (na ordem; se acabar, recomeça). "livro" é da capa do curso antigo.
COVER_ORDER = ["leao", "elefante", "tigre", "zebra", "urso", "sapo", "foca", "hipopotamo", "iguana", "vaca", "gato", "rato", "pato",
               "abelha", "aviao", "navio", "bola", "casa", "banana", "abacaxi", "maca", "queijo", "janela", "vaso", "dado", "xicara", "oculos"]
LEGACY_COVERS = {1: "livro"}  # curso antigo "Interpretação de Texto" (id 1)

# arquivo (sem extensão) -> (texto exibido, sílabas ou None). Arquivos novos entram sozinhos; use o CSV para sílabas.
WORDS = {
    "abacaxi": ("ABACAXI", ["A", "BA", "CA", "XI"]), "abacate": ("ABACATE", ["A", "BA", "CA", "TE"]),
    "abelha": ("ABELHA", ["A", "BE", "LHA"]), "arroz": ("ARROZ", ["AR", "ROZ"]), "aviao": ("AVIÃO", ["A", "VI", "ÃO"]),
    "banana": ("BANANA", ["BA", "NA", "NA"]), "bola": ("BOLA", ["BO", "LA"]), "cama": ("CAMA", ["CA", "MA"]),
    "casa": ("CASA", ["CA", "SA"]), "dado": ("DADO", ["DA", "DO"]), "elefante": ("ELEFANTE", ["E", "LE", "FAN", "TE"]),
    "escola": ("ESCOLA", ["ES", "CO", "LA"]), "foca": ("FOCA", ["FO", "CA"]), "gato": ("GATO", ["GA", "TO"]),
    "hipopotamo": ("HIPOPÓTAMO", ["HI", "PO", "PÓ", "TA", "MO"]), "iguana": ("IGUANA", ["I", "GUA", "NA"]),
    "janela": ("JANELA", ["JA", "NE", "LA"]), "ketchup": ("KETCHUP", None), "laranja": ("LARANJA", ["LA", "RAN", "JA"]),
    "leao": ("LEÃO", ["LE", "ÃO"]), "livro": ("LIVRO", ["LI", "VRO"]), "maca": ("MAÇÃ", ["MA", "ÇÃ"]),
    "navio": ("NAVIO", ["NA", "VI", "O"]), "oculos": ("ÓCULOS", ["Ó", "CU", "LOS"]), "pato": ("PATO", ["PA", "TO"]),
    "queijo": ("QUEIJO", ["QUEI", "JO"]), "rato": ("RATO", ["RA", "TO"]), "sapo": ("SAPO", ["SA", "PO"]),
    "sorvete": ("SORVETE", ["SOR", "VE", "TE"]), "tigre": ("TIGRE", ["TI", "GRE"]), "urso": ("URSO", ["UR", "SO"]),
    "vaca": ("VACA", ["VA", "CA"]), "vaso": ("VASO", ["VA", "SO"]), "wifi": ("WI-FI", ["WI", "FI"]),
    "xicara": ("XÍCARA", ["XÍ", "CA", "RA"]), "zebra": ("ZEBRA", ["ZE", "BRA"]),
}
SKIP_WORDS = {"yakult"}  # marca comercial
# dica curta (sem dar a resposta) usada nos exercícios de sílaba e de letra que falta; o CSV pode acrescentar mais
DICAS = {
    "abacate": "fruta verde com caroço grande", "abacaxi": "fruta com coroa", "abelha": "faz mel", "arroz": "grãozinho branco do prato",
    "aviao": "voa no céu", "banana": "fruta amarela que o macaco ama", "bola": "a gente chuta", "cama": "onde a gente dorme",
    "casa": "onde a gente mora", "dado": "tem pontinhos de 1 a 6", "elefante": "bicho grande com tromba", "escola": "onde a gente estuda",
    "foca": "bicho do mar que bate palmas", "gato": "faz miau", "hipopotamo": "bicho grande que vive na água", "iguana": "lagarto verde",
    "janela": "por onde entra a luz", "ketchup": "molho vermelho do lanche", "laranja": "fruta que vira suco", "leao": "o rei da selva",
    "livro": "a gente lê", "maca": "fruta vermelha", "navio": "boia no mar", "oculos": "ajuda a enxergar", "pato": "faz quá",
    "queijo": "o rato adora", "rato": "gosta de queijo", "sapo": "faz coaxo", "sorvete": "gelado e gostoso", "tigre": "felino listrado",
    "urso": "bicho peludo que gosta de mel", "vaca": "dá leite", "vaso": "onde fica a planta", "wifi": "internet sem fio",
    "xicara": "a gente bebe nela", "zebra": "bicho listrado de preto e branco",
}
PHRASES = {
    "a_abelha_voa": "A abelha voa.", "a_arvore_e_verde": "A árvore é verde.", "a_bola_e_azul": "A bola é azul.",
    "a_estrela_brilha": "A estrela brilha.", "a_flor_e_rosa": "A flor é rosa.", "a_lua_e_amarela": "A lua é amarela.",
    "a_maca_e_vermelha": "A maçã é vermelha.", "a_nuvem_e_branca": "A nuvem é branca.",
    "o_cachorro_late": "O cachorro late.", "o_coelho_pula": "O coelho pula.", "o_gato_dorme": "O gato dorme.",
    "o_passaro_canta": "O pássaro canta.", "o_pato_nada": "O pato nada.", "o_peixe_nada": "O peixe nada.",
    "o_sol_brilha": "O sol brilha.",
}
CONFUSABLE = [set("BDPQ"), set("MN"), set("FV"), set("CGK"), set("SZX"), set("TD"), set("LR"), set("AEIOU"), set("UV"), set("IJ")]
VOWELS, ALPHABET = "AEIOU", [chr(c) for c in range(65, 91)]
CV = re.compile(r"^[BCDFGJLMNPQRSTVXZ][AEIOU]$")
UNITS = [  # id, título, descrição, nome curto da lição
    (101, "Unidade 1: Conhecendo as Letras", "Descubra as letras do alfabeto, ouça o som de cada uma e ache a letra inicial e final das palavras.", "Letras"),
    (102, "Unidade 2: Palavras e Figuras", "Leia a palavra e encontre a figura certa.", "Figuras"),
    (103, "Unidade 3: Sílabas", "Junte as sílabas e complete as palavras.", "Sílabas"),
    (104, "Unidade 4: Completando Palavras", "Descubra a letra que está faltando.", "Letra que falta"),
    (105, "Unidade 5: Frases", "Leia as frases e combine com os desenhos.", "Frases"),
]


def norm(s):
    s = unicodedata.normalize("NFD", s)
    return re.sub(r"[^a-z0-9_]", "", "".join(c for c in s if unicodedata.category(c) != "Mn").lower())


def cover(index, words_img):
    avail = [k for k in COVER_ORDER if k in words_img] + sorted(k for k in words_img if k not in COVER_ORDER and k not in LEGACY_COVERS.values())
    return words_img[avail[index % len(avail)]] if avail else COURSE_IMG


def spaced(w, j):
    return " ".join("_" if i == j else c for i, c in enumerate(w))


def load_csv(path):
    if path.is_file():
        for row in csv.reader(path.read_text(encoding="utf-8-sig").splitlines(), delimiter=";"):
            if row and row[0].strip() and not row[0].lstrip().startswith("#") and len(row) >= 2:
                syl = [s for s in row[2].strip().upper().split("-") if s] if len(row) > 2 and row[2].strip() else None
                key = row[0].strip().lower()
                WORDS[key] = (row[1].strip().upper(), syl)
                if len(row) > 3 and row[3].strip():
                    DICAS[key] = row[3].strip()


def scan(public):
    img = public / "imageSrc"
    words_img = {p.stem: f"/imageSrc/{p.name}" for p in sorted(img.glob("*.png")) if p.stem not in SKIP_WORDS}
    ldir = img / "letras_limpas" if (img / "letras_limpas").is_dir() else img / "letras"
    letters = {p.stem[-1].upper(): f"/imageSrc/{ldir.name}/{p.name}" for p in sorted(ldir.glob("letra_*.png"))}
    phrases = {p.stem: f"/imageSrc/frases/{p.name}" for p in sorted((img / "frases").glob("*.png"))}
    aud = public / "audioSrc"
    aud_words = {p.stem: f"/audioSrc/{p.name}" for p in sorted(aud.glob("*.mp3"))}
    aud_letters = {p.stem.lower(): f"/audioSrc/letras/{p.name}" for p in sorted((aud / "letras").glob("*.mp3"))}
    for p in sorted(public.glob("?.mp3")):  # compatibilidade: a.mp3, b.mp3... na raiz
        aud_letters.setdefault(p.stem.lower(), "/" + p.name)
    aud_phr = {p.stem: f"/audioSrc/frases/{p.name}" for p in sorted((aud / "frases").glob("*.mp3"))}
    return words_img, letters, phrases, aud_words, aud_letters, aud_phr


class Store:
    """Estado acumulado (o que já existe no JSON) + novos itens, sem repetir."""
    def __init__(self, data):
        self.units, self.lessons = data["units"], data["lessons"]
        self.challenges, self.options = data["challenges"], data["options"]
        opts = {}
        for o in self.options:
            opts.setdefault(o["challengeId"], []).append(o)
        self.sigs = {self.sig(c["type"], c["question"], opts.get(c["id"], [])) for c in self.challenges}
        self.questions = {c["question"] for c in self.challenges}

    @staticmethod
    def sig(ctype, question, opts):
        return (ctype, question, tuple(sorted((o["text"], o.get("imageSrc") or "") for o in opts)))

    def unit(self, uid, course_id, order, title, desc):
        if not any(u["id"] == uid for u in self.units):
            self.units.append({"id": uid, "courseId": course_id, "title": title, "description": desc, "order": order})

    def lesson(self, uid, title):
        n = 1 + sum(1 for l in self.lessons if l["unitId"] == uid)
        if n > 99:
            sys.exit("Limite de 99 lições por unidade atingido. Use --reiniciar ou peça para eu aumentar o limite.")
        lid = uid * 100 + n
        self.lessons.append({"id": lid, "unitId": uid, "title": title, "order": n})
        return lid

    def add(self, lid, ctype, question, opts):
        order = 1 + sum(1 for c in self.challenges if c["lessonId"] == lid)
        cid = lid * 100 + order
        self.challenges.append({"id": cid, "lessonId": lid, "type": ctype, "question": question, "order": order})
        for k, o in enumerate(opts, 1):
            self.options.append({"id": cid * 10 + k, "challengeId": cid, "text": o["text"], "correct": o["correct"],
                                 "imageSrc": o.get("imageSrc"), "audioSrc": o.get("audioSrc")})
        self.sigs.add(self.sig(ctype, question, opts)); self.questions.add(question)


def make_templates(ctx):
    """Devolve {id_da_unidade: [(nome_do_modelo, [(item, função(rng)->(tipo, pergunta, opções)|None)])]}."""
    info, img, letters, phrases = ctx["info"], ctx["img"], ctx["letters"], ctx["phrases"]
    aw, al, ap, nivel, uni = ctx["aud_words"], ctx["aud_letters"], ctx["aud_phr"], ctx["nivel"], ctx["uni"]
    show = lambda k: info[k][0]
    dica = lambda k: f" ({DICAS[k]})" if k in DICAS else ""
    ini = lambda k: norm(show(k))[:1].upper()
    imgw = [k for k in uni if img.get(k)]
    sylw = [k for k in uni if info[k][1]]

    def shuf(l, r): r.shuffle(l); return l

    def pick_letters(r, t, n=3):
        near = sorted(set().union(*[g for g in CONFUSABLE if t in g]) - {t}); r.shuffle(near)
        rest = [c for c in ALPHABET if c != t and c not in near]; r.shuffle(rest)
        pool = near + rest if nivel == 1 or not near else [near[0]] + rest + near[1:]
        return [t] + pool[: n - 1]

    def lopt(c, ok, image=False):
        return {"text": c, "correct": ok, "imageSrc": letters.get(c) if image else None, "audioSrc": al.get(c.lower())}

    def fopt(k, ok):
        return {"text": "", "correct": ok, "imageSrc": img[k], "audioSrc": aw.get(k)}

    def fig_distract(r, k, pool, same=lambda x: False):
        others = [x for x in pool if x != k]; r.shuffle(others)
        if nivel >= 3:
            others.sort(key=lambda x: 0 if ini(x) == ini(k) else 1)
        elif nivel == 1:
            others.sort(key=lambda x: 1 if ini(x) == ini(k) else 0)
        return [x for x in others if not same(x)]

    def numbers(r, n, lo=1, hi=9):
        near = sorted({x for x in range(max(lo, n - 2), min(hi, n + 2) + 1) if x != n}, key=lambda x: (abs(x - n), r.random()))
        return [n] + near[:2]

    def count_q(r, n, text):
        opts = [{"text": str(x), "correct": x == n} for x in numbers(r, n, 1 if "sílabas" in text else 2)]
        return ("SELECT", text, shuf(opts, r))

    # ---- U1
    def u1_letter_q(first):
        def f(k):
            def g(r):
                w = show(k); L = ini(k) if first else norm(w)[-1:].upper()
                if L not in ALPHABET: return None
                q = f"Com qual letra {'começa' if first else 'termina'} a palavra {w}?"
                return ("SELECT", q, shuf([lopt(x, x == L) for x in pick_letters(r, L)], r))
            return g
        return [(k, f(k)) for k in uni]
    u1 = [("u1-id", [(c, (lambda c: lambda r: ("SELECT", f"Toque na letra {c}", shuf([lopt(x, x == c, True) for x in pick_letters(r, c)], r)))(c)) for c in sorted(letters)]),
          ("u1-ini", u1_letter_q(True)), ("u1-fim", u1_letter_q(False))]

    # ---- U2
    def fig_word(k):
        def g(r):
            ks = [k] + fig_distract(r, k, imgw)[:2]
            return ("SELECT", f"Toque na figura: {show(k)}", shuf([fopt(x, x == k) for x in ks], r)) if len(ks) == 3 else None
        return g

    def fig_initial(L):
        def g(r):
            ok = [k for k in imgw if ini(k) == L]; bad = [k for k in imgw if ini(k) != L]; r.shuffle(bad)
            return ("SELECT", f"Toque na figura que começa com a letra {L}", shuf([fopt(r.choice(ok), True)] + [fopt(x, False) for x in bad[:2]], r))
        return g

    def fig_rhyme(k):
        def g(r):
            last = info[k][1][-1]
            partners = [x for x in imgw if x != k and info[x][1] and info[x][1][-1] == last]
            if not partners: return None
            bad = [x for x in imgw if x != k and x not in partners and not (info[x][1] and info[x][1][-1] == last)]; r.shuffle(bad)
            return ("SELECT", f"Qual figura termina com a mesma sílaba de {show(k)}?", shuf([fopt(r.choice(partners), True)] + [fopt(x, False) for x in bad[:2]], r))
        return g
    u2 = [("u2-fig", [(k, fig_word(k)) for k in imgw]),
          ("u2-ini", [(L, fig_initial(L)) for L in sorted({ini(k) for k in imgw})]),
          ("u2-rima", [(k, fig_rhyme(k)) for k in imgw if info[k][1]])]

    # ---- U3
    def syl_missing(k, j):
        def g(r):
            syls = info[k][1]; t = syls[j]
            a = [t[0] + v for v in VOWELS if t[0] + v != t]; b = [c + t[1] for c in "BCDFGLMNPRSTV" if c + t[1] != t]
            wrong = [r.choice(a), r.choice(b)]
            shown = "-".join("__" if i == j else s for i, s in enumerate(syls))
            return ("SELECT", f"Que sílaba completa a palavra{dica(k)}? {shown}", shuf([{"text": s, "correct": s == t} for s in [t] + wrong], r))
        return g

    def syl_first(k):
        def g(r):
            t = info[k][1][0]; pool = sorted({info[x][1][0] for x in sylw if info[x][1][0] != t}); r.shuffle(pool)
            return ("SELECT", f"Qual é a primeira sílaba de {show(k)}?", shuf([{"text": s, "correct": s == t} for s in [t] + pool[:2]], r)) if len(pool) >= 2 else None
        return g

    def fig_syl(s):
        def g(r):
            ok = [k for k in imgw if info[k][1] and info[k][1][0] == s]; bad = [k for k in imgw if not info[k][1] or info[k][1][0] != s]; r.shuffle(bad)
            return ("SELECT", f"Toque na figura que começa com a sílaba {s}", shuf([fopt(r.choice(ok), True)] + [fopt(x, False) for x in bad[:2]], r))
        return g
    def build_syl(k):
        def g(r):
            syls = info[k][1]
            hint = {"imageSrc": img.get(k), "audioSrc": aw.get(k)}
            pool = sorted({v for s_ in syls if CV.match(s_) for v in [s_[0] + x for x in VOWELS] + [c + s_[1] for c in "BCDFGLMNPRSTV"]} - set(syls))
            if len(pool) < 2: return None
            r.shuffle(pool)
            tiles = [{"text": t, "correct": True, **(hint if i == 0 else {})} for i, t in enumerate(syls)] + [{"text": t, "correct": False} for t in pool[:2]]
            return ("BUILD", "Ouça e monte a palavra" if aw.get(k) else "Monte o nome da figura", tiles)
        return g
    build_syl_items = [k for k in sylw if 2 <= len(info[k][1]) <= 4 and (aw.get(k) or img.get(k))]
    u3 = [("u3-monte", [(k, build_syl(k)) for k in build_syl_items]), ("u3-falta", [((k, j), syl_missing(k, j)) for k in sylw for j, s in enumerate(info[k][1]) if CV.match(s)]),
          ("u3-primeira", [(k, syl_first(k)) for k in sylw]),
          ("u3-conta", [(k, (lambda k: lambda r: count_q(r, len(info[k][1]), f"Quantas sílabas tem a palavra {show(k)}?"))(k)) for k in sylw]),
          ("u3-figsil", [(s, fig_syl(s)) for s in sorted({info[k][1][0] for k in imgw if info[k][1]})])]

    # ---- U4
    plain = [k for k in uni if show(k) == norm(show(k)).upper()]

    def miss(k, j):
        def g(r):
            w = show(k); t = w[j]
            if t in VOWELS:
                ks = [t] + shuf([v for v in VOWELS if v != t], r)[:2]
            else:
                ks = pick_letters(r, t)
            return ("SELECT", f"Que letra falta{dica(k)}? " + spaced(w, j), shuf([lopt(x, x == t) for x in ks], r))
        return g
    def build_letters(k):
        def g(r):
            w = show(k)
            hint = {"imageSrc": img.get(k), "audioSrc": aw.get(k)}
            extra = [c for c in pick_letters(r, r.choice(w))[1:] if c not in w]
            if not extra: return None
            tiles = [{"text": c, "correct": True, **(hint if i == 0 else {})} for i, c in enumerate(w)] + [{"text": c, "correct": False} for c in extra[:2]]
            return ("BUILD", "Ouça e monte a palavra" if aw.get(k) else "Monte o nome da figura", tiles)
        return g
    build_letter_items = [k for k in plain if 3 <= len(show(k)) <= 6 and (aw.get(k) or img.get(k))]
    u4 = [("u4-monte", [(k, build_letters(k)) for k in build_letter_items]), ("u4-vogal", [((k, j), miss(k, j)) for k in plain for j, c in enumerate(show(k)) if c in VOWELS]),
          ("u4-inicial", [((k, 0), miss(k, 0)) for k in plain if show(k)[0] not in VOWELS]),
          ("u4-final", [((k, len(show(k)) - 1), miss(k, len(show(k)) - 1)) for k in plain]),
          ("u4-conta", [(k, (lambda k: lambda r: count_q(r, len(show(k)), f"Quantas letras tem a palavra {show(k)}?"))(k)) for k in plain])]

    # ---- U5
    pk = sorted(k for k in phrases if k in PHRASES)
    words_of = lambda k: PHRASES[k][:-1].split()

    def p_draw(k):
        def g(r):
            others = [x for x in pk if x != k]; r.shuffle(others)
            return ("SELECT", f"Toque no desenho da frase: {PHRASES[k]}", shuf([{"text": "", "correct": x == k, "imageSrc": phrases[x], "audioSrc": ap.get(x)} for x in [k] + others[:2]], r))
        return g

    def p_cloze(k, pos):
        def g(r):
            ws = words_of(k); t = ws[pos]
            pool = sorted({words_of(x)[pos if pos == 1 else -1] for x in pk if x != k and ((" é " in PHRASES[x]) == (" é " in PHRASES[k]) or pos == 1)} - {t}); r.shuffle(pool)
            q = "Complete a frase: " + " ".join("___" if i == pos else w for i, w in enumerate(ws)) + "."
            return ("SELECT", q, shuf([{"text": w, "correct": w == t} for w in [t] + pool[:2]], r)) if len(pool) >= 2 else None
        return g

    def p_art(k):
        def g(r):
            ws = words_of(k)
            return ("SELECT", "Complete a frase: ___ " + " ".join(ws[1:]) + ".", shuf([{"text": a, "correct": a == ws[0]} for a in ("O", "A")], r))
        return g
    u5 = [("u5-desenho", [(k, p_draw(k)) for k in pk]), ("u5-predicado", [(k, p_cloze(k, len(words_of(k)) - 1)) for k in pk]),
          ("u5-substantivo", [(k, p_cloze(k, 1)) for k in pk]), ("u5-artigo", [(k, p_art(k)) for k in pk])]
    return {101: u1, 102: u2, 103: u3, 104: u4, 105: u5}


def pick_batch(store, templates, quota, seed, lote):
    """Escolhe `quota` desafios novos: perguntas inéditas primeiro, revezando entre os modelos."""
    lists = []
    for name, items in templates:
        cands = []
        for item, fn in items:
            for attempt in range(3):
                res = fn(random.Random(f"{seed}|{lote}|{name}|{item}|{attempt}"))
                if res: cands.append(res)
        r = random.Random(f"{seed}|{lote}|{name}|ordem")
        fresh = [c for c in cands if c[1] not in store.questions]; stale = [c for c in cands if c[1] in store.questions]
        r.shuffle(fresh); r.shuffle(stale)
        lists.append(fresh + stale)
    picked, used_q = [], set()
    while len(picked) < quota and any(lists):
        for lst in lists:
            while lst and len(picked) < quota:
                ctype, q, opts = lst.pop(0)
                many = ctype == "BUILD"  # montar a palavra: várias peças corretas, mesma pergunta para palavras diferentes
                n_ok = sum(o["correct"] for o in opts)
                if (q in used_q and not many) or (n_ok < 2 if many else n_ok != 1) or len(opts) < 2: continue
                if Store.sig(ctype, q, opts) in store.sigs: continue
                picked.append((ctype, q, opts)); used_q.add(q); store.sigs.add(Store.sig(ctype, q, opts)); break
    return picked


def build(public, seed, quantidade, out, reiniciar, csv_path):
    load_csv(csv_path)
    words_img, letters, phrases, aw, al, ap = scan(public)
    uni = sorted((set(words_img) | {k for k in WORDS if k in aw}) - SKIP_WORDS)
    info = {k: WORDS.get(k, (k.upper(), None)) for k in uni}
    if out.is_file() and not reiniciar:
        data = json.loads(out.read_text(encoding="utf-8"))
        if "courses" not in data:  # arquivo da versão antiga: tinha um curso só
            data["courses"] = [data.pop("course")] if "course" in data else []
        lote = data.get("lotes", len(data["courses"]) or 1) + 1
    else:
        data, lote = {"courses": [], "units": [], "lessons": [], "challenges": [], "options": []}, 1
    if lote > 90:
        sys.exit("Limite de 90 cursos gerados atingido. Use --reiniciar ou peça para eu aumentar o limite.")
    store = Store(data)
    course = {"id": COURSE_ID + lote - 1, "title": COURSE_TITLE if lote == 1 else f"{COURSE_TITLE} {lote}", "imageSrc": COURSE_IMG}
    data["courses"].append(course)
    for i, c in enumerate(data["courses"]):  # recalcula todas as capas: cursos já existentes também ganham figura própria
        c["imageSrc"] = cover(i, words_img)
    ctx = dict(info=info, img=words_img, letters=letters, phrases=phrases, aud_words=aw, aud_letters=al, aud_phr=ap,
               nivel=min(lote, 3), uni=uni)
    quota, avisos, por_unidade = math.ceil(quantidade / len(UNITS)), [], {}
    tpl = make_templates(ctx)
    for base_id, title, desc, short in UNITS:
        k = base_id - 100
        uid = 100 + (lote - 1) * 10 + k  # ids únicos por curso; o curso 1 mantém 101..105
        picked = pick_batch(store, tpl[base_id], quota, seed, lote)
        store.unit(uid, course["id"], k, title, desc)
        for i in range(0, len(picked), PER_LESSON):
            lid = store.lesson(uid, f"{short} {i // PER_LESSON + 1}")
            for ctype, q, opts in picked[i:i + PER_LESSON]:
                store.add(lid, ctype, q, opts)
        por_unidade[short] = len(picked)
        if len(picked) < quota:
            avisos.append(f"{short}: só {len(picked)} de {quota} (combinações esgotadas). Adicione figuras, áudios ou palavras no CSV.")
    novos = sum(por_unidade.values())
    return {"courses": data["courses"], "units": store.units, "lessons": store.lessons,
            "challenges": store.challenges, "options": store.options, "lotes": lote,
            "capasExistentes": {str(i): words_img[k] for i, k in LEGACY_COVERS.items() if k in words_img},
            "stats": {"curso_novo": course["title"], "novos_desafios": novos, "por_unidade": por_unidade,
                      "total_cursos": len(data["courses"]), "total_desafios": len(store.challenges), "palavras": len(uni),
                      "letras": len(letters), "frases": len(phrases), "audios_palavras": len(aw), "audios_letras": len(al), "avisos": avisos}}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--public", default="public"); ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--quantidade", type=int, default=150, help="desafios novos por execução (padrão 150)")
    ap.add_argument("--out", default="scripts/generated/curso-alfabetizacao.json")
    ap.add_argument("--csv", default="scripts/entradas/palavras-extras.csv")
    ap.add_argument("--reiniciar", action="store_true", help="ignora o JSON anterior e recomeça só com o primeiro curso")
    a = ap.parse_args()
    public = Path(a.public)
    if not (public / "imageSrc").is_dir():
        sys.exit(f"Pasta {public}/imageSrc nao encontrada. Rode a partir da raiz do projeto.")
    out = Path(a.out); out.parent.mkdir(parents=True, exist_ok=True)
    data = build(public, a.seed, a.quantidade, out, a.reiniciar, Path(a.csv))
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(data["stats"], ensure_ascii=False, indent=2)); print(f"Gerado: {out}")


if __name__ == "__main__":
    main()
