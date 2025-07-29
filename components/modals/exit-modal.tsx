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
      <DialogContent className="max-w-md bg-indigo-500">
        <DialogHeader>
          <div className="flex items-center w-full justify-center mb-5">
            <Image src="/sad.png" alt="Triste" height={80} width={80} />
          </div>
          <DialogTitle className="text-center text-yellow-300 font-bold text-2xl">
            Tem certeza que deseja sair?
          </DialogTitle>
          <DialogDescription className="text-center text-yellow-200">
            Você pode continuar de onde parou na próxima vez que entrar.
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
              Ou continue aprendendo
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
              Encerrar sessão
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
