import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@linkwarden/prisma";
import verifyUser from "@/lib/api/verifyUser";

// GET  /api/v1/collections/:id/members  — list members with roles
// POST /api/v1/collections/:id/members  — invite a user by email
// DELETE /api/v1/collections/:id/members?userId=<id>  — remove a member
export default async function members(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyUser({ req, res });
  if (!user) return;

  const collectionId = Number(req.query.id);
  if (!collectionId || isNaN(collectionId)) {
    return res.status(400).json({ response: "Invalid collection ID." });
  }

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } },
  });

  if (!collection) {
    return res.status(404).json({ response: "Collection not found." });
  }
  if (collection.ownerId !== user.id) {
    return res.status(403).json({ response: "Only the owner can manage members." });
  }

  if (req.method === "GET") {
    return res.status(200).json({ response: collection.members });
  }

  if (req.method === "POST") {
    const { email, role } = req.body as { email: string; role?: "viewer" | "editor" };
    if (!email) {
      return res.status(400).json({ response: "email is required." });
    }
    const invitee = await prisma.user.findUnique({ where: { email } });
    if (!invitee) {
      return res.status(404).json({ response: "User not found." });
    }
    const existing = collection.members.find((m) => m.userId === invitee.id);
    if (existing) {
      return res.status(409).json({ response: "User is already a member." });
    }
    const editor = role === "editor";
    const member = await prisma.usersAndCollections.create({
      data: {
        collectionId,
        userId: invitee.id,
        canCreate: editor,
        canUpdate: editor,
        canDelete: false,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return res.status(201).json({ response: member });
  }

  if (req.method === "DELETE") {
    const targetUserId = Number(req.query.userId);
    if (!targetUserId) {
      return res.status(400).json({ response: "userId query param is required." });
    }
    if (targetUserId === user.id) {
      return res.status(400).json({ response: "Owner cannot remove themselves." });
    }
    await prisma.usersAndCollections.deleteMany({
      where: { collectionId, userId: targetUserId },
    });
    return res.status(200).json({ response: "Member removed." });
  }

  return res.status(405).json({ response: "Method not allowed." });
}
