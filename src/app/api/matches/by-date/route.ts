import { NextResponse } from 'next/server'; import { loadAll } from '@/lib/store';
export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const league = searchParams.get('league') as any;
  const date = searchParams.get('date') as string; // yyyy-mm-dd
  const [y,m,d] = date.split('-'); const ddmmyyyy = `${d}-${m}-${y}`;
  const { nextMatches, logos } = loadAll();
  const rows = nextMatches.filter(m=> m.league===league && m.date===ddmmyyyy).map(m=>({
    ...m, homeLogo: logos[m.home] || '/assets/logos/fallback.png', awayLogo: logos[m.away] || '/assets/logos/fallback.png'
  }));
  return NextResponse.json(rows);
}
