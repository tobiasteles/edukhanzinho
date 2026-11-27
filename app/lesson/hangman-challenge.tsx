"use client";

import { challengeOptions } from "@/db/schema";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Option = typeof challengeOptions.$inferSelect;

const MAX_WRONG = 6; // cordas do balão
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const base = (c: string) => c.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

type Props = {
  options: Option[];
  status: "correct" | "wrong" | "none";
  revealed: boolean;
  onSolved: () => void;
  onFailed: () => void;
  hintTick?: number; // a cada aumento, revela uma letra (Pena da dica)
  ropeBonus?: number; // cordas extras (Corda extra)
};

// Forca do balão: cada letra errada solta uma corda; sem "perder": no fim a palavra aparece e a criança segue.
// As letras da palavra são as opções corretas, na ordem do id. A figura e o som vêm da primeira letra.
export const HangmanChallenge = ({ options, status, revealed, onSolved, onFailed, hintTick = 0, ropeBonus = 0 }: Props) => {
  const letters = useMemo(() => options.filter((o) => o.correct).sort((a, b) => a.id - b.id), [options]);
  const hint = letters[0];
  const [guessed, setGuessed] = useState<string[]>([]);
  const reported = useRef(false);

  const isHit = (b: string) => letters.some((l) => base(l.text) === b);
  const wrongCount = guessed.filter((g) => !isHit(g)).length;
  const solved = letters.length > 0 && letters.every((l) => guessed.includes(base(l.text)));
  const finished = status !== "none";
  const maxWrong = MAX_WRONG + ropeBonus;
  const remaining = Math.max(maxWrong - wrongCount, 0);
  const lastTick = useRef(hintTick);

  const guess = useCallback(
    (letter: string) => {
      if (status !== "none" || reported.current) return;
      const b = base(letter);
      if (!/^[A-Z]$/.test(b)) return;
      setGuessed((prev) => (prev.includes(b) ? prev : [...prev, b]));
    },
    [status]
  );

  // teclado do computador
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length === 1) guess(e.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [guess]);

  useEffect(() => {
    if (reported.current || letters.length === 0) return;
    if (solved) {
      reported.current = true;
      speak(letters.map((l) => l.text).join(""));
      onSolved();
    } else if (wrongCount >= maxWrong) {
      reported.current = true;
      onFailed();
    }
  }, [solved, wrongCount, maxWrong, letters, onSolved, onFailed]);

  // Pena da dica: revela a próxima letra que falta (sem custar corda)
  useEffect(() => {
    if (hintTick === lastTick.current) return;
    lastTick.current = hintTick;
    if (status !== "none" || reported.current) return;
    const next = letters.find((l) => !guessed.includes(base(l.text)));
    if (next) setGuessed((prev) => (prev.includes(base(next.text)) ? prev : [...prev, base(next.text)]));
  }, [hintTick, letters, guessed, status]);

  const playWord = () => {
    if (hint?.audioSrc) new Audio(hint.audioSrc).play().catch(() => {});
  };

  const floating = solved || revealed;

  return (
    <div className="flex w-full flex-col items-center gap-y-6">
      <div className="flex items-center gap-x-6">
        <motion.svg
          viewBox="0 0 200 230"
          role="img"
          aria-label={`Balão preso por ${remaining} cordas`}
          className="h-48 w-40 lg:h-56 lg:w-48"
          animate={{ y: floating ? -16 : 0 }}
          transition={{ type: "spring", stiffness: 60, damping: 10 }}
        >
          {Array.from({ length: MAX_WRONG }, (_, i) => (
            <motion.line
              key={i}
              x1={78 + i * 8.8}
              y1={112}
              x2={80 + i * 8}
              y2={182}
              stroke="#8a6a3a"
              strokeWidth={2.5}
              strokeLinecap="round"
              animate={{ opacity: i < remaining ? 1 : 0 }}
            />
          ))}
          <ellipse cx="100" cy="62" rx="50" ry="58" className="fill-edu-magenta" />
          <ellipse cx="82" cy="40" rx="10" ry="18" fill="#fff" opacity="0.35" transform="rotate(20 82 40)" />
          <path d="M93 116 L107 116 L100 128 Z" className="fill-edu-magenta" />
          <rect x="66" y="180" width="68" height="42" rx="10" className="fill-edu-sun" />
          <path d="M66 196 H134" stroke="#d99a00" strokeWidth="3" />
        </motion.svg>

        <div className="flex flex-col items-center gap-y-3">
          {hint?.imageSrc && (
            <div className="relative h-28 w-28 lg:h-36 lg:w-36">
              <Image src={hint.imageSrc} alt="Figura da palavra" fill className="object-contain" />
            </div>
          )}
          {hint?.audioSrc && (
            <motion.button
              type="button"
              onClick={playWord}
              whileTap={{ scale: 0.9 }}
              aria-label="Ouvir a palavra"
              className="flex h-14 w-14 items-center justify-center rounded-full border-b-4 border-edu-sky-edge bg-edu-sky text-edu-ink"
            >
              <Volume2 className="h-7 w-7" />
            </motion.button>
          )}
          <span className="rounded-2xl bg-edu-sun/25 px-3 py-1 font-ui font-semibold text-edu-sun-ink">Cordas: {remaining}</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 lg:gap-3" aria-label="Palavra escondida">
        {letters.map((l, i) => {
          const got = guessed.includes(base(l.text));
          const shown = got || finished;
          return (
            <div
              key={i}
              className={cn(
                "flex h-14 min-w-11 items-center justify-center rounded-2xl border-2 border-b-[6px] px-2 font-read text-3xl lg:h-16 lg:min-w-14 lg:text-4xl",
                got ? "border-edu-green bg-edu-green-soft text-edu-green-edge" : shown ? "border-edu-coral bg-edu-coral-soft text-edu-coral-edge" : "border-dashed border-edu-line bg-white/60 text-edu-ink"
              )}
            >
              {shown ? l.text : ""}
            </div>
          );
        })}
      </div>

      <div className="flex max-w-2xl flex-wrap justify-center gap-1.5 lg:gap-2" aria-label="Teclado de letras">
        {ALPHABET.map((c) => {
          const used = guessed.includes(c);
          const hit = used && isHit(c);
          return (
            <motion.button
              key={c}
              type="button"
              disabled={used || finished}
              whileTap={{ scale: 0.9 }}
              onClick={() => guess(c)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border-2 border-b-4 font-read text-xl lg:h-12 lg:w-12 lg:text-2xl",
                !used && "border-edu-line bg-white text-edu-ink hover:bg-edu-cream",
                hit && "border-edu-green bg-edu-green-soft text-edu-green-edge",
                used && !hit && "border-edu-coral bg-edu-coral-soft text-edu-coral-edge"
              )}
            >
              {c}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
