import { prisma } from "@linkwarden/prisma";
import { HIGHLIGHT_COLORS } from "@linkwarden/lib/schemaValidation";

type Props = {
  userId: number;
  color?: string;
  q?: string;
  take?: string;
  cursor?: string;
};

const DEFAULT_TAKE = 50;
const MAX_TAKE = 100;

export default async function getHighlights({
  userId,
  color,
  q,
  take,
  cursor,
}: Props) {
  if (color && !(HIGHLIGHT_COLORS as readonly string[]).includes(color)) {
    return {
      status: 400,
      response: `Invalid color. Allowed colors are: ${HIGHLIGHT_COLORS.join(
        ", "
      )}.`,
    };
  }

  let takeCount = DEFAULT_TAKE;

  if (take !== undefined && take !== "") {
    takeCount = Number(take);

    if (!Number.isInteger(takeCount) || takeCount < 1 || takeCount > MAX_TAKE) {
      return {
        status: 400,
        response: `take must be a whole number between 1 and ${MAX_TAKE}.`,
      };
    }
  }

  let cursorId: number | undefined;

  if (cursor !== undefined && cursor !== "") {
    const parsed = Number(cursor);

    if (!Number.isInteger(parsed) || parsed < 1) {
      return {
        status: 400,
        response: "cursor must be the id of a highlight.",
      };
    }

    cursorId = parsed;
  }

  const POSTGRES_IS_ENABLED =
    process.env.DATABASE_URL?.startsWith("postgresql");

  const search = q?.trim();

  const searchCondition = search
    ? {
        OR: [
          {
            text: {
              contains: search,
              mode: POSTGRES_IS_ENABLED ? ("insensitive" as const) : undefined,
            },
          },
          {
            comment: {
              contains: search,
              mode: POSTGRES_IS_ENABLED ? ("insensitive" as const) : undefined,
            },
          },
        ],
      }
    : undefined;

  // Fetch one more than asked for, so nextCursor is null on the last page rather
  // than pointing at a page that turns out to be empty.
  const rows = await prisma.highlight.findMany({
    take: takeCount + 1,
    skip: cursorId ? 1 : undefined,
    cursor: cursorId ? { id: cursorId } : undefined,
    where: {
      AND: [
        { userId },
        ...(color ? [{ color }] : []),
        ...(searchCondition ? [searchCondition] : []),
      ],
    },
    include: {
      link: {
        select: { id: true, name: true, url: true },
      },
    },
    orderBy: { id: "desc" },
  });

  const hasMore = rows.length > takeCount;
  const highlights = hasMore ? rows.slice(0, takeCount) : rows;

  return {
    status: 200,
    response: {
      highlights,
      nextCursor: hasMore ? highlights[highlights.length - 1].id : null,
    },
  };
}
