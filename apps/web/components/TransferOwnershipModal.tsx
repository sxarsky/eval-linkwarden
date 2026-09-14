import React, { useState } from "react";

interface Member {
  userId: number;
  user: { id: number; name: string; email: string };
}

interface TransferOwnershipModalProps {
  collectionId: number;
  members: Member[];
  onClose: () => void;
  onTransferred: () => void;
}

export default function TransferOwnershipModal({
  collectionId,
  members,
  onClose,
  onTransferred,
}: TransferOwnershipModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/v1/collections/${collectionId}/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: selectedUserId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.response ?? "Transfer failed.");
      setLoading(false);
      return;
    }
    onTransferred();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-xl p-6 w-96 shadow-xl border border-neutral-content">
        <h2 className="font-semibold text-lg mb-4">Transfer Collection Ownership</h2>
        {error && <p className="text-error text-sm mb-3">{error}</p>}
        <select
          className="select select-bordered w-full mb-4"
          onChange={(e) => setSelectedUserId(Number(e.target.value))}
          defaultValue=""
        >
          <option value="" disabled>Select new owner…</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.user.name} ({m.user.email})
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost btn-sm">Cancel</button>
          <button
            onClick={handleTransfer}
            disabled={!selectedUserId || loading}
            className="btn btn-error btn-sm"
          >
            {loading ? "Transferring…" : "Transfer Ownership"}
          </button>
        </div>
      </div>
    </div>
  );
}
