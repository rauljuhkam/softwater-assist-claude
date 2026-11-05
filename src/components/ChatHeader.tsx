"use client";

import { useState } from "react";
import { Menu, Settings2, SlidersHorizontal } from "lucide-react";
import type { ModelOption, Persona } from "@/lib/types";
import { MODEL_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";

interface ChatHeaderProps {
  title: string;
  model: ModelOption;
  onModelChange: (model: ModelOption) => void;
  personas: Persona[];
  personaId: string | null;
  onPersonaChange: (personaId: string) => void;
  onOpenManagePrompts: () => void;
  temperature: number;
  topP: number;
  onTemperatureChange: (v: number) => void;
  onTopPChange: (v: number) => void;
  onOpenMobileMenu: () => void;
}

export function ChatHeader({
  title,
  model,
  onModelChange,
  personas,
  personaId,
  onPersonaChange,
  onOpenManagePrompts,
  temperature,
  topP,
  onTemperatureChange,
  onTopPChange,
  onOpenMobileMenu,
}: ChatHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            aria-label="Open menu"
            onClick={onOpenMobileMenu}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-semibold text-slate-900">{title}</h1>
              <span className="shrink-0 rounded-full border border-royal-200 bg-royal-50 px-2 py-0.5 text-[11px] font-medium text-royal-700">
                SHARED DEMO
              </span>
            </div>
          </div>
        </div>

        <div className="relative shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setSettingsOpen((s) => !s)} aria-label="Response settings">
            <SlidersHorizontal size={16} />
          </Button>
          {settingsOpen && (
            <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
              <p className="mb-3 text-xs text-slate-400">
                Settings are saved per conversation for demonstration only — they do not
                control real model inference.
              </p>
              <div className="space-y-3">
                <Slider label="Temperature" value={temperature} onChange={onTemperatureChange} />
                <Slider label="Top-P" value={topP} onChange={onTopPChange} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-sm text-slate-600">
          Model
          <select
            value={model}
            onChange={(e) => onModelChange(e.target.value as ModelOption)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-royal-400 focus:outline-none"
          >
            {MODEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-1.5 text-sm text-slate-600">
          Prompt
          <select
            value={personaId ?? ""}
            onChange={(e) => onPersonaChange(e.target.value)}
            className="max-w-[160px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-royal-400 focus:outline-none"
          >
            {personas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <Button variant="secondary" size="sm" onClick={onOpenManagePrompts}>
          <Settings2 size={14} /> Manage Prompts
        </Button>
      </div>
    </header>
  );
}
