import React, { useState, useRef, useEffect } from "react";

interface LinkDescriptionEditorProps {
  linkId: number;
  initialDescription: string;
  onSave?: (newDescription: string) => void;
  readOnly?: boolean;
}

// Inline description editor: shows text in view mode; clicking it enters edit mode
// with a textarea and Save/Cancel buttons. Calls onSave (and PUT /api/v1/links/:id)
// when the user confirms.
export default function LinkDescriptionEditor({
  linkId,
  initialDescription,
  onSave,
  readOnly = false,
}: LinkDescriptionEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialDescription);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }
  }, [editing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/v1/links/${linkId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: draft }),
      });
      onSave?.(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (!editing || readOnly) {
    return (
      <p
        className={`text-sm text-neutral-500 ${readOnly ? "" : "cursor-pointer hover:text-neutral-700"}`}
        onClick={() => !readOnly && setEditing(true)}
        title={readOnly ? undefined : "Click to edit description"}
      >
        {draft || <span className="italic text-neutral-400">Add a description…</span>}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <textarea
        ref={textareaRef}
        className="text-sm border border-neutral-content rounded px-2 py-1 resize-none w-full"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={3}
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs text-primary disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={() => { setDraft(initialDescription); setEditing(false); }}
          className="text-xs text-neutral-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
