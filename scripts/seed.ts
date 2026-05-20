import "dotenv/config";
import * as schema from "../db/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log("Apagando tabelas para aplicar nova estrutura de Interpretação...");
    await db.delete(schema.courses);
    await db.delete(schema.userProgress);
    await db.delete(schema.units);
    await db.delete(schema.lessons);
    await db.delete(schema.challenges);
    await db.delete(schema.challengeOptions);
    await db.delete(schema.challengeProgress);
    await db.delete(schema.userSubscription);

    console.log("Inserindo Curso: Edukhanzinho Leitura...");
    await db.insert(schema.courses).values([
      {
        id: 1,
        title: "Interpretação de Texto",
        imageSrc: "/simbolo-5.jpg", // O seu novo logotipo marcando o curso
      },
    ]);

    console.log("Inserindo Unidades de Progresso...");
    await db.insert(schema.units).values([
      {
        id: 1,
        courseId: 1,
        title: "Unidade 1: Detetives de Pistas",
        description: "Encontre informações escondidas nos textos e entenda a ideia principal.",
        order: 1,
      },
    ]);

    console.log("Inserindo Lições de Interpretação...");
    await db.insert(schema.lessons).values([
      {
        id: 1,
        unitId: 1,
        title: "Ideia Central e Detalhes",
        order: 1,
      },
      {
        id: 2,
        unitId: 1,
        title: "Decifrando Tirinhas e Imagens",
        order: 2,
      },
    ]);

    console.log("Inserindo Desafios (Textos + Perguntas)...");
    await db.insert(schema.challenges).values([
      // --- LIÇÃO 1: Ideia Central e Detalhes ---
      {
        id: 1,
        lessonId: 1,
        type: "SELECT",
        order: 1,
        question: '"O cãozinho Totó viu uma borboleta azul no jardim. Ele correu tanto para tentar pegá-la que acabou dormindo na grama de tão cansado." — Qual é a ideia principal do texto?',
      },
      {
        id: 2,
        lessonId: 1,
        type: "ASSIST",
        order: 2,
        question: '"O cãozinho Totó viu uma borboleta azul no jardim. Ele correu tanto para tentar pegá-la que acabou dormindo na grama de tão cansado." — Por que Totó dormiu na grama?',
      },
      
      // --- LIÇÃO 2: Decifrando Tirinhas e Imagens ---
      {
        id: 3,
        lessonId: 2,
        type: "SELECT",
        order: 1,
        question: '"Na tirinha, o gatinho olha para o prato vazio, depois olha para o dono com olhos gigantes e começa a ronronar bem alto." — O que o gatinho quer dizer com essa atitude?',
      },
    ]);

    console.log("Inserindo Opções de Resposta (Interpretação Alternativas)...");
    await db.insert(schema.challengeOptions).values([
      // Opções para o Desafio 1 (Ideia principal do Totó)
      {
        id: 1,
        challengeId: 1,
        correct: true,
        text: "Um cãozinho que se cansou de brincar com a borboleta.",
      },
      {
        id: 2,
        challengeId: 1,
        correct: false,
        text: "A cor azul da borboleta do jardim.",
      },
      {
        id: 3,
        challengeId: 1,
        correct: false,
        text: "Que a grama do jardim estava muito verde.",
      },

      // Opções para o Desafio 2 (Causa/Efeito - Por que dormiu?)
      {
        id: 4,
        challengeId: 2,
        correct: false,
        text: "Porque ele não gostava de borboletas.",
      },
      {
        id: 5,
        challengeId: 2,
        correct: true,
        text: "Porque ele correu muito e ficou exausto.",
      },
      {
        id: 6,
        challengeId: 2,
        correct: false,
        text: "Porque já era noite no jardim.",
      },

      // Opções para o Desafio 3 (Linguagem não-verbal - Gatinho)
      {
        id: 7,
        challengeId: 3,
        correct: false,
        text: "Que ele quer sair para passear na rua.",
      },
      {
        id: 8,
        challengeId: 3,
        correct: false,
        text: "Que ele está com medo do seu dono.",
      },
      {
        id: 9,
        challengeId: 3,
        correct: true,
        text: "Que ele está pedindo comida de um jeito fofo.",
      },
    ]);

    console.log("Banco de dados populado com sucesso para o Edukhanzinho Leitura! 🎉");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to seed the database");
  }
};

main();