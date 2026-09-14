import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@linkwarden/prisma";
import verifyUser from "@/lib/api/verifyUser";

// DELETE /api/v1/users/me/tokens/:id
// Revokes a personal access token (sets revoked: true).
// Returns 204 on success.
// Returns 404 if token not found.
// Returns 403 if token belongs to a different user.
export default async function tokenById(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyUser({ req, res });
  if (!user) return;

  if (req.method !== "DELETE") {
    return res.status(405).json({ response: "Method not allowed." });
  }

  const tokenId = Number(req.query.id);
  if (!tokenId || isNaN(tokenId)) {
    return res.status(400).json({ response: "Invalid token ID." });
  }

  const token = await prisma.accessToken.findUnique({
    where: { id: tokenId },
    select: { id: true, userId: true, revoked: true },
  });

  if (!token) {
    return res.status(404).json({ response: "Token not found." });
  }

  if (token.userId !== user.id) {
    return res.status(403).json({ response: "Permission denied." });
  }

  await prisma.accessToken.update({
    where: { id: tokenId },
    data: { revoked: true },
  });

  return res.status(204).end();
}
