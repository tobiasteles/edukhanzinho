"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Crown, Star } from "lucide-react";

const reveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

// Prévia decorativa da tela /learn (não clicável).
export const AppPreviewSection = () => {
  const reduce = useReducedMotion();

  return (
    <section
      className="w-full px-4 pb-20 pt-28"
      style={{ background: "linear-gradient(to bottom, #22a559 0, #faf6ee 150px)" }}
    >
      <div className="mx-auto max-w-5xl">
        <motion.div {...reveal} className="mb-10 text-center">
          <h2 className="font-ui text-3xl font-semibold text-edu-ink md:text-4xl">Por dentro da aventura</h2>
          <p className="mt-2 font-ui text-edu-ink/70">Lições curtas, estrelas e missões para aprender brincando.</p>
        </motion.div>

        <div aria-hidden="true" className="pointer-events-none grid select-none gap-6 lg:grid-cols-[1.4fr_1fr]">
          <motion.div {...reveal}>
            <div className="flex items-center justify-between gap-4 rounded-3xl bg-edu-blue p-6 text-white">
              <div>
                <h3 className="font-ui text-xl font-semibold md:text-2xl">Unidade 1: Descobrindo as Letras</h3>
                <p className="mt-1 text-sm md:text-base">Encontre as letras escondidas e forme suas primeiras palavras.</p>
              </div>
              <Button variant="primaryOutline" tabIndex={-1} className="shrink-0">
                <BookOpen className="h-4 w-4" /> Continuar
              </Button>
            </div>

            <div className="relative mt-8 flex flex-col items-center gap-y-6 pb-4">
              <div className="relative">
                <motion.div
                  animate={reduce ? undefined : { y: [0, -6, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-2xl border-2 border-edu-line bg-white px-3 py-1 font-ui text-sm font-semibold text-edu-blue"
                >
                  COMEÇAR!
                </motion.div>
                <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full border-b-[8px] border-edu-green-edge bg-edu-green">
                  <Star className="h-9 w-9 fill-white text-white" />
                </div>
              </div>
              <div className="ml-24 flex h-[88px] w-[88px] items-center justify-center rounded-full border-b-[8px] border-neutral-400 bg-neutral-200">
                <Crown className="h-8 w-8 fill-neutral-400 text-neutral-400" />
              </div>
              <div className="mr-24 flex h-[88px] w-[88px] items-center justify-center rounded-full border-b-[8px] border-neutral-400 bg-neutral-200">
                <Star className="h-8 w-8 text-neutral-400" />
              </div>
            </div>
          </motion.div>

          <motion.div {...reveal} className="flex flex-col gap-4">
            <div className="flex gap-3 font-ui font-semibold">
              <div className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-edu-sun/25 px-3 py-2 text-edu-sun-ink">
                <Star className="h-5 w-5 fill-edu-sun text-edu-sun-edge" /> 600
              </div>
            </div>
            <div className="rounded-3xl border-2 border-edu-line bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-ui text-lg font-semibold text-edu-ink">Missões</h3>
                <span className="rounded-full bg-edu-blue px-3 py-1 font-ui text-xs font-semibold text-white">VEJA TODAS</span>
              </div>
              {[["Ganhe 50 XP", 100], ["Ganhe 500 XP", 40], ["Ganhe 5.000 XP", 8]].map(([label, value]) => (
                <div key={label} className="mb-4 flex items-center gap-3 last:mb-0">
                  <Star className="h-9 w-9 shrink-0 rounded-full border-2 border-edu-ink p-1.5 text-edu-ink" />
                  <div className="w-full">
                    <p className="mb-1 font-ui font-semibold text-edu-ink">{label}</p>
                    <Progress value={Number(value)} className="h-3" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
