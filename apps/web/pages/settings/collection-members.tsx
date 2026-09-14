import React, { useState } from "react";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import CollectionSettingsSidebar from "@/components/CollectionSettingsSidebar";
import TransferOwnershipModal from "@/components/TransferOwnershipModal";

interface Member {
  userId: number;
  role: string;
  user: { id: number; name: string; email: string };
}

interface CollectionMembersPageProps {
  collectionId: number;
  collectionName: string;
  initialMembers: Member[];
}

export default function CollectionMembersPage({
  collectionId,
  collectionName,
  initialMembers,
}: CollectionMembersPageProps) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [showTransfer, setShowTransfer] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");

  const handleInvite = async () => {
    setInviteError("");
    const res = await fetch(`/api/v1/collections/${collectionId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    });
    const data = await res.json();
    if (!res.ok) {
      setInviteError(data.response ?? "Failed to invite.");
      return;
    }
    setMembers((prev) => [...prev, data.response]);
    setInviteEmail("");
  };

  const handleRemove = async (userId: number) => {
    await fetch(`/api/v1/collections/${collectionId}/members?userId=${userId}`, {
      method: "DELETE",
    });
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
  };

  return (
    <div className="flex h-screen">
      <CollectionSettingsSidebar collectionId={collectionId} />
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-xl font-bold mb-6">{collectionName} — Members</h1>
        <div className="mb-6">
          <div className="flex gap-2 mb-3">
            <input
              type="email"
              placeholder="Invite by email…"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="input input-bordered flex-1"
            />
            <button onClick={handleInvite} className="btn btn-primary btn-sm">Invite</button>
          </div>
          {inviteError && <p className="text-error text-sm">{inviteError}</p>}
        </div>
        {showTransfer && (
          <TransferOwnershipModal
            collectionId={collectionId}
            members={members}
            onClose={() => setShowTransfer(false)}
            onTransferred={() => router.push(`/collections/${collectionId}`)}
          />
        )}
        <div className="mt-4">
          <button onClick={() => setShowTransfer(true)} className="btn btn-error btn-outline btn-sm">
            Transfer Ownership
          </button>
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: { collectionId: 1, collectionName: "My Collection", initialMembers: [] } };
};
