"use client";

import { Droplets, Plus, Trash2, X } from "lucide-react";
import type { ChatSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  chats: ChatSummary[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function groupByDate(chats: ChatSummary[]) {
  const groups = new Map<string, ChatSummary[]>();
  for (const chat of chats) {
    const date = new Date(chat.updatedAt);
    const label = date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(chat);
  }
  return groups;
}

function SidebarContent({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}: Omit<SidebarProps, "mobileOpen" | "onCloseMobile">) {
  const grouped = groupByDate(chats);

  return (
    <div className="flex h-full w-full flex-col bg-slate-50">
      <div className="flex items-center gap-2 border-b border-slate-200 p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-royal-100 text-royal-600">
          <Droplets size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">SoftWater Assist</p>
          <p className="text-xs text-slate-500">Water softener education</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-slate-400">
          Chat history
        </p>
        {chats.length === 0 ? (
          <p className="px-1 text-sm text-slate-400">No conversations yet.</p>
        ) : (
          Array.from(grouped.entries()).map(([label, group]) => (
            <div key={label} className="mb-3">
              <p className="mb-1 px-1 text-xs text-slate-400">{label}</p>
              <ul className="space-y-0.5">
                {group.map((chat) => (
                  <li key={chat.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => onSelectChat(chat.id)}
                      className={cn(
                        "block w-full truncate rounded-lg px-2.5 py-2 pr-8 text-left text-sm",
                        chat.id === activeChatId
                          ? "bg-royal-100 font-medium text-royal-700"
                          : "text-slate-700 hover:bg-slate-100",
                      )}
                      title={chat.title}
                    >
                      {chat.title}
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${chat.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="absolute right-1.5 top-1.5 block rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 sm:hidden sm:group-hover:block"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-royal-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-royal-700"
        >
          <Plus size={16} /> New Chat
        </button>
        <p className="mt-3 text-center text-xs text-slate-400">
          Learn more:{" "}
          <a
            href="https://www.epa.gov/watersense/cation-exchange-water-softeners"
            target="_blank"
            rel="noreferrer"
            className="text-royal-600 hover:underline"
          >
            EPA WaterSense
          </a>{" "}
          ·{" "}
          <a
            href="https://extension.psu.edu/water-softening"
            target="_blank"
            rel="noreferrer"
            className="text-royal-600 hover:underline"
          >
            Penn State Extension
          </a>
        </p>
      </div>
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  return (
    <>
      <aside className="hidden w-[260px] shrink-0 border-r border-slate-200 md:block">
        <SidebarContent {...props} />
      </aside>

      {props.mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={props.onCloseMobile}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-[300px] border-r border-slate-200 bg-slate-50 shadow-xl">
            <button
              type="button"
              aria-label="Close menu"
              onClick={props.onCloseMobile}
              className="absolute right-2 top-2 rounded-md p-1.5 text-slate-500 hover:bg-slate-200"
            >
              <X size={18} />
            </button>
            <SidebarContent {...props} />
          </div>
        </div>
      )}
    </>
  );
}
