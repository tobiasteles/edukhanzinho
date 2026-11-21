import { challenges } from "@/db/schema";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";
import { useAudio, useKey } from "react-use";

type Props = {
  id: number;
  imageSrc: string | null;
  audioSrc: string | null;
  text: string;
  shortcut: string;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
  status?: "correct" | "wrong" | "none";
  type: (typeof challenges.$inferSelect)["type"];
};

export const Card = ({
  imageSrc,
  audioSrc,
  text,
  shortcut,
  selected,
  onClick,
  disabled,
  status,
  type,
}: Props) => {
  // sem áudio, não passamos src (string vazia gera erro no React); o play também é pulado
  const [audio, , controls] = useAudio({ src: audioSrc ?? undefined } as unknown as { src: string });

  const handleClick = useCallback(() => {
    if (disabled) return;

    if (audioSrc) controls.play();
    onClick();
  }, [disabled, onClick, controls, audioSrc]);

  useKey(shortcut, handleClick, {}, [handleClick]);

  const isCorrect = !!selected && status === "correct";
  const isWrong = !!selected && status === "wrong";
  const answered = status === "correct" || status === "wrong";

  const box = isCorrect
    ? "border-edu-green bg-edu-green-soft"
    : isWrong
      ? "border-edu-coral bg-edu-coral-soft"
      : selected
        ? "border-edu-blue bg-edu-blue-soft"
        : "border-edu-line bg-white hover:bg-edu-cream";

  const label = isCorrect
    ? "text-edu-green-edge"
    : isWrong
      ? "text-edu-coral-edge"
      : selected
        ? "text-edu-blue"
        : "text-edu-ink";

  const badge = isCorrect
    ? "bg-edu-green text-white"
    : isWrong
      ? "bg-edu-coral text-white"
      : selected
        ? "bg-edu-blue text-white"
        : "bg-edu-cream text-edu-ink/60";

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-pressed={!!selected}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      whileHover={disabled || answered ? undefined : { y: -3 }}
      whileTap={disabled || answered ? undefined : { scale: 0.97 }}
      animate={
        isCorrect
          ? { scale: [1, 1.06, 1], x: 0 }
          : isWrong
            ? { x: [0, -10, 10, -8, 8, 0], scale: 1 }
            : { scale: 1, x: 0 }
      }
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "h-full w-full cursor-pointer select-none rounded-3xl border-2 border-b-[6px] p-4 outline-none transition-colors focus-visible:ring-4 focus-visible:ring-edu-blue/30 lg:p-5",
        box,
        disabled && "pointer-events-none",
        type === "ASSIST" && "lg:p-4"
      )}
    >
      {audio}
      {imageSrc && (
        <div className="relative mb-3 aspect-square max-h-[150px] w-full lg:max-h-[220px]">
          <Image src={imageSrc} fill alt={text} className="object-contain" />
        </div>
      )}
      <div className="flex items-center gap-x-3 lg:gap-x-4">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-ui text-sm font-semibold lg:h-10 lg:w-10 lg:text-base",
            badge
          )}
        >
          {isCorrect ? (
            <Check className="h-5 w-5" strokeWidth={3} />
          ) : isWrong ? (
            <X className="h-5 w-5" strokeWidth={3} />
          ) : (
            shortcut
          )}
        </span>
        <p className={cn("font-read text-lg lg:text-2xl", label)}>{text}</p>
      </div>
    </motion.div>
  );
};
