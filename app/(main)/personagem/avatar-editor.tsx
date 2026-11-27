"use client";

import { saveAvatar } from "@/actions/avatar";
import { Avatar } from "@/components/avatar/avatar";
import { Button } from "@/components/ui/button";
import { ANIMALS, ITEMS, RULE_NAME, SLOTS, isUnlocked, missing, type Item, type Slot, type Stats } from "@/lib/avatar-catalogo";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type Props = {
  initial: { animal: string; hat: string | null; face: string | null; neck: string | null; back: string | null };
  stats: Stats;
};

export const AvatarEditor = ({ initial, stats }: Props) => {
  const [animal, setAnimal] = useState(initial.animal);
  const [equip, setEquip] = useState<Record<Slot, string | null>>({
    hat: initial.hat,
    face: initial.face,
    neck: initial.neck,
    back: initial.back,
  });
  const [pending, startTransition] = useTransition();

  const toggle = (item: Item) => {
    if (!isUnlocked(item, stats)) return;
    setEquip((prev) => ({ ...prev, [item.slot]: prev[item.slot] === item.key ? null : item.key }));
  };

  const save = () =>
    startTransition(() => {
      saveAvatar({ animal, ...equip })
        .then(() => toast.success("Personagem salvo!"))
        .catch(() => toast.error("Ops! Algo deu errado. Tente de novo."));
    });

  return (
    <div className="flex w-full flex-col items-center gap-y-6">
      <div className="rounded-3xl border-2 border-b-[6px] border-edu-line bg-edu-sky-soft p-4">
        <Avatar look={{ animal, ...equip }} size={200} />
      </div>

      <p className="text-center font-ui text-edu-ink/70">
        Você tem {stats.atividades} atividades concluídas, {stats.figurinhas} figurinhas e {stats.dominadas} palavras dominadas.
      </p>

      <section className="w-full">
        <h2 className="mb-2 font-ui text-lg font-semibold text-edu-ink">Escolha seu bichinho</h2>
        <div className="flex flex-wrap gap-2">
          {ANIMALS.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => setAnimal(a.key)}
              aria-pressed={animal === a.key}
              aria-label={a.nome}
              className={cn(
                "rounded-2xl border-2 border-b-4 bg-white p-1 transition-colors",
                animal === a.key ? "border-edu-blue bg-edu-blue-soft" : "border-edu-line hover:bg-edu-cream"
              )}
            >
              <Avatar look={{ animal: a.key }} size={64} />
            </button>
          ))}
        </div>
      </section>

      {SLOTS.map((slot) => (
        <section key={slot.key} className="w-full">
          <h2 className="mb-2 font-ui text-lg font-semibold text-edu-ink">{slot.nome}</h2>
          <div className="flex flex-wrap gap-2">
            {ITEMS.filter((i) => i.slot === slot.key).map((item) => {
              const open = isUnlocked(item, stats);
              const on = equip[slot.key] === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  disabled={!open}
                  onClick={() => toggle(item)}
                  aria-pressed={on}
                  className={cn(
                    "flex flex-col items-start rounded-2xl border-2 border-b-4 px-3 py-2 text-left font-ui",
                    on ? "border-edu-green bg-edu-green-soft text-edu-green-edge" : open ? "border-edu-line bg-white text-edu-ink hover:bg-edu-cream" : "border-edu-line bg-edu-cream text-edu-ink/50"
                  )}
                >
                  <span className="flex items-center gap-x-1 font-semibold">
                    {!open && <Lock className="h-4 w-4" />}
                    {item.nome}
                  </span>
                  {!open && (
                    <span className="text-xs">
                      Faltam {missing(item, stats)} {RULE_NAME[item.regra.tipo]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <Button variant="secondary" size="lg" onClick={save} disabled={pending} className="w-full max-w-xs">
        Salvar personagem
      </Button>
    </div>
  );
};
