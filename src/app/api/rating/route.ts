import { NextResponse } from 'next/server'; import { loadAll } from '@/lib/store'; import { computeEloSeries } from '@/lib/elo';
export async function GET(req: Request){
  const { searchParams } = new URL(req.url); const league = searchParams.get('league');
  const { matches, logos } = loadAll(); const m = matches.filter((mm:any)=> mm.league===league);
  const { ranking, series } = computeEloSeries(m as any);
  const sers = Object.entries(series).flatMap(([team,arr]: any)=> (arr as any[]).map(x=>({date:x.date, elo:x.elo, team})));
  const withLogos = ranking.map(r=>({...r, logo: (logos as any)[r.team]}));
  return NextResponse.json({ ranking: withLogos, series: sers });
}
