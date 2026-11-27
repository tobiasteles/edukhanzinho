// Catálogo do personagem: bichinhos, peças e regras de desbloqueio (tudo previsível, sem sorteio).
export const ANIMALS = [
  { key: "gato", nome: "Gato" },
  { key: "leao", nome: "Leão" },
  { key: "urso", nome: "Urso" },
  { key: "coelho", nome: "Coelho" },
  { key: "elefante", nome: "Elefante" },
  { key: "sapo", nome: "Sapo" },
] as const;

export type AnimalKey = (typeof ANIMALS)[number]["key"];
export type Slot = "hat" | "face" | "neck" | "back";
export type Stats = { atividades: number; figurinhas: number; dominadas: number };

export const SLOTS: { key: Slot; nome: string }[] = [
  { key: "hat", nome: "Chapéu" },
  { key: "face", nome: "Rosto" },
  { key: "neck", nome: "Pescoço" },
  { key: "back", nome: "Costas" },
];

export const RULE_NAME: Record<keyof Stats, string> = {
  atividades: "atividades concluídas",
  figurinhas: "figurinhas",
  dominadas: "palavras dominadas",
};

export type Item = { key: string; nome: string; slot: Slot; regra: { tipo: keyof Stats; valor: number } };

export const ITEMS: Item[] = [
  { key: "fone", nome: "Fone de ouvido", slot: "hat", regra: { tipo: "atividades", valor: 0 } },
  { key: "explorador", nome: "Chapéu de explorador", slot: "hat", regra: { tipo: "atividades", valor: 10 } },
  { key: "festa", nome: "Chapéu de festa", slot: "hat", regra: { tipo: "figurinhas", valor: 3 } },
  { key: "coroa", nome: "Coroa", slot: "hat", regra: { tipo: "dominadas", valor: 3 } },
  { key: "oculos", nome: "Óculos redondos", slot: "face", regra: { tipo: "atividades", valor: 20 } },
  { key: "sol", nome: "Óculos de sol", slot: "face", regra: { tipo: "figurinhas", valor: 8 } },
  { key: "gravata", nome: "Gravata-borboleta", slot: "neck", regra: { tipo: "atividades", valor: 15 } },
  { key: "cachecol", nome: "Cachecol", slot: "neck", regra: { tipo: "figurinhas", valor: 5 } },
  { key: "mochila", nome: "Mochila", slot: "back", regra: { tipo: "atividades", valor: 30 } },
  { key: "capa", nome: "Capa de herói", slot: "back", regra: { tipo: "dominadas", valor: 5 } },
];

export const isUnlocked = (item: Item, stats: Stats) => stats[item.regra.tipo] >= item.regra.valor;
export const missing = (item: Item, stats: Stats) => Math.max(item.regra.valor - stats[item.regra.tipo], 0);
