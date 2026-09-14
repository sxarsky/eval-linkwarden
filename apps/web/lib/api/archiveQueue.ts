import crypto from "crypto";

export interface ArchiveJob {
  id: string;
  linkId: number;
  url: string;
  status: "pending" | "completed" | "failed";
  archiveUrl?: string;
  error?: string;
  enqueuedAt: Date;
}

// In-memory job store for development. Production uses BullMQ + Redis.
// This module exposes the same interface so handlers and tests can use it uniformly.
const jobs = new Map<string, ArchiveJob>();

/**
 * Enqueue an archive job for a link.
 * Idempotent: same URL → reuse the existing pending/completed job (no duplicates).
 */
export async function enqueueArchiveJob(
  linkId: number,
  url: string
): Promise<string> {
  // Dedup: if a pending or completed job already exists for this URL, reuse it.
  // Use Array.from to iterate Map values (required for es5 TypeScript target).
  for (const job of Array.from(jobs.values())) {
    if (job.url === url && job.status !== "failed") {
      return job.id;
    }
  }

  const id = crypto.randomUUID();
  jobs.set(id, { id, linkId, url, status: "pending", enqueuedAt: new Date() });
  return id;
}

export async function getJobStatus(jobId: string): Promise<ArchiveJob | null> {
  return jobs.get(jobId) ?? null;
}
