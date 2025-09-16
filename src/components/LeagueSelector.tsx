'use client';
import useSWR from 'swr'; const fetcher=(u:string)=>fetch(u).then(r=>r.json());
export default function LeagueSelector({value,onChange}:{value?:string,onChange:(v:string)=>void}){
  const {data} = useSWR('/api/leagues', fetcher);
  return (
    <select className="btn" value={value} onChange={e=>onChange(e.target.value)}>
      {data?.map((l:any)=>(<option key={l.code} value={l.code}>{l.code} – {l.name}</option>))}
    </select>
  );
}
