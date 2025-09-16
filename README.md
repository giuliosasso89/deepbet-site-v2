# DeepBet · Pronostici Top 5

Sito moderno (Next.js App Router) per pronostici calcio con modello Poisson, rating Elo, standings e statistiche.

## Requisiti
- Node.js >= 18
- I dati si trovano nella cartella `/data`. Gli .xlsx vengono convertiti automaticamente in .json alla build tramite `scripts/convert_xlsx_to_json.mjs`.

## Avvio (Fase 1 · Localhost)
```bash
npm install
npm run dev
```

## Build & Deploy (Fase 2)
```bash
npm run build
# deploy su Vercel/Netlify/AWS seguendo la guida della piattaforma
```

## Struttura dati
- `data/historical_dataset.json`
- `data/next_match.json`
- `data/team_logo.json`
- `data/team_stats.json`
- `data/standings/standings_{LEAGUE}_{SEASON}_{YYYYMMDD}.json`
- `data/alias.json`

## API
Vedi cartella `src/app/api/*` per gli endpoint richiesti.
