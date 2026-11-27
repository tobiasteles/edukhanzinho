"use client";

import { challengeOptions, challenges, userSubscription } from "@/db/schema";
import { useEffect, useState, useTransition } from "react";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { Challenge } from "./challenge";
import { BuildChallenge } from "./build-challenge";
import { HangmanChallenge } from "./hangman-challenge";
import { Footer } from "./footer";
import { AnimatePresence, motion } from "framer-motion";
import { celebrateCorrect, celebrateFinish } from "@/lib/confetti";
import { questionSpeech, setSpeechSlow, speak, stopSpeaking } from "@/lib/speech";
import { useAutoRead } from "@/lib/use-auto-read";
import { SpeakButton } from "@/components/speak-button";
import { Button } from "@/components/ui/button";
import { spendSupply } from "@/actions/supplies";
import { Feather, LifeBuoy } from "lucide-react";
import { upsertChallengeProgress } from "@/actions/challenge-progress";
import { toast } from "sonner";
import { useAudio, useMount } from "react-use";
import Image from "next/image";
import { ResultCard } from "./result-card";
import { useRouter } from "next/navigation";
import { usePracticeModal } from "@/store/use-practice-modal";

type Props = {
  initialPercentage: number;
  initialHearts?: number; // vidas foram removidas: ignorado
  initialLessonId: number;
  initalLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean;
    challengeOptions: (typeof challengeOptions.$inferSelect)[];
  })[];
  userSubscription: typeof userSubscription.$inferSelect & {
    isActive: boolean;
  } | null;
  equipped?: { hat: string | null; face: string | null; neck: string | null; back: string | null };
  supplies?: { penas: number; cordas: number };
};

// som da tela final: só existe (e só toca) quando a tela final aparece
const FinishSound = () => {
  const [audio] = useAudio({ src: "/finished.wav", autoPlay: true });
  return audio;
};

