"use server";

import db from "@/db/drizzle";
import { classStudents, classes, teachers } from "@/db/schema";
import { gerarApelido } from "@/lib/apelidos";
import { ANIMALS } from "@/lib/avatar-catalogo";
import { auth } from "@clerk/nextjs/server";
import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const MAX_TURMAS = 20;
const MAX_ALUNOS = 60;

const exigirProfessor = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autorizado");
  const [teacher] = await db.select().from(teachers).where(eq(teachers.userId, userId));
  if (!teacher) throw new Error("Acesso restrito a professores");
  return userId;
};

// só o primeiro nome, sem caracteres de controle
const limpaNome = (nome: string) => nome.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 40);

const donoDaTurma = async (userId: string, turmaId: number) => {
  if (!Number.isInteger(turmaId)) throw new Error("Turma inválida");
  const [turma] = await db.select().from(classes).where(and(eq(classes.id, turmaId), eq(classes.teacherUserId, userId)));
  if (!turma) throw new Error("Turma não encontrada");
  return turma;
};

export const criarTurma = async (nome: string) => {
  const userId = await exigirProfessor();
  const limpo = limpaNome(nome).slice(0, 60);
  if (!limpo) throw new Error("Dê um nome para a turma");
  const [total] = await db.select({ n: count() }).from(classes).where(eq(classes.teacherUserId, userId));
  if ((total?.n ?? 0) >= MAX_TURMAS) throw new Error("Limite de turmas atingido");
  const [nova] = await db.insert(classes).values({ teacherUserId: userId, nome: limpo }).returning({ id: classes.id });
  revalidatePath("/professor");
  return { id: nova.id };
};

export const excluirTurma = async (turmaId: number) => {
  const userId = await exigirProfessor();
  await donoDaTurma(userId, turmaId);
  await db.delete(classes).where(eq(classes.id, turmaId));
  revalidatePath("/professor");
  return { ok: true as const };
};

// Cada nome vira um aluno com apelido e bichinho sorteados. O nome real só o professor vê.
export const adicionarAlunos = async (turmaId: number, nomes: string[]) => {
  const userId = await exigirProfessor();
  await donoDaTurma(userId, turmaId);

  const limpos = Array.from(new Set(nomes.map(limpaNome).filter(Boolean)));
  if (limpos.length === 0) throw new Error("Escreva pelo menos um nome");

  const existentes = await db.select().from(classStudents).where(eq(classStudents.classId, turmaId));
  if (existentes.length + limpos.length > MAX_ALUNOS) throw new Error(`Cada turma aceita até ${MAX_ALUNOS} alunos`);

  const usados = new Set(existentes.map((a) => a.apelido));
  const novos = limpos.map((nomeInterno) => {
    const { apelido, animal } = gerarApelido(usados);
    return { classId: turmaId, nomeInterno, apelido, animal: ANIMALS.some((a) => a.key === animal) ? animal : "gato" };
  });

  await db.insert(classStudents).values(novos);
  revalidatePath(`/professor/turma/${turmaId}`);
  revalidatePath("/professor");
  return { adicionados: novos.length };
};

export const removerAluno = async (alunoId: number) => {
  const userId = await exigirProfessor();
  if (!Number.isInteger(alunoId)) throw new Error("Aluno inválido");
  const [aluno] = await db.select().from(classStudents).where(eq(classStudents.id, alunoId));
  if (!aluno) throw new Error("Aluno não encontrado");
  await donoDaTurma(userId, aluno.classId);
  await db.delete(classStudents).where(eq(classStudents.id, alunoId));
  revalidatePath(`/professor/turma/${aluno.classId}`);
  revalidatePath("/professor");
  return { ok: true as const };
};
