'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, BarChart3, LineChart, Table, History } from "lucide-react";
const items = [
  { href: "/pronostici", label: "Campionato", icon: <BarChart3 size={18}/> },
  { href: "/per-data", label: "Data", icon: <CalendarDays size={18}/> },
  { href: "/rating", label: "Rating", icon: <LineChart size={18}/> },
  { href: "/classifica", label: "Classifica", icon: <Table size={18}/> },
  { href: "/storico", label: "Storico", icon: <History size={18}/> },
];
export default function Sidebar(){
  const pathname = usePathname();
  return (
    <aside className="w-64 hidden md:flex md:flex-col sticky top-0 h-screen p-4 gap-3">
      <div className="card-glass p-4"><div className="text-xl font-semibold">DeepBet</div><div className="text-sm opacity-70">Top5 EU</div></div>
      <nav className="card-glass p-2 flex-1">
        {items.map(it => (
          <Link key={it.href} href={it.href} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 my-1 transition ${pathname.startsWith(it.href) ? 'bg-white/70' : 'hover:bg-white/50'}`}>
            {it.icon}<span>{it.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
