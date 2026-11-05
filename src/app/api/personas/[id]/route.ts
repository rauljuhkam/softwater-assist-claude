import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { friendlyServerError, badRequest, notFound } from "@/lib/apiError";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  let body: { name?: string; description?: string; promptText?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const data: Record<string, string | null> = {};
  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) return badRequest("Persona name cannot be empty.");
    if (name.length > 80) return badRequest("Persona name must be 80 characters or fewer.");
    data.name = name;
  }
  if (body.description !== undefined) {
    data.description = body.description.trim() || null;
  }
  if (body.promptText !== undefined) {
    const promptText = body.promptText.trim();
    if (!promptText) return badRequest("Persona prompt text cannot be empty.");
    if (promptText.length > 4000) return badRequest("Persona prompt text must be 4000 characters or fewer.");
    data.promptText = promptText;
  }

  try {
    const existing = await prisma.systemPrompt.findUnique({ where: { id } });
    if (!existing) return notFound("Persona not found.");

    const persona = await prisma.systemPrompt.update({ where: { id }, data });
    return NextResponse.json({ persona });
  } catch (error) {
    return friendlyServerError(error, "personas.PATCH");
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const existing = await prisma.systemPrompt.findUnique({ where: { id } });
    if (!existing) return notFound("Persona not found.");
    if (existing.isDefault) {
      return badRequest("Default personas cannot be deleted, only edited.");
    }

    await prisma.systemPrompt.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return friendlyServerError(error, "personas.DELETE");
  }
}
