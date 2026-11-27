import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { getAvatarData, getUserProgress } from "@/db/queries";
import { redirect } from "next/navigation";
import { AvatarEditor } from "./avatar-editor";

const PersonagemPage = async () => {
  const [userProgress, data] = await Promise.all([getUserProgress(), getAvatarData()]);

  if (!userProgress || !userProgress.activeCourse || !data) {
    redirect("/courses");
  }

  const a = data.avatar;

  return (
    <div className="relative z-10 flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress activeCourse={userProgress.activeCourse} points={userProgress.points} />
      </StickyWrapper>
      <FeedWrapper>
        <div className="flex w-full flex-col items-center">
          <h1 className="my-4 text-center font-ui text-2xl font-semibold text-edu-ink">Meu Personagem</h1>
          <p className="mb-6 text-center font-ui text-lg text-edu-ink/70">
            Faça atividades para ganhar peças novas e vista o seu bichinho!
          </p>
          <AvatarEditor
            initial={{
              animal: a?.animal ?? "gato",
              hat: a?.hat ?? null,
              face: a?.face ?? null,
              neck: a?.neck ?? null,
              back: a?.back ?? null,
            }}
            stats={data.stats}
          />
        </div>
      </FeedWrapper>
    </div>
  );
};

export default PersonagemPage;
