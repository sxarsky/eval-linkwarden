import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@linkwarden/prisma";
import verifyUser from "@/lib/api/verifyUser";
import crypto from "crypto";

// POST /api/v1/links/bulk-archive
// Creates a bulk archive job for the specified link IDs.
// Body: { linkIds: number[] } (1-100 links)
// Returns 202: { jobId: string, status: "queued" }
// Returns 403 if any linkId is not owned by the authenticated user.
// Auth: 401 if no session.
export default async function bulkArchive(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyUser({ req, res });
  if (!user) return;

  if (req.method !== "POST") {
    return res.status(405).json({ response: "Method not allowed." });
  }

  const { linkIds } = req.body as { linkIds?: number[] };
  if (!Array.isArray(linkIds) || linkIds.length === 0) {
    return res.status(400).json({ response: "linkIds array is required." });
  }
  if (linkIds.length > 100) {
    return res.status(400).json({ response: "Maximum 100 links per batch." });
  }

  // Verify all linkIds are owned by the authenticated user.
  const ownedCount = await prisma.link.count({
    where: {
      id: { in: linkIds },
      collection: { ownerId: user.id },
    },
  });
  if (ownedCount !== linkIds.length) {
    return res.status(403).json({ response: "One or more links are not accessible." });
  }

  const jobId = crypto.randomUUID();

  await prisma.bulkArchiveJob.create({
    data: {
      id: jobId,
      userId: user.id,
      linkIds: JSON.stringify(linkIds),
      status: "queued",
      totalLinks: linkIds.length,
      archivedCount: 0,
    },
  });

  return res.status(202).json({ response: { jobId, status: "queued" } });
}
