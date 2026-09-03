import { useState } from "react";
import { setGuestSide } from "../services/guestService";
import type { GuestSide } from "../types/guest";

interface GuestSideSelectorProps {
  guestId: string;
  side: GuestSide | null;
  onChange: (side: GuestSide) => void;
}

const OPTIONS: { value: GuestSide; label: string }[] = [
  { value: "groom", label: "Ladke Wale (Groom's Side)" },
  { value: "bride", label: "Ladki Wale (Bride's Side)" },
];

export function GuestSideSelector({ guestId, side, onChange }: GuestSideSelectorProps) {
  const [saving, setSaving] = useState<GuestSide | null>(null);

  async function handleSelect(value: GuestSide) {
    if (saving || value === side) return;
    setSaving(value);
    try {
      await setGuestSide(guestId, value);
      onChange(value);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="mx-auto mt-6 max-w-sm text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-emerald-deep/50">
        Which side are you joining us from?
      </p>
      <div
        role="radiogroup"
        aria-label="Guest side"
        className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`cursor-pointer rounded-xl border px-4 py-2.5 text-center text-sm font-medium transition ${
              side === option.value
                ? "border-gold bg-gold/15 text-emerald-deep"
                : "border-emerald-deep/15 bg-white/60 text-emerald-deep/70 hover:border-gold/50"
            } ${saving ? "opacity-70" : ""}`}
          >
            <input
              type="radio"
              name="guest-side"
              value={option.value}
              checked={side === option.value}
              onChange={() => handleSelect(option.value)}
              disabled={saving !== null}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}
