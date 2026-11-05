import { Info } from "lucide-react";

export function SharedDemoBanner() {
  return (
    <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800 sm:px-6">
      <Info size={14} className="mt-0.5 shrink-0" />
      <p>
        This is a shared educational demo with no login. Anyone with the link can see, change or
        delete these conversations. Please do not enter personal information.
      </p>
    </div>
  );
}
