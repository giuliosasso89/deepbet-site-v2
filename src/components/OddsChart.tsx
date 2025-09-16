'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
export default function OddsChart({data}:{data:{date:string,B365H:number,B365D:number,B365A:number}[]}){
  if(!data?.length) return <div className="text-sm opacity-60">Nessuna quota storica disponibile.</div>;
  return (<div className="h-56"><ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}><XAxis dataKey="date"/><YAxis/><Tooltip/><Legend/>
      <Line type="monotone" dataKey="B365H" dot={false}/>
      <Line type="monotone" dataKey="B365D" dot={false}/>
      <Line type="monotone" dataKey="B365A" dot={false}/>
    </LineChart>
  </ResponsiveContainer></div>);
}
