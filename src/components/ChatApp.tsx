"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatSummary, ChatWithMessages, ModelOption, Persona } from "@/lib/types";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/Sidebar";
import { ChatHeader } from "@/components/ChatHeader";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { MessageList } from "@/components/MessageList";
import { Composer, type Attachment } from "@/components/Composer";
import { ManagePromptsDialog } from "@/components/ManagePromptsDialog";
import { SharedDemoBanner } from "@/components/SharedDemoBanner";
import { ErrorRetry } from "@/components/ErrorRetry";
import { Droplet } from "@/components/Droplet";

export function ChatApp() {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<ChatWithMessages | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [managePromptsOpen, setManagePromptsOpen] = useState(false);
  const [personaError, setPersonaError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [chatLoadError, setChatLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const loadChats = useCallback(async () => {
    try {
      const { chats } = await api.listChats();
      setChats(chats);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load conversations.");
    }
  }, []);

  const loadPersonas = useCallback(async () => {
    try {
      const { personas } = await api.listPersonas();
      setPersonas(personas);
    } catch (err) {
      setPersonaError(err instanceof Error ? err.message : "Failed to load personas.");
    }
  }, []);

  useEffect(() => {
    loadChats();
    loadPersonas();
  }, [loadChats, loadPersonas]);

  const loadActiveChat = useCallback(async (id: string) => {
    try {
      const { chat } = await api.getChat(id);
      setActiveChat(chat);
      setChatLoadError(null);
    } catch (err) {
      setChatLoadError(err instanceof Error ? err.message : "Failed to load conversation.");
    }
  }, []);

  useEffect(() => {
    if (activeChatId) {
      loadActiveChat(activeChatId);
    } else {
      setActiveChat(null);
    }
  }, [activeChatId, loadActiveChat]);

  function selectChat(id: string) {
    abortRef.current?.abort();
    setIsTyping(false);
    setSendError(null);
    setActiveChatId(id);
    setMobileMenuOpen(false);
  }

  async function newChat() {
    try {
      const defaultPersona = personas.find((p) => p.slug === "water-basics") ?? personas[0] ?? null;
      const { chat } = await api.createChat("GPT4", defaultPersona?.id ?? null);
      await loadChats();
      setActiveChatId(chat.id);
      setMobileMenuOpen(false);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to create conversation.");
    }
  }

  async function deleteChat(id: string) {
    try {
      await api.deleteChat(id);
      await loadChats();
      if (activeChatId === id) setActiveChatId(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to delete conversation.");
    }
  }

  async function ensureChat(): Promise<string> {
    if (activeChatId) return activeChatId;
    const defaultPersona = personas.find((p) => p.slug === "water-basics") ?? personas[0] ?? null;
    const { chat } = await api.createChat("GPT4", defaultPersona?.id ?? null);
    await loadChats();
    setActiveChatId(chat.id);
    return chat.id;
  }

  async function sendMessage(content: string, attachment: Attachment | null) {
    setSendError(null);
    const chatId = await ensureChat();

    const controller = new AbortController();
    abortRef.current = controller;
    setIsTyping(true);

    // optimistic user message so it appears immediately
    const optimisticUser: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      chatSessionId: chatId,
      role: "USER",
      content,
      attachmentName: attachment?.name ?? null,
      attachmentSize: attachment?.size ?? null,
      createdAt: new Date().toISOString(),
    };
    setActiveChat((prev) =>
      prev && prev.id === chatId ? { ...prev, messages: [...prev.messages, optimisticUser] } : prev,
    );

    try {
      const { assistantMessage } = await api.sendMessage(chatId, content, attachment, controller.signal);
      await Promise.all([loadActiveChat(chatId), loadChats()]);
      if (!assistantMessage) {
        // reply was invalidated because the chat was cleared/deleted meanwhile
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setSendError(err instanceof Error ? err.message : "Failed to send message.");
      await loadActiveChat(chatId);
    } finally {
      setIsTyping(false);
    }
  }

  async function clearChat() {
    if (!activeChatId) return;
    abortRef.current?.abort();
    setIsTyping(false);
    try {
      await api.clearChat(activeChatId);
      await Promise.all([loadActiveChat(activeChatId), loadChats()]);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to clear conversation.");
    }
  }

  async function updateModel(model: ModelOption) {
    if (!activeChatId) {
      await ensureChat();
    }
    const id = activeChatId;
    if (!id) return;
    setActiveChat((prev) => (prev ? { ...prev, model } : prev));
    await api.updateChat(id, { model });
    loadChats();
  }

  async function updatePersona(personaId: string) {
    const id = await ensureChat();
    setActiveChat((prev) => (prev ? { ...prev, personaId } : prev));
    await api.updateChat(id, { personaId });
  }

  async function updateTemperature(temperature: number) {
    const id = await ensureChat();
    setActiveChat((prev) => (prev ? { ...prev, temperature } : prev));
    await api.updateChat(id, { temperature });
  }

  async function updateTopP(topP: number) {
    const id = await ensureChat();
    setActiveChat((prev) => (prev ? { ...prev, topP } : prev));
    await api.updateChat(id, { topP });
  }

  async function handleSuggestedQuestion(question: string) {
    await sendMessage(question, null);
  }

  async function createPersona(data: { name: string; description: string; promptText: string }) {
    try {
      await api.createPersona(data);
      await loadPersonas();
      setPersonaError(null);
    } catch (err) {
      setPersonaError(err instanceof Error ? err.message : "Failed to create persona.");
    }
  }

  async function updatePersonaDetails(
    id: string,
    data: { name: string; description: string; promptText: string },
  ) {
    try {
      await api.updatePersona(id, data);
      await loadPersonas();
      setPersonaError(null);
    } catch (err) {
      setPersonaError(err instanceof Error ? err.message : "Failed to update persona.");
    }
  }

  async function deletePersona(id: string) {
    try {
      await api.deletePersona(id);
      await loadPersonas();
      setPersonaError(null);
    } catch (err) {
      setPersonaError(err instanceof Error ? err.message : "Failed to delete persona.");
    }
  }

  const effectiveModel: ModelOption = activeChat?.model ?? "GPT4";
  const effectivePersonaId = activeChat?.personaId ?? personas.find((p) => p.slug === "water-basics")?.id ?? null;
  const effectiveTemperature = activeChat?.temperature ?? 0.7;
  const effectiveTopP = activeChat?.topP ?? 0.9;

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-white">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onNewChat={newChat}
        onDeleteChat={deleteChat}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <SharedDemoBanner />
        <ChatHeader
          title={activeChat?.title ?? "New conversation"}
          model={effectiveModel}
          onModelChange={updateModel}
          personas={personas}
          personaId={effectivePersonaId}
          onPersonaChange={updatePersona}
          onOpenManagePrompts={() => setManagePromptsOpen(true)}
          temperature={effectiveTemperature}
          topP={effectiveTopP}
          onTemperatureChange={updateTemperature}
          onTopPChange={updateTopP}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {loadError && !activeChatId ? (
          <ErrorRetry message={loadError} onRetry={loadChats} />
        ) : chatLoadError && activeChatId ? (
          <ErrorRetry message={chatLoadError} onRetry={() => loadActiveChat(activeChatId)} />
        ) : !activeChatId || !activeChat || activeChat.messages.length === 0 ? (
          <WelcomeScreen onSelectQuestion={handleSuggestedQuestion} />
        ) : (
          <MessageList messages={activeChat.messages} isTyping={isTyping} />
        )}

        {sendError && (
          <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600 sm:px-6">
            {sendError}
          </p>
        )}

        <Composer
          onSend={sendMessage}
          onClearChat={clearChat}
          disabled={isTyping}
          hasMessages={Boolean(activeChat?.messages.length)}
        />
      </div>

      <ManagePromptsDialog
        open={managePromptsOpen}
        onClose={() => setManagePromptsOpen(false)}
        personas={personas}
        onCreate={createPersona}
        onUpdate={updatePersonaDetails}
        onDelete={deletePersona}
        error={personaError}
      />

      <Droplet />
    </div>
  );
}
