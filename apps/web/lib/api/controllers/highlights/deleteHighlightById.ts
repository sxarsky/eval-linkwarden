import { prisma } from "@linkwarden/prisma";

export default async function deleteHighlightById(
  userId: number,
  highlightId: number
) {
  if (!highlightId || !Number.isInteger(highlightId))
    return { response: "Please choose a valid highlight.", status: 401 };

  // Look the highlight up first. prisma.delete raises when nothing matches, which
  // turned a missing or foreign highlight into a server error.
  const existingHighlight = await prisma.highlight.findFirst({
    where: { id: highlightId, userId },
  });

  if (!existingHighlight)
    return { response: "Highlight not found.", status: 404 };

  const targetHighlight = await prisma.highlight.delete({
    where: { id: highlightId },
  });

  return { response: targetHighlight.id, status: 200 };
}
