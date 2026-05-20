import { Button } from "@/components/ui/button";
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Image from "next/image";

export const Header = () => {
  return (
    <header className="h-20 w-full border-b-2 border-slate-200 px-4 bg-white sticky top-0 z-50">
      <div className="lg:max-w-screen-lg mx-auto flex items-center justify-between h-full">
        
        {/* Logo baseado no SÍMBOLO 5.jpg e Nome do App */}
        <div className="flex items-center gap-x-3 cursor-pointer hover:opacity-90 transition-opacity">
          <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-lg">
            <Image 
              src="/SÍMBOLO/SÍMBOLO 5.jpg" 
              alt="Edukhanzinho Logo"
              fill
              className="object-contain"
              sizes="(min-width: 640px) 48px, 40px"
              priority
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0026ff] tracking-wide">
            Edukhanzinho <span className="text-emerald-600">Leitura</span>
          </h1>
        </div>

        {/* Autenticação */}
        <div className="flex items-center">
          <ClerkLoading>
            <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
          </ClerkLoading>
          <ClerkLoaded>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal" afterSignInUrl="/learn" afterSignUp="/learn">
                <Button size="default" variant="ghost" className="text-neutral-600 font-bold hover:text-[#0026ff]">
                  Entrar
                </Button>
              </SignInButton>
            </SignedOut>
          </ClerkLoaded>
        </div>

      </div>
    </header>
  );
};