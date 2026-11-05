"use client";

import { useEffect, useRef, useState } from "react";
import { X, BellOff, Dog } from "lucide-react";
import { getDropletTips } from "@/lib/knowledge";
import { DROPLET_TIP_INTERVAL_MS } from "@/lib/constants";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/Button";

const TIPS = getDropletTips();

export function Droplet() {
  const [muted, setMuted] = useLocalStorage<boolean>("softwater-droplet-muted", false);
  const [visibleTip, setVisibleTip] = useState<string | null>(null);
  const tipIndexRef = useRef(0);

  useEffect(() => {
    if (muted) {
      setVisibleTip(null);
      return;
    }

    const showNextTip = () => {
      setVisibleTip(TIPS[tipIndexRef.current % TIPS.length]);
      tipIndexRef.current += 1;
    };

    showNextTip();
    const interval = setInterval(showNextTip, DROPLET_TIP_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [muted]);

  return (
    <div
      className="pointer-events-none fixed right-4 z-40 flex flex-col items-end gap-2 sm:right-6"
      style={{ bottom: "calc(var(--composer-height, 88px) + 12px)" }}
    >
      {visibleTip && !muted && (
        <div className="pointer-events-auto w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-semibold text-royal-700">Tip from Droplet</span>
            <button
              type="button"
              aria-label="Dismiss tip"
              onClick={() => setVisibleTip(null)}
              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-sm text-slate-600">{visibleTip}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start px-1"
            onClick={() => setMuted(true)}
          >
            <BellOff size={14} /> Mute tips
          </Button>
        </div>
      )}
      <button
        type="button"
        aria-label={muted ? "Unmute Droplet tips" : "Droplet, your water softener helper"}
        onClick={() => setMuted((m) => !m)}
        className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-royal-600 shadow-md hover:bg-slate-50"
        title={muted ? "Tips muted — click to unmute" : "Click to mute tips"}
      >
        <Dog size={22} />
      </button>
    </div>
  );
}
