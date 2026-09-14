import React, { useState } from "react";
import {
  LinkIncludingShortenedCollectionAndTags,
} from "@linkwarden/types/global";
import LinkIcon from "./LinkIcon";
import LinkDate from "./LinkDate";
import LinkActions from "./LinkActions";
import { TFunction } from "i18next";

type Props = {
  link: LinkIncludingShortenedCollectionAndTags;
  isPublicRoute: boolean;
  t: TFunction<"translation", undefined>;
};

// Compact one-line card with collapsible description.
// Designed for high-density views where the full LinkCard is too tall.
export default function LinkCardCompact({ link, isPublicRoute, t }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [linkModal, setLinkModal] = useState(false);
  const hasLongDesc = link.description && link.description.length > 100;

  return (
    <div className="flex items-start gap-2 px-3 py-2 border-b border-neutral-content hover:bg-base-200 group">
      <div className="flex-shrink-0 mt-0.5">
        <LinkIcon link={link} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <a
            href={link.url ?? undefined}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium truncate hover:underline"
          >
            {link.name}
          </a>
          <LinkDate link={link} />
        </div>

        {link.description && (
          <div className="mt-0.5">
            <p
              className={`text-xs text-neutral-500 ${
                !expanded && hasLongDesc ? "line-clamp-2" : ""
              }`}
            >
              {link.description}
            </p>
            {hasLongDesc && (
              <button
                className="text-xs text-primary mt-0.5"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? t("show_less") : t("show_more")}
              </button>
            )}
          </div>
        )}
      </div>

      {!isPublicRoute && (
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <LinkActions link={link} t={t} linkModal={linkModal} setLinkModal={setLinkModal} />
        </div>
      )}
    </div>
  );
}
