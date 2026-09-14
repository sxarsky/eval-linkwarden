import type { NextApiRequest, NextApiResponse } from "next";
import verifyUser from "@/lib/api/verifyUser";
import { prisma } from "@linkwarden/prisma";

// POST /api/v1/coupons — create a coupon
// Body: { code: string, discountPercent: number }
// Returns 201 with created coupon. Returns 409 if code already exists.
//
// GET /api/v1/coupons — list all coupons owned by the authenticated user
// Returns 200 with array of coupons.
export default async function coupons(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyUser({ req, res });
  if (!user) return;

  if (req.method === "POST") {
    const { code, discountPercent } = req.body;

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return res.status(400).json({ response: "A valid coupon code is required." });
    }
    if (typeof discountPercent !== "number" || discountPercent < 0 || discountPercent > 100) {
      return res.status(400).json({ response: "discountPercent must be a number between 0 and 100." });
    }

    const existing = await prisma.coupon.findFirst({ where: { code: code.trim() } });
    if (existing) {
      return res.status(409).json({ response: "A coupon with this code already exists." });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim(),
        discountPercent,
        createdById: user.id,
      },
    });

    return res.status(201).json({ response: coupon });
  } else if (req.method === "GET") {
    const coupons = await prisma.coupon.findMany({
      where: { createdById: user.id },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ response: coupons });
  }

  return res.status(405).json({ response: "Method not allowed." });
}
