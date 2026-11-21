import confetti from "canvas-confetti";

const COLORS = ["#1849d6", "#22a559", "#ffc800", "#d946ef", "#4db8f0"];

// Pequena festa quando a criança acerta uma pergunta.
export const celebrateCorrect = () => {
  confetti({
    particleCount: 45,
    spread: 65,
    startVelocity: 32,
    origin: { x: 0.5, y: 0.8 },
    colors: COLORS,
    disableForReducedMotion: true,
  });
};

// Festa maior ao concluir a lição: dois canhões, um de cada lado.
export const celebrateFinish = () => {
  const end = Date.now() + 1600;

  const frame = () => {
    confetti({ particleCount: 4, angle: 60, spread: 65, origin: { x: 0, y: 0.8 }, colors: COLORS, disableForReducedMotion: true });
    confetti({ particleCount: 4, angle: 120, spread: 65, origin: { x: 1, y: 0.8 }, colors: COLORS, disableForReducedMotion: true });
    if (Date.now() < end) requestAnimationFrame(frame);
  };

  frame();
};
