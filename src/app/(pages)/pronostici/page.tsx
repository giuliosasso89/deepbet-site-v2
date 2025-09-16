'use client';
import { useEffect, useState } from 'react';
import LeagueSelector from '@/components/LeagueSelector';
import MatchdaySelector from '@/components/MatchdaySelector';
import useSWR from 'swr';
import OddsChart from '@/components/OddsChart';
import Heatmap from '@/components/Heatmap';
import { CalendarDays, Shield, Zap, CircleDot, Trophy } from 'lucide-react';

const fetcher = (url:string)=>fetch(url).then(r=>r.json());

export default function PronosticiPage(){
  const [league,setLeague]=useState('I1');
  const [matchday,setMatchday]=useState<number|undefined>(undefined);
  const {data:matches} = useSWR(()=> (league && matchday) ? `/api/matches?league=${league}&matchday=${matchday}` : null, fetcher);
  const {data:mds} = useSWR(()=> league ? `/api/matchdays?league=${league}` : null, fetcher);
  useEffect(()=>{ if(mds?.length) setMatchday(mds[0]); },[mds]);

  return (
    <div className="space-y-4">
      <div className="card-glass p-4 flex flex-wrap gap-2 items-center hover-lift anim-fade-up" style={{animationDelay:'20ms'}}>
        <LeagueSelector value={league} onChange={setLeague} />
        <MatchdaySelector league={league} value={matchday} onChange={setMatchday} />
      </div>

      {!mds?.length && <div className="card-glass p-4 anim-fade-up" style={{animationDelay:'60ms'}}>Nessuna giornata futura trovata. Verifica <code>data/next_match.json</code>.</div>}
      {mds?.length && !matches?.length && <div className="card-glass p-4 anim-fade-up" style={{animationDelay:'60ms'}}>Nessuna partita per la giornata selezionata.</div>}

      <div className="grid gap-4">
        {matches?.map((m:any, idx:number)=>(<MatchCard key={m.id} match={m} league={league} idx={idx}/>))}
      </div>
    </div>
  );
}

/** Badge data */
function DateBadge({date}:{date:string}){
  return (
    <div className="badge flex items-center gap-1">
      <CalendarDays size={14}/> <span>{date}</span>
    </div>
  );
}

/** Riquadri percentuali 1 / X / 2 (senza barre) */
function ProbBoxes({probs}:{probs:{home:number,draw:number,away:number}}){
  const ph = +(probs.home*100).toFixed(1);
  const pd = +(probs.draw*100).toFixed(1);
  const pa = +(probs.away*100).toFixed(1);
  const Item = ({label,val,type}:{label:string,val:number,type:'home'|'draw'|'away'})=>{
    const cls = `prob-box ${type}`;
    return <div className={cls}><span className="font-semibold">{label}</span><span className="font-mono">{val.toFixed(1)}%</span></div>;
  };
  return (
    <div className="grid grid-cols-3 gap-3 min-w-[260px]">
      <Item label="1" val={ph} type="home"/>
      <Item label="X" val={pd} type="draw"/>
      <Item label="2" val={pa} type="away"/>
    </div>
  );
}

/** Stat pills con icone */
function StatPills({stats}:{stats:any}){
  if(!stats) return <div className="text-xs opacity-60">n/d</div>;
  const Pill = ({icon,label,val}:{icon:JSX.Element,label:string,val:number})=>(
    <div className="stat-pill text-xs flex items-center justify-between gap-2">
      <span className="inline-flex items-center gap-1 opacity-80">{icon}{label}</span>
      <span className="font-semibold">{val}</span>
    </div>
  );
  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
      <Pill icon={<Trophy size={14}/>} label="Ovr" val={stats.overall}/>
      <Pill icon={<Zap size={14}/>} label="Atk" val={stats.attack}/>
      <Pill icon={<CircleDot size={14}/>} label="Mid" val={stats.midfield}/>
      <Pill icon={<Shield size={14}/>} label="Def" val={stats.defence}/>
    </div>
  );
}

/** Barra forma: ultime 5 (W/D/L) */
function FormBar({items}:{items:('W'|'D'|'L')[]|undefined}){
  if(!items?.length) return <div className="text-xs opacity-60">Form: n/d</div>;
  const color = (c:'W'|'D'|'L') => c==='W' ? '#22c55e' : c==='D' ? '#9ca3af' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs opacity-70">Form:</span>
      <div className="flex items-center gap-1">
        {items.map((c,idx)=>(
          <span key={idx} className="form-sq" title={c} style={{background: color(c)}} />
        ))}
      </div>
    </div>
  );
}

function TeamColumn({name, logoUrl, stats, form, align='center'}:{name:string, logoUrl:string, stats:any, form:('W'|'D'|'L')[]|undefined, align?:'center'|'left'|'right'}){
  const logo = <img src={logoUrl} alt="" className="team-logo w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain" loading="lazy" onError={(e:any)=>{e.currentTarget.src='/assets/logos/fallback.png'}}/>;
  const nameCls = `team-name text-lg sm:text-xl md:text-2xl font-semibold ${align==='left'?'text-left':align==='right'?'text-right':'text-center'}`;
  const wrapperCls = `flex flex-col items-center gap-3 ${align==='left'?'md:items-start':align==='right'?'md:items-end':'md:items-center'}`;
  return (
    <div className={wrapperCls}>
      {logo}
      <div className={nameCls}>{name}</div>
      <StatPills stats={stats}/>
      <FormBar items={form}/>
    </div>
  );
}

