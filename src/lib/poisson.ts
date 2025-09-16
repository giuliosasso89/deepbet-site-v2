export type PoissonOutput = {
  probs: {home:number, draw:number, away:number},
  results: {score:string, p:number}[],
  heatmap: number[][],
  under_over: {u15:number,u25:number,u35:number,o15:number,o25:number,o35:number},
};
function factorial(n:number){ return n<=1?1:n*factorial(n-1); }
function poisson(k:number, lambda:number){ return Math.exp(-lambda)*Math.pow(lambda,k)/factorial(k); }
export function poissonPredict(lambdaH:number, lambdaA:number): PoissonOutput{
  const max=5; const matrix:number[][]=[];
  let pHome=0, pAway=0, pDraw=0; const results: {score:string,p:number}[]=[];
  let pU15=0,pU25=0,pU35=0,pO15=0,pO25=0,pO35=0;
  for(let h=0; h<=max; h++){
    const ph = poisson(h, lambdaH); const row:number[]=[];
    for(let a=0; a<=max; a++){
      const pa = poisson(a, lambdaA); const p = ph*pa; row.push(p);
      if(h>a) pHome+=p; else if(h<a) pAway+=p; else pDraw+=p;
      const sum=h+a; if(sum<=1) pU15+=p; else pO15+=p; if(sum<=2) pU25+=p; else pO25+=p; if(sum<=3) pU35+=p; else pO35+=p;
      results.push({score:`${h}-${a}`, p});
    } matrix.push(row);
  } results.sort((x,y)=>y.p-x.p);
  return { probs:{home:pHome,draw:pDraw,away:pAway}, results, heatmap:matrix, under_over:{u15:pU15,u25:pU25,u35:pU35,o15:pO15,o25:pO25,o35:pO35} };
}
