import { NextResponse } from 'next/server';
import { loadAll } from '@/lib/store';
import { poissonPredict } from '@/lib/poisson';

function parseDDMMYYYY(s: string) {
  const [dd, mm, yyyy] = s.split('-').map(Number);
  return new Date(yyyy || 1970, (mm || 1) - 1, dd || 1).getTime();
}

function teamForm(matches: any[], league: string, team: string) {
  const rows = matches
    .filter((m: any) => m.league === league && m.fthg != null && m.ftag != null && (m.home === team || m.away === team))
    .sort((a: any, b: any) => parseDDMMYYYY(a.date) - parseDDMMYYYY(b.date));
  const last5 = rows.slice(-5);
  return last5.map((m: any) => {
    const isHome = m.home === team;
    const gf = isHome ? m.fthg : m.ftag;
    const ga = isHome ? m.ftag : m.fthg;
    if (gf > ga) return 'W';
    if (gf < ga) return 'L';
    return 'D';
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const league = searchParams.get('league') as string;
  const home = searchParams.get('home') as string;
  const away = searchParams.get('away') as string;

  const { matches, standings, stats } = loadAll();
  const key = (s: string) => s.trim().toLowerCase();

  // H2H nello stesso ordine home->away
  const h2h = matches.filter((m: any) => m.league === league && m.home === home && m.away === away);
  if (h2h.length < 7) {
    return NextResponse.json({ available: false });
  }

  // pesi stagionali
  const weight = (dateStr: string) => {
    const y = parseInt(dateStr.slice(6, 10));
    if (y >= 2025) return 1.0;
    if (y === 2024) return 1.0;
    if (y === 2023) return 0.7;
    if (y === 2022) return 0.5;
    if (y === 2021) return 0.35;
    return 0.25;
  };

  let sumW = 0, gH = 0, gA = 0;
  for (const m of h2h) {
    const w = weight(m.date);
    sumW += w;
    gH += (m.fthg ?? 0) * w;
    gA += (m.ftag ?? 0) * w;
  }
  const avgH = gH / (sumW || 1);
  const avgA = gA / (sumW || 1);

  // xG/xGA dalla classifica
  const st = (standings as any)[league] as any[] || [];
  const rowH = st.find(r => r.team === home);
  const rowA = st.find(r => r.team === away);
  const adjH = rowH?.xg && rowA?.xga ? (rowH.xg + (rowA.xga)) / 2 : avgH;
  const adjA = rowA?.xg && rowH?.xga ? (rowA.xg + (rowH.xga)) / 2 : avgA;

  // vantaggio casa (leggero)
  const uplift = avgH > avgA ? 0.10 : 0.05;
  const lambdaH = Math.max(0.1, adjH * (1 + uplift));
  const lambdaA = Math.max(0.05, adjA);

  const out = poissonPredict(lambdaH, lambdaA);

  // quote storiche Best365
  const odds_history = h2h
    .filter((m: any) => m.B365H && m.B365D && m.B365A)
    .map((m: any) => ({ date: m.date, B365H: m.B365H!, B365D: m.B365D!, B365A: m.B365A! }));

  // stats + form
  const stats_home = (stats as any)[key(home)] ?? null;
  const stats_away = (stats as any)[key(away)] ?? null;
  const form_home = teamForm(matches, league, home);
  const form_away = teamForm(matches, league, away);

  // H2H dettagliato (ultimi 10)
  const h2h_sorted = [...h2h].sort((a, b) => parseDDMMYYYY(b.date) - parseDDMMYYYY(a.date));
  const h2h_last = h2h_sorted.slice(0, 10).map((m: any) => ({
    date: m.date,
    home: m.home,
    away: m.away,
    fthg: m.fthg ?? null,
    ftag: m.ftag ?? null,
    sign: m.fthg == null || m.ftag == null ? null : (m.fthg > m.ftag ? 'H' : (m.fthg < m.ftag ? 'A' : 'D'))
  }));
  const h2h_counts = h2h_sorted.reduce((acc: any, m: any) => {
    if (m.fthg == null || m.ftag == null) return acc;
    const s = m.fthg > m.ftag ? 'H' : (m.fthg < m.ftag ? 'A' : 'D');
    acc[s] = (acc[s] || 0) + 1; return acc;
  }, { H: 0, D: 0, A: 0 });

  return NextResponse.json({
    available: true,
    ...out,
    odds_history,
    stats: { home: stats_home, away: stats_away },
    form: { home: form_home, away: form_away },
    h2h: { total: h2h.length, counts: h2h_counts, last: h2h_last }
  });
}
