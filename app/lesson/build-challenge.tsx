"use client";

import { challengeOptions } from "@/db/schema";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

type Option = typeof challengeOptions.$inferSelect;

type Props = {
  options: Option[];
  built: number[]; // ids das peças colocadas, na ordem
  onChange: (next: number[]) => void;
  status: "correct" | "wrong" | "none";
  revealed: boolean;
  disabled?: boolean;
  seed: number;
};

// mesmo embaralhamento para o mesmo desafio: as peças não "pulam" a cada renderização
const shuffleSeeded = <T,>(items: T[], seed: number) => {
  const arr = [...items];
  let s = seed || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Montar a palavra: as peças corretas (correct=true) formam a resposta na ordem do id; as demais são distratores.
// A figura e o som da palavra vêm da primeira peça correta.
export const BuildChallenge = ({ options, built, onChange, status, revealed, disabled, seed }: Props) => {
  const answer = useMemo(() => options.filter((o) => o.correct).sort((a, b) => a.id - b.id), [options]);
  const tiles = useMemo(() => shuffleSeeded([...options].sort((a, b) => a.id - b.id), seed), [options, seed]);
  const hint = answer[0];

  const playWord = () => {
    if (hint?.audioSrc) new Audio(hint.audioSrc).play().catch(() => {});
  };

  const place = (o: Option) => {
    if (disabled || built.length >= answer.length || built.includes(o.id)) return;
    speak(o.text);
    onChange([...built, o.id]);
  };

  const remove = (index: number) => {
    if (disabled) return;
    onChange(built.filter((_, i) => i !== index));
  };

  return (
    <div className="flex w-full flex-col items-center gap-y-8">
      <div className="flex items-center gap-x-4">
        {hint?.imageSrc && (
          <div className="relative h-32 w-32 lg:h-44 lg:w-44">
            <Image src={hint.imageSrc} alt="Figura da palavra" fill className="object-contain" />
          </div>
        )}
        {hint?.audioSrc && (
          <motion.button
            type="button"
            onClick={playWord}
            whileTap={{ scale: 0.9 }}
            aria-label="Ouvir a palavra"
            className="flex h-16 w-16 items-center justify-center rounded-full border-b-4 border-edu-sky-edge bg-edu-sky text-edu-ink"
          >
            <Volume2 className="h-8 w-8" />
          </motion.button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 lg:gap-3" aria-label="Espaços da palavra">
        {answer.map((_, i) => {
          const id = built[i];
          const tile = id !== undefined ? options.find((o) => o.id === id) : undefined;
          const tone =
            status === "correct" || revealed
              ? "border-edu-green bg-edu-green-soft text-edu-green-edge"
              : status === "wrong"
                ? "border-edu-coral bg-edu-coral-soft text-edu-coral-edge"
                : tile
                  ? "border-edu-blue bg-edu-blue-soft text-edu-blue"
                  : "border-dashed border-edu-line bg-white/60 text-edu-ink";
          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => tile && remove(i)}
              animate={status === "wrong" && !revealed ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
              transition={{ duration: 0.35 }}
              className={cn(
                "flex h-16 min-w-14 items-center justify-center rounded-2xl border-2 border-b-[6px] px-3 font-read text-3xl lg:h-20 lg:min-w-16 lg:text-4xl",
                tone
              )}
            >
              {tile?.text}
            </motion.button>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-2 lg:gap-3">
        {tiles.map((o) => {
          const used = built.includes(o.id);
          return (
            <motion.button
              key={o.id}
              type="button"
              disabled={used || disabled}
              whileTap={{ scale: 0.92 }}
              onClick={() => place(o)}
              className={cn(
                "flex h-16 min-w-14 items-center justify-center rounded-2xl border-2 border-b-[6px] px-4 font-read text-3xl lg:h-20 lg:min-w-16 lg:text-4xl",
                used ? "border-edu-line bg-edu-cream text-transparent" : "border-edu-line bg-white text-edu-ink hover:bg-edu-cream"
              )}
            >
              {o.text}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
