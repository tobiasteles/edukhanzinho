// Itens de apoio (Pena da dica e Corda extra): estoque, limite e regras para ganhar. Só roda no servidor.
import db from "@/db/drizzle";
import { challengeProgress, userAvatar, userStickers, userSupplies } from "@/db/schema";
import { and, count, eq } from "drizzle-orm";

export const START_PENAS = 2;
export const START_CORDAS = 1;
export const BASE_CAP = 3; // estoque máximo de cada item
export const BACKPACK_CAP = 5; // com a Mochila vestida
export const ATIVIDADES_POR_PENA = 5;

// Dá +1 pena a cada 5 atividades concluídas e +1 corda a cada palavra dominada, respeitando o limite.
// O que passar do limite não se perde: fica esperando e entra quando a criança usar um item.
export const syncSupplies = async (userId: string) => {
  const [avatar] = await db.select().from(userAvatar).where(eq(userAvatar.userId, userId));
  const cap = avatar?.back === "mochila" ? BACKPACK_CAP : BASE_CAP;

  const [done] = await db
    .select({ n: count() })
    .from(challengeProgress)
    .where(and(eq(challengeProgress.userId, userId), eq(challengeProgress.completed, true)));
  const stickers = await db.select().from(userStickers).where(eq(userStickers.userId, userId));
  const marcos = Math.floor((done?.n ?? 0) / ATIVIDADES_POR_PENA);
  const dominadas = stickers.filter((s) => s.times >= 3).length;

  const [row] = await db.select().from(userSupplies).where(eq(userSupplies.userId, userId));
  const penas = row?.penas ?? START_PENAS;
  const cordas = row?.cordas ?? START_CORDAS;
  const penasGanhas = row?.penasGanhas ?? 0;
  const cordasGanhas = row?.cordasGanhas ?? 0;

  const novasPenas = Math.min(Math.max(marcos - penasGanhas, 0), Math.max(cap - penas, 0));
  const novasCordas = Math.min(Math.max(dominadas - cordasGanhas, 0), Math.max(cap - cordas, 0));
  const next = {
    penas: penas + novasPenas,
    cordas: cordas + novasCordas,
    penasGanhas: penasGanhas + novasPenas,
    cordasGanhas: cordasGanhas + novasCordas,
  };

  if (!row || novasPenas > 0 || novasCordas > 0) {
    await db
      .insert(userSupplies)
      .values({ userId, ...next })
      .onConflictDoUpdate({ target: userSupplies.userId, set: next });
  }

  return { penas: next.penas, cordas: next.cordas, cap, novasPenas, novasCordas };
};
