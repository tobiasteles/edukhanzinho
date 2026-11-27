// Apelidos que aparecem para as crianças no lugar do nome real (ex.: "Leão Valente 42").
import { ANIMALS } from "./avatar-catalogo";

const ADJETIVOS = ["Alegre", "Curioso", "Corajoso", "Esperto", "Veloz", "Gentil", "Brilhante", "Sorridente", "Valente", "Criativo"];

const sorteia = <T,>(lista: readonly T[]) => lista[Math.floor(Math.random() * lista.length)];

// Gera um apelido diferente de todos os já usados na turma.
export const gerarApelido = (usados: Set<string>) => {
  for (let tentativa = 0; tentativa < 500; tentativa++) {
    const animal = sorteia(ANIMALS);
    const apelido = `${animal.nome} ${sorteia(ADJETIVOS)} ${10 + Math.floor(Math.random() * 90)}`;
    if (!usados.has(apelido)) {
      usados.add(apelido);
      return { apelido, animal: animal.key };
    }
  }
  throw new Error("Não foi possível gerar um apelido novo");
};
