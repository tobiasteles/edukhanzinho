"use server";

import db from "@/db/drizzle";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import { challengeOptions, challengeProgress, challenges, userProgress } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const upsertChallengeProgress = async (challengeId: number, optionId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Não autorizado");
  }

  if (!Number.isInteger(challengeId) || !Number.isInteger(optionId)) {
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
  const option = await db.query.challengeOptions.findFirst({
    where: and(
      eq(challengeOptions.id, optionId),
      eq(challengeOptions.challengeId, challengeId)
    ),
  });

  if (!option?.correct) {
    throw new Error("Resposta inválida");
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

  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
  return;
};
