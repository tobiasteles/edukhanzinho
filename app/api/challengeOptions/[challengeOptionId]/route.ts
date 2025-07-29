import db from "@/db/drizzle";
import { challengeOptions } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Interface para os parâmetros da rota
interface RouteParams {
  params: {
    challengeOptionId: string;
  };
}

export const GET = async (req: Request, { params }: RouteParams) => {
  if (!isAdmin()) {
    return new NextResponse("Não autorizado", { status: 403 });
  }

  const id = parseInt(params.challengeOptionId);
  if (isNaN(id)) {
    return new NextResponse("ID inválido", { status: 400 });
  }

  const data = await db.query.challengeOptions.findFirst({
    where: eq(challengeOptions.id, id),
  });

  return NextResponse.json(data);
};

export const PUT = async (req: Request, { params }: RouteParams) => {
  if (!isAdmin()) {
    return new NextResponse("Não autorizado", { status: 403 });
  }

  const id = parseInt(params.challengeOptionId);
  if (isNaN(id)) {
    return new NextResponse("ID inválido", { status: 400 });
  }

  const body = await req.json();
  const data = await db
    .update(challengeOptions)
    .set(body)
    .where(eq(challengeOptions.id, id))
    .returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (req: Request, { params }: RouteParams) => {
  if (!isAdmin()) {
    return new NextResponse("Não autorizado", { status: 403 });
  }

  const id = parseInt(params.challengeOptionId);
  if (isNaN(id)) {
    return new NextResponse("ID inválido", { status: 400 });
  }

  const data = await db
    .delete(challengeOptions)
    .where(eq(challengeOptions.id, id))
    .returning();

  return NextResponse.json(data[0]);
};