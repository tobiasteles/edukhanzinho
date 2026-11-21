import type { Metadata } from "next";
import { Kode_Mono, Fredoka, Andika } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ExitModal } from "@/components/modals/exit-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { PracticeModal } from "@/components/modals/practice-modal";

// Kode Mono: só na marca (logo/nome). Fredoka: interface e botões. Andika: textos que a criança lê nos exercícios.
const kodeMono = Kode_Mono({ variable: "--font-kode-mono", subsets: ["latin"] });
const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"] });
const andika = Andika({
  variable: "--font-andika",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Edukhanzinho | Leitura e alfabetização para crianças",
  description:
    "Edukhanzinho é um jogo educativo para crianças aprenderem a ler e a escrever: letras, sílabas e palavras em lições curtas, com imagens, sons e muita brincadeira.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR">
        <body
          className={`${kodeMono.variable} ${fredoka.variable} ${andika.variable} font-ui bg-edu-cream text-edu-ink`}
        >
          <Toaster />
          <ExitModal />
          <HeartsModal />
          <PracticeModal />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}