export const Quiz = ({
  initialPercentage,
  initialLessonId,
  initalLessonChallenges,
  equipped,
  supplies,
}: Props) => {

  const { open: openPracticeModel } = usePracticeModal();

  useMount(() => {
    if (initialPercentage === 100) {
      openPracticeModel();
    }
  })

  const router = useRouter();

  const [correctAudio, , correctControls] = useAudio({ src: "/correct.wav" });
  const [incorrectAudio, , incorrectControls] = useAudio({
    src: "/incorrect.wav",
  });
  const [pending, startTransition] = useTransition();

  const [lessonId] = useState(initialLessonId);

  const [percentage, setPercentage] = useState(() => {
    return initialPercentage === 100 ? 0 : initialPercentage;
  });
  const [challenges] = useState(initalLessonChallenges);
  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = challenges.findIndex(
      (challenge) => !challenge.completed
    );
    return uncompletedIndex === -1 ? 0 : uncompletedIndex;
  });

  const [selectedOption, setSelectedOption] = useState<number>();
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");
  const [wrongCount, setWrongCount] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [built, setBuilt] = useState<number[]>([]);
  const [penas, setPenas] = useState(supplies?.penas ?? 0);
  const [cordas, setCordas] = useState(supplies?.cordas ?? 0);
  const [hidden, setHidden] = useState<number[]>([]);
  const [hintTick, setHintTick] = useState(0);
  const [ropeBonus, setRopeBonus] = useState(0);
  const { autoRead, toggleAutoRead } = useAutoRead();

  // poder do Fone de ouvido: a voz fala mais devagar
  useEffect(() => {
    setSpeechSlow(equipped?.hat === "fone");
    return () => setSpeechSlow(false);
  }, [equipped?.hat]);

  const challenge = challenges[activeIndex];
  const options = challenge?.challengeOptions ?? [];
  const isBuild = challenge?.type === "BUILD";
  const isHangman = challenge?.type === "HANGMAN";
  const answerSeq = options.filter((o) => o.correct).sort((a, b) => a.id - b.id);

  const finished = !challenge;
  useEffect(() => {
    if (finished) celebrateFinish();
  }, [finished]);

  // para a voz ao trocar de pergunta ou sair da lição
  useEffect(() => {
    stopSpeaking();
    return () => stopSpeaking();
  }, [challenge?.id]);

  // lê a pergunta (e opções curtas) sozinho, para crianças que ainda não leem
  useEffect(() => {
    if (!challenge || !autoRead) return;
    const t = setTimeout(
      () =>
        speak(
          challenge.type === "BUILD" || challenge.type === "HANGMAN"
            ? challenge.question
            : questionSpeech(challenge.question, challenge.challengeOptions.map((o) => o.text))
        ),
      400
    );
    return () => clearTimeout(t);
  }, [challenge?.id, autoRead]);

  const onNext = () => {
    setActiveIndex((current) => current + 1);
    setWrongCount(0);
    setRevealed(false);
    setBuilt([]);
    setHidden([]);
    setRopeBonus(0);
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;

    stopSpeaking();
    setSelectedOption(id);
  };

  // itens de apoio: o servidor desconta do estoque; a ajuda depende do tipo de atividade
  const wrongVisible = options.filter((o) => !o.correct && !hidden.includes(o.id) && o.id !== selectedOption);
  const canPena =
    status === "none" &&
    !pending &&
    penas > 0 &&
    (isHangman || (isBuild ? built.length < answerSeq.length : wrongVisible.length >= 2));
  const canCorda = status === "none" && !pending && cordas > 0 && isHangman;

  const onUsePena = () => {
    if (!challenge || !canPena) return;
    startTransition(() => {
      spendSupply("pena")
        .then((r) => {
          setPenas(r.penas);
          setCordas(r.cordas);
          if (!r.ok) {
            toast.error("Você não tem mais penas.");
            return;
          }
          if (isHangman) {
            setHintTick((n) => n + 1);
          } else if (isBuild) {
            let k = 0;
            while (k < built.length && options.find((o) => o.id === built[k])?.text === answerSeq[k]?.text) k++;
            setBuilt(answerSeq.slice(0, Math.min(k + 1, answerSeq.length)).map((o) => o.id));
          } else if (wrongVisible.length >= 2) {
            setHidden((prev) => [...prev, wrongVisible[0].id]);
          }
        })
        .catch(() => toast.error("Ops! Algo deu errado. Tente de novo."));
    });
  };

  const onUseCorda = () => {
    if (!challenge || !canCorda) return;
    startTransition(() => {
      spendSupply("corda")
        .then((r) => {
          setPenas(r.penas);
          setCordas(r.cordas);
          if (!r.ok) {
            toast.error("Você não tem mais cordas.");
            return;
          }
          setRopeBonus((n) => n + 1);
        })
        .catch(() => toast.error("Ops! Algo deu errado. Tente de novo."));
    });
  };

  const applySupplies = (s?: { penas: number; cordas: number; novasPenas: number; novasCordas: number } | null) => {
    if (!s) return;
    setPenas(s.penas);
    setCordas(s.cordas);
    if (s.novasPenas > 0) toast.success("Você ganhou uma pena da dica!");
    if (s.novasCordas > 0) toast.success("Você ganhou uma corda extra!");
  };

  const announceSticker = (sticker?: { nome: string; times: number } | null) => {
    if (!sticker) return;
    toast.success(
      sticker.times === 1
        ? `Nova figurinha: ${sticker.nome}!`
        : sticker.times === 3
          ? `Você dominou a palavra ${sticker.nome}!`
          : `${sticker.nome}: mais uma estrela!`
    );
  };

  // forca do balão: o jogo termina sozinho (acertou a palavra ou soltou todas as cordas)
  const onHangmanSolved = () => {
    if (!challenge || status !== "none") return;
    startTransition(() => {
      upsertChallengeProgress(challenge.id, answerSeq.map((o) => o.id))
        .then((res) => {
          correctControls.play();
          setStatus("correct");
          celebrateCorrect();
          setPercentage((prev) => prev + 100 / challenges.length);
          announceSticker(res?.sticker);
          applySupplies(res?.supplies);
        })
        .catch(() => toast.error("Ops! Algo deu errado. Tente de novo."));
    });
  };

  const onHangmanFailed = () => {
    if (status !== "none") return;
    incorrectControls.play();
    setStatus("wrong");
    setRevealed(true);
    speak(`A palavra é ${answerSeq.map((o) => o.text).join("")}`);
  };

  const onContinue = () => {
    if (isHangman ? status === "none" : isBuild ? built.length < answerSeq.length : !selectedOption) return;

    if (status === "wrong") {
      if (revealed) onNext(); // depois de 2 erros mostramos a resposta e seguimos em frente
      setStatus("none");
      setSelectedOption(undefined);
      setBuilt([]);
      return;
    }
    if (status === "correct") {
      onNext();
      setStatus("none");
      setSelectedOption(undefined);
      setBuilt([]);
      return;
    }

    const correctOption = options.find((option) => option.correct);

    if (!correctOption) {
      return;
    }

    const isRight = isBuild
      ? built.every((id, i) => options.find((o) => o.id === id)?.text === answerSeq[i]?.text)
      : correctOption.id === selectedOption;

    if (isRight) {
      startTransition(() => {
        upsertChallengeProgress(challenge.id, isBuild ? built : (selectedOption as number))
          .then((res) => {
            correctControls.play();
            setStatus("correct");
            celebrateCorrect();
            setPercentage((prev) => prev + 100 / challenges.length);
            announceSticker(res?.sticker);
          applySupplies(res?.supplies);
          })
          .catch(() =>
            toast.error("Ops! Algo deu errado. Tente de novo.")
          );
      });
    } else {
      const attempts = wrongCount + 1;
      setWrongCount(attempts);
      incorrectControls.play();
      setStatus("wrong");

      if (attempts >= 2) {
        // 2 erros: mostra a resposta certa (com som) e deixa a criança seguir
        setRevealed(true);
        if (isBuild) {
          setBuilt(answerSeq.map((o) => o.id));
          speak(`A palavra é ${answerSeq.map((o) => o.text).join("")}`);
        } else if (correctOption.text.trim()) {
          speak(`A resposta certa é ${questionSpeech(correctOption.text, [])}`);
        } else if (correctOption.audioSrc) {
          new Audio(correctOption.audioSrc).play().catch(() => {});
        }
      }
    }
  };
  if (!challenge) {
    return (
      <>
        <FinishSound />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center items-center justify-center h-full"
        >
          <Image
            src="/finish.png"
            alt="Finalizado"
            className="hidden lg:block"
            height={200}
            width={200}
          />
          <Image
            src="/finish.png"
            alt="Finalizado"
            className="block lg:hidden"
            height={100}
            width={100}
          />
          <h1 className="font-ui text-2xl lg:text-4xl font-semibold text-edu-ink">
            Bom trabalho! <br /> Lição concluída!
          </h1>
          <div className="flex items-center gap-x-4 w-full">
            <ResultCard variant="points" value={challenges.length * 100} />
          </div>
        </motion.div>
        <Footer
          lessonId={lessonId}
          status="completed"
          onCheck={() => router.push("/learn")}
        />
      </>
    );
  }
  const title =
    challenge.type === "ASSIST"
      ? "Selecione a opção correta"
      : challenge.question;

  return (
    <>
      {incorrectAudio}
      {correctAudio}
      <Header
        percentage={percentage}
        autoRead={autoRead}
        onToggleAutoRead={toggleAutoRead}
      />
      <div className="flex-1">
        <div className="h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -48 }}
              transition={{ duration: 0.25 }}
              style={{ zoom: equipped?.face === "oculos" ? 1.2 : 1 }} // poder dos Óculos: letras maiores
              className="lg:min-h-[350px] max-w-4xl w-full px-6 lg:px-0 flex flex-col gap-y-8 lg:gap-y-10 mx-auto items-center"
            >
              <div className="flex items-center gap-x-3">
                <SpeakButton text={title} />
                <h1 className="font-read text-xl lg:text-3xl text-center lg:text-start font-bold text-edu-ink">
                  {title}
                </h1>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="sun" onClick={onUsePena} disabled={!canPena}>
                  <Feather className="h-5 w-5" /> Pena da dica ({penas})
                </Button>
                {isHangman && (
                  <Button variant="sun" onClick={onUseCorda} disabled={!canCorda}>
                    <LifeBuoy className="h-5 w-5" /> Corda extra ({cordas})
                  </Button>
                )}
              </div>
              <div className="w-full">
                {challenge.type === "ASSIST" && (
                  <QuestionBubble question={challenge.question} />
                )}
                {isHangman ? (
                  <HangmanChallenge
                    options={options}
                    status={status}
                    revealed={revealed}
                    onSolved={onHangmanSolved}
                    onFailed={onHangmanFailed}
                    hintTick={hintTick}
                    ropeBonus={ropeBonus}
                  />
                ) : isBuild ? (
                  <BuildChallenge
                    options={options}
                    built={built}
                    onChange={setBuilt}
                    status={status}
                    revealed={revealed}
                    disabled={pending || status !== "none"}
                    seed={challenge.id}
                  />
                ) : (
                  <Challenge
                    options={options}
                    onSelect={onSelect}
                    status={status}
                    selectedOption={selectedOption}
                    revealOption={revealed ? options.find((o) => o.correct)?.id : undefined}
                    hiddenOptions={hidden}
                    disabled={pending}
                    type={challenge.type}
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <Footer
        disabled={pending || (isHangman ? status === "none" : isBuild ? built.length < answerSeq.length : !selectedOption)}
        status={status}
        revealed={revealed}
        onCheck={onContinue}
      />
    </>
  );
};
