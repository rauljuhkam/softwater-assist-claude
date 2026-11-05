"use client";

import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Paperclip, Send, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  ALLOWED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_MESSAGE_LENGTH,
} from "@/lib/constants";
import { formatBytes } from "@/lib/utils";

export interface Attachment {
  name: string;
  size: number;
}

interface ComposerProps {
  onSend: (content: string, attachment: Attachment | null) => void;
  onClearChat: () => void;
  disabled: boolean;
  hasMessages: boolean;
}

export function Composer({ onSend, onClearChat, disabled, hasMessages }: ComposerProps) {
  const [value, setValue] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Publish the composer's live height as a CSS variable so fixed-position
  // overlays (e.g. the Droplet mascot) can sit above it instead of
  // overlapping its controls on narrow screens.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      document.documentElement.style.setProperty(
        "--composer-height",
        `${entry.contentRect.height}px`,
      );
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const trimmed = value.trim();
  const overLimit = value.length > MAX_MESSAGE_LENGTH;
  const canSend = trimmed.length > 0 && !overLimit && !disabled;

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    autoResize();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      setAttachmentError(`File is too large. Maximum size is ${formatBytes(MAX_ATTACHMENT_SIZE_BYTES)}.`);
      return;
    }
    if (file.type && !ALLOWED_ATTACHMENT_TYPES.includes(file.type as (typeof ALLOWED_ATTACHMENT_TYPES)[number])) {
      setAttachmentError("This file type isn't supported in this demo.");
      return;
    }

    setAttachmentError(null);
    setAttachment({ name: file.name, size: file.size });
  }

  function submit() {
    if (!canSend) return;
    onSend(trimmed, attachment);
    setValue("");
    setAttachment(null);
    requestAnimationFrame(autoResize);
  }

  return (
    <div ref={rootRef} className="border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
      {attachmentError && (
        <p className="mb-2 text-xs text-red-600">{attachmentError}</p>
      )}
      {attachment && (
        <div className="mb-2 flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
          <Paperclip size={12} />
          <span className="max-w-[200px] truncate">{attachment.name}</span>
          <span className="text-slate-400">({formatBytes(attachment.size)})</span>
          <button
            type="button"
            aria-label="Remove attachment"
            onClick={() => setAttachment(null)}
            className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-royal-400">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about hardness, salt, regeneration..."
          rows={1}
          disabled={disabled}
          aria-label="Message"
          className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send message"
        >
          Send <Send size={14} />
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={ALLOWED_ATTACHMENT_TYPES.join(",")}
          />
          <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Paperclip size={14} /> Attach File
          </Button>
          <Button variant="ghost" size="sm" onClick={onClearChat} disabled={!hasMessages}>
            <Trash2 size={14} /> Clear Chat
          </Button>
        </div>
        <span className={overLimit ? "text-xs text-red-600" : "text-xs text-slate-400"}>
          {value.length}/{MAX_MESSAGE_LENGTH}
        </span>
      </div>
      <p className="mt-1.5 text-xs text-slate-400">
        Attachments store the filename and size only — this demo does not upload or analyze
        file contents.
      </p>
    </div>
  );
}
