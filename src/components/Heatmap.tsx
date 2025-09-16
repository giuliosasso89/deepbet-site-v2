'use client';
import React from 'react';

function cellColor(p:number, max:number){
  const ratio = max ? p / max : 0;
  const hue = 210 - Math.round(ratio*210);          // blu → rosso
  const alpha = 0.9 * Math.max(0.15, ratio);
  return `hsla(${hue} 90% 50% / ${alpha})`;
}

export default function Heatmap({matrix}:{matrix:number[][]}){
  const max = Math.max(...matrix.flat(), 0);
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[auto_repeat(6,1fr)] gap-1 text-xs">
        <div></div>
        {[0,1,2,3,4,5].map(a=>(
          <div key={a} className="text-center font-medium opacity-70">{a}</div>
        ))}
        {matrix.map((row,i)=>(
          <React.Fragment key={i}>
            <div className="text-center font-medium opacity-70">{i}</div>
            {row.map((p,j)=>(
              <div
                key={j}
                title={`${i}-${j}: ${(p*100).toFixed(1)}%`}
                className="heat-cell h-8 rounded-md border border-white/30"
                style={{background: cellColor(p, max)}}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs opacity-70">
        <span>Gol Casa →</span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-6 h-3 rounded" style={{background: cellColor(0.05*max, max)}} />
          <span className="inline-block w-6 h-3 rounded" style={{background: cellColor(0.5*max, max)}} />
          <span className="inline-block w-6 h-3 rounded" style={{background: cellColor(max, max)}} />
        </span>
        <span>← Gol Trasferta</span>
      </div>
    </div>
  );
}
