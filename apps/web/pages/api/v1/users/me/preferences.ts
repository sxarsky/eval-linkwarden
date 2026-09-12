import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { prisma } from "@linkwarden/prisma";

// GET /api/v1/users/me/preferences
// Returns user preference settings. Accepts ONLY NextAuth session cookies.
// Bearer tokens (personal access tokens) are explicitly rejected with 401.
// This prevents server-side scripts from reading private UI preference data.
export default async function userPreferences(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ response: "Method not allowed." });
  }

  // Reject Bearer token auth — session cookies only
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({
      response: "Bearer token authentication is not accepted for this endpoint. Use a session cookie.",
    });
  }

  const token = await getToken({ req });
  if (!token?.id) {
    return res.status(401).json({ response: "Unauthorized." });
  }

  const user = await prisma.user.findUnique({
    where: { id: token.id as number },
    select: {
      id: true,
      linksRouteTo: true,
      preventDuplicateLinks: true,
      archiveAsScreenshot: true,
      archiveAsMonolith: true,
      archiveAsPDF: true,
      archiveAsWaybackMachine: true,
      locale: true,
      theme: true,
    },
  });

  if (!user) {
    return res.status(404).json({ response: "User not found." });
  }

  return res.status(200).json({ response: user });
}
