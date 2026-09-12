import React, { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

interface LinkSearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

// Inline search bar for client-side link filtering.
// Without onSearch, navigates to /search?q=<query> on form submit.
export default function LinkSearchBar({
  initialQuery = "",
  placeholder,
  onSearch,
}: LinkSearchBarProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      onSearch?.(value);
    },
    [onSearch]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSearch && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-md">
      <input
        type="search"
        value={query}
        onChange={handleChange}
        placeholder={placeholder ?? t("search_placeholder", "Search links…")}
        className="w-full border border-neutral-content rounded-lg px-4 py-2 text-sm bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </form>
  );
}
