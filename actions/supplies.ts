"use server";

import db from "@/db/drizzle";
import { userSupplies } from "@/db/schema";
import { START_CORDAS, START_PENAS } from "@/lib/supplies";
import { auth } from "@clerk/nextjs/server";
import { and, eq, gt, sql } from "drizzle-orm";

// Gasta 1 item do estoque. O desconto é feito no servidor: não dá para usar mais do que se tem.
export const spendSupply = async (kind: "pena" | "corda") => {
  const { userId } = await auth();

  if (!userId) throw new Error("Não autorizado");
  if (kind !== "pena" && kind !== "corda") throw new Error("Item inválido");

  await db
    .insert(userSupplies)
    .values({ userId, penas: START_PENAS, cordas: START_CORDAS })
    .onConflictDoNothing();

  const stock = kind === "pena" ? userSupplies.penas : userSupplies.cordas;
  const [row] = await db
    .update(userSupplies)
    .set(kind === "pena" ? { penas: sql`${userSupplies.penas} - 1` } : { cordas: sql`${userSupplies.cordas} - 1` })
    .where(and(eq(userSupplies.userId, userId), gt(stock, 0)))
    .returning({ penas: userSupplies.penas, cordas: userSupplies.cordas });

  if (row) return { ok: true as const, penas: row.penas, cordas: row.cordas };

  const [current] = await db.select().from(userSupplies).where(eq(userSupplies.userId, userId));
  return { ok: false as const, penas: current?.penas ?? 0, cordas: current?.cordas ?? 0 };
};
