import { getAvatarData, getLesson, getUserProgress, getUserSubscription } from "@/db/queries";
import { redirect } from "next/navigation";
import { Quiz } from "./quiz";


const LessonIdPage = async () => {
  

  const lessonData = getLesson();
  const userProgressData = getUserProgress();
  const userSubscriptionData = getUserSubscription();

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
