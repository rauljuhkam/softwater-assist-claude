import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { friendlyServerError, badRequest } from "@/lib/apiError";
import { MAX_CUSTOM_PERSONAS } from "@/lib/constants";

export async function GET() {
  try {
    const personas = await prisma.systemPrompt.findMany({
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({ personas });
  } catch (error) {
    return friendlyServerError(error, "personas.GET");
  }
}

export async function POST(request: Request) {
  let body: { name?: string; description?: string; promptText?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const name = body.name?.trim();
  const promptText = body.promptText?.trim();

  if (!name || name.length === 0) {
    return badRequest("Persona name is required.");
  }
  if (name.length > 80) {
    return badRequest("Persona name must be 80 characters or fewer.");
  }
  if (!promptText || promptText.length === 0) {
    return badRequest("Persona prompt text is required.");
  }
  if (promptText.length > 4000) {
    return badRequest("Persona prompt text must be 4000 characters or fewer.");
  }

  try {
    const customCount = await prisma.systemPrompt.count({ where: { isDefault: false } });
    if (customCount >= MAX_CUSTOM_PERSONAS) {
      return badRequest(
        `You have reached the limit of ${MAX_CUSTOM_PERSONAS} custom personas. Edit or delete an existing one to add another.`,
      );
    }

    const persona = await prisma.systemPrompt.create({
      data: {
        name,
        description: body.description?.trim() || null,
        promptText,
        isDefault: false,
      },
    });
    return NextResponse.json({ persona }, { status: 201 });
  } catch (error) {
    return friendlyServerError(error, "personas.POST");
  }
}
