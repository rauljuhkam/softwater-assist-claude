"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Persona } from "@/lib/types";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { MAX_CUSTOM_PERSONAS } from "@/lib/constants";

interface ManagePromptsDialogProps {
  open: boolean;
  onClose: () => void;
  personas: Persona[];
  onCreate: (data: { name: string; description: string; promptText: string }) => Promise<void>;
  onUpdate: (id: string, data: { name: string; description: string; promptText: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  error: string | null;
}

const emptyForm = { name: "", description: "", promptText: "" };

export function ManagePromptsDialog({
  open,
  onClose,
  personas,
  onCreate,
  onUpdate,
  onDelete,
  error,
}: ManagePromptsDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const customCount = personas.filter((p) => !p.isDefault).length;
  const limitReached = customCount >= MAX_CUSTOM_PERSONAS && editingId === null;

  function startEdit(persona: Persona) {
    setEditingId(persona.id);
    setForm({
      name: persona.name,
      description: persona.description ?? "",
      promptText: persona.promptText,
    });
  }

  function startCreate() {
    setEditingId("new");
    setForm(emptyForm);
  }

  function cancelForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submitForm() {
    if (!form.name.trim() || !form.promptText.trim()) return;
    setSubmitting(true);
    try {
      if (editingId && editingId !== "new") {
        await onUpdate(editingId, form);
      } else {
        await onCreate(form);
      }
      cancelForm();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Manage Prompts" className="max-w-xl">
      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {editingId === null ? (
        <>
          <ul className="space-y-2">
            {personas.map((persona) => (
              <li
                key={persona.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">{persona.name}</p>
                    {persona.isDefault && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                        default
                      </span>
                    )}
                  </div>
                  {persona.description && (
                    <p className="mt-0.5 truncate text-xs text-slate-500">{persona.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(persona)} aria-label={`Edit ${persona.name}`}>
                    <Pencil size={14} />
                  </Button>
                  {!persona.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(persona.id)}
                      aria-label={`Delete ${persona.name}`}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <Button
            variant="secondary"
            size="sm"
            className="mt-4 w-full justify-center"
            onClick={startCreate}
            disabled={limitReached}
          >
            <Plus size={14} /> Add Persona
          </Button>
          {limitReached && (
            <p className="mt-2 text-xs text-slate-500">
              You have reached the limit of {MAX_CUSTOM_PERSONAS} custom personas. Edit or delete
              one to add another.
            </p>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Name</span>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              maxLength={80}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-royal-400 focus:outline-none"
              placeholder="e.g. Salt efficiency expert"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Description (optional)</span>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-royal-400 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Prompt text</span>
            <textarea
              value={form.promptText}
              onChange={(e) => setForm((f) => ({ ...f, promptText: e.target.value }))}
              maxLength={4000}
              rows={5}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-royal-400 focus:outline-none"
              placeholder="Describe how this persona should respond..."
            />
          </label>
          <p className="text-xs text-slate-400">
            Saved for demonstration only — prompt text does not control real model inference.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={cancelForm}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={submitForm}
              disabled={submitting || !form.name.trim() || !form.promptText.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
