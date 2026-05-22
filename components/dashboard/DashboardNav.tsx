"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/dashboard", label: "Orgânico", description: "Leads sem Ação de Marketing" },
    { href: "/marketing", label: "Ação de Marketing", description: "Leads via Ação de Marketing" },
  ];

  return (
    <div className="flex gap-2 mb-8 border-b border-border">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-5 py-3 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
              active
                ? "border-primary text-primary bg-background"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            }`}
          >
            <span className="block">{tab.label}</span>
            <span className="block text-xs font-normal opacity-70">{tab.description}</span>
          </Link>
        );
      })}
    </div>
  );
}
