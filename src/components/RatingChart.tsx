'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
export default function RatingChart({data}:{data:{date:string,elo:number}[]}){
  if(!data?.length) return <div className="text-sm opacity-60">Nessuna serie disponibile.</div>;
  return (<div className="h-56"><ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}><XAxis dataKey="date"/><YAxis/><Tooltip/><Line type="monotone" dataKey="elo" dot={false}/></LineChart>
  </ResponsiveContainer></div>);
}
