import { NextResponse } from 'next/server'; import { loadAll } from '@/lib/store'; import { poissonPredict } from '@/lib/poisson';
export async function GET(req: Request){
  const { searchParams } = new URL(req.url); const league = searchParams.get('league') as any;
  const { matches } = loadAll(); const byMd: Record<number, any[]> = {};
  for(const m of matches.filter((m:any)=> m.league===league)){ (byMd[m.matchday] ??= []).push(m); }
  const trend = Object.entries(byMd).sort((a,b)=> parseInt(a[0])-parseInt(b[0])).map(([md, arr])=>{
    let correct=0,total=0; for(const m of (arr as any[])){
      if(m.fthg==null || m.ftag==null) continue;
      const p = poissonPredict(1.4,1.1).probs;
      const sign = p.home>p.draw && p.home>p.away ? 'H' : (p.away>p.draw ? 'A' : 'D');
      const real = m.fthg>m.ftag ? 'H' : (m.fthg<m.ftag ? 'A' : 'D'); total+=1; if(sign===real) correct+=1;
    } return { matchday: parseInt(md), accuracy: total? correct/total : 0 };
  });
  return NextResponse.json({ trend });
}
