import db from "@/db/drizzle";
import { challengeOptions } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export const GET = async () => {
  if (!(await isAdmin())) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const data = await db.query.challengeOptions.findMany();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[CHALLENGE_OPTIONS_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
};

export const POST = async (req: Request) => {
  if (!(await isAdmin())) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const body = await req.json();
    const data = await db.insert(challengeOptions).values(body).returning();
    
    if (!data[0]) {
      return new NextResponse("Falha ao criar opção", { status: 400 });
    }
    
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error("[CHALLENGE_OPTIONS_POST]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
};