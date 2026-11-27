"use server";

import db from "@/db/drizzle";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import { challengeOptions, challengeProgress, challenges, userProgress, userStickers } from "@/db/schema";
import catalogo from "@/lib/stickers-catalogo.json";
import { syncSupplies } from "@/lib/supplies";
import { auth } from "@clerk/nextjs/server";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const upsertChallengeProgress = async (challengeId: number, answer: number | number[]) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Não autorizado");
  }

  const valid = Array.isArray(answer)
    ? answer.length > 0 && answer.length <= 12 && answer.every((id) => Number.isInteger(id))
    : Number.isInteger(answer);

  if (!Number.isInteger(challengeId) || !valid) {
    throw new Error("Dados inválidos");
  }

  const currentUserProgress = await getUserProgress();
  const userSubscription = await getUserSubscription();
 
  if (!currentUserProgress) {
    throw new Error("Progresso do usuário não encontrado");
  }

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  if (!challenge) {
    throw new Error("Desafio não encontrado");
  }

  // o servidor confere a resposta: não confiamos no que o navegador diz
  const allOptions = await db.query.challengeOptions.findMany({
    where: eq(challengeOptions.challengeId, challengeId),
  });

  if (challenge.type === "BUILD" || challenge.type === "HANGMAN") {
    // montar a palavra e forca: confere a ordem das peças pelo texto (letras repetidas são peças diferentes)
    if (!Array.isArray(answer)) throw new Error("Resposta inválida");
    const expected = allOptions.filter((o) => o.correct).sort((a, b) => a.id - b.id).map((o) => o.text);
    const byId = new Map(allOptions.map((o) => [o.id, o.text]));
    const given = answer.map((id) => byId.get(id));
    const distinct = new Set(answer).size === answer.length;
    if (!distinct || given.length !== expected.length || given.some((t, i) => t !== expected[i])) {
      throw new Error("Resposta inválida");
    }
  } else {
    if (typeof answer !== "number") throw new Error("Resposta inválida");
    const option = allOptions.find((o) => o.id === answer);
    if (!option?.correct) throw new Error("Resposta inválida");
  }

  const lessonId = challenge.lessonId;

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId)
    ),
  });

  const isPractice = !!existingChallengeProgress;

  if (isPractice) {
    await db
      .update(challengeProgress)
      .set({
        completed: true,
      })
      .where(eq(challengeProgress.id, existingChallengeProgress.id));

    revalidatePath("/learn");
    revalidatePath("/lesson");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    revalidatePath(`/lesson/${lessonId}`);
    return;
  }

  await db.insert(challengeProgress).values({
    challengeId,
    userId,
    completed: true,
  });

  await db
    .update(userProgress)
    .set({
      points: sql`${userProgress.points} + 100`,
    })
    .where(eq(userProgress.userId, userId));

  // figurinha: usa a figura da resposta certa (só figuras de palavras, na raiz de /imageSrc)
  let sticker: { key: string; nome: string; imagem: string; times: number } | null = null;
  const figure = allOptions.filter((o) => o.correct).sort((a, b) => a.id - b.id).find((o) => o.imageSrc);
  const key = figure?.imageSrc?.match(/^\/imageSrc\/([a-z0-9]+)\.png$/)?.[1];
  const entry = key ? catalogo.find((c) => c.key === key) : undefined;

  if (entry) {
    const [row] = await db
      .insert(userStickers)
      .values({ userId, stickerKey: entry.key, times: 1 })
      .onConflictDoUpdate({
        target: [userStickers.userId, userStickers.stickerKey],
        set: { times: sql`${userStickers.times} + 1` },
      })
      .returning({ times: userStickers.times });
    sticker = { key: entry.key, nome: entry.nome, imagem: entry.imagem, times: row?.times ?? 1 };
  }

  // itens de apoio: +1 pena a cada 5 atividades, +1 corda por palavra dominada (com limite de estoque)
  const supplies = await syncSupplies(userId);

  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath("/album");
  revalidatePath(`/lesson/${lessonId}`);
  return { sticker, supplies };
};
