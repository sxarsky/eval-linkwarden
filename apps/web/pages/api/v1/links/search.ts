import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@linkwarden/prisma";
import verifyUser from "@/lib/api/verifyUser";

// GET /api/v1/links/search
// Query params:
//   ?q=<string>    — search in name, url, description (optional)
//   ?tag=<string>  — filter by exact tag name (optional)
// Both params are optional; when combined, AND semantics apply.
// Returns 200 with empty array when no results match.
export default async function searchLinks(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyUser({ req, res });
  if (!user) return;

  if (req.method !== "GET") {
    return res.status(405).json({ response: "Method not allowed." });
  }

  const q = req.query.q as string | undefined;
  const tag = req.query.tag as string | undefined;

  const where: object = {
    AND: [
      {
        collection: {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      },
      ...(q
        ? [
            {
              OR: [
                { name: { contains: q } },
                { url: { contains: q } },
                { description: { contains: q } },
              ],
            },
          ]
        : []),
      ...(tag
        ? [{ tags: { some: { name: { equals: tag } } } }]
        : []),
    ],
  };

  const links = await prisma.link.findMany({
    where,
    include: {
      tags: true,
      collection: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return res.status(200).json({ response: links });
}
