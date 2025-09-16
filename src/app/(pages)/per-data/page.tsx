'use client';
import { useEffect, useState } from 'react';
import LeagueSelector from '@/components/LeagueSelector';
import useSWR from 'swr';
const fetcher=(u:string)=>fetch(u).then(r=>r.json());
export default function PerDataPage(){
  const [league,setLeague]=useState('I1');
  const [date,setDate]=useState<string>('');
  const {data:matches} = useSWR(()=> (league && date) ? `/api/matches/by-date?league=${league}&date=${date}` : null, fetcher);
  useEffect(()=>{ setDate(new Date().toISOString().split('T')[0]) },[]);
  return (
    <div className="space-y-4">
      <div className="card-glass p-4 flex flex-wrap gap-2 items-center">
        <LeagueSelector value={league} onChange={setLeague} />
        <input type="date" className="btn" value={date} onChange={e=>setDate(e.target.value)} />
      </div>
      {!matches?.length && <div className="card-glass p-4">Nessuna partita trovata per la data selezionata.</div>}
      <div className="grid gap-4">
        {matches?.map((m:any)=>(
          <div key={m.id} className="card-glass p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={m.homeLogo} className="w-8 h-8" onError={(e:any)=>{e.currentTarget.src='/assets/logos/fallback.png'}}/>
              <span className="font-medium">{m.home}</span>
              <span className="opacity-60">vs</span>
              <img src={m.awayLogo} className="w-8 h-8" onError={(e:any)=>{e.currentTarget.src='/assets/logos/fallback.png'}}/>
              <span className="font-medium">{m.away}</span>
            </div>
            <div className="text-sm opacity-70">{m.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
