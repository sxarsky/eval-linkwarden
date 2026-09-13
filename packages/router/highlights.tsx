import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Highlight } from "@linkwarden/prisma/client";
import {
  PostHighlightSchemaType,
  UpdateHighlightSchemaType,
} from "@linkwarden/lib/schemaValidation";

export type HighlightWithLink = Highlight & {
  link: { id: number; name: string; url: string | null };
};

type HighlightsPage = {
  highlights: HighlightWithLink[];
  nextCursor: number | null;
};

type UseHighlightsOptions = {
  q?: string;
  color?: string;
};

const LIBRARY_KEY = "highlight-library";

const useGetLinkHighlights = (
  linkId: number
): UseQueryResult<Highlight[], Error> => {
  const { status } = useSession();

  return useQuery({
    queryKey: ["highlights", linkId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/links/${linkId}/highlights`);
      if (!response.ok) throw new Error("Failed to fetch highlights.");

      const data = await response.json();
      return data.response;
    },
    enabled: status === "authenticated",
  });
};

const usePostHighlight = (linkId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (highlight: PostHighlightSchemaType) => {
      const response = await fetch("/api/v1/highlights", {
        body: JSON.stringify({ ...highlight }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.response);

      return data.response;
    },
    onSuccess: (data: Highlight) => {
      queryClient.setQueryData(
        ["highlights", linkId],
        (oldData: Highlight[]) => {
          const index = oldData.findIndex((h) => h?.id === data?.id);
          if (index !== -1) {
            const newData = [...oldData];
            newData[index] = data;
            return newData;
          } else {
            return [...oldData, data];
          }
        }
      );
    },
  });
};

const useRemoveHighlight = (linkId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (highlightId: number) => {
      const response = await fetch(`/api/v1/highlights/${highlightId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.response);

      return data.response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["highlights", linkId], (oldData: any) =>
        oldData.filter((highlight: Highlight) => highlight.id !== data)
      );
    },
  });
};

const useHighlights = ({ q, color }: UseHighlightsOptions = {}) => {
  const { status } = useSession();

  return useInfiniteQuery<HighlightsPage>({
    queryKey: [LIBRARY_KEY, { q: q ?? "", color: color ?? "" }],
    initialPageParam: undefined as number | undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (color) params.set("color", color);
      if (pageParam) params.set("cursor", String(pageParam));

      const queryString = params.toString();

      const response = await fetch(
        `/api/v1/highlights${queryString ? `?${queryString}` : ""}`
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.response);

      return data.response as HighlightsPage;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: status === "authenticated",
  });
};

const useUpdateHighlight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: { id: number } & UpdateHighlightSchemaType) => {
      const response = await fetch(`/api/v1/highlights/${id}`, {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.response);

      return data.response as HighlightWithLink;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [LIBRARY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["highlights", data.linkId] });
    },
  });
};

const useDeleteHighlight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
    }: {
      id: number;
      linkId: number;
    }): Promise<number> => {
      const response = await fetch(`/api/v1/highlights/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.response);

      return data.response as number;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [LIBRARY_KEY] });
      queryClient.invalidateQueries({
        queryKey: ["highlights", variables.linkId],
      });
    },
  });
};

export {
  useGetLinkHighlights,
  usePostHighlight,
  useRemoveHighlight,
  useHighlights,
  useUpdateHighlight,
  useDeleteHighlight,
};
