import { normalizeUrl } from "@/lib/utils/normalizeUrl";

/**
 * getDedupKey: canonical URL key used to detect duplicate links.
 * Uses normalizeUrl so URLs differing only in path case, trailing slash,
 * or UTM params are treated as identical.
 */
export function getDedupKey(rawUrl: string): string {
  return normalizeUrl(rawUrl);
}
