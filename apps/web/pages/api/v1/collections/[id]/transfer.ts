import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@linkwarden/prisma";
import verifyUser from "@/lib/api/verifyUser";

// POST /api/v1/collections/:id/transfer
// Body: { toUserId: number }
// Transfers collection ownership from current owner to toUserId (who must be a member).
export default async function transfer(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyUser({ req, res });
  if (!user) return;

  if (req.method !== "POST") {
    return res.status(405).json({ response: "Method not allowed." });
  }

  const collectionId = Number(req.query.id);
  if (!collectionId || isNaN(collectionId)) {
    return res.status(400).json({ response: "Invalid collection ID." });
  }

  const { toUserId } = req.body as { toUserId?: number };
  if (!toUserId) {
    return res.status(400).json({ response: "toUserId is required." });
  }

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    include: { members: true },
  });

  if (!collection) {
    return res.status(404).json({ response: "Collection not found." });
  }
  if (collection.ownerId !== user.id) {
    return res.status(403).json({ response: "Only the owner can transfer ownership." });
  }

  const isMember = collection.members.some((m) => m.userId === toUserId);
  if (!isMember) {
    return res.status(400).json({
      response: "Transfer target must already be a member of the collection.",
    });
  }

  const updated = await prisma.collection.update({
    where: { id: collectionId },
    data: { ownerId: toUserId },
    select: { id: true, name: true, ownerId: true },
  });

  return res.status(200).json({ response: updated });
}
