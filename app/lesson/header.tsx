import { Progress } from "@/components/ui/progress";
import { useExitModal } from "@/store/use-exit-modal";
import { InfinityIcon, X } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

type Props = {
    hearts: number;
    percentage: number;
    hasActiveSubscription: boolean;
}

export const Header = ({
    hearts,
    percentage,
    hasActiveSubscription,
}: Props) => {
    const { open } = useExitModal();

    return (
        <header className="lg:pt-[50px] pt-[20px] px-10 flex gap-x-7 items-center justify-between max-w-[1140px] mx-auto w-full ">
            <X
            onClick={open}
            className="h-7 w-7 shrink-0 text-edu-ink/40 hover:text-edu-coral transition cursor-pointer"
            />
            <Progress value={percentage} className="h-4" />
            <div className="flex items-center rounded-2xl bg-edu-coral-soft px-3 py-1 font-ui font-semibold text-edu-coral-edge">
                <Image
                src="/heart.png"
                height={28}
                width={28}
                alt="Vidas"
                className="mr-2"
                />
                {hasActiveSubscription
                ? <InfinityIcon className="h-6 w-6 stroke-[3] shrink-0" /> : (
                    <motion.span key={hearts} initial={{ scale: 1.6 }} animate={{ scale: 1 }} className="inline-block">
                        {hearts}
                    </motion.span>
                )
                }
            </div>
        </header>
    )
}