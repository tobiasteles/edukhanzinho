import { challengeOptions, challenges } from "@/db/schema"
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SpeakButton } from "@/components/speak-button";
import { Card } from "./card";

type Props = {
    options: typeof challengeOptions.$inferSelect[];
    onSelect: (id: number) => void;
    status: "correct" | "wrong" | "none";
    selectedOption?: number;
    disabled?: boolean;
    type: typeof challenges.$inferSelect["type"];
}

export const Challenge = ({
    options,
    onSelect,
    status,
    selectedOption,
    disabled,
    type
}: Props) => {
return (
    <div className={cn(
        "grid auto-rows-fr gap-4 lg:gap-6", type === "ASSIST" && "grid-cols-1",
        type === "SELECT" && "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
    )}>
        {options.map((option, i) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
              className="relative h-full"
            >
              <Card
              id={option.id}
              text={option.text}
              imageSrc={option.imageSrc}
              shortcut = {`${i+1}`}
              selected={selectedOption === option.id}
              onClick={() => onSelect(option.id)}
              status={status}
              audioSrc={option.audioSrc}
              disabled={disabled}
              type={type}
              />
              {option.text.trim() && (
                <SpeakButton text={option.text} className="absolute right-3 top-3" />
              )}
            </motion.div>
        ))}
    </div>
)
}