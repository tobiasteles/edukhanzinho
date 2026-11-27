// Desenho do personagem em SVG (camadas). Só strings fixas do projeto: nada vem do usuário.
import type { AnimalKey } from "./avatar-catalogo";

type Palette = { body: string; light: string; dark: string };

const PALETTES: Record<AnimalKey, Palette> = {
  gato: { body: "#F59E0B", light: "#FDE68A", dark: "#B45309" },
  leao: { body: "#F4B942", light: "#FDE7B0", dark: "#B45309" },
  urso: { body: "#A0623A", light: "#E7C9A9", dark: "#5B3A1E" },
  coelho: { body: "#DDE3EC", light: "#FFFFFF", dark: "#F9A8D4" },
  elefante: { body: "#94A3B8", light: "#CBD5E1", dark: "#64748B" },
  sapo: { body: "#4ADE80", light: "#BBF7D0", dark: "#15803D" },
};

const behindHead = (a: AnimalKey, p: Palette) => {
  switch (a) {
    case "gato":
      return `<polygon points="56,66 60,20 98,50" fill="${p.body}"/><polygon points="144,66 140,20 102,50" fill="${p.body}"/><polygon points="66,54 66,34 86,50" fill="${p.dark}"/><polygon points="134,54 134,34 114,50" fill="${p.dark}"/>`;
    case "leao":
      return `<circle cx="100" cy="90" r="68" fill="${p.dark}"/><circle cx="58" cy="46" r="14" fill="${p.body}"/><circle cx="142" cy="46" r="14" fill="${p.body}"/>`;
    case "urso":
      return `<circle cx="60" cy="46" r="19" fill="${p.body}"/><circle cx="140" cy="46" r="19" fill="${p.body}"/><circle cx="60" cy="46" r="10" fill="${p.light}"/><circle cx="140" cy="46" r="10" fill="${p.light}"/>`;
    case "coelho":
      return `<ellipse cx="78" cy="24" rx="15" ry="40" fill="${p.body}"/><ellipse cx="122" cy="24" rx="15" ry="40" fill="${p.body}"/><ellipse cx="78" cy="26" rx="7" ry="30" fill="${p.dark}"/><ellipse cx="122" cy="26" rx="7" ry="30" fill="${p.dark}"/>`;
    case "elefante":
      return `<circle cx="42" cy="94" r="32" fill="${p.body}"/><circle cx="158" cy="94" r="32" fill="${p.body}"/><circle cx="42" cy="94" r="20" fill="${p.dark}"/><circle cx="158" cy="94" r="20" fill="${p.dark}"/>`;
    case "sapo":
      return `<circle cx="70" cy="48" r="20" fill="${p.body}"/><circle cx="130" cy="48" r="20" fill="${p.body}"/>`;
  }
};

