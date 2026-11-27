import { getAvatarData, getLesson, getUserProgress, getUserSubscription } from "@/db/queries";
import { redirect } from "next/navigation";
import { Quiz } from "../quiz";

type Props = {
  params: Promise<{ lessonId: string }>;
};

const LessonIdPage = async ({
params,
}: Props) => {
  const id = Number((await params).lessonId);

  if (!Number.isInteger(id)) {
    redirect("/learn");
  }

  const userSubscriptionData = getUserSubscription();
  const lessonData = getLesson(id);
  const userProgressData = getUserProgress();

  const [lesson, userProgress, userSubscription, avatarData] = await Promise.all([
    lessonData,
    userProgressData,
    userSubscriptionData,
    getAvatarData(),
  ]);

  if (!lesson || !userProgress) {
    redirect("/learn");
  }

  const initialPercentage =
    (lesson.challenges.filter((challenge) => challenge.completed).length /
      lesson.challenges.length) *
    100;

  return (
    <Quiz
      initialLessonId={lesson.id}
      initalLessonChallenges={lesson.challenges}
      initialHearts={userProgress.hearts}
      initialPercentage={initialPercentage}
      userSubscription={userSubscription}
      equipped={
        avatarData?.avatar
          ? { hat: avatarData.avatar.hat, face: avatarData.avatar.face, neck: avatarData.avatar.neck, back: avatarData.avatar.back }
          : undefined
      }
    />
  );
};

export default LessonIdPage;
