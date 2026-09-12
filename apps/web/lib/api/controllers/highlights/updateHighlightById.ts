import { prisma } from "@linkwarden/prisma";
import { UpdateHighlightSchemaType } from "@linkwarden/lib/schemaValidation";

export default async function updateHighlightById(
  userId: number,
  highlightId: number,
  body: UpdateHighlightSchemaType
) {
  if (!highlightId || !Number.isInteger(highlightId)) {
    return { status: 400, response: "Please choose a valid highlight." };
  }

  const existingHighlight = await prisma.highlight.findFirst({
    where: { id: highlightId },
  });

  if (!existingHighlight) {
    return { status: 404, response: "Highlight not found." };
  }

  const updatedHighlight = await prisma.highlight.update({
    where: { id: highlightId },
    data: {
      ...(body.color !== undefined ? { color: body.color } : {}),
      ...(body.comment !== undefined ? { comment: body.comment } : {}),
    },
    include: {
      link: {
        select: { id: true, name: true, url: true },
      },
    },
  });

  return { status: 200, response: updatedHighlight };
}
