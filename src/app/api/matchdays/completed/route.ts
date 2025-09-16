import { NextResponse } from 'next/server'; import { loadAll } from '@/lib/store';
export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const league = searchParams.get('league') as any;
  const { matches, nextMatches } = loadAll();
  const future = new Set(nextMatches.filter(m=>m.league===league).map(m=>m.matchday));
  const past = [...new Set(matches.filter(m=>m.league===league).map(m=>m.matchday))].filter(md=> !future.has(md)).sort((a,b)=>a-b);
  return NextResponse.json(past);
}
