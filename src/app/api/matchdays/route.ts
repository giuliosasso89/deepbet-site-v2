import { NextResponse } from 'next/server'; import { loadAll } from '@/lib/store';
export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const league = searchParams.get('league') as any;
  const { nextMatches } = loadAll();
  const mds = [...new Set(nextMatches.filter(m=> m.league===league).map(m=> m.matchday))].sort((a,b)=>a-b);
  return NextResponse.json(mds);
}
