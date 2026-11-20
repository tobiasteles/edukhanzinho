import db from "@/db/drizzle";
import { lessons } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) => {
  if (!(await isAdmin())) {
    return new NextResponse("Não autorizado", { status: 403 });
  }

  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, Number((await params).lessonId)),
  });

  return NextResponse.json(data);
};


export const PUT = async (
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) => {
  if (!(await isAdmin())) {
    return new NextResponse("Não autorizado", { status: 403 });
  }

  const body = await req.json();

  const data = await db.update(lessons).set({
    ...body,
  }).where(eq(lessons.id, Number((await params).lessonId))).returning()

  return NextResponse.json(data);
};


export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) => {
  if (!(await isAdmin())) {
    return new NextResponse("Não autorizado", { status: 403 });
  }

  const data = await db.delete(lessons).where(eq(lessons.id, Number((await params).lessonId))).returning()

  return NextResponse.json(data);
};