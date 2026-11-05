import type { ChatSummary, ChatWithMessages, Persona, ModelOption } from "@/lib/types";

async function handle<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore parse failure, use default message
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export const api = {
  listChats: () =>
    fetch("/api/chats").then((r) => handle<{ chats: ChatSummary[] }>(r)),

  createChat: (model: ModelOption, personaId: string | null) =>
    fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, personaId }),
    }).then((r) => handle<{ chat: ChatSummary }>(r)),

  getChat: (id: string, signal?: AbortSignal) =>
    fetch(`/api/chats/${id}`, { signal }).then((r) => handle<{ chat: ChatWithMessages }>(r)),

  updateChat: (
    id: string,
    data: Partial<{ model: ModelOption; personaId: string | null; temperature: number; topP: number; title: string }>,
  ) =>
    fetch(`/api/chats/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => handle<{ chat: ChatSummary }>(r)),

  deleteChat: (id: string) =>
    fetch(`/api/chats/${id}`, { method: "DELETE" }).then((r) => handle<{ success: true }>(r)),

  sendMessage: (
    id: string,
    content: string,
    attachment: { name: string; size: number } | null,
    signal?: AbortSignal,
  ) =>
    fetch(`/api/chats/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        attachmentName: attachment?.name,
        attachmentSize: attachment?.size,
      }),
      signal,
    }).then((r) =>
      handle<{
        userMessage: ChatWithMessages["messages"][number];
        assistantMessage: ChatWithMessages["messages"][number] | null;
        cancelled: boolean;
      }>(r),
    ),

  clearChat: (id: string) =>
    fetch(`/api/chats/${id}/messages`, { method: "DELETE" }).then((r) => handle<{ success: true }>(r)),

  listPersonas: () =>
    fetch("/api/personas").then((r) => handle<{ personas: Persona[] }>(r)),

  createPersona: (data: { name: string; description?: string; promptText: string }) =>
    fetch("/api/personas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => handle<{ persona: Persona }>(r)),

  updatePersona: (id: string, data: Partial<{ name: string; description: string; promptText: string }>) =>
    fetch(`/api/personas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => handle<{ persona: Persona }>(r)),

  deletePersona: (id: string) =>
    fetch(`/api/personas/${id}`, { method: "DELETE" }).then((r) => handle<{ success: true }>(r)),

  health: () => fetch("/api/health").then((r) => handle<{ status: string }>(r)),
};
