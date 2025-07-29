
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
    alt="herois"
    fill
    className="object-contain"
    sizes="(min-width: 1024px) 424px, 240px"
  />
</div>

      <div className="flex flex-col items-center gap-y-8 text-center px-4">
        <h1 className="text-xl lg:text-3xl font-bold text-neutral-700 max-w-[480px]">
          Aprenda, pratique e domine o Bê-a-Bá com a gente!
        </h1>
        <div className="flex flex-col items-center gap-y-3 max-w-[300px] w-full">
          <ClerkLoading>
      <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
          </ClerkLoading>
          <ClerkLoaded>
            <SignedOut>
            <SignUpButton mode="modal" afterSignInUrl="/learn" afterSignUpUrl="/learn">
              <Button size="lg" variant="secondary" className="w-full">Vamos começar?</Button>
            </SignUpButton>
            <SignInButton mode="modal" afterSignInUrl="/learn" afterSignUpUrl="/learn">
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
