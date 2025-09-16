import { NextResponse } from 'next/server';
export async function GET(){ return NextResponse.json([
  {code:'I1', name:'Serie A'},{code:'E0', name:'Premier League'},{code:'SP1', name:'Liga'},{code:'D1', name:'Bundesliga'},{code:'F1', name:'Ligue 1'}
]); }
