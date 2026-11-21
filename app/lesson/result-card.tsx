import { cn } from "@/lib/utils";
import Image from "next/image";

type Props = {
  value: number;
  variant: "points" | "hearts";
};


export const ResultCard = ({
value,
variant
}: Props) => {
 const imageSrc = variant === "hearts" ? "/heart.png" : "/points.png"

return (
    <div className={cn(
      "rounded-2xl border-2 w-full ",
      variant === "points" && "bg-edu-sun border-edu-sun",
      variant === "hearts" && "bg-edu-coral border-edu-coral",
    )}>
      <div className={
        cn(
          "p-1.5 text-white rounded-t-xl font-bold text-center uppercase text-xs",
          variant === "hearts" && "bg-edu-coral",
          variant === "points" && "bg-edu-sun text-edu-sun-ink"
        )
      }>
        {variant === "hearts" ? "Vidas" : "XP Total"}
      </div>
      <div className={cn(
        "rounded-2xl bg-white items-center flex justify-center p-6 font-bold text-lg",
        variant === "hearts" && "text-edu-coral-edge",
        variant === "points" && "text-edu-sun-ink",
      )}>
        <Image 
        alt="Icone"
        src={imageSrc}
        height={30}
        width={30}
        className="mr-2"
        />
        {value}
      </div>
    </div>
)
}