// src/lib/poisson.ts

export type PoissonOutput = {
  probs: { home: number; draw: number; away: number };
  results: { score: string; p: number }[];
  heatmap: number[][]; // 0–5 gol per squadra
  under_over: {
    u15: number; u25: number; u35: number;
    o15: number; o25: number; o35: number;
  };
};

function poissonRow(lambda: number, kmax: number): number[] {
  const arr = new Array<number>(kmax + 1).fill(0);
  const p0 = Math.exp(-lambda);
  arr[0] = p0;
  for (let k = 1; k <= kmax; k++) {
    arr[k] = arr[k - 1] * (lambda / k);
  }
  return arr;
}

export function poissonPredict(lambdaH: number, lambdaA: number): PoissonOutput {
  // limiti e stabilità numerica
  const lamH = Math.max(0.01, Math.min(lambdaH, 6));
  const lamA = Math.max(0.01, Math.min(lambdaA, 6));

  // per heatmap usiamo 0–5; per somme (1/X/2, U/O) spingiamo un po’ di più
  const K_HEAT = 5;
  const K_JOINT = 12;

  const pH_heat = poissonRow(lamH, K_HEAT);
  const pA_heat = poissonRow(lamA, K_HEAT);
  const pH = poissonRow(lamH, K_JOINT);
  const pA = poissonRow(lamA, K_JOINT);

  // matrice 0–5 per heatmap
  const heatmap: number[][] = [];
  for (let i = 0; i <= K_HEAT; i++) {
    const row: number[] = [];
    for (let j = 0; j <= K_HEAT; j++) {
      row.push(pH_heat[i] * pA_heat[j]);
    }
    heatmap.push(row);
  }

  // Probabilità 1 / X / 2 (sommando su 0..K_JOINT)
  let ph = 0, pd = 0, pa = 0;
  for (let i = 0; i <= K_JOINT; i++) {
    for (let j = 0; j <= K_JOINT; j++) {
      const pij = pH[i] * pA[j];
      if (i > j) ph += pij;
      else if (i === j) pd += pij;
      else pa += pij;
    }
  }

  // Under/Over (totale gol) con soglie 1.5/2.5/3.5
  let u15 = 0, u25 = 0, u35 = 0, o15 = 0, o25 = 0, o35 = 0;
  for (let i = 0; i <= K_JOINT; i++) {
    for (let j = 0; j <= K_JOINT; j++) {
      const s = i + j;
      const pij = pH[i] * pA[j];
      if (s <= 1) u15 += pij; else o15 += pij;
      if (s <= 2) u25 += pij; else o25 += pij;
      if (s <= 3) u35 += pij; else o35 += pij;
    }
  }

  // Top 3 risultati esatti (0–5 per squadra)
  const exact: { score: string; p: number }[] = [];
  for (let i = 0; i <= K_HEAT; i++) {
    for (let j = 0; j <= K_HEAT; j++) {
      exact.push({ score: `${i}-${j}`, p: pH_heat[i] * pA_heat[j] });
    }
  }
  exact.sort((a, b) => b.p - a.p);
  const results = exact.slice(0, 3);

  return {
    probs: { home: ph, draw: pd, away: pa },
    results,
    heatmap,
    under_over: { u15, u25, u35, o15, o25, o35 },
  };
}
