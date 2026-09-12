import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@linkwarden/prisma";
import verifyUser from "@/lib/api/verifyUser";
import { getCollectionRole } from "@/lib/auth/collection-role";

// POST /api/v1/collections/:id/links
// Adds a link to a collection.
//
// Permission matrix:
//   Owner   → 201
//   Member  → 201
//   Viewer  → 403 (cannot add links)
//   Non-member (no role) → 404 (existence not revealed)
//   Unauthenticated → 401
export default async function addLinkToCollection(
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

  const { role, exists } = await getCollectionRole(user.id, collectionId);

  // Non-member AND non-existent both get 404 (existence not revealed)
  if (!exists || role === null) {
    return res.status(404).json({ response: "Collection not found." });
  }

  // Viewer gets 403 (they can see the collection but not add links)
  if (role === "viewer") {
    return res.status(403).json({ response: "You do not have permission to add links." });
  }

  // Owner or member: proceed
  const { linkId } = req.body as { linkId?: number };
  if (!linkId) {
    return res.status(400).json({ response: "linkId is required." });
  }

  const link = await prisma.link.findUnique({
    where: { id: linkId },
    select: { id: true, createdById: true },
  });
  if (!link) {
    return res.status(404).json({ response: "Link not found." });
  }

  await prisma.link.update({
    where: { id: linkId },
    data: { collectionId },
  });

  return res.status(201).json({ response: { collectionId, linkId } });
}
