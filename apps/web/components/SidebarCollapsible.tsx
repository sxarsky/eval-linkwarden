import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

interface SidebarCollapsibleProps {
  collections: { id: number; name: string; _count?: { links: number } }[];
  defaultCollapsed?: boolean;
}

// Collapsible sidebar with smooth transition.
// When collapsed shows only icons; when expanded shows name + link count.
export default function SidebarCollapsible({
  collections,
  defaultCollapsed = false,
}: SidebarCollapsibleProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const router = useRouter();

  return (
    <nav
      className={`h-full bg-base-200 border-r border-neutral-content transition-all duration-200 flex flex-col ${
        collapsed ? "w-14" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between px-3 py-3 border-b border-neutral-content">
        {!collapsed && (
          <span className="font-semibold text-sm text-neutral-700">Collections</span>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="ml-auto text-neutral-400 hover:text-neutral-700 text-lg leading-none"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      <ul className="flex-1 overflow-y-auto py-2">
        {collections.map((c) => {
          const active = router.query.id === String(c.id);
          return (
            <li key={c.id}>
              <Link
                href={`/collections/${c.id}`}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded mx-1 transition-colors ${
                  active ? "bg-primary/10 text-primary font-medium" : "hover:bg-base-300"
                }`}
                title={collapsed ? c.name : undefined}
              >
                <span className="flex-shrink-0">📁</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{c.name}</span>
                    {c._count && (
                      <span className="text-xs text-neutral-400">{c._count.links}</span>
                    )}
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
