import type { NextApiRequest, NextApiResponse } from "next";
import verifyUser from "@/lib/api/verifyUser";
import { prisma } from "@linkwarden/prisma";

// GET /api/v1/collections/public
// Returns publicly visible collections owned by the calling user.
// Renamed from /api/v1/collections/shared (old path returns 404).
export default async function publicCollections(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ response: "Method not allowed." });
  }

  const user = await verifyUser({ req, res });
  if (!user) return;

  const collections = await prisma.collection.findMany({
    where: { isPublic: true, ownerId: user.id },
    select: { id: true, name: true, description: true, isPublic: true },
  });

  return res.status(200).json({ response: collections });
}
