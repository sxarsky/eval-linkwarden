import React from "react";

interface PinnedBadgeProps {
  isPinned: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
  disabled?: boolean;
}

// Visual badge button to toggle pinned state on a link.
// Renders yellow when pinned, neutral grey when not.
export default function PinnedBadge({ isPinned, onToggle, size = "sm", disabled }: PinnedBadgeProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) onToggle();
      }}
      disabled={disabled}
      className={`inline-flex items-center gap-1 rounded-full border transition-colors select-none ${
        isPinned
          ? "bg-warning/20 border-warning text-warning-content"
          : "bg-base-300 border-neutral-content text-neutral-400 hover:bg-warning/10 hover:border-warning/50"
      } ${size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"} disabled:opacity-40`}
      title={isPinned ? "Unpin this link" : "Pin this link"}
      aria-pressed={isPinned}
    >
      📌 {isPinned ? "Pinned" : "Pin"}
    </button>
  );
}
