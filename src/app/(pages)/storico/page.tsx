'use client';
import { useState } from 'react';
import LeagueSelector from '@/components/LeagueSelector';
import useSWR from 'swr';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
const fetcher=(u:string)=>fetch(u).then(r=>r.json());
export default function StoricoPage(){
  const [league,setLeague]=useState('I1');
  const {data} = useSWR(()=> `/api/history/accuracy?league=${league}`, fetcher);
  return (
    <div className="space-y-4">
      <div className="card-glass p-4 flex items-center gap-2"><LeagueSelector value={league} onChange={setLeague} /></div>
      {!data?.trend?.length && <div className="card-glass p-4">Nessun dato storico disponibile (servono partite concluse in <code>data/historical_dataset.json</code>).</div>}
      {data?.trend?.length && <div className="card-glass p-4 h-72">
        <ResponsiveContainer width="100%" height="100%"><LineChart data={data.trend}>
          <XAxis dataKey="matchday"/><YAxis domain={[0,1]}/><Tooltip formatter={(v)=> (Number(v)*100).toFixed(1)+'%'}/>
          <Line type="monotone" dataKey="accuracy" dot={false}/>
        </LineChart></ResponsiveContainer>
      </div>}
    </div>
  );
}
