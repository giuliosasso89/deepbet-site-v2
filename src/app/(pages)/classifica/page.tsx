'use client';
import { useState } from 'react';
import LeagueSelector from '@/components/LeagueSelector';
import useSWR from 'swr';
const fetcher=(u:string)=>fetch(u).then(r=>r.json());
export default function ClassificaPage(){
  const [league,setLeague]=useState('I1');
  const {data} = useSWR(()=> `/api/standings?league=${league}`, fetcher);
  return (
    <div className="space-y-4">
      <div className="card-glass p-4 flex items-center gap-2"><LeagueSelector value={league} onChange={setLeague} /></div>
      {!data?.length && <div className="card-glass p-4">Nessuna classifica trovata. Assicurati di avere file in <code>data/standings/</code>.</div>}
      {data?.length && (
        <div className="card-glass p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left opacity-70"><tr><th>#</th><th>Squadra</th><th>Pt</th><th>GF</th><th>GS</th><th>xG</th><th>xGA</th></tr></thead>
            <tbody>{data.map((row:any,idx:number)=>(
              <tr key={row.team} className="border-t border-white/30">
                <td>{idx+1}</td><td className="flex items-center gap-2 py-2"><img src={row.logo} className="w-6 h-6" onError={(e:any)=>{e.currentTarget.src='/assets/logos/fallback.png'}}/>{row.team}</td>
                <td>{row.points}</td><td>{row.gf}</td><td>{row.ga}</td><td>{row.xg ?? '-'}</td><td>{row.xga ?? '-'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
