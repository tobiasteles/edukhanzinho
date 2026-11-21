import { Button } from "@/components/ui/button";
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-[988px] mx-auto flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-4 gap-8">
      <div className="relative w-[240px] h-[240px] lg:w-[424px] lg:h-[424px] mb-8 lg:mb-0">
        <Image
          src="/hero.png"
          alt="Edukhanzinho - leitura e alfabetização para crianças"
          fill
          className="object-contain"
          sizes="(min-width: 1024px) 424px, 240px"
          priority
        />
      </div>

      <div className="flex flex-col items-center gap-y-8 text-center px-4">
        <div className="flex flex-col gap-y-3 items-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-edu-blue bg-edu-blue/10 px-3 py-1 rounded-full border border-edu-blue/30">
            Leitura e alfabetização
          </span>
          <h1 className="text-xl lg:text-3xl font-semibold text-edu-ink max-w-[480px] leading-tight">
            Aprenda a ler e a escrever brincando, uma letrinha de cada vez!
          </h1>
        </div>

        <div className="flex flex-col items-center gap-y-3 max-w-[300px] w-full">
          <ClerkLoading>
            <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
          </ClerkLoading>
          <ClerkLoaded>
            <SignedOut>
              <SignUpButton mode="modal" forceRedirectUrl="/learn" signInForceRedirectUrl="/learn">
                <Button size="lg" variant="secondary" className="w-full">Vamos começar?</Button>
              </SignUpButton>
              <SignInButton mode="modal" forceRedirectUrl="/learn" signUpForceRedirectUrl="/learn">
                <Button size="lg" variant="primaryOutline" className="w-full">Eu já tenho uma conta</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Button size="lg" variant="secondary" className="w-full" asChild>
                <Link href="/learn">
                  Continue aprendendo
                </Link>
              </Button>
            </SignedIn>
          </ClerkLoaded>
        </div>
      </div>
    </div>
  );
}