import type { NextApiRequest, NextApiResponse } from "next";
import verifyUser from "@/lib/api/verifyUser";
import { prisma } from "@linkwarden/prisma";

// GET /api/v1/coupons/:id — retrieve a specific coupon
// Returns 200 with coupon.
// Returns 404 if not found or not owned by user.
export default async function couponById(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyUser({ req, res });
  if (!user) return;

  if (req.method !== "GET") {
    return res.status(405).json({ response: "Method not allowed." });
  }

  const couponId = Number(req.query.id);
  if (!couponId || isNaN(couponId)) {
    return res.status(400).json({ response: "Invalid coupon ID." });
  }

  const coupon = await prisma.coupon.findFirst({
    where: { id: couponId, createdById: user.id },
  });

  if (!coupon) {
    return res.status(404).json({ response: "Coupon not found." });
  }

  return res.status(200).json({ response: coupon });
}
