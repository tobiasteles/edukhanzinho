import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SidebarItem } from "./sidebar-item";
import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { Loader } from "lucide-react";

type Props = {
  className?: string;
};

export const Sidebar = ({ className }: Props) => {
  return (
    <div
      className={cn(
        "flex bg-white h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r-2 flex-col",
        className
      )}
    >
        <Link href="/learn">
      <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3 max-w-full overflow-hidden">
        <Image src="/SELO/SELO 2.png" height={50} width={50} alt="Logo" />
        <h1 className="text-xl lg:text-lg font-extrabold text-blue-700 tracking-wide break-words w-full">
          Edukhanzinho
        </h1>
      </div>
      </Link>
      <div className="flex flex-col gap-y-2 flex-1">
        <SidebarItem label="Aprenda" href="/learn" iconSrc="/learn.png" />
        <SidebarItem label="Classificação" href="/leaderboard" iconSrc="/leaderboard.png" />
        <SidebarItem label="Missões" href="/quests" iconSrc="/quest.png" />
        <SidebarItem label="Compras" href="/shop" iconSrc="/shop.png" />
      </div>
      <div className="p-4">
        <ClerkLoading>
            <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
        </ClerkLoading>
        <ClerkLoaded>
            <UserButton afterSignOutUrl="/" />
        </ClerkLoaded>
      </div>
    </div>
    
  );
};
