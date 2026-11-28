// Grava no banco o curso gerado por scripts/gerador_atividades.py.
// Seguro para rodar várias vezes: atualiza pelo id (sem duplicar) e NÃO apaga usuários,
// progresso, assinaturas nem o curso antigo. Só mexe nos ids gerados (curso 100+, unidades 100+,
// lições 10000+, desafios 1000000+, cursos 100+).
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { and, eq, gte, inArray, notInArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { readFileSync } from "node:fs";
import * as schema from "../db/schema";

const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

type Generated = {
  course?: typeof schema.courses.$inferInsert; // formato antigo (um curso só)
  courses?: (typeof schema.courses.$inferInsert)[];
  capasExistentes?: Record<string, string>; // trocar só a capa de cursos que já existem (ex.: o curso antigo)
  units: (typeof schema.units.$inferInsert)[];
  lessons: (typeof schema.lessons.$inferInsert)[];
  challenges: (typeof schema.challenges.$inferInsert)[];
  options: (typeof schema.challengeOptions.$inferInsert)[];
};

const chunk = <T>(items: T[], size: number) => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    out.push(items.slice(i, i + size));
  return out;
};

const main = async () => {
  const file = process.argv[2] ?? "scripts/generated/curso-alfabetizacao.json";
  const data = JSON.parse(readFileSync(file, "utf-8")) as Generated;

  console.log(`Lendo ${file}...`);

  const courseList = data.courses ?? (data.course ? [data.course] : []);
  for (const course of courseList) {
    await db
      .insert(schema.courses)
      .values(course)
      .onConflictDoUpdate({
        target: schema.courses.id,
        set: { title: course.title, imageSrc: course.imageSrc },
      });
  }

  for (const [id, imageSrc] of Object.entries(data.capasExistentes ?? {})) {
    await db
      .update(schema.courses)
      .set({ imageSrc })
      .where(eq(schema.courses.id, Number(id)));
  }

  for (const part of chunk(data.units, 50)) {
    await db
      .insert(schema.units)
      .values(part)
      .onConflictDoUpdate({
        target: schema.units.id,
        set: {
          title: sql`excluded.title`,
          description: sql`excluded.description`,
          courseId: sql`excluded.course_id`,
          order: sql`excluded."order"`,
        },
      });
  }

  for (const part of chunk(data.lessons, 50)) {
    await db
      .insert(schema.lessons)
      .values(part)
      .onConflictDoUpdate({
        target: schema.lessons.id,
        set: {
          title: sql`excluded.title`,
          unitId: sql`excluded.unit_id`,
          order: sql`excluded."order"`,
        },
      });
  }

  for (const part of chunk(data.challenges, 100)) {
    await db
      .insert(schema.challenges)
      .values(part)
      .onConflictDoUpdate({
        target: schema.challenges.id,
        set: {
          lessonId: sql`excluded.lesson_id`,
          type: sql`excluded.type`,
          question: sql`excluded.question`,
          order: sql`excluded."order"`,
        },
      });
  }

  // opções não têm progresso de usuário: apaga e reinsere, sempre sem duplicar
  const challengeIds = data.challenges.map((c) => c.id as number);
  for (const ids of chunk(challengeIds, 100)) {
    await db
      .delete(schema.challengeOptions)
      .where(inArray(schema.challengeOptions.challengeId, ids));
  }
  for (const part of chunk(data.options, 200)) {
    await db.insert(schema.challengeOptions).values(part);
  }

  // remove só o que sobrou de execuções antigas do gerador (faixa de ids gerados)
  await db
    .delete(schema.challenges)
    .where(
      and(
        gte(schema.challenges.id, 1_000_000),
        notInArray(schema.challenges.id, challengeIds),
      ),
    );
  await db.delete(schema.lessons).where(
    and(
      gte(schema.lessons.id, 10_000),
      notInArray(
        schema.lessons.id,
        data.lessons.map((l) => l.id as number),
      ),
    ),
  );
  await db.delete(schema.units).where(
    and(
      gte(schema.units.id, 100),
      notInArray(
        schema.units.id,
        data.units.map((u) => u.id as number),
      ),
    ),
  );

  // cursos gerados que sumiram do JSON (ex.: --reiniciar): solta os usuários antes, para não apagar o progresso deles
  const courseIds = courseList.map((c) => c.id as number);
  await db
    .update(schema.userProgress)
    .set({ activeCourseId: null })
    .where(
      and(
        gte(schema.userProgress.activeCourseId, 100),
        notInArray(schema.userProgress.activeCourseId, courseIds),
      ),
    );
  await db
    .delete(schema.courses)
    .where(
      and(
        gte(schema.courses.id, 100),
        notInArray(schema.courses.id, courseIds),
      ),
    );

  // ids foram gravados à mão: alinha os contadores para o painel admin não colidir depois
  for (const table of [
    "courses",
    "units",
    "lessons",
    "challenges",
    "challenge_options",
  ]) {
    await db.execute(
      sql.raw(
        `SELECT setval(pg_get_serial_sequence('${table}', 'id'), (SELECT COALESCE(MAX(id), 1) FROM ${table}))`,
      ),
    );
  }

  console.log(
    `Pronto: ${courseList.length} cursos, ${data.units.length} unidades, ${data.lessons.length} lições, ${data.challenges.length} desafios, ${data.options.length} opções.`,
  );
};

main().catch((error) => {
  console.error("Falha ao gravar o curso gerado:", error);
  process.exit(1);
});
