"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

const SPRING = { stiffness: 90, damping: 24, mass: 0.4 };

const Cloud = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 50" className={className} aria-hidden="true">
    <g fill="#fff">
      <ellipse cx="35" cy="32" rx="28" ry="16" />
      <ellipse cx="62" cy="22" rx="26" ry="18" />
      <ellipse cx="88" cy="32" rx="26" ry="14" />
    </g>
  </svg>
);

const Balloon = ({ letter, className, delay }: { letter: string; className: string; delay: number }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      animate={reduce ? undefined : { y: [0, -12, 0] }}
      transition={{ duration: 4, repeat: Infinity, delay }}
      className={`absolute flex h-14 w-14 items-center justify-center rounded-full font-ui text-2xl font-semibold shadow-md md:h-16 md:w-16 ${className}`}
    >
      {letter}
    </motion.div>
  );
};

// Camadas: céu (mais lento) → montanhas/balões → título + colinas → primeiro plano (fixo).
// {/* Substituir por SVG/PNG do Figma */} — cada camada abaixo pode virar uma imagem exportada.
export const ParallaxWorldSection = () => {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const sky = useSpring(useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 220]), SPRING);
  const far = useSpring(useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140]), SPRING);
  const mid = useSpring(useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 70]), SPRING);

  return (
    <section
      ref={ref}
      aria-label="A trilha da leitura"
      className="relative h-[650px] w-full overflow-hidden md:h-[780px]"
      style={{ background: "linear-gradient(to bottom, #faf6ee, #e0f2fe)" }}
    >
      {/* Camada 0: céu e sol */}
      <motion.div style={{ y: sky }} className="absolute inset-x-0 -top-64 bottom-0">
        <div className="absolute right-[12%] top-[34%] h-24 w-24 rounded-full bg-edu-sun shadow-[0_0_90px_30px_rgba(255,200,0,0.45)] md:h-32 md:w-32" />
        <Cloud className="absolute left-[8%] top-[38%] w-32 opacity-90 md:w-44" />
        <Cloud className="absolute right-[30%] top-[46%] w-24 opacity-80 md:w-36" />
        <Cloud className="absolute left-[44%] top-[32%] w-20 opacity-70 md:w-28" />
      </motion.div>

      {/* Camada 1: montanhas distantes e balões de letras */}
      <motion.div style={{ y: far }} className="absolute inset-x-0 -top-40 bottom-0">
        <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path d="M0 600V330C160 250 300 250 460 320S760 380 940 290 1260 230 1440 300V600Z" fill="#c7d2fe" />
          <path d="M0 600V420C200 350 380 380 560 420S960 450 1180 380 1360 360 1440 390V600Z" fill="#ddd6fe" />
        </svg>
        <Balloon letter="A" delay={0} className="left-[10%] top-[30%] bg-edu-magenta text-white" />
        <Balloon letter="B" delay={1} className="right-[14%] top-[26%] bg-edu-blue text-white" />
        <Balloon letter="C" delay={2} className="left-[72%] top-[48%] bg-edu-sun text-edu-sun-ink" />
        <span className="absolute left-[24%] top-[26%] text-2xl text-edu-sun" aria-hidden="true">★</span>
        <span className="absolute right-[30%] top-[34%] text-xl text-edu-sun" aria-hidden="true">★</span>
      </motion.div>

      {/* Camada 2: título + colinas médias */}
      <motion.div style={{ y: mid }} className="absolute inset-x-0 -top-20 bottom-0">
        <div className="absolute inset-x-0 top-[30%] px-4 text-center">
          <h2 className="font-ui text-3xl font-semibold text-edu-ink md:text-5xl">Explore o Mundo das Letrinhas</h2>
          <p className="mx-auto mt-3 max-w-md font-ui text-base text-edu-ink/70 md:text-xl">
            Siga a trilha, descubra letras, sílabas e palavras e ganhe estrelas pelo caminho.
          </p>
        </div>
        <svg viewBox="0 0 1440 780" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path d="M0 780V500C220 410 420 420 640 480S1060 550 1240 460 1400 430 1440 440V780Z" fill="#86efac" />
        </svg>
      </motion.div>

      {/* Camada 3: primeiro plano fixo, árvores e trilha pontilhada */}
      <svg viewBox="0 0 1440 780" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d="M0 780V580C180 520 380 540 560 600S980 660 1180 580 1380 560 1440 580V780Z" fill="#22a559" />
        <path d="M700 780C640 730 820 700 760 650S690 610 740 580" fill="none" stroke="#faf6ee" strokeWidth="9" strokeLinecap="round" strokeDasharray="2 20" />
        {[[160, 600, 1], [1260, 590, 1.1], [1080, 640, 0.8]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <rect x="-6" y="0" width="12" height="40" rx="4" fill="#197a41" />
            <circle cx="0" cy="-14" r="36" fill="#4ade80" />
            <circle cx="-18" cy="2" r="22" fill="#4ade80" />
            <circle cx="18" cy="2" r="22" fill="#4ade80" />
          </g>
        ))}
      </svg>
    </section>
  );
};
