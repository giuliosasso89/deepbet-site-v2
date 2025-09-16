// scripts/convert_xlsx_to_json.mjs
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

const dataDir = path.join(process.cwd(), 'data');
const xlsxDir = path.join(dataDir, 'xlsx');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const saveJSON = (name, obj) => {
  const out = path.join(dataDir, name);
  fs.writeFileSync(out, JSON.stringify(obj, null, 2));
  console.log(`Wrote ${name} ${Array.isArray(obj) ? `(${obj.length} rows)` : ''}`);
};

// --- helpers ---
const normKey = (s) =>
  String(s).trim().toLowerCase().replace(/\s+/g, '').replace(/[_-]/g, '');

const parseDateDDMMYYYY = (v) => {
  if (v == null || v === '') return null;
  const d = new Date(v);
  if (!Number.isNaN(d.valueOf())) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = d.getFullYear();
    return `${dd}-${mm}-${yy}`;
  }
  // già DD-MM-YYYY?
  if (/^\d{2}-\d{2}-\d{4}$/.test(String(v))) return String(v);
  return String(v);
};

const buildColIndex = (row0) => {
  const idx = {};
  for (const k of Object.keys(row0 || {})) idx[normKey(k)] = k;
  return idx;
};

const BEST_TEAM_HEADERS = [
  'team','squadra','club','name','nome','teamname','clubname','team_name','club_name',
  'nomenome','nomesquadra','squadranome'
];
const BEST_URL_HEADERS = [
  'url','logo','logourl','logo_url','image','img','imageurl','png','pngurl','svg','svgurl','logopng'
];

const pickByHeaders = (row, cols, headerList) => {
  for (const nm of headerList) {
    const col = cols[normKey(nm)];
    if (col && row[col] != null) return row[col];
  }
  return null;
};

// euristica: se non trovo per header, scelgo la prima colonna “stringa-non url” per team,
// e la prima colonna che contiene un URL/estensione immagine per url
const guessTeam = (row) => {
  for (const [k, v] of Object.entries(row)) {
    if (v == null) continue;
    if (typeof v === 'string' && v.trim() && !/^https?:/i.test(v)) {
      return v.trim();
    }
  }
  return null;
};
const guessUrl = (row) => {
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === 'string') {
      const s = v.trim();
      if (/^https?:/i.test(s) || /\.(png|svg|jpg|jpeg|webp)$/i.test(s)) return s;
    }
  }
  return null;
};

const KEYMAP_COMMON = {
  league: ['league', 'campionato', 'div'],
  matchday: ['matchday', 'giornata', 'md'],
  date: ['date', 'data'],
  home: ['home', 'casa', 'hometeam', 'home_team'],
  away: ['away', 'trasferta', 'awayteam', 'away_team'],
  fthg: ['fthg', 'hg', 'homegoals', 'home_goals', 'golcasa', 'gol_casa'],
  ftag: ['ftag', 'ag', 'awaygoals', 'away_goals', 'goltrasferta', 'gol_trasferta'],
  B365H: ['b365h'],
  B365D: ['b365d'],
  B365A: ['b365a'],
};
const KEYMAP_STATS = {
  overall: ['overall', 'ovr', 'rating'],
  attack: ['attack', 'attacco', 'atk', 'offense', 'off'],
  midfield: ['midfield', 'centrocampo', 'mid', 'midf'],
  defence: ['defence', 'defense', 'difesa', 'def', 'df'],
};

const getByKeylist = (row, cols, keys) => {
  for (const nm of keys) {
    const col = cols[normKey(nm)];
    if (col && row[col] != null) return row[col];
  }
  return null;
};

