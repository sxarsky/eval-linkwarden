import type { NextApiRequest, NextApiResponse } from "next";

// GET /api/v1/users/export — REMOVED
// This endpoint has been deleted. All requests return 404.
// Use GET /api/v1/links with pagination for data export.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(404).json({ response: "Not found." });
}
