// Leitura em voz alta com a Web Speech API nativa do navegador (sem custo, sem IA externa).
const LANG = "pt-BR";

export const isSpeechSupported = () =>
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  typeof SpeechSynthesisUtterance !== "undefined";

const pickVoice = () => {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === LANG) ??
    voices.find((v) => v.lang.toLowerCase().startsWith("pt")) ??
    null
  );
};

export const speak = (text: string) => {
  if (!isSpeechSupported() || !text.trim()) return;

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANG;
  utterance.rate = 0.85; // um pouco mais devagar para crianças em alfabetização
  utterance.pitch = 1.1;

  const voice = pickVoice();
  if (voice) utterance.voice = voice;

  synth.speak(utterance);
};

export const stopSpeaking = () => {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
};

// Monta o que será lido: a pergunta e, quando as opções são curtas (letras, sílabas, números), as opções também.
export const questionSpeech = (question: string, options: string[]) => {
  const clean = (t: string) => t.replace(/_+/g, " ... ").replace(/\s+/g, " ").trim();
  const texts = options.map((o) => o.trim());
  const short = texts.length > 1 && texts.every((t) => t.length > 0 && t.length <= 12);
  return clean(question) + (short ? ". " + texts.map(clean).join(". ") + "." : "");
};
