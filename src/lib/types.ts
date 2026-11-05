export type ModelOption = "GPT4" | "CLAUDE" | "LOCAL_LLAMA";
export type MessageRole = "USER" | "ASSISTANT";

export interface Persona {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  promptText: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatSessionId: string;
  role: MessageRole;
  content: string;
  attachmentName: string | null;
  attachmentSize: number | null;
  createdAt: string;
}

export interface ChatSummary {
  id: string;
  title: string;
  model: ModelOption;
  personaId: string | null;
  temperature: number;
  topP: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatWithMessages extends ChatSummary {
  messages: ChatMessage[];
}
