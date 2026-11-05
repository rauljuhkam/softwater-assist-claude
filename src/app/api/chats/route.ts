import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { friendlyServerError, badRequest } from "@/lib/apiError";

export async function GET() {
  try {
    const chats = await prisma.chatSession.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        model: true,
        personaId: true,
        temperature: true,
        topP: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ chats });
  } catch (error) {
    return friendlyServerError(error, "chats.GET");
  }
}

export async function POST(request: Request) {
  let body: { model?: string; personaId?: string | null } = {};
  try {
    body = await request.json();
  } catch {
    // empty body is fine; use defaults
  }

  const model = body.model ?? "GPT4";
  if (!["GPT4", "CLAUDE", "LOCAL_LLAMA"].includes(model)) {
    return badRequest("Invalid model option.");
  }

  try {
    const chat = await prisma.chatSession.create({
      data: {
        model: model as "GPT4" | "CLAUDE" | "LOCAL_LLAMA",
        personaId: body.personaId ?? null,
      },
    });
    return NextResponse.json({ chat }, { status: 201 });
  } catch (error) {
    return friendlyServerError(error, "chats.POST");
  }
}
