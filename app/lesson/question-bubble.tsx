import Image from "next/image";

type Props = {
    question: string;
};

export const QuestionBubble = ({ question }: Props) => {
    return (
        <div className="flex items-center gap-x-4 mb-6">
            <Image
            src="/face.png"
            alt="User Avatar"
            width={60}
            height={60}
            className="hidden lg:block"
            />
            <Image
            src="/face.png"
            alt="User Avatar"
            width={60}
            height={60}
            className="block lg:hidden"/>
            <div className="relative py-2 px-4 border-2 rounded-xl text-sm lg:text-base">
                {question}
                <div className="absolute -left-3 top-1/2 w-0 h-2 border-x-8 border-x-transparent border-t-8 transform -translate-y-1/2 rotate-90" />
            </div>
        </div>
    )
}