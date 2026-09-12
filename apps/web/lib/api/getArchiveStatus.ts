export type ArchiveStatus = "pending" | "completed" | "failed";

export function getArchiveStatus(link: {
  archiveJobId?: string | null;
  archiveCompletedAt?: Date | null;
  archiveError?: string | null;
}): ArchiveStatus {
  if (link.archiveError) return "failed";
  if (link.archiveCompletedAt) return "completed";
  return "pending";
}
