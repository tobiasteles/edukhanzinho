"use server";

import db from "@/db/drizzle";
import { getAvatarData } from "@/db/queries";
import { userAvatar } from "@/db/schema";
import { ANIMALS, ITEMS, isUnlocked, SLOTS } from "@/lib/avatar-catalogo";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type Input = {
  animal: string;
  hat: string | null;
  face: string | null;
  neck: string | null;
  back: string | null;
};

// Salva o personagem. O servidor confere cada peça: só entra o que a criança já conquistou.
export const saveAvatar = async (input: Input) => {
  const { userId } = await auth();
  const data = await getAvatarData();

  if (!userId || !data) throw new Error("Não autorizado");
  if (!ANIMALS.some((a) => a.key === input.animal)) throw new Error("Bichinho inválido");

  for (const { key: slot } of SLOTS) {
    const key = input[slot];
    if (key === null) continue;
    const item = ITEMS.find((i) => i.key === key && i.slot === slot);
    if (!item || !isUnlocked(item, data.stats)) throw new Error("Peça indisponível");
  }

  const values = { animal: input.animal, hat: input.hat, face: input.face, neck: input.neck, back: input.back };

  await db
    .insert(userAvatar)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: userAvatar.userId, set: values });

  revalidatePath("/personagem");
  revalidatePath("/learn");
  return { ok: true as const };
};
