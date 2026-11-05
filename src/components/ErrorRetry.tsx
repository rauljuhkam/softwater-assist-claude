import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ErrorRetry({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-10 text-center">
      <AlertTriangle className="text-amber-500" size={28} />
      <p className="max-w-sm text-sm text-slate-600">{message}</p>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
