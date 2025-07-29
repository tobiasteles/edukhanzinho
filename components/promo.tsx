

import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";

export const Promo = () => {
  return (
    <div className="border-2 rounded-xl p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-x-2">
          <Image src="/unlimeted.png" height={26} width={26} alt="Pro" />
          <h3 className="font-bold text-lg">Desbloqueie o Pro</h3>
        </div>
        <p className="text-muted-foreground">Vidas ilimitadas e muito mais</p>
      </div>

      <Button asChild variant="super" className="w-full" size="lg">
        <Link href="/shop">Atualize hoje mesmo</Link>
      </Button>
    </div>
  );
};

export default Promo;
