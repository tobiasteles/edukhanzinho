"use client";

import { challengeOptions, challenges, userSubscription } from "@/db/schema";
import { useEffect, useState, useTransition } from "react";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { Challenge } from "./challenge";
import { Footer } from "./footer";
import { AnimatePresence, motion } from "framer-motion";
import { celebrateCorrect, celebrateFinish } from "@/lib/confetti";
import { questionSpeech, speak, stopSpeaking } from "@/lib/speech";
import { useAutoRead } from "@/lib/use-auto-read";
import { SpeakButton } from "@/components/speak-button";
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
  const { autoRead, toggleAutoRead } = useAutoRead();

  const challenge = challenges[activeIndex];
  const options = challenge?.challengeOptions ?? [];

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
      () => speak(questionSpeech(challenge.question, challenge.challengeOptions.map((o) => o.text))),
      400
    );
    return () => clearTimeout(t);
  }, [challenge?.id, autoRead]);

  const onNext = () => {
    setActiveIndex((current) => current + 1);
    setWrongCount(0);
    setRevealed(false);
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;

    stopSpeaking();
    setSelectedOption(id);
  };

  const onContinue = () => {
    if (!selectedOption) return;

    if (status === "wrong") {
      if (revealed) onNext(); // depois de 2 erros mostramos a resposta e seguimos em frente
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }
    if (status === "correct") {
      onNext();
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    const correctOption = options.find((option) => option.correct);

    if (!correctOption) {
      return;
    }

    if (correctOption && correctOption.id === selectedOption) {
      startTransition(() => {
        upsertChallengeProgress(challenge.id, selectedOption)
          .then(() => {
            correctControls.play();
            setStatus("correct");
            celebrateCorrect();
            setPercentage((prev) => prev + 100 / challenges.length);
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
        if (correctOption.text.trim()) {
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
              className="lg:min-h-[350px] max-w-4xl w-full px-6 lg:px-0 flex flex-col gap-y-8 lg:gap-y-10 mx-auto items-center"
            >
              <div className="flex items-center gap-x-3">
                <SpeakButton text={title} />
                <h1 className="font-read text-xl lg:text-3xl text-center lg:text-start font-bold text-edu-ink">
                  {title}
                </h1>
              </div>
              <div className="w-full">
                {challenge.type === "ASSIST" && (
                  <QuestionBubble question={challenge.question} />
                )}
                <Challenge
                  options={options}
                  onSelect={onSelect}
                  status={status}
                  selectedOption={selectedOption}
                  revealOption={revealed ? options.find((o) => o.correct)?.id : undefined}
                  disabled={pending}
                  type={challenge.type}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <Footer
        disabled={pending || !selectedOption}
        status={status}
        revealed={revealed}
        onCheck={onContinue}
      />
    </>
  );
};
