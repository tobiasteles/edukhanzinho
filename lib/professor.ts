// Leitura de dados do professor (só servidor). Cada função confere o dono dos dados.
import db from "@/db/drizzle";
import { classStudents, classes, teachers } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, count, eq } from "drizzle-orm";

export const getTeacher = async () => {
  const { userId } = await auth();
  if (!userId) return null;
  const [teacher] = await db.select().from(teachers).where(eq(teachers.userId, userId));
  return teacher ?? null;
};

export const getTurmas = async (teacherUserId: string) =>
  db
    .select({ id: classes.id, nome: classes.nome, alunos: count(classStudents.id) })
    .from(classes)
    .leftJoin(classStudents, eq(classStudents.classId, classes.id))
    .where(eq(classes.teacherUserId, teacherUserId))
    .groupBy(classes.id);

export const getTurma = async (teacherUserId: string, turmaId: number) => {
  const [turma] = await db
    .select()
    .from(classes)
    .where(and(eq(classes.id, turmaId), eq(classes.teacherUserId, teacherUserId)));
  if (!turma) return null;
  const alunos = await db.select().from(classStudents).where(eq(classStudents.classId, turma.id)).orderBy(classStudents.nomeInterno);
  return { turma, alunos };
};
