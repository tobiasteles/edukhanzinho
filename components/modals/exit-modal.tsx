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
import { useExitModal } from "@/store/use-exit-modal";

export const ExitModal = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const { isOpen, close } = useExitModal();

  useEffect(() => setIsClient(true), []);

  if (!isClient) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md bg-edu-blue">
        <DialogHeader>
          <div className="flex items-center w-full justify-center mb-5">
            <Image src="/sad.png" alt="Triste" height={80} width={80} />
          </div>
          <DialogTitle className="text-center text-edu-sun font-bold text-2xl">
            Já vai embora?
          </DialogTitle>
          <DialogDescription className="text-center text-white/90">
            Sem problema! Quando voltar, você continua de onde parou.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mb-4">
          <div className="flex flex-col gap-y-4 w-full">
            <Button
              variant="primary"
              className="w-full"
              size="lg"
              onClick={close}
            >
              Continuar aprendendo
            </Button>
            <Button
              variant="danger"
              className="w-full"
              size="lg"
              onClick={() => {
                close();
                router.push("/learn");
              }}
            >
              Sair da lição
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
