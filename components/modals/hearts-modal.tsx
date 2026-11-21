"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useHeartsModal } from "@/store/use-hearts-modal";

export const HeartsModal = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const { isOpen, close } = useHeartsModal();

  useEffect(() => setIsClient(true), []);

  if (!isClient) {
    return null;
  }

  const onClick = () => {
    close();
    router.push("/store");
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md bg-edu-blue">
        <DialogHeader>
          <div className="flex items-center w-full justify-center mb-5">
            <Image src="/bad.png" alt="Triste" height={80} width={80} />
          </div>
          <DialogTitle className="text-center text-edu-sun font-bold text-2xl">
            Suas vidas acabaram!
          </DialogTitle>
          <DialogDescription className="text-center text-white/90">
            Troque suas estrelas por mais vidas na loja ou libere o Pro para vidas ilimitadas.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mb-4">
          <div className="flex flex-col gap-y-4 w-full">
            <Button
              variant="primary"
              className="w-full"
              size="lg"
              onClick={onClick}
            >
              Quero vidas ilimitadas
            </Button>
            <Button
              variant="primaryOutline"
              className="w-full"
              size="lg"
              onClick={close}
            >
              Agora não
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
