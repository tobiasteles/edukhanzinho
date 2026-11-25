import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { courses } from "@/db/schema";

type Props = {
  activeCourse: typeof courses.$inferSelect;
  points: number;
  hearts?: number; // vidas foram removidas: ignorado
  hasActiveSubscription?: boolean;
};

export const UserProgress = ({ activeCourse, points }: Props) => {
  return (
    <div className="flex items-center justify-between gap-x-2 w-full">
      <Link href="/courses">
        <Button variant="ghost">
          <Image
            src={activeCourse.imageSrc}
            priority
            alt={activeCourse.title}
            className="rounded-md border bg-edu-sky-soft object-contain p-0.5"
            width={32}
            height={32}
          />
        </Button>
      </Link>
      <div className="flex items-center px-3 font-ui font-semibold text-edu-sun-ink">
        <Image
          src="/points.png"
          height={28}
          width={28}
          alt="Estrelas"
          className="mr-2"
        />
        {points}
      </div>
    </div>
  );
};
