import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { friendlyServerError, badRequest, notFound } from "@/lib/apiError";
import { buildSimulatedReply, deriveTitle } from "@/lib/knowledge";
import {
  MAX_MESSAGE_LENGTH,
  SIMULATED_REPLY_DELAY_MS,
  MAX_ATTACHMENT_SIZE_BYTES,
} from "@/lib/constants";
import { checkRateLimit, getClientKey } from "@/lib/rateLimit";

interface Params {
  params: Promise<{ id: string }>;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  const rateLimit = checkRateLimit(getClientKey(request));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many messages sent too quickly. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  let body: { content?: string; attachmentName?: string; attachmentSize?: number };
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const content = body.content?.trim() ?? "";
  if (!content) return badRequest("Message cannot be empty.");
  if (content.length > MAX_MESSAGE_LENGTH) {
    return badRequest(`Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`);
  }
  if (body.attachmentSize !== undefined && body.attachmentSize > MAX_ATTACHMENT_SIZE_BYTES) {
    return badRequest("Attachment is too large.");
  }

  try {
    const chat = await prisma.chatSession.findUnique({ where: { id } });
    if (!chat) return notFound("Conversation not found.");

    const userMessage = await prisma.message.create({
      data: {
        chatSessionId: id,
        role: "USER",
        content,
        attachmentName: body.attachmentName ?? null,
        attachmentSize: body.attachmentSize ?? null,
      },
    });

    if (chat.title === "New conversation") {
      await prisma.chatSession.update({
        where: { id },
        data: { title: deriveTitle(content) },
      });
    }

    await sleep(SIMULATED_REPLY_DELAY_MS);

    // If the chat was deleted or cleared while we were "thinking", do not
    // attach an orphaned assistant reply — the pending reply is invalidated.
    const [chatStillExists, userMessageStillExists] = await Promise.all([
      prisma.chatSession.findUnique({ where: { id } }),
      prisma.message.findUnique({ where: { id: userMessage.id } }),
    ]);

    if (!chatStillExists || !userMessageStillExists) {
      return NextResponse.json({ userMessage, assistantMessage: null, cancelled: true });
    }

    const simulated = buildSimulatedReply(content);
    const assistantMessage = await prisma.message.create({
      data: {
        chatSessionId: id,
        role: "ASSISTANT",
        content: simulated.content,
      },
    });

    await prisma.chatSession.update({ where: { id }, data: { updatedAt: new Date() } });

    return NextResponse.json({ userMessage, assistantMessage, cancelled: false });
  } catch (error) {
    return friendlyServerError(error, "chats.id.messages.POST");
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const chat = await prisma.chatSession.findUnique({ where: { id } });
    if (!chat) return notFound("Conversation not found.");

    await prisma.message.deleteMany({ where: { chatSessionId: id } });
    await prisma.chatSession.update({
      where: { id },
      data: { title: "New conversation" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return friendlyServerError(error, "chats.id.messages.DELETE");
  }
}
