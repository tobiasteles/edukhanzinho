import Image from "next/image";

type Props = {
  question: string;
};

export const QuestionBubble = ({ question }: Props) => {
  return (
    <div className="mb-6 flex items-center gap-x-4">
      <Image
        src="/face.png"
        alt="Personagem do Edukhanzinho"
        width={72}
        height={72}
        className="h-14 w-14 shrink-0 lg:h-[72px] lg:w-[72px]"
      />
      <div className="relative rounded-3xl border-2 border-b-[6px] border-edu-line bg-white px-5 py-3 font-read text-lg text-edu-ink lg:text-2xl">
        {question}
        <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 border-b-2 border-l-2 border-edu-line bg-white" />
      </div>
    </div>
  );
};
