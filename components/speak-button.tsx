"use client";

import { isSpeechSupported, speak } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  text: string;
  className?: string;
};

export const SpeakButton = ({ text, className }: Props) => {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isSpeechSupported());
  }, []);

  if (!supported) return null;

  return (
    <motion.button
      type="button"
      aria-label="Ouvir em voz alta"
      title="Ouvir"
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-b-4 border-edu-sky-edge bg-edu-sky text-edu-ink transition-colors hover:bg-edu-sky/80 lg:h-11 lg:w-11",
        className
      )}
    >
      <Volume2 className="h-5 w-5" />
    </motion.button>
  );
};
