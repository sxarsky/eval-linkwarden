import type { NextApiRequest, NextApiResponse } from "next";
import verifyUser from "@/lib/api/verifyUser";
import { UpdateHighlightSchema } from "@linkwarden/lib/schemaValidation";
import deleteHighlightById from "@/lib/api/controllers/highlights/deleteHighlightById";
import updateHighlightById from "@/lib/api/controllers/highlights/updateHighlightById";

export default async function highlights(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await verifyUser({ req, res });
  if (!user) return;

  if (req.method === "PATCH") {
    if (process.env.NEXT_PUBLIC_DEMO === "true")
      return res.status(400).json({
        response:
          "This action is disabled because this is a read-only demo of Linkwarden.",
      });

    const dataValidation = UpdateHighlightSchema.safeParse(req.body);

    if (!dataValidation.success) {
      return res.status(400).json({
        response: `Error: ${
          dataValidation.error.issues[0].message
        } [${dataValidation.error.issues[0].path.join(", ")}]`,
      });
    }

    const highlights = await updateHighlightById(
      user.id,
      Number(req.query.id as string),
      dataValidation.data
    );

    return res
      .status(highlights.status)
      .json({ response: highlights.response });
  }

  if (req.method === "DELETE") {
    if (process.env.NEXT_PUBLIC_DEMO === "true")
      return res.status(400).json({
        response:
          "This action is disabled because this is a read-only demo of Linkwarden.",
      });

    const highlights = await deleteHighlightById(
      user.id,
      Number(req.query.id as string)
    );

    return res
      .status(highlights?.status || 500)
      .json({ response: highlights?.response });
  }

  return res.status(405).json({ response: "Method not allowed." });
}
