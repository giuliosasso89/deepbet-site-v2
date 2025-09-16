'use client';
import { useState } from 'react';
import LeagueSelector from '@/components/LeagueSelector';
import useSWR from 'swr';
import RatingChart from '@/components/RatingChart';
const fetcher=(u:string)=>fetch(u).then(r=>r.json());
export default function RatingPage(){
  const [league,setLeague]=useState('I1');
  const {data} = useSWR(()=> `/api/rating?league=${league}`, fetcher);
  return (
    <div className="space-y-4">
      <div className="card-glass p-4 flex items-center gap-2"><LeagueSelector value={league} onChange={setLeague} /></div>
      <div className="card-glass p-4">
        <div className="font-medium mb-2">Ranking Elo</div>
        <div className="grid gap-2">
          {data?.ranking?.length ? data.ranking.map((r:any)=>(
            <div key={r.team} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <img src={r.logo} className="w-6 h-6" onError={(e:any)=>{e.currentTarget.src='/assets/logos/fallback.png'}}/><span>{r.team}</span>
              </div><span className="font-mono">{Math.round(r.elo)}</span>
            </div>
          )) : <div className="text-sm opacity-60">Dati non disponibili (servono match storici).</div>}
        </div>
      </div>
      <div className="card-glass p-4"><div className="font-medium mb-2">Andamento rating</div><RatingChart data={data?.series || []}/></div>
    </div>
  );
}
