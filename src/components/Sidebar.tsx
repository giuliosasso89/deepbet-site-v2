'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import { CalendarDays, BarChart3, ListOrdered, History, Trophy } from 'lucide-react';

type NavItem = {
  href: Route;         // <— tipizzato, non string
  label: string;
  icon: JSX.Element;
};

const items: NavItem[] = [
  { href: '/pronostici' as Route, label: 'Campionato', icon: <Trophy size={16} /> },
  { href: '/per-data' as Route,   label: 'Per data',   icon: <CalendarDays size={16} /> },
  { href: '/rating' as Route,     label: 'Rating',     icon: <BarChart3 size={16} /> },
  { href: '/classifica' as Route, label: 'Classifica', icon: <ListOrdered size={16} /> },
  { href: '/storico' as Route,    label: 'Storico',    icon: <History size={16} /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] shrink-0 p-4 hidden md:flex">
      <nav className="card-glass p-2 flex-1">
        {items.map((it) => {
          const active = pathname?.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 my-1 transition ${
                active ? 'bg-white/70' : 'hover:bg-white/50'
              }`}
            >
              {it.icon}
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