const face = (a: AnimalKey, p: Palette) => {
  const eyes =
    a === "sapo"
      ? `<circle cx="70" cy="48" r="13" fill="#fff"/><circle cx="130" cy="48" r="13" fill="#fff"/><circle cx="72" cy="50" r="6" fill="#1F2937"/><circle cx="128" cy="50" r="6" fill="#1F2937"/>`
      : `<circle cx="80" cy="84" r="10" fill="#fff"/><circle cx="120" cy="84" r="10" fill="#fff"/><circle cx="82" cy="86" r="5" fill="#1F2937"/><circle cx="118" cy="86" r="5" fill="#1F2937"/>`;
  const trunk = a === "elefante" ? `<rect x="89" y="100" width="22" height="48" rx="11" fill="${p.body}" stroke="${p.dark}" stroke-width="2"/>` : "";
  const muzzle = a === "elefante" || a === "sapo" ? "" : `<ellipse cx="100" cy="106" rx="26" ry="19" fill="${p.light}"/>`;
  const nose = a === "elefante" ? "" : a === "sapo" ? `<circle cx="92" cy="98" r="2.5" fill="${p.dark}"/><circle cx="108" cy="98" r="2.5" fill="${p.dark}"/>` : `<ellipse cx="100" cy="98" rx="7" ry="5" fill="${p.dark}"/>`;
  const mouth = a === "sapo" ? `<path d="M70 110 Q100 132 130 110" stroke="${p.dark}" stroke-width="4" fill="none" stroke-linecap="round"/>` : a === "elefante" ? "" : `<path d="M88 112 Q100 124 112 112" stroke="${p.dark}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  const cheeks = `<circle cx="64" cy="106" r="7" fill="#FB7185" opacity="0.35"/><circle cx="136" cy="106" r="7" fill="#FB7185" opacity="0.35"/>`;
  return `<circle cx="100" cy="90" r="50" fill="${p.body}"/>${muzzle}${trunk}${cheeks}${eyes}${nose}${mouth}`;
};

const body = (p: Palette) =>
  `<ellipse cx="100" cy="182" rx="44" ry="46" fill="${p.body}"/><ellipse cx="100" cy="190" rx="28" ry="30" fill="${p.light}"/><circle cx="58" cy="176" r="12" fill="${p.body}"/><circle cx="142" cy="176" r="12" fill="${p.body}"/><ellipse cx="78" cy="224" rx="17" ry="8" fill="${p.dark}"/><ellipse cx="122" cy="224" rx="17" ry="8" fill="${p.dark}"/>`;

export const ITEM_ART: Record<string, string> = {
  fone: `<path d="M48 90 A52 52 0 0 1 152 90" fill="none" stroke="#334155" stroke-width="8" stroke-linecap="round"/><rect x="38" y="80" width="18" height="32" rx="9" fill="#EF4444"/><rect x="144" y="80" width="18" height="32" rx="9" fill="#EF4444"/>`,
  explorador: `<ellipse cx="100" cy="54" rx="68" ry="13" fill="#C08A3E"/><path d="M62 54 C62 14 138 14 138 54 Z" fill="#D9A04F"/><rect x="62" y="44" width="76" height="9" fill="#7C4A1D"/>`,
  festa: `<polygon points="100,-2 68,58 132,58" fill="#EC4899"/><circle cx="100" cy="0" r="7" fill="#FACC15"/><path d="M82 40 L118 40 M76 50 L124 50" stroke="#FACC15" stroke-width="5"/>`,
  coroa: `<polygon points="62,56 66,22 84,42 100,14 116,42 134,22 138,56" fill="#FACC15" stroke="#CA8A04" stroke-width="3" stroke-linejoin="round"/>`,
  oculos: `<g fill="none" stroke="#1F2937" stroke-width="4"><circle cx="80" cy="85" r="16"/><circle cx="120" cy="85" r="16"/><path d="M96 85 H104"/></g>`,
  sol: `<rect x="60" y="74" width="36" height="24" rx="10" fill="#111827"/><rect x="104" y="74" width="36" height="24" rx="10" fill="#111827"/><path d="M96 82 H104" stroke="#111827" stroke-width="4"/>`,
  gravata: `<polygon points="100,142 76,130 76,154" fill="#DC2626"/><polygon points="100,142 124,130 124,154" fill="#DC2626"/><circle cx="100" cy="142" r="8" fill="#991B1B"/>`,
  cachecol: `<rect x="60" y="132" width="80" height="17" rx="8" fill="#2563EB"/><rect x="112" y="140" width="17" height="38" rx="7" fill="#2563EB"/><path d="M112 154 H129 M112 164 H129" stroke="#93C5FD" stroke-width="3"/>`,
  mochila: `<rect x="128" y="142" width="38" height="54" rx="13" fill="#16A34A"/><rect x="134" y="162" width="26" height="17" rx="5" fill="#15803D"/>`,
  capa: `<path d="M62 140 Q100 128 138 140 L156 220 Q100 238 44 220 Z" fill="#DC2626"/>`,
};

export type Look = { animal?: string | null; hat?: string | null; face?: string | null; neck?: string | null; back?: string | null };

export const avatarMarkup = (look: Look) => {
  const a = (look.animal && look.animal in PALETTES ? look.animal : "gato") as AnimalKey;
  const p = PALETTES[a];
  const piece = (k?: string | null) => (k && ITEM_ART[k] ? ITEM_ART[k] : "");
  return piece(look.back) + behindHead(a, p) + body(p) + piece(look.neck) + face(a, p) + piece(look.face) + piece(look.hat);
};
