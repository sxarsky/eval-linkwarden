import React, { useState, useMemo } from "react";
import type { GetServerSideProps } from "next";
import type { LinkIncludingShortenedCollectionAndTags } from "@linkwarden/types/global";
import LinkSearchBar from "@/components/LinkSearchBar";
import SidebarCollapsible from "@/components/SidebarCollapsible";

interface ExplorePageProps {
  links: LinkIncludingShortenedCollectionAndTags[];
  collections: { id: number; name: string; _count?: { links: number } }[];
}

// Explore page: browse all links with a live-filter search bar and collapsible sidebar.
export default function ExplorePage({ links, collections }: ExplorePageProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      query.trim()
        ? links.filter(
            (l) =>
              l.name.toLowerCase().includes(query.toLowerCase()) ||
              (l.url ?? "").toLowerCase().includes(query.toLowerCase()) ||
              (l.description ?? "").toLowerCase().includes(query.toLowerCase())
          )
        : links,
    [links, query]
  );

  return (
    <div className="flex h-screen">
      <SidebarCollapsible collections={collections} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-neutral-content">
          <h1 className="text-xl font-bold whitespace-nowrap">Explore</h1>
          <LinkSearchBar onSearch={setQuery} />
          <span className="text-xs text-neutral-400 whitespace-nowrap">
            {filtered.length} / {links.length} links
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid gap-2">
            {filtered.map((link) => (
              <div key={link.id} className="text-sm border rounded p-2">
                <a href={link.url ?? undefined} target="_blank" rel="noreferrer" className="text-primary font-medium">
                  {link.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: { links: [], collections: [] } };
};
