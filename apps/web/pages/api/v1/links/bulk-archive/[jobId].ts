import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@linkwarden/prisma";
import verifyUser from "@/lib/api/verifyUser";

// GET /api/v1/links/bulk-archive/:jobId
// Returns the status of a bulk archive job.
// Returns 200: { id, status, totalLinks, archivedCount, failedCount, createdAt, completedAt }
// Returns 404 if job not found.
// Returns 403 if job belongs to a different user.
export default async function bulkArchiveStatus(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyUser({ req, res });
  if (!user) return;

  if (req.method !== "GET") {
    return res.status(405).json({ response: "Method not allowed." });
  }

  const { jobId } = req.query;
  if (!jobId || typeof jobId !== "string") {
    return res.status(400).json({ response: "Invalid job ID." });
  }

  const job = await prisma.bulkArchiveJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      status: true,
      totalLinks: true,
      archivedCount: true,
      failedCount: true,
      createdAt: true,
      completedAt: true,
      userId: true,
    },
  });

  if (!job) {
    return res.status(404).json({ response: "Job not found." });
  }

  if (job.userId !== user.id) {
    return res.status(403).json({ response: "Permission denied." });
  }

  const { userId: _hidden, ...jobData } = job;
  return res.status(200).json({ response: jobData });
}
