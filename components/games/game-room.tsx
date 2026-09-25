'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { dataSpeedDefault, dataSpeedPresets, gameCatalog, GameId, timeLimitPresets } from '@/lib/games';
import { nameKey } from '@/lib/leaderboard';
import { CodeMatch } from './code-match';
import { DataCrack } from './data-crack';
import { MethCook } from './meth-cook';
import { VaultDrill } from './vault-drill';
import { VoltLab } from './volt-lab';
import { useGameKeys } from './use-game-input';
import { SubmitScore } from './submit-score';

type Phase='ready'|'running'|'success'|'failure';
const eyebrows:Record<GameId,string>={code:'KEYPAD OVERRIDE',data:'SIGNAL ALIGNMENT',drill:'VAULT ACCESS',volt:'VOLTAGE REGULATOR',meth:'MOBILE LAB'};
const limitName=(value:number)=>value?`${value} seconds`:'No limit';
export function GameRoom({game}: {game:GameId}) {
  const config=gameCatalog[game];
  // Meth is scored on purity, not speed: its best is the highest on-target percentage.
  const graded=game==='meth';
  const [phase,setPhase]=useState<Phase>('ready');
  const phaseRef=useRef<Phase>('ready');
  const [duration,setDuration]=useState<number>(config.limit);
  const [difficulty,setDifficulty]=useState<number>(dataSpeedDefault);
  const [clock,setClock]=useState<number>(config.limit);
  const [round,setRound]=useState(0);
  const [message,setMessage]=useState('');
  const [resultTime,setResultTime]=useState(0);
  const [resultScore,setResultScore]=useState(0);
  const [best,setBest]=useState<number|null>(null);
  const [player,setPlayer]=useState('');
  const deadline=useRef(0);
  const started=useRef(0);
  const timed=duration>0;
  const storageKey=`how-to-crim-best-v2-${game}-${duration}-${game==='data'?difficulty:'standard'}`;
  useEffect(()=>{
    try {const value=Number(localStorage.getItem(storageKey));setBest(Number.isFinite(value)&&value>0?value:null);} catch {setBest(null);}
  },[storageKey]);
  useEffect(()=>{try{setPlayer(localStorage.getItem(nameKey)??'');}catch{}},[]);
  const finish=useCallback((success:boolean,reason:string,score?:number)=>{
    if(phaseRef.current!=='running') return;
    const now=performance.now();
    if(now>=deadline.current){success=false;reason='Time expired. Try another run.';}
    phaseRef.current=success?'success':'failure';setPhase(phaseRef.current);
    const elapsed=(now-started.current)/1000;
    setResultTime(elapsed);setClock(Number.isFinite(deadline.current)?Math.max(0,(deadline.current-now)/1000):elapsed);setMessage(reason);
    const value=graded?score??0:elapsed;
    setResultScore(value);
    const better=(old:number)=>graded?value>old:value<old;
    if(success&&value>0) {
      setBest(old=>old===null||better(old)?value:old);
      try {const old=Number(localStorage.getItem(storageKey));if(!Number.isFinite(old)||old<=0||better(old))localStorage.setItem(storageKey,String(value));}catch{}
    }
  },[storageKey,graded]);
  useEffect(()=>{
    if(phase!=='running')return;
    function tick(){
      const now=performance.now();
      if(!Number.isFinite(deadline.current)){setClock((now-started.current)/1000);return;}
      const left=Math.max(0,(deadline.current-now)/1000);setClock(left);if(left<=0)finish(false,'Time expired. Try another run.');
    }
    const timer=setInterval(tick,100);document.addEventListener('visibilitychange',tick);
    return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',tick);};
  },[phase,finish]);
  function start(){started.current=performance.now();deadline.current=timed?started.current+duration*1000:Infinity;phaseRef.current='running';setClock(timed?duration:0);setMessage('');setRound(old=>old+1);setPhase('running');}
  // With a limit a penalty eats the remaining time; without one it is added to the run's time.
  function penalty(seconds:number){if(phaseRef.current!=='running')return;if(!timed){started.current-=seconds*1000;return;}deadline.current-=seconds*1000;if(deadline.current<=performance.now())finish(false,'Wrong confirmation used the remaining time.');}
  const active=phase==='running';
  useGameKeys(active,()=>finish(false,'Hack aborted.'),['escape','backspace']);
  const props={active,clock,duration,onFinish:finish};
  const bestText=best===null?'—':graded?`${Math.round(best)}%`:`${best.toFixed(2)}s`;
  const finished=phase==='success'||phase==='failure';
  return <div className="page-shell game-page"><ThemeToggle/><main className="game-content"><Link prefetch href="/" className="game-brand">How to <span>Crim</span></Link><div className="game-heading"><div><Link prefetch className="back-link" href="/#practice">← Back to games</Link><h1>{config.title}</h1><p>{config.description}</p></div><div className="run-clock" aria-label={timed?`${clock.toFixed(1)} seconds remaining`:`${clock.toFixed(1)} seconds elapsed`}><span>{timed?(active?'TIME LEFT':'TIME LIMIT'):(phase==='ready'?'TIME LIMIT':'ELAPSED')}</span><strong className={active&&timed&&clock<5?'time-critical':''}>{phase==='ready'&&!timed?<>None</>:<>{clock.toFixed(2)}<small>s</small></>}</strong></div></div>
    <div className="run-toolbar">{!graded&&<label>Time limit<select disabled={active} value={duration} onChange={e=>{setDuration(Number(e.target.value));setClock(Number(e.target.value));setPhase('ready');phaseRef.current='ready';}}>{timeLimitPresets.map(value=><option key={value} value={value}>{limitName(value)}{value===config.limit&&'limitLabel' in config?` - ${config.limitLabel}`:''}</option>)}</select></label>}{game==='data'&&<label>Bar speed<select disabled={active} value={difficulty} onChange={e=>{setDifficulty(Number(e.target.value));setPhase('ready');phaseRef.current='ready';}}>{dataSpeedPresets.map(value=><option key={value} value={value}>{value}{value===dataSpeedDefault?' - Default':''}</option>)}</select></label>}{graded&&<span className="toolbar-note">Cook length 135–145 s · no time limit</span>}<span className="personal-best">{graded?'Best purity':'Your best'} <strong>{bestText}</strong><small>On this device{graded?'':' · current settings'}</small></span></div>
    {phase==='success'&&<section className="win-banner" role="status" aria-label="Winning run"><span className="win-eyebrow">✓ {graded?'Batch complete':'Cleared'}</span><strong className={`win-player ${player.trim()?'':'win-player-empty'}`}>{player.trim()||'Your name here'}</strong><span className="win-detail">{config.title} · {graded?`${Math.round(resultScore)}% on target`:`${resultTime.toFixed(2)}s · ${limitName(duration)}${game==='data'?` · speed ${difficulty}`:''}`}</span></section>}
    {phase==='ready'?<section className="ready-panel"><span className="game-eyebrow">{eyebrows[game]}</span><h2>Ready when you are.</h2><p>{config.instructions}</p><Button size="lg" onClick={start}>Start game</Button><small>{timed?'The timer starts when you press Start game.':graded?'The cook timer starts once all three ingredients are in.':'There is no time limit. Your time starts when you press Start game.'}</small></section>:<section className="game-stage" aria-label={`${config.title} game`} key={`${game}-${round}`}>{game==='code'?<CodeMatch {...props} onPenalty={penalty}/>:game==='data'?<DataCrack {...props} difficulty={difficulty}/>:game==='drill'?<VaultDrill {...props}/>:game==='volt'?<VoltLab {...props}/>:<MethCook {...props}/>}</section>}
    {finished?<section className={`run-result ${phase}`} role="status"><div>{phase==='success'&&<SubmitScore game={game} seconds={resultTime} purity={graded?resultScore:undefined} player={player} onPlayerChange={setPlayer} key={round}/>}<h2>{phase==='success'?'Complete':'Try again'}</h2><p>{message}</p><span>{graded&&phase==='success'?`${Math.round(resultScore)}% of the cook on target`:`${resultTime.toFixed(2)}s elapsed`}</span></div><Button onClick={start}>Play again</Button></section>:active?<div className="run-actions"><span>{timed?'The timer keeps running if you switch tabs.':graded?'The cook pauses if you switch tabs.':'No time limit. Your time keeps running if you switch tabs.'}</span><Button variant="outline" onClick={()=>finish(false,'Run ended. Start again when you are ready.')}>End run</Button></div>:null}
    {graded&&<details className="game-instructions meth-facts"><summary>How meth works on Highlife</summary><p>This trainer grades you on time spent on target, like the reference. On Highlife, each cook gets a Cook Score from 0 to 125 from your cooking and your recipe. Divide it by 33 (31, 29, or 27 with Let Him Cook) and round down for trays, capped by what your recipe can make. Recipes are scrambled every month and found by trial and error. Staying on green longer makes Cloudy more likely.</p><p><Link prefetch href="/resources#meth">Full meth breakdown and tray table →</Link></p></details>}
    <details className="game-instructions" open={phase==='ready'}><summary>How to play</summary><p>{config.instructions}</p>{game==='volt'&&<p>For example: 6 × 50 + 6 × 10 + 5 × 1 = 365. Use the changing result to work out which socket has each multiplier before committing.</p>}<p className="trainer-note">Browser recreation based on <a href={config.source} target="_blank" rel="noreferrer">{config.sourceName} ↗</a>. {game==='code'?'Highlife runs DES with no time limit; the timed options are extra practice.':graded?'Timings and grade thresholds follow the reference; ingredient amounts do not change the result there either.':'30 seconds is a trainer preset.'} Exact Highlife server settings may differ.</p></details>
  </main></div>;
}