if (fs.existsSync(xlsxDir)) {
  const files = fs.readdirSync(xlsxDir).filter((f) => f.toLowerCase().endsWith('.xlsx'));

  for (const f of files) {
    const base = path.basename(f).toLowerCase();
    const full = path.join(xlsxDir, f);

    // --- historical_dataset.xlsx ---
    if (base.startsWith('historical_dataset')) {
      const wb = xlsx.readFile(full, { cellDates: true });
      const out = [];
      for (const sh of wb.SheetNames) {
        const raw = xlsx.utils.sheet_to_json(wb.Sheets[sh], { defval: null });
        if (!raw.length) continue;
        const cols = buildColIndex(raw[0]);

        for (const r of raw) {
          const league = getByKeylist(r, cols, KEYMAP_COMMON.league);
          const md = getByKeylist(r, cols, KEYMAP_COMMON.matchday);
          const date = parseDateDDMMYYYY(getByKeylist(r, cols, KEYMAP_COMMON.date));
          const home = getByKeylist(r, cols, KEYMAP_COMMON.home);
          const away = getByKeylist(r, cols, KEYMAP_COMMON.away);
          const fthg = getByKeylist(r, cols, KEYMAP_COMMON.fthg);
          const ftag = getByKeylist(r, cols, KEYMAP_COMMON.ftag);

          const row = {
            id: `${league}_${md}_${home}_${away}`,
            league: league ?? null,
            matchday: md != null ? Number(md) : null,
            date,
            home: home ?? null,
            away: away ?? null
          };
          const h = getByKeylist(r, cols, KEYMAP_COMMON.B365H);
          const d = getByKeylist(r, cols, KEYMAP_COMMON.B365D);
          const a = getByKeylist(r, cols, KEYMAP_COMMON.B365A);
          if (h != null) row.B365H = Number(h);
          if (d != null) row.B365D = Number(d);
          if (a != null) row.B365A = Number(a);
          if (fthg != null) row.fthg = Number(fthg);
          if (ftag != null) row.ftag = Number(ftag);

          out.push(row);
        }
      }
      saveJSON('historical_dataset.json', out);
      continue;
    }

    // --- next_match.xlsx ---
    if (base.startsWith('next_match')) {
      const wb = xlsx.readFile(full, { cellDates: true });
      const out = [];
      for (const sh of wb.SheetNames) {
        const raw = xlsx.utils.sheet_to_json(wb.Sheets[sh], { defval: null });
        if (!raw.length) continue;
        const cols = buildColIndex(raw[0]);

        for (const r of raw) {
          const league = getByKeylist(r, cols, KEYMAP_COMMON.league);
          const md = getByKeylist(r, cols, KEYMAP_COMMON.matchday);
          const date = parseDateDDMMYYYY(getByKeylist(r, cols, KEYMAP_COMMON.date));
          const home = getByKeylist(r, cols, KEYMAP_COMMON.home);
          const away = getByKeylist(r, cols, KEYMAP_COMMON.away);

          out.push({
            id: `${league}_${md}_${home}_${away}`,
            league: league ?? null,
            matchday: md != null ? Number(md) : null,
            date,
            home: home ?? null,
            away: away ?? null
          });
        }
      }
      saveJSON('next_match.json', out);
      continue;
    }

    // --- team_logo.xlsx ---
    if (base.startsWith('team_logo')) {
      const wb = xlsx.readFile(full, { cellDates: true });
      const out = [];
      for (const sh of wb.SheetNames) {
        const raw = xlsx.utils.sheet_to_json(wb.Sheets[sh], { defval: null });
        if (!raw.length) continue;
        const cols = buildColIndex(raw[0]);

        for (const r of raw) {
          let team = pickByHeaders(r, cols, BEST_TEAM_HEADERS);
          let url = pickByHeaders(r, cols, BEST_URL_HEADERS);
          if (!team) team = guessTeam(r);
          if (!url) url = guessUrl(r);
          if (team && url) out.push({ team: String(team).trim(), url: String(url).trim() });
        }
      }
      saveJSON('team_logo.json', out);
      continue;
    }

    // --- team_stats.xlsx ---
    if (base.startsWith('team_stats')) {
      const wb = xlsx.readFile(full, { cellDates: true });
      const out = [];
      for (const sh of wb.SheetNames) {
        const raw = xlsx.utils.sheet_to_json(wb.Sheets[sh], { defval: null });
        if (!raw.length) continue;
        const cols = buildColIndex(raw[0]);

        for (const r of raw) {
          let team = pickByHeaders(r, cols, BEST_TEAM_HEADERS) || guessTeam(r);
          if (!team) continue;
          const overall = Number(getByKeylist(r, cols, KEYMAP_STATS.overall)) || 0;
          const attack = Number(getByKeylist(r, cols, KEYMAP_STATS.attack)) || 0;
          const midfield = Number(getByKeylist(r, cols, KEYMAP_STATS.midfield)) || 0;
          const defence = Number(getByKeylist(r, cols, KEYMAP_STATS.defence)) || 0;
          out.push({ team: String(team).trim(), overall, attack, midfield, defence });
        }
      }
      saveJSON('team_stats.json', out);
      continue;
    }

    console.log('Ignoro file XLSX:', f);
  }
} else {
  console.log('Nessuna cartella data/xlsx: salta conversione.');
}

// alias.json placeholder se assente
const aliasPath = path.join(dataDir, 'alias.json');
if (!fs.existsSync(aliasPath)) fs.writeFileSync(aliasPath, '{}');
