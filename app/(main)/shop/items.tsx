"use client";

import { refillHearts } from "@/actions/user-progress";
import { createStripeUrl } from "@/actions/user-subscription";
import { Button } from "@/components/ui/button";
import { POINTS } from "@/constants";
import Image from "next/image";
import { useTransition } from "react";
import { toast } from "sonner";



type Props = {
  hearts: number;
  points: number;
  hasActiveSubscription: boolean;
};

export const Items = ({ hearts, points, hasActiveSubscription }: Props) => {
  const [pending, startTransition] = useTransition();

  const onRefillHearts = () => {
    if (pending || hearts === 5 || points < POINTS) {
      return;
    }

    startTransition(() => {
      refillHearts().catch(() => toast.error("Algo deu errado."));
    });
  };

  const onUpgrade = () => {
    startTransition(() => {
      createStripeUrl()
        .then((response) => {
          if (response.data) {
            window.location.href = response.data;
          }
        })
        .catch(() => toast.error("Algo deu errado."));
    });
  };

  return (
    <ul className="w-full">
      <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
        <Image src="/heart.png" alt="Vidas" height={60} width={60} />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            Recarregue suas vidas.
          </p>
        </div>
        <Button
          onClick={onRefillHearts}
          disabled={pending || hearts === 5 || points < POINTS}
        >
          {hearts === 5 ? (
            "Cheio"
          ) : (
            <div className="flex items-center">
              <Image src="/points.png" alt="Pontos" height={20} width={20} />
              <p>{POINTS}</p>
            </div>
          )}
        </Button>
      </div>
      <div className="flex items-center w-full p-4 pt-8 gap-x-4 border-t-2">
        <Image src="/unlimeted.png" alt="Infinito" height={60} width={60} />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            Vidas infinitas.
          </p>
        </div>
        <Button variant={"super"} onClick={onUpgrade} disabled={pending}>
          {hasActiveSubscription ? "Configurações" : "Adquira"}
        </Button>
      </div>
    </ul>
  );
};
