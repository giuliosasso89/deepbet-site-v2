import { NextResponse } from 'next/server';
import { loadAll } from '@/lib/store';

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const league = searchParams.get('league') as any;
  const { standings, logos } = loadAll();
  const key = (s:string)=> s.trim().toLowerCase();
  const rows = (standings as any)[league] || [];
  for(const r of rows){
    r.logo = logos[key(r.team)] || '/assets/logos/fallback.png';
  }
  return NextResponse.json(rows);
}
