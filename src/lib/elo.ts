export type EloRecord = { team:string, elo:number, date:string };
export function computeEloSeries(matches:any[], K=20){
  const ratings: Record<string, number> = {};
  const series: Record<string, EloRecord[]> = {};
  const sorted = [...matches].sort((a,b)=> new Date(a.date.split('-').reverse().join('-')).getTime() - new Date(b.date.split('-').reverse().join('-')).getTime());
  for(const m of sorted){
    const home = m.home; const away = m.away;
    ratings[home] ??= 1500; ratings[away] ??= 1500;
    const Rh = ratings[home]; const Ra = ratings[away];
    const Eh = 1/(1+10**((Ra-Rh)/400)); const Ea = 1-Eh;
    const outcomeHome = m.fthg>m.ftag?1:(m.fthg===m.ftag?0.5:0); const outcomeAway = 1-outcomeHome;
    ratings[home] = Rh + K*(outcomeHome - Eh); ratings[away] = Ra + K*(outcomeAway - Ea);
    const ds = m.date;
    (series[home] ??= []).push({team:home, elo:ratings[home], date: ds});
    (series[away] ??= []).push({team:away, elo:ratings[away], date: ds});
  }
  const ranking = Object.entries(ratings).map(([team,elo])=>({team, elo})).sort((a,b)=>b.elo-a.elo);
  return { ranking, series };
}
