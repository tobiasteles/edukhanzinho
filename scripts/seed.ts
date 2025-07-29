import "dotenv/config";

import * as schema from "../db/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);

const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log("Seeding database");
    await db.delete(schema.courses);
    await db.delete(schema.userProgress);
    await db.delete(schema.units);
    await db.delete(schema.lessons);
    await db.delete(schema.challenges);
    await db.delete(schema.challengeOptions);
    await db.delete(schema.challengeProgress);
    await db.delete(schema.userSubscription);

    await db.insert(schema.courses).values([
      {
        id: 1,
        title: "Aprender a Ler",
        imageSrc: "/brain.png",
      },
      {
        id: 2,
        title: "Letras e Sons",
        imageSrc: "/cube.png",
      },
      {
        id: 3,
        title: "Sílabas e Palavras",
        imageSrc: "/speak.png",
      },
      {
        id: 4,
        title: "Frases Simples",
        imageSrc: "/writing.png",
      },
      {
        id: 5,
        title: "Histórias Curtas",
        imageSrc: "/book.png",
      },
      {
        id: 6,
        title: "Compreensão",
        imageSrc: "/game.png",
      },
    ]);

    // Unidades

    await db.insert(schema.units).values([
      {
        id: 1,
        courseId: 1, //Aprender a Ler
        title: "Unidade 1",
        description:
          "Ensinar o som das letras + associar a letra à imagem e ao som correspondente.",
        order: 1,
      },
    ]);

    // Lições

    await db.insert(schema.lessons).values([
      {
        id: 1,
        unitId: 1,
        order: 1,
        title: "Qual som a letra faz?",
      },
    ]);
    await db.insert(schema.lessons).values([
      {
        id: 2,
        unitId: 1,
        order: 2,
        title: "Qual som a letra faz? Parte 2",
      },
    ]);
    await db.insert(schema.lessons).values([
      {
        id: 3,
        unitId: 1,
        order: 3,
        title: "Qual som a letra faz? Parte 3",
      },
    ]);
    await db.insert(schema.lessons).values([
      {
        id: 4,
        unitId: 1,
        order: 4,
        title: "Qual som a letra faz? Parte 4",
      },
    ]);
    await db.insert(schema.lessons).values([
      {
        id: 5,
        unitId: 1,
        order: 5,
        title: "Qual som a letra faz? Parte 5",
      },
    ]);

    // Desafios
    await db.insert(schema.challenges).values([
      {
        id: 1,
        lessonId: 1,
        type: "SELECT",
        order: 1,
        question: "Qual som a letra A faz?",
      },
      {
        id: 2,
        lessonId: 1,
        type: "ASSIST",
        order: 2,
        question: "Qual som a letra B faz?",
      },
      {
        id: 3,
        lessonId: 1,
        type: "SELECT",
        order: 3,
        question: "Qual som a letra C faz?",
      },
    ]);
    // Opção dos desafios
    await db.insert(schema.challengeOptions).values([
      {
        id: 1,
        challengeId: 1,
        imageSrc: "/a.png",
        correct: true,
        text: "A",
        audioSrc: "/a.mp3",
      },
      {
        id: 2,
        challengeId: 1,
        imageSrc: "/b.png",
        correct: false,
        text: "B",
        audioSrc: "/b.mp3",
      },
      {
        id: 3,
        challengeId: 1,
        imageSrc: "/c.png",
        correct: false,
        text: "C",
        audioSrc: "/c.mp3",
      },
    ]);
    await db.insert(schema.challengeOptions).values([
      {
        id: 4,
        challengeId: 2,
        correct: false,
        text: "A",
        audioSrc: "/a.mp3",
      },
      {
        id: 5,
        challengeId: 2,
        correct: true,
        text: "B",
        audioSrc: "/b.mp3",
      },
      {
        id: 6,
        challengeId: 2,
        correct: false,
        text: "C",
        audioSrc: "/c.mp3",
      },
    ]);
    await db.insert(schema.challengeOptions).values([
      {
        id: 7,
        challengeId: 3,
        imageSrc: "/a.png",
        correct: false,
        text: "A",
        audioSrc: "/a.mp3",
      },
      {
        id: 8,
        challengeId: 3,
        imageSrc: "/b.png",
        correct: false,
        text: "B",
        audioSrc: "/b.mp3",
      },
      {
        id: 9,
        challengeId: 3,
        imageSrc: "/c.png",
        correct: true,
        text: "C",
        audioSrc: "/c.mp3",
      },
    ]);

    await db.insert(schema.challenges).values([
      {
        id: 4,
        lessonId: 2,
        type: "SELECT",
        order: 1,
        question: "Qual som a letra A faz?",
      },
      {
        id: 5,
        lessonId: 2,
        type: "ASSIST",
        order: 2,
        question: "Qual som a letra B faz?",
      },
      {
        id: 6,
        lessonId: 2,
        type: "SELECT",
        order: 3,
        question: "Qual som a letra C faz?",
      },
    ]);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to seed the database");
  }
};

main();
