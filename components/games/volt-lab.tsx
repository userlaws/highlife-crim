'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { clamp, createVoltPuzzle, randomInt, voltageTotal } from '@/lib/games';
import { GameProps, useGameKeys } from './use-game-input';
import { DigitalNumber } from './digital-number';

export function VoltLab({active, remaining, duration, onFinish}:GameProps) {
  const [puzzle] = useState(createVoltPuzzle);
  const [symbols] = useState(()=>{
    const items=['Φ','Θ','≋'];
    for(let i=2;i>0;i--){const j=randomInt(i+1);[items[i],items[j]]=[items[j],items[i]];}
    return items;
  });
  const [input, setInput] = useState(0);
  const [output, setOutput] = useState(-1);
  const [pending,setPending] = useState(false);
  const busy=useRef(false);
  const confirmation=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>()=>{if(confirmation.current)clearTimeout(confirmation.current);},[]);
  useEffect(()=>{if(!active&&confirmation.current){clearTimeout(confirmation.current);busy.current=false;setPending(false);}},[active]);
  const [connections, setConnections] = useState([-1,-1,-1]);
  const committed = useRef(connections);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [message, setMessage] = useState('Probe the outputs. Their symbols hide different multipliers each round.');
  const total = voltageTotal(puzzle.values,puzzle.multipliers,connections);
  const canConnect = active && !pending && output>=0 && connections[input] < 0 && !connections.includes(output);
  const preview = total + (output>=0 && connections[input] < 0 && !connections.includes(output) ? puzzle.values[input] * puzzle.multipliers[output] : 0);
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0,0,700,360);
    function wire(from:number,to:number,color:string,dashed=false) {
      if (!ctx) return;
      ctx.beginPath(); ctx.strokeStyle=color; ctx.lineWidth=3; ctx.setLineDash(dashed ? [7,7] : []);
      const bend=240+from*70;
      ctx.moveTo(114,90+from*90); ctx.lineTo(bend,90+from*90); ctx.lineTo(bend,90+to*90); ctx.lineTo(586,90+to*90); ctx.stroke();
    }
    connections.forEach((to,from) => { if(to>=0) wire(from,to,['#f4c75c','#63c5ed','#bd9cf4'][from]); });
    if (canConnect) wire(input,output,'#9ba6b5',true);
  }, [connections,input,output,canConnect]);
  function move(side:'input'|'output',direction:number) {
    if(!active||busy.current) return;
    if(side==='input') setInput(clamp(input+direction,0,2));
    else if(output>=0||direction>0) setOutput(clamp(output+direction,0,2));
  }
  function connect() {
    if(!active || busy.current || output<0 || committed.current[input]>=0 || committed.current.includes(output)) return;
    busy.current=true;setPending(true);
    const next=committed.current.map((to,i)=>i===input?output:to);
    setMessage('Connecting…');
    confirmation.current=setTimeout(()=>{
      committed.current=next;setConnections(next);
      const result=voltageTotal(puzzle.values,puzzle.multipliers,next);
      if(next.every(to=>to>=0)) {
        confirmation.current=setTimeout(()=>onFinish(result===puzzle.target,result===puzzle.target?'Voltage matched. Circuit bypassed.':`Circuit closed at ${result}; target was ${puzzle.target}.`),1000);
      } else {busy.current=false;setPending(false);setMessage(`Input ${input+1} connected. Committed result: ${result}.`);}
    },1000);
  }
  useGameKeys(active&&!pending,(key,repeat)=>{
    if(repeat)return;
    if(key==='enter'||key===' ') {if(!repeat) connect();return;}
    if(['w','s','arrowup','arrowdown'].includes(key)) move('input',key==='w'||key==='arrowup'?-1:1);
    else move('output',key==='a'||key==='arrowleft'?-1:1);
  },['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','enter',' ']);
  return <div><div className="volt-game"><div className="volt-display volt-target"><span>TARGET</span><strong><DigitalNumber value={puzzle.target} pad={3}/></strong></div>
    <div className="volt-field"><canvas ref={canvas} width={700} height={360} aria-hidden="true"/>
      {puzzle.values.map((value,i)=><button key={i} className={`volt-input ${input===i?'socket-selected':''} ${connections[i]>=0?'socket-used':''}`} style={{top:`${25+i*25}%`}} aria-label={`Input ${i+1}: ${value}${connections[i]>=0?', connected':''}`} aria-pressed={input===i} disabled={!active||pending||connections[i]>=0} onClick={()=>setInput(i)}><DigitalNumber value={value}/></button>)}
      {symbols.map((symbol,i)=><button key={i} className={`volt-output ${output===i?'socket-selected':''} ${connections.includes(i)?'socket-used':''}`} style={{top:`${25+i*25}%`}} aria-label={`Output ${i+1}${connections.includes(i)?', connected':''}`} aria-pressed={output===i} disabled={!active||pending||connections.includes(i)} onClick={()=>setOutput(i)}>{symbol}</button>)}
    </div><div className="volt-bottom"><div className="battery" aria-label={`${Math.ceil(remaining/duration*6)} timer segments remaining`}>{Array.from({length:6},(_,i)=><i key={i} className={i<Math.ceil(remaining/duration*6)?'charged':''}/>)}</div><div className={`volt-display volt-result ${preview===puzzle.target?'voltage-matched':''}`}><strong><DigitalNumber value={preview} pad={3}/></strong><span>RESULT · {canConnect?'PREVIEW':'CONNECTED'}</span></div><span className="volt-committed">{connections.filter(to=>to>=0).length} / 3 wired</span></div>
    </div><p className="game-feedback" role="status">{message}</p><div className="control-row"><span>Preview → compare → commit</span><Button disabled={!canConnect} onClick={connect}>Connect <kbd>Enter</kbd></Button></div></div>;
}
