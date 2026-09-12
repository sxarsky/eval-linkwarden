import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@linkwarden/prisma";
import verifyUser from "@/lib/api/verifyUser";

// GET /api/v1/links/favorites
// Returns links that the authenticated user has favorited (pinned).
// Supports ?cursor and ?take pagination.
// Response: { response: { links: Array<{id, url, name, pinnedBy, ...}>, cursor: string | null } }
// Auth: 401 if no session.
export default async function favoritesLinks(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyUser({ req, res });
  if (!user) return;

  if (req.method !== "GET") {
    return res.status(405).json({ response: "Method not allowed." });
  }

  const take = Math.min(Number(req.query.take) || 50, 100);
  const cursor = Number(req.query.cursor) || undefined;

  const links = await prisma.link.findMany({
    take,
    skip: cursor ? 1 : undefined,
    cursor: cursor ? { id: cursor } : undefined,
    where: {
      pinnedBy: { some: { id: user.id } },
    },
    include: {
      tags: true,
      collection: true,
      pinnedBy: {
        where: { id: user.id },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const nextCursor = links.length === take ? String(links[links.length - 1].id) : null;

  return res.status(200).json({
    response: {
      links,
      cursor: nextCursor,
    },
  });
}
