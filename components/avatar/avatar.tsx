import { avatarMarkup, type Look } from "@/lib/avatar-art";

type Props = { look: Look; size?: number; className?: string };

// O desenho vem só de strings fixas do projeto (lib/avatar-art.ts); nada digitado pelo usuário entra aqui.
export const Avatar = ({ look, size = 160, className }: Props) => (
  <svg
    viewBox="-10 -20 220 270"
    width={size}
    height={(size * 270) / 220}
    role="img"
    aria-label="Personagem"
    className={className}
    dangerouslySetInnerHTML={{ __html: avatarMarkup(look) }}
  />
);
