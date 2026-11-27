// Libera (ou retira) o acesso de professor a quem já criou conta no site.
//   npm run professor -- adicionar email@escola.com "Nome do professor"
//   npm run professor -- remover email@escola.com
import "dotenv/config";
import { createClerkClient } from "@clerk/backend";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

const db = drizzle(neon(process.env.DATABASE_URL!), { schema });
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const main = async () => {
  const [comando, email, ...resto] = process.argv.slice(2);
  if (!comando || !email) throw new Error('Uso: npm run professor -- adicionar|remover email@escola.com "Nome"');

  const { data: usuarios } = await clerk.users.getUserList({ emailAddress: [email] });
  const usuario = usuarios[0];
  if (!usuario) throw new Error(`Nenhuma conta encontrada para ${email}. Peça para a pessoa criar a conta no site primeiro.`);

  if (comando === "adicionar") {
    const nome = resto.join(" ").trim() || usuario.firstName || "Professor(a)";
    await db
      .insert(schema.teachers)
      .values({ userId: usuario.id, nome })
      .onConflictDoUpdate({ target: schema.teachers.userId, set: { nome } });
    console.log(`Acesso de professor liberado para ${nome} (${email}).`);
  } else if (comando === "remover") {
    await db.delete(schema.teachers).where(eq(schema.teachers.userId, usuario.id));
    console.log(`Acesso de professor retirado de ${email}.`);
  } else {
    throw new Error("Comando desconhecido: use adicionar ou remover");
  }
};

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