function Top3Plain({list}:{list:{score:string,p:number}[]}) {
  const top = list.slice(0,3);
  return (
    <ol className="space-y-1">
      {top.map((r)=>(
        <li key={r.score} className="rounded-lg px-3 py-2 border border-white/40 bg-white/20">
          <span className="font-medium">{r.score}</span>
          <span className="ml-2 font-mono">{(r.p*100).toFixed(1)}%</span>
        </li>
      ))}
    </ol>
  );
}

function H2HList({data}:{data:{date:string,home:string,away:string,fthg:number|null,ftag:number|null,sign:'H'|'D'|'A'|null}[]|undefined}){
  if(!data?.length) return <div className="text-sm opacity-60">Nessun H2H disponibile.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[400px] text-sm">
        <thead className="opacity-70">
          <tr><th className="text-left">Data</th><th className="text-left">Match</th><th className="text-left">Risultato</th><th className="text-left">Segno</th></tr>
        </thead>
        <tbody>
          {data.map((m,i)=>(
            <tr key={i} className="border-t border-white/30">
              <td className="py-1">{m.date}</td>
              <td>{m.home} vs {m.away}</td>
              <td>{m.fthg!=null && m.ftag!=null ? `${m.fthg}-${m.ftag}` : 'n/d'}</td>
              <td>{m.sign ?? 'n/d'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatchCard({match, league, idx}:{match:any, league:string, idx:number}){
  const [open,setOpen]=useState(false);
  const {data:pred} = useSWR(()=> `/api/predict?league=${league}&home=${encodeURIComponent(match.home)}&away=${encodeURIComponent(match.away)}`, fetcher);

  return (
    <div className="match-card card-glass p-5 hover-lift anim-fade-up" style={{animationDelay: `${80 + idx*60}ms`}}>
      {/* Grid 3 blocchi: Home | Centro (data + 1/X/2 + Dettagli) | Away */}
      <div className="grid items-start gap-6 md:grid-cols-[1fr_auto_1fr]">
        <TeamColumn
          name={match.home}
          logoUrl={match.homeLogo}
          stats={pred?.stats?.home}
          form={pred?.form?.home}
          align="left"
        />

        <div className="flex flex-col items-center gap-3">
          <DateBadge date={match.date}/>
          {pred?.available
            ? <ProbBoxes probs={pred.probs}/>
            : <div className="text-sm italic opacity-70 text-center">Pronostico non presente</div>
          }
          <button className="btn mt-1" onClick={()=>setOpen(v=>!v)}>{open ? 'Nascondi dettagli' : 'Dettagli'}</button>
        </div>

        <TeamColumn
          name={match.away}
          logoUrl={match.awayLogo}
          stats={pred?.stats?.away}
          form={pred?.form?.away}
          align="right"
        />
      </div>

      {/* Dettagli */}
      {open && pred?.available && (
        <div className="mt-5 grid gap-4">
          {/* Top3 + Under/Over (Top3 senza colori) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-glass p-4">
              <div className="font-medium mb-2">Top 3 risultati</div>
              <Top3Plain list={pred.results}/>
            </div>
            <div className="card-glass p-4">
              <div className="font-medium mb-2">Under / Over</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>U1.5: {(pred.under_over.u15*100).toFixed(1)}%</div>
                <div>U2.5: {(pred.under_over.u25*100).toFixed(1)}%</div>
                <div>U3.5: {(pred.under_over.u35*100).toFixed(1)}%</div>
                <div>O1.5: {(pred.under_over.o15*100).toFixed(1)}%</div>
                <div>O2.5: {(pred.under_over.o25*100).toFixed(1)}%</div>
                <div>O3.5: {(pred.under_over.o35*100).toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Heatmap */}
          <div className="card-glass p-4">
            <div className="font-medium mb-2">Heatmap risultati esatti (0–5)</div>
            <Heatmap matrix={pred.heatmap}/>
          </div>

          {/* Quote + H2H */}
          <div className="card-glass p-4">
            <div className="font-medium mb-2">Andamento quote B365</div>
            <OddsChart data={pred.odds_history}/>
            <div className="mt-4">
              <div className="font-medium mb-2">H2H (ultimi incontri)</div>
              <H2HList data={pred.h2h?.last}/>
              {pred.h2h?.total != null && (
                <div className="mt-2 text-xs opacity-70">
                  Totale H2H: {pred.h2h.total} · Vittorie Casa: {pred.h2h.counts?.H ?? 0} · Pareggi: {pred.h2h.counts?.D ?? 0} · Vittorie Trasferta: {pred.h2h.counts?.A ?? 0}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
