import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Progress } from "@/components/ui/progress";
import { getUserProgress, getUserStickers } from "@/db/queries";
import catalogo from "@/lib/stickers-catalogo.json";
import { redirect } from "next/navigation";
import { AlbumGrid } from "./album-grid";

const AlbumPage = async () => {
  const [userProgress, stickers] = await Promise.all([getUserProgress(), getUserStickers()]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  const times = new Map(stickers.map((s) => [s.stickerKey, s.times]));
  const items = catalogo.map((c) => ({ ...c, times: times.get(c.key) ?? 0 }));
  const collected = items.filter((i) => i.times > 0).length;

  return (
    <div className="relative z-10 flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress activeCourse={userProgress.activeCourse} points={userProgress.points} />
      </StickyWrapper>
      <FeedWrapper>
        <div className="flex w-full flex-col items-center">
          <h1 className="my-4 text-center font-ui text-2xl font-semibold text-edu-ink">Meu Álbum de Figurinhas</h1>
          <p className="mb-4 text-center font-ui text-lg text-edu-ink/70">
            Acerte atividades com a figura para ganhar a figurinha. Com 3 estrelas, você domina a palavra!
          </p>
          <div className="mb-6 w-full max-w-md">
            <p className="mb-1 text-center font-ui font-semibold text-edu-ink">
              {collected} de {items.length} figurinhas
            </p>
            <Progress value={items.length ? (collected / items.length) * 100 : 0} className="h-4" />
          </div>
          <AlbumGrid items={items} />
        </div>
      </FeedWrapper>
    </div>
  );
};

export default AlbumPage;
