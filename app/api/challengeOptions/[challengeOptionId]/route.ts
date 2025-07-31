import db from "@/db/drizzle";
import { challengeOptions } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

interface RouteParams {
  params: {
    challengeOptionId: string;
  };
}

export const GET = async (req: Request, { params }: RouteParams) => {
  if (!(await isAdmin())) {
    return new NextResponse("Não autorizado", { status: 403 });
  }

  const id = parseInt(params.challengeOptionId);
  if (isNaN(id)) {
    return new NextResponse("ID inválido", { status: 400 });
  }

  try {
    const data = await db.query.challengeOptions.findFirst({
      where: eq(challengeOptions.id, id),
    });

    if (!data) {
      return new NextResponse("Opção não encontrada", { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[CHALLENGE_OPTION_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
};

export const PUT = async (req: Request, { params }: RouteParams) => {
  if (!(await isAdmin())) {
    return new NextResponse("Não autorizado", { status: 403 });
  }

  const id = parseInt(params.challengeOptionId);
  if (isNaN(id)) {
    return new NextResponse("ID inválido", { status: 400 });
  }

  try {
    const body = await req.json();
    const data = await db
      .update(challengeOptions)
      .set(body)
      .where(eq(challengeOptions.id, id))
      .returning();

    if (!data[0]) {
      return new NextResponse("Opção não encontrada", { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("[CHALLENGE_OPTION_PUT]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
};

export const DELETE = async (req: Request, { params }: RouteParams) => {
  if (!(await isAdmin())) {
    return new NextResponse("Não autorizado", { status: 403 });
  }

  const id = parseInt(params.challengeOptionId);
  if (isNaN(id)) {
    return new NextResponse("ID inválido", { status: 400 });
  }

  try {
    const data = await db
      .delete(challengeOptions)
      .where(eq(challengeOptions.id, id))
      .returning();

    if (!data[0]) {
      return new NextResponse("Opção não encontrada", { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("[CHALLENGE_OPTION_DELETE]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
};