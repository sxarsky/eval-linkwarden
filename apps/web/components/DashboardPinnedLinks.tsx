import React, { useState } from "react";
import { LinkIncludingShortenedCollectionAndTags } from "@linkwarden/types/global";
import PinnedBadge from "./PinnedBadge";

interface DashboardPinnedLinksProps {
  links: (LinkIncludingShortenedCollectionAndTags & { pinnedBy?: { id: number }[] })[];
  userId: number;
}

// Shows pinned links at the top of the dashboard as a horizontal strip.
export default function DashboardPinnedLinks({ links, userId }: DashboardPinnedLinksProps) {
  const [optimisticPinned, setOptimisticPinned] = useState<Record<number, boolean>>({});

  const pinned = links.filter((l) => {
    const overridden = optimisticPinned[l.id as number];
    if (overridden !== undefined) return overridden;
    return l.pinnedBy?.some((u) => u.id === userId) ?? false;
  });

  if (!pinned.length) return null;

  const handleToggle = async (linkId: number, currentlyPinned: boolean) => {
    setOptimisticPinned((prev) => ({ ...prev, [linkId]: !currentlyPinned }));
    try {
      await fetch(`/api/v1/links/${linkId}/pin`, { method: "PATCH" });
    } catch {
      setOptimisticPinned((prev) => ({ ...prev, [linkId]: currentlyPinned }));
    }
  };

  return (
    <section className="mb-4">
      <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
        Pinned
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {pinned.map((link) => {
          const isPinned = optimisticPinned[link.id as number] ?? (link.pinnedBy?.some((u) => u.id === userId) ?? false);
          return (
            <div
              key={link.id}
              className="flex-shrink-0 w-52 border border-neutral-content rounded-lg p-2 bg-base-200"
            >
              <a href={link.url ?? undefined} target="_blank" rel="noreferrer" className="text-sm font-medium truncate block hover:underline">
                {link.name}
              </a>
              <div className="mt-1">
                <PinnedBadge isPinned={isPinned} onToggle={() => handleToggle(link.id as number, isPinned)} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
