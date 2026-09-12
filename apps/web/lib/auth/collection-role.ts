import { prisma } from "@linkwarden/prisma";

export type CollectionRole = "owner" | "member" | "viewer" | null;

/**
 * getCollectionRole: resolves the calling user's role in a collection.
 *
 * Returns:
 *   "owner"  — user is the collection owner
 *   "member" — user has canCreate: true membership record
 *   "viewer" — user has canCreate: false membership record (view only)
 *   null     — user has no membership (non-member)
 *
 * Returns null for non-existent collections (caller handles 404 response).
 */
export async function getCollectionRole(
  userId: number,
  collectionId: number
): Promise<{ role: CollectionRole; exists: boolean }> {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: {
      ownerId: true,
      members: {
        where: { userId },
        select: { canCreate: true },
      },
    },
  });

  if (!collection) return { role: null, exists: false };
  if (collection.ownerId === userId) return { role: "owner", exists: true };

  const membership = collection.members[0];
  if (!membership) return { role: null, exists: true };

  return {
    role: membership.canCreate ? "member" : "viewer",
    exists: true,
  };
}
