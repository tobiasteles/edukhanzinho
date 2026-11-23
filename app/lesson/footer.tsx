import { useKey, useMedia } from "react-use";
import { CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  onCheck: () => void;
  status: "correct" | "wrong" | "none" | "completed";
  disabled?: boolean;
  lessonId?: number;
  revealed?: boolean;
};

export const Footer = ({ onCheck, status, disabled, lessonId, revealed }: Props) => {
  useKey("Enter", onCheck, {}, [onCheck]);
  const isMobile = useMedia("(max-width: 1024px)", false);

  return (
    <footer
      className={cn(
        "h-[100px] lg:h-[140px] border-t-2 border-edu-line/60 transition-colors duration-300",
        status === "correct" && "border-transparent bg-edu-green-soft",
        status === "wrong" && "border-transparent bg-edu-coral-soft"
      )}
    >
      <div className="max-w-[1140px] h-full mx-auto flex items-center justify-between px-6 lg:px-10">
        {status === "correct" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-ui text-edu-green-edge font-semibold text-lg lg:text-3xl flex items-center"
          >
            <CheckCircle className="h-7 w-7 lg:h-10 lg:w-10 mr-3 lg:mr-4" />
            Muito bem!
          </motion.div>
        )}
        {status === "wrong" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-ui text-edu-coral-edge font-semibold text-lg lg:text-3xl flex items-center"
          >
            <XCircle className="h-7 w-7 lg:h-10 lg:w-10 mr-3 lg:mr-4" />
            {revealed ? "Veja a resposta certa em verde!" : "Quase! Tente de novo."}
          </motion.div>
        )}
        {status === "completed" && (
         <Button
         variant="default"
         size={isMobile ? "sm" : "lg"}
         onClick={() => window.location.href = `/lesson/${lessonId}`}
         >
            Pratique novamente.
         </Button>
        )}
        <Button
          disabled={disabled}
          className="ml-auto"
          onClick={onCheck}
          size={isMobile ? "sm" : "lg"}
          variant={status === "wrong" && !revealed ? "danger" : "secondary"}
        >
          {status === "none" && "Verificar"}
          {status === "correct" && "Próximo"}
          {status === "wrong" && (revealed ? "Próximo" : "Tentar de novo")}
          {status === "completed" && "Continuar"}
        </Button>
      </div>
    </footer>
  );
};
