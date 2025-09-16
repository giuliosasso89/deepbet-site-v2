import { NextResponse } from 'next/server';
import { loadAll } from '@/lib/store';

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const league = searchParams.get('league') as any;
  const matchday = parseInt(searchParams.get('matchday')||'0');
  const { nextMatches, logos } = loadAll();

  const key = (s:string)=> s.trim().toLowerCase();

  const rows = nextMatches
    .filter(m=> m.league===league && m.matchday===matchday)
    .map(m=>({
      ...m,
      homeLogo: logos[key(m.home)] || '/assets/logos/fallback.png',
      awayLogo: logos[key(m.away)] || '/assets/logos/fallback.png'
    }));

  return NextResponse.json(rows);
}
