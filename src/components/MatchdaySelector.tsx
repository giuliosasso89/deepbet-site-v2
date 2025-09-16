'use client';
import useSWR from 'swr'; const fetcher=(u:string)=>fetch(u).then(r=>r.json());
export default function MatchdaySelector({league,value,onChange}:{league:string,value?:number,onChange:(v:number)=>void}){
  const {data} = useSWR(()=> league ? `/api/matchdays?league=${league}` : null, fetcher);
  const list: number[] = data || [];
  if(!list.length) return <span className="text-sm opacity-60">Nessuna giornata disponibile</span>;
  return (
    <select className="btn" value={value} onChange={e=>onChange(parseInt(e.target.value))}>
      {list.map(md=>(<option key={md} value={md}>Giornata {md}</option>))}
    </select>
  );
}
