import { Button } from "@/components/ui/button";
import { BookOpen, MessageSquareText, Sparkles, Newspaper, Search } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="hidden lg:block h-20 w-full border-t-2 border-slate-200 p-2">
      <div className="max-w-screen-lg mx-auto flex items-center justify-evenly h-full gap-x-2 text-neutral-600 font-medium">
        
        {/* Histórias e Fábulas */}
        <Button size="lg" variant="ghost" className="flex-1 gap-x-3 text-base hover:text-emerald-600 transition-colors">
          <BookOpen className="h-6 w-6 text-emerald-500" />
          <span>Histórias</span>
        </Button>

        {/* Tirinhas e Diálogos */}
        <Button size="lg" variant="ghost" className="flex-1 gap-x-3 text-base hover:text-sky-600 transition-colors">
          <MessageSquareText className="h-6 w-6 text-sky-500" />
          <span>Tirinhas</span>
        </Button>

        {/* Poesias e Rimas */}
        <Button size="lg" variant="ghost" className="flex-1 gap-x-3 text-base hover:text-purple-600 transition-colors">
          <Sparkles className="h-6 w-6 text-purple-500" />
          <span>Poesias</span>
        </Button>

        {/* Notícias e Curiosidades */}
        <Button size="lg" variant="ghost" className="flex-1 gap-x-3 text-base hover:text-orange-600 transition-colors">
          <Newspaper className="h-6 w-6 text-orange-500" />
          <span>Notícias</span>
        </Button>

        {/* Mistérios e Desafios (Inferência) */}
        <Button size="lg" variant="ghost" className="flex-1 gap-x-3 text-base hover:text-rose-600 transition-colors">
          <Search className="h-6 w-6 text-rose-500" />
          <span>Mistérios</span>
        </Button>

      </div>
    </footer>
  );
}