import MainLayout from "@/layouts/MainLayout";
import PageHeader from "@/components/PageHeader";
import HighlightCard from "@/components/HighlightCard";
import getServerSideProps from "@/lib/client/getServerSideProps";
import { useTranslation } from "next-i18next";
import { ReactElement, useState } from "react";
import { NextPageWithLayout } from "./_app";
import { useHighlights } from "@linkwarden/router/highlights";
import { HIGHLIGHT_COLORS } from "@linkwarden/lib/schemaValidation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Page: NextPageWithLayout = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [color, setColor] = useState("");

  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useHighlights({
    q: search || undefined,
    color: color || undefined,
  });

  const highlights = data?.pages.flatMap((page) => page.highlights) ?? [];

  return (
    <div
      data-testid="highlights-page"
      className="p-3 flex flex-col gap-5 w-full flex-1"
    >
      <PageHeader icon={"bi-quote"} title={t("notes_highlights")} />

      <input
        data-testid="highlight-search"
        type="text"
        value={search}
        placeholder={t("search_highlights")}
        onChange={(e) => setSearch(e.target.value)}
        className="input input-bordered w-full max-w-md"
      />

      <div data-testid="highlight-color-filter" className="flex gap-2 flex-wrap">
        <Button
          data-testid="highlight-color-all"
          size="sm"
          variant="ghost"
          className={cn(color === "" && "bg-primary/20 hover:bg-primary/20")}
          onClick={() => setColor("")}
        >
          {t("all_colors")}
        </Button>
        {HIGHLIGHT_COLORS.map((c) => (
          <Button
            key={c}
            data-testid={`highlight-color-${c}`}
            size="sm"
            variant="ghost"
            className={cn(color === c && "bg-primary/20 hover:bg-primary/20")}
            onClick={() => setColor(c)}
          >
            {t(`color_${c}`)}
          </Button>
        ))}
      </div>

      {isLoading && !highlights.length && (
        <div className="flex flex-col gap-3">
          <div className="skeleton h-16 w-full"></div>
          <div className="skeleton h-16 w-full"></div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {highlights.map((highlight) => (
          <HighlightCard key={highlight.id} highlight={highlight} />
        ))}
      </div>

      {!isLoading && highlights.length === 0 && (
        <div
          data-testid="highlights-empty"
          style={{ flex: "1 1 auto" }}
          className="flex flex-col gap-2 justify-center h-full w-full mx-auto p-10"
        >
          <p className="text-center text-xl">{t("no_highlights_yet")}</p>
          <p className="text-center mx-auto max-w-96 w-fit text-neutral text-sm">
            {t("no_highlights_yet_desc")}
          </p>
        </div>
      )}

      {hasNextPage && (
        <Button
          data-testid="highlights-load-more"
          className="mx-auto"
          variant="accent"
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {t("load_more")}
        </Button>
      )}
    </div>
  );
};

Page.getLayout = function getLayout(page: ReactElement<any>) {
  return <MainLayout>{page}</MainLayout>;
};

export default Page;

export { getServerSideProps };
