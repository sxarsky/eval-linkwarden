import React, { useState } from "react";
import { LinkIncludingShortenedCollectionAndTags } from "@linkwarden/types/global";
import HighlightDrawer from "./HighlightDrawer";

interface LinkDetailsTabsProps {
  link: LinkIncludingShortenedCollectionAndTags | null;
  onClose: () => void;
}

type Tab = "info" | "highlights" | "formats";

// Tabbed replacement for the single-panel LinkDetails.
// Tabs: Info (url, description, tags, date), Highlights, Formats.
export default function LinkDetailsTabs({ link, onClose }: LinkDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("info");

  if (!link) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-base-100 border-l border-neutral-content shadow-lg flex flex-col z-40">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-content">
        <h2 className="font-semibold text-base truncate pr-2">{link.name}</h2>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-700 ml-auto flex-shrink-0"
          aria-label="Close details"
        >
          ✕
        </button>
      </div>

      <div className="flex border-b border-neutral-content">
        {(["info", "highlights", "formats"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "info" && (
          <div className="space-y-3 text-sm">
            <a
              href={link.url ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="text-primary break-all hover:underline"
            >
              {link.url}
            </a>
            {link.description && (
              <p className="text-neutral-600">{link.description}</p>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              {link.tags?.map((tag) => (
                <span key={tag.id} className="bg-base-300 text-xs px-2 py-0.5 rounded-full">
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
        {activeTab === "highlights" && <HighlightDrawer onClose={onClose} />}
        {activeTab === "formats" && (
          <p className="text-sm text-neutral-400">Archived formats will appear here.</p>
        )}
      </div>
    </div>
  );
}
