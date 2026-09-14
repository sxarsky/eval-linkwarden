import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@linkwarden/prisma";
import verifyUser from "@/lib/api/verifyUser";
import crypto from "crypto";

// POST /api/v1/users/me/tokens
// Creates a personal access token. The full token is returned ONCE on creation only.
// Body: { name: string }
// Returns 201: { id, name, token: "<full-token>" }
//
// GET /api/v1/users/me/tokens
// Lists the caller's personal access tokens. The token value is NEVER included in GET.
// Returns 200: [{ id, name, createdAt, expires }]
export default async function tokensHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyUser({ req, res });
  if (!user) return;

  if (req.method === "POST") {
    const { name } = req.body as { name?: string };
    if (!name) {
      return res.status(400).json({ response: "Token name is required." });
    }

    // Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Tokens expire in 1 year
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const token = await prisma.accessToken.create({
      data: {
        name,
        userId: user.id,
        token: rawToken,
        expires,
        isSession: false,
      },
    });

    // Full token returned ONCE on creation only
    return res.status(201).json({
      response: { id: token.id, name: token.name, token: rawToken, expires: token.expires },
    });
  }

  if (req.method === "GET") {
    const tokens = await prisma.accessToken.findMany({
      where: { userId: user.id, isSession: false },
      select: { id: true, name: true, createdAt: true, expires: true, revoked: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ response: tokens });
  }

  return res.status(405).json({ response: "Method not allowed." });
}
