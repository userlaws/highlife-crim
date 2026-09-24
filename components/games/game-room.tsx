'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { dataSpeedPresets, gameCatalog, GameId } from '@/lib/games';
import { CodeMatch } from './code-match';
import { DataCrack } from './data-crack';
import { VaultDrill } from './vault-drill';
import { VoltLab } from './volt-lab';
import { useGameKeys } from './use-game-input';
import { SubmitScore } from './submit-score';

type Phase='ready'|'running'|'success'|'failure';
export function GameRoom({game}: {game:GameId}) {
  const config=gameCatalog[game];
  const [phase,setPhase]=useState<Phase>('ready');
  const phaseRef=useRef<Phase>('ready');
  const [duration,setDuration]=useState<number>(config.limit);
  const [difficulty,setDifficulty]=useState(5);
  const [remaining,setRemaining]=useState<number>(config.limit);
  const [round,setRound]=useState(0);
  const [message,setMessage]=useState('');
  const [resultTime,setResultTime]=useState(0);
  const [best,setBest]=useState<number|null>(null);
  const deadline=useRef(0);
  const started=useRef(0);
  const storageKey=`how-to-crim-best-v2-${game}-${duration}-${game==='data'?difficulty:'standard'}`;
  useEffect(()=>{
    try {const value=Number(localStorage.getItem(storageKey));setBest(Number.isFinite(value)&&value>0?value:null);} catch {setBest(null);}
  },[storageKey]);
  const finish=useCallback((success:boolean,reason:string)=>{
    if(phaseRef.current!=='running') return;
    const now=performance.now();
    if(now>=deadline.current){success=false;reason='Time expired. Try another run.';}
    phaseRef.current=success?'success':'failure';setPhase(phaseRef.current);
    const elapsed=(now-started.current)/1000;
    setResultTime(elapsed);setRemaining(Math.max(0,(deadline.current-now)/1000));setMessage(reason);
    if(success) {
      setBest(old=>old===null?elapsed:Math.min(old,elapsed));
      try {const old=Number(localStorage.getItem(storageKey));if(!Number.isFinite(old)||old<=0||elapsed<old)localStorage.setItem(storageKey,String(elapsed));}catch{}
    }
  },[storageKey]);
  useEffect(()=>{
    if(phase!=='running')return;
    function tick(){const left=Math.max(0,(deadline.current-performance.now())/1000);setRemaining(left);if(left<=0)finish(false,'Time expired. Try another run.');}
    const timer=setInterval(tick,100);document.addEventListener('visibilitychange',tick);
    return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',tick);};
  },[phase,finish]);
  function start(){started.current=performance.now();deadline.current=started.current+duration*1000;phaseRef.current='running';setRemaining(duration);setMessage('');setRound(old=>old+1);setPhase('running');}
  function penalty(seconds:number){if(phaseRef.current!=='running')return;deadline.current-=seconds*1000;if(deadline.current<=performance.now())finish(false,'Wrong confirmation used the remaining time.');}
  const active=phase==='running';
  useGameKeys(active,()=>finish(false,'Hack aborted.'),['escape','backspace']);
  const props={active,remaining,duration,onFinish:finish};
  return <div className="page-shell game-page"><ThemeToggle/><main className="game-content"><Link prefetch href="/" className="game-brand">How to <span>Crim</span></Link><div className="game-heading"><div><Link prefetch className="back-link" href="/#practice">← Back to games</Link><h1>{config.title}</h1><p>{config.description}</p></div><div className="run-clock" aria-label={`${remaining.toFixed(1)} seconds remaining`}><span>{active?'TIME LEFT':'TIME LIMIT'}</span><strong className={active&&remaining<5?'time-critical':''}>{(phase==='ready'?duration:remaining).toFixed(2)}<small>s</small></strong></div></div>
    <div className="run-toolbar"><label>Time limit<select disabled={active} value={duration} onChange={e=>{setDuration(Number(e.target.value));setRemaining(Number(e.target.value));setPhase('ready');phaseRef.current='ready';}}>{[15,30,45,60,90].map(value=><option key={value} value={value}>{value} seconds</option>)}</select></label>{game==='data'&&<label>Bar speed<select disabled={active} value={difficulty} onChange={e=>{setDifficulty(Number(e.target.value));setPhase('ready');phaseRef.current='ready';}}>{dataSpeedPresets.map(value=><option key={value} value={value}>{value}{value===5?' - Default':''}</option>)}</select></label>}<span className="personal-best">Your best <strong>{best===null?'—':`${best.toFixed(2)}s`}</strong><small>On this device · current settings</small></span></div>
    {phase==='ready'?<section className="ready-panel"><span className="game-eyebrow">{game==='code'?'KEYPAD OVERRIDE':game==='data'?'SIGNAL ALIGNMENT':game==='drill'?'VAULT ACCESS':'VOLTAGE REGULATOR'}</span><h2>Ready when you are.</h2><p>{config.instructions}</p><Button size="lg" onClick={start}>Start game</Button><small>The timer starts when you press Start game.</small></section>:<section className="game-stage" aria-label={`${config.title} game`} key={`${game}-${round}`}>{game==='code'?<CodeMatch {...props} onPenalty={penalty}/>:game==='data'?<DataCrack {...props} difficulty={difficulty}/>:game==='drill'?<VaultDrill {...props}/>:<VoltLab {...props}/>}</section>}
    {phase==='success'||phase==='failure'?<section className={`run-result ${phase}`} role="status"><div><h2>{phase==='success'?'Complete':'Try again'}</h2><p>{message}</p><span>{resultTime.toFixed(2)}s elapsed</span>{phase==='success'&&<SubmitScore game={game} seconds={resultTime} key={round}/>}</div><Button onClick={start}>Play again</Button></section>:active?<div className="run-actions"><span>The timer keeps running if you switch tabs.</span><Button variant="outline" onClick={()=>finish(false,'Run ended. Start again when you are ready.')}>End run</Button></div>:null}
    <details className="game-instructions" open={phase==='ready'}><summary>How to play</summary><p>{config.instructions}</p>{game==='volt'&&<p>For example: 6 × 50 + 6 × 10 + 5 × 1 = 365. Use the changing result to work out which socket has each multiplier before committing.</p>}<p className="trainer-note">Browser recreation based on <a href={config.source} target="_blank" rel="noreferrer">{config.sourceName} ↗</a>. {game==='code'?'15 seconds follows the supplied video reference.':'30 seconds is a trainer preset.'} Exact Highlife server settings may differ.</p></details>
  </main></div>;
}
