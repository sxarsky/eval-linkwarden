import React, { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { useTranslation } from "next-i18next";
import { Button } from "./ui/button";
import {
  HighlightWithLink,
  useDeleteHighlight,
  useUpdateHighlight,
} from "@linkwarden/router/highlights";

const SWATCH: Record<string, string> = {
  yellow: "bg-yellow-500/70",
  green: "bg-green-500/70",
  blue: "bg-blue-500/70",
  red: "bg-red-500/70",
};

const BORDER: Record<string, string> = {
  yellow: "border-yellow-500",
  green: "border-green-500",
  blue: "border-blue-500",
  red: "border-red-500",
};

type Props = {
  highlight: HighlightWithLink;
};

export default function HighlightCard({ highlight }: Props) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(highlight.comment ?? "");

  const updateHighlight = useUpdateHighlight();
  const deleteHighlight = useDeleteHighlight();

  const formattedDate = new Date(highlight.createdAt).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const save = async () => {
    await updateHighlight.mutateAsync({ id: highlight.id, comment: note });
    setEditing(false);
  };

  return (
    <div
      data-testid="highlight-card"
      className={clsx(
        "p-3 border-l-4 bg-base-200 rounded-r-md flex flex-col gap-2",
        BORDER[highlight.color] ?? "border-neutral"
      )}
    >
      <p
        data-testid="highlight-text"
        className={clsx(
          "w-fit px-2 rounded-md",
          SWATCH[highlight.color] ?? "bg-neutral/40"
        )}
      >
        {highlight.text}
      </p>

      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            data-testid="highlight-note-input"
            className="textarea textarea-bordered w-full"
            value={note}
            placeholder={t("add_a_note")}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              data-testid="highlight-note-save"
              size="sm"
              variant="accent"
              disabled={updateHighlight.isPending}
              onClick={save}
            >
              {t("save")}
            </Button>
            <Button
              data-testid="highlight-note-cancel"
              size="sm"
              variant="ghost"
              onClick={() => {
                setNote(highlight.comment ?? "");
                setEditing(false);
              }}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <p data-testid="highlight-note" className="text-sm text-neutral">
          {highlight.comment || t("no_note_yet")}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <Link
          data-testid="highlight-source-link"
          href={`/links/${highlight.link.id}`}
          className="text-sm font-semibold truncate hover:underline"
        >
          {highlight.link.name || highlight.link.url}
        </Link>
        <span className="text-xs text-neutral whitespace-nowrap">
          {formattedDate}
        </span>
      </div>

      <div className="flex gap-2">
        {!editing && (
          <Button
            data-testid="highlight-edit-note"
            size="sm"
            variant="ghost"
            onClick={() => setEditing(true)}
          >
            <i className="bi-pencil mr-1" />
            {t("edit_note")}
          </Button>
        )}
        <Button
          data-testid="highlight-delete"
          size="sm"
          variant="ghost"
          disabled={deleteHighlight.isPending}
          onClick={() =>
            deleteHighlight.mutate({
              id: highlight.id,
              linkId: highlight.linkId,
            })
          }
        >
          <i className="bi-trash text-error mr-1" />
          {t("delete")}
        </Button>
      </div>
    </div>
  );
}
