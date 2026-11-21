"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

const Cloud = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 50" className={className} aria-hidden="true">
    <g fill="#fff">
      <ellipse cx="35" cy="32" rx="28" ry="16" />
      <ellipse cx="62" cy="22" rx="26" ry="18" />
      <ellipse cx="88" cy="32" rx="26" ry="14" />
    </g>
  </svg>
);

// Cenário fixo atrás da trilha: ao rolar a página, as camadas sobem em velocidades diferentes.
export const LearnScenery = () => {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const k = reduce ? 0 : 1;
  const slow = useTransform(scrollY, [0, 3000], [0, -240 * k]);
  const medium = useTransform(scrollY, [0, 3000], [0, -520 * k]);
  const fast = useTransform(scrollY, [0, 3000], [0, -900 * k]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden lg:left-[256px]"
      style={{ background: "linear-gradient(to bottom, #e0f2fe 0, #faf6ee 60%)" }}
    >
      {/* nuvens: camada mais lenta */}
      <motion.div style={{ y: slow }} className="absolute inset-0">
        <motion.div
          animate={reduce ? undefined : { x: [0, 40, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Cloud className="absolute left-[6%] top-[14%] w-28 opacity-80 md:w-40" />
          <Cloud className="absolute right-[10%] top-[30%] w-24 opacity-70 md:w-36" />
          <Cloud className="absolute left-[40%] top-[62%] w-24 opacity-60 md:w-32" />
        </motion.div>
      </motion.div>

      {/* balões de letras: camada mais rápida, nas bordas para não atrapalhar a leitura */}
      <motion.div style={{ y: fast }} className="absolute inset-0">
        <div className="absolute left-[3%] top-[48%] flex h-12 w-12 items-center justify-center rounded-full bg-edu-magenta/70 font-ui text-xl font-semibold text-white md:h-14 md:w-14">A</div>
        <div className="absolute right-[4%] top-[70%] flex h-12 w-12 items-center justify-center rounded-full bg-edu-blue/70 font-ui text-xl font-semibold text-white md:h-14 md:w-14">B</div>
        <div className="absolute left-[8%] top-[92%] flex h-12 w-12 items-center justify-center rounded-full bg-edu-sun/80 font-ui text-xl font-semibold text-edu-sun-ink md:h-14 md:w-14">C</div>
      </motion.div>

      {/* colinas: camada intermediária, bem suaves */}
      <motion.div style={{ y: medium }} className="absolute inset-x-0 top-[78%] h-[60vh]">
        <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
          <path d="M0 400V120C220 40 440 60 660 120S1080 190 1260 110 1400 70 1440 80V400Z" fill="#86efac" fillOpacity="0.45" />
        </svg>
      </motion.div>
    </div>
  );
};
