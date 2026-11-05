import { NextResponse } from "next/server";

/** Logs the real error server-side and returns a friendly message to the client. */
export function friendlyServerError(error: unknown, context: string) {
  console.error(`[${context}]`, error);
  return NextResponse.json(
    {
      error:
        "The database is unavailable right now. Please try again in a moment.",
    },
    { status: 503 },
  );
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}
