import fs from 'fs';
import path from 'path';

export type LeagueCode = 'I1'|'E0'|'SP1'|'D1'|'F1';

type Match = {
  id: string; league: LeagueCode; matchday:number;
  date: string; home: string; away: string;
  fthg?: number; ftag?: number;
  B365H?: number; B365D?: number; B365A?: number;
};

type TeamStats = { team:string, overall:number, attack:number, midfield:number, defence:number };
type Standing = { team:string, points:number, gf:number, ga:number, xg?:number, xga?:number };

export let cache: {
  leagues: {code:LeagueCode, name:string}[];
  matches: Match[];
  nextMatches: Match[];
  logos: Record<string,string>;
  stats: Record<string, TeamStats>;
  standings: Record<LeagueCode, Standing[]>;
} | null = null;

const readJSON = (file:string)=> JSON.parse(fs.readFileSync(file,'utf-8'));
const exists = (p:string)=> fs.existsSync(p);

function mapLeagueCode(v:any): LeagueCode | null {
  const s = String(v ?? '').toUpperCase().replace(/\s+/g,'');
  if (s.includes('I1') || /SERIEA|ITA1|IT1/.test(s)) return 'I1';
  if (s.includes('E0') || /PREMIER|EPL|ENG1/.test(s)) return 'E0';
  if (s.includes('SP1') || /LALIGA|LIGA|SPA1/.test(s)) return 'SP1';
  if (s.includes('D1') || /BUNDESLIGA|GER1/.test(s)) return 'D1';
  if (s.includes('F1') || /LIGUE1|FRA1/.test(s)) return 'F1';
  return null;
}

function mapAlias(name:string|undefined|null, alias:Record<string,string>): string {
  if(!name) return '';
  const trimmed = String(name).trim();
  return alias[trimmed] ?? trimmed;
}
const key = (s:string)=> s.trim().toLowerCase();

export function loadAll(){
  if(cache) return cache;

  const dataDir = path.join(process.cwd(), 'data');
  const aliasPath = path.join(dataDir, 'alias.json');
  const alias: Record<string,string> = exists(aliasPath) ? readJSON(aliasPath) : {};

  const leagues = [
    {code:'I1', name:'Serie A'},
    {code:'E0', name:'Premier League'},
    {code:'SP1', name:'Liga'},
    {code:'D1', name:'Bundesliga'},
    {code:'F1', name:'Ligue 1'},
  ] as const;

  const safeRead = (p:string, def:any)=> exists(p) ? readJSON(p) : def;

  const histRaw  = safeRead(path.join(dataDir,'historical_dataset.json'), []) as any[];
  const nextRaw  = safeRead(path.join(dataDir,'next_match.json'), []) as any[];
  const logosArr = safeRead(path.join(dataDir,'team_logo.json'), []) as {team:string,url:string}[];
  const statsArr = safeRead(path.join(dataDir,'team_stats.json'), []) as TeamStats[];

  // --- NORMALIZZAZIONE LEGA + ALIAS TEAM + MATCHDAY NUMERICO ---
  const toMatch = (r:any): Match | null => {
    const L = mapLeagueCode(r.league);
    if(!L) return null;
    const md = Number(r.matchday);
    if(!Number.isFinite(md)) return null;
    return {
      id: r.id ?? `${L}_${md}_${r.home}_${r.away}`,
      league: L,
      matchday: md,
      date: String(r.date ?? ''),
      home: mapAlias(r.home, alias),
      away: mapAlias(r.away, alias),
      fthg: r.fthg!=null ? Number(r.fthg) : undefined,
      ftag: r.ftag!=null ? Number(r.ftag) : undefined,
      B365H: r.B365H!=null ? Number(r.B365H) : undefined,
      B365D: r.B365D!=null ? Number(r.B365D) : undefined,
      B365A: r.B365A!=null ? Number(r.B365A) : undefined,
    };
  };

  const matches = histRaw.map(toMatch).filter(Boolean) as Match[];
  const nextMatches = nextRaw.map(toMatch).filter(Boolean) as Match[];

  // --- LOGHI / STATS (filtra righe invalide) ---
  const logos: Record<string,string> = {};
  for (const l of logosArr) {
    if (!l?.team || !l?.url) continue;
    logos[key(mapAlias(l.team, alias))] = String(l.url);
  }

  const stats: Record<string,TeamStats> = {};
  for (const s of statsArr) {
    if (!s?.team) continue;
    const team = mapAlias(s.team, alias);
    stats[key(team)] = { ...s, team };
  }

  // --- STANDINGS (scegli ultimo file per lega + alias team) ---
  const standings: Record<LeagueCode, Standing[]> = { I1:[],E0:[],SP1:[],D1:[],F1:[] };
  const standingsDir = path.join(dataDir, 'standings');
  if(!exists(standingsDir)) fs.mkdirSync(standingsDir, { recursive:true });
  for(const lg of leagues){
    const files = fs.readdirSync(standingsDir).filter(f=> f.startsWith(`standings_${lg.code}_`));
    if(files.length){
      files.sort();
      const arr = readJSON(path.join(standingsDir, files[files.length-1])) as Standing[];
      standings[lg.code] = arr.map(r=> ({ ...r, team: mapAlias(r.team, alias) }));
    }
  }

  cache = { leagues: leagues as any, matches, nextMatches, logos, stats, standings };
  return cache;
}
