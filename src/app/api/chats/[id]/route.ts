import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { friendlyServerError, badRequest, notFound } from "@/lib/apiError";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const chat = await prisma.chatSession.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!chat) return notFound("Conversation not found.");
    return NextResponse.json({ chat });
  } catch (error) {
    return friendlyServerError(error, "chats.id.GET");
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  let body: {
    model?: string;
    personaId?: string | null;
    temperature?: number;
    topP?: number;
    title?: string;
  };
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const data: Record<string, unknown> = {};

  if (body.model !== undefined) {
    if (!["GPT4", "CLAUDE", "LOCAL_LLAMA"].includes(body.model)) {
      return badRequest("Invalid model option.");
    }
    data.model = body.model;
  }
  if (body.personaId !== undefined) {
    data.personaId = body.personaId;
  }
  if (body.temperature !== undefined) {
    if (typeof body.temperature !== "number" || body.temperature < 0 || body.temperature > 1) {
      return badRequest("Temperature must be between 0 and 1.");
    }
    data.temperature = Math.round(body.temperature * 10) / 10;
  }
  if (body.topP !== undefined) {
    if (typeof body.topP !== "number" || body.topP < 0 || body.topP > 1) {
      return badRequest("Top-P must be between 0 and 1.");
    }
    data.topP = Math.round(body.topP * 10) / 10;
  }
  if (body.title !== undefined) {
    const title = body.title.trim();
    if (!title) return badRequest("Title cannot be empty.");
    data.title = title.slice(0, 120);
  }

  try {
    const existing = await prisma.chatSession.findUnique({ where: { id } });
    if (!existing) return notFound("Conversation not found.");

    const chat = await prisma.chatSession.update({ where: { id }, data });
    return NextResponse.json({ chat });
  } catch (error) {
    return friendlyServerError(error, "chats.id.PATCH");
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const existing = await prisma.chatSession.findUnique({ where: { id } });
    if (!existing) return notFound("Conversation not found.");

    await prisma.chatSession.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return friendlyServerError(error, "chats.id.DELETE");
  }
}
