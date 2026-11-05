"use client";

import { Droplet as DropletIcon, FlaskConical, Repeat, Scale } from "lucide-react";

interface SuggestedQuestion {
  icon: React.ElementType;
  title: string;
  question: string;
}

const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    icon: DropletIcon,
    title: "Hardness",
    question: "What is water hardness and how is it measured?",
  },
  {
    icon: FlaskConical,
    title: "Ion exchange",
    question: "How does ion exchange softening work?",
  },
  {
    icon: Repeat,
    title: "Regeneration",
    question: "What happens during regeneration and why is salt used?",
  },
  {
    icon: Scale,
    title: "Selection",
    question: "How do I choose the right softener size for my household?",
  },
];

interface WelcomeScreenProps {
  onSelectQuestion: (question: string) => void;
}

export function WelcomeScreen({ onSelectQuestion }: WelcomeScreenProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 py-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-royal-100 text-royal-600">
        <DropletIcon size={28} />
      </div>
      <h1 className="text-2xl font-semibold text-slate-900">
        How can I help you understand water softening?
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Ask about hardness, ion exchange, regeneration, salt or maintenance. Replies in this
        demo are simulated educational content.
      </p>

      <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {SUGGESTED_QUESTIONS.map(({ icon: Icon, title, question }) => (
          <button
            key={title}
            type="button"
            onClick={() => onSelectQuestion(question)}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-royal-300 hover:bg-royal-50/40"
          >
            <span className="mt-0.5 text-royal-600">
              <Icon size={18} />
            </span>
            <span>
              <span className="block text-sm font-medium text-royal-700">{title}</span>
              <span className="block text-sm text-slate-600">{question}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
