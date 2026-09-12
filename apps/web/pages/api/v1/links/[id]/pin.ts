import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@linkwarden/prisma";
import verifyUser from "@/lib/api/verifyUser";

export default async function pinLink(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyUser({ req, res });
  if (!user) return;

  if (req.method !== "PATCH") {
    return res.status(405).json({ response: "Method not allowed." });
  }

  const linkId = Number(req.query.id);
  if (!linkId || isNaN(linkId)) {
    return res.status(400).json({ response: "Invalid link ID." });
  }

  const link = await prisma.link.findUnique({
    where: { id: linkId },
    select: { id: true, createdById: true, pinnedBy: { select: { id: true } } },
  });

  if (!link) {
    return res.status(404).json({ response: "Link not found." });
  }

  if (link.createdById !== user.id) {
    return res.status(403).json({ response: "Permission denied." });
  }

  // Toggle: add user to pinnedBy if not present, remove if present
  const alreadyPinned = link.pinnedBy.some((u) => u.id === user.id);

  const updated = await prisma.link.update({
    where: { id: linkId },
    data: {
      pinnedBy: alreadyPinned
        ? { disconnect: { id: user.id } }
        : { connect: { id: user.id } },
    },
    select: {
      id: true,
      name: true,
      url: true,
      pinnedBy: { select: { id: true } },
      updatedAt: true,
    },
  });

  return res.status(200).json({ response: updated });
}
