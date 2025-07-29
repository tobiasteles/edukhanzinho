import { Button } from "@/components/ui/button";
import Image from "next/image";

export const Footer = () => {
    return (
        <footer className="hidden lg:block h-20 w-full border-t-2 border-slate-200 p-2">
            <div className="max-w-screen-lg mx-auto flex items-center justify-evenly h-full">
            <Button size="lg" variant="ghost" className="flex-1">
                <Image src="/A.png" alt="A" height={32} width={40}  className="mr-4 rounded-md"/>
            </Button>
            <Button size="lg" variant="ghost" className="flex-1">
                <Image src="/E.png" alt="E" height={32} width={40}  className="mr-4 rounded-md"/>
            </Button>
            <Button size="lg" variant="ghost" className="flex-1">
                <Image src="/I.png" alt="I" height={32} width={40}  className="mr-4 rounded-md"/>
            </Button>
            <Button size="lg" variant="ghost" className="flex-1">
                <Image src="/O.png" alt="O" height={32} width={40}  className="mr-4 rounded-md"/>
                </Button>
            <Button size="lg" variant="ghost" className="flex-1">
                <Image src="/U.png" alt="U" height={32} width={40}  className="mr-4 rounded-md"/>
            </Button>
            </div>
        </footer>
    );
}