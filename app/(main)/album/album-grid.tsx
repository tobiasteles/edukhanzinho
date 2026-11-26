"use client";

import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";

type Item = { key: string; nome: string; imagem: string; times: number };

export const AlbumGrid = ({ items }: { items: Item[] }) => {
  const play = (item: Item) => {
    if (item.times === 0) return;
    // toca o áudio real da palavra; se o arquivo não existir, a voz do navegador diz o nome
    new Audio(`/audioSrc/${item.key}.mp3`).play().catch(() => speak(item.nome));
  };

  return (
    <ul className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => {
        const got = item.times > 0;
        return (
          <motion.li key={item.key} whileHover={got ? { y: -3 } : undefined} whileTap={got ? { scale: 0.97 } : undefined}>
            <button
              type="button"
              onClick={() => play(item)}
              disabled={!got}
              aria-label={got ? `Figurinha ${item.nome}` : "Figurinha ainda escondida"}
              className={cn(
                "flex w-full flex-col items-center gap-y-2 rounded-3xl border-2 border-b-[6px] p-3",
                got ? "border-edu-line bg-white" : "border-edu-line bg-edu-cream"
              )}
            >
              <div className="relative h-24 w-24 lg:h-28 lg:w-28">
                <Image
                  src={item.imagem}
                  alt={got ? item.nome : "Figurinha escondida"}
                  fill
                  className={cn("object-contain", !got && "opacity-20 brightness-0")}
                />
              </div>
              <p className="font-ui text-lg font-semibold text-edu-ink">{got ? item.nome : "?"}</p>
              <div className="flex gap-x-1" aria-label={`${item.times} de 3 estrelas`}>
                {[1, 2, 3].map((n) => (
                  <Star key={n} className={cn("h-5 w-5", item.times >= n ? "fill-edu-sun text-edu-sun-edge" : "text-edu-line")} />
                ))}
              </div>
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
};
