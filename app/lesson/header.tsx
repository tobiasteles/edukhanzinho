import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useExitModal } from "@/store/use-exit-modal";
import { Volume2, VolumeX, X } from "lucide-react";

type Props = {
    percentage: number;
    autoRead: boolean;
    onToggleAutoRead: () => void;
}

export const Header = ({
    percentage,
    autoRead,
    onToggleAutoRead,
}: Props) => {
    const { open } = useExitModal();

    return (
        <header className="lg:pt-[50px] pt-[20px] px-10 flex gap-x-7 items-center justify-between max-w-[1140px] mx-auto w-full ">
            <X
            onClick={open}
            className="h-7 w-7 shrink-0 text-edu-ink/40 hover:text-edu-coral transition cursor-pointer"
            />
            <Progress value={percentage} className="h-4" />
            <button
            type="button"
            onClick={onToggleAutoRead}
            aria-pressed={autoRead}
            aria-label={autoRead ? "Desligar a leitura automática" : "Ligar a leitura automática"}
            title="Ler sozinho"
            className={cn(
                "flex shrink-0 items-center gap-x-2 rounded-2xl px-3 py-1 font-ui font-semibold transition-colors",
                autoRead ? "bg-edu-sky-soft text-edu-blue" : "bg-edu-cream text-edu-ink/50"
            )}
            >
                {autoRead ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                <span className="hidden sm:inline">Ler sozinho</span>
            </button>
        </header>
    )
}