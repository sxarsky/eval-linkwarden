import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

interface CollectionSettingsSidebarProps {
  collectionId: number;
}

const SECTIONS = [
  { key: "general", label: "General" },
  { key: "members", label: "Members" },
  { key: "danger", label: "Danger Zone" },
];

export default function CollectionSettingsSidebar({ collectionId }: CollectionSettingsSidebarProps) {
  const router = useRouter();
  return (
    <nav className="w-52 bg-base-200 border-r border-neutral-content p-4 flex-shrink-0">
      <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
        Collection Settings
      </h3>
      <ul className="space-y-1">
        {SECTIONS.map(({ key, label }) => {
          const href = `/settings/collections/${collectionId}/${key}`;
          const active = router.asPath === href;
          return (
            <li key={key}>
              <Link
                href={href}
                className={`block px-2 py-1.5 rounded text-sm transition-colors ${
                  active ? "bg-primary/10 text-primary font-medium" : "hover:bg-base-300"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
