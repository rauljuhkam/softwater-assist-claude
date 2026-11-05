import { Paperclip } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { cn, formatBytes, formatTime } from "@/lib/utils";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "USER";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[85%] sm:max-w-[70%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-br-sm bg-royal-600 text-white"
              : "rounded-bl-sm bg-slate-100 text-slate-800",
          )}
        >
          {message.content}
        </div>
        {message.attachmentName && (
          <div
            className={cn(
              "mt-1 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-500",
              isUser ? "ml-auto" : "",
            )}
          >
            <Paperclip size={12} />
            <span className="max-w-[160px] truncate">{message.attachmentName}</span>
            {message.attachmentSize != null && <span>({formatBytes(message.attachmentSize)})</span>}
          </div>
        )}
        <p className={cn("mt-1 text-xs text-slate-400", isUser ? "text-right" : "text-left")}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
