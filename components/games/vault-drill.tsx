'use client';
import { memo, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { initialDrill, stepDrill } from '@/lib/games';
import { GameProps, useGameFrame } from './use-game-input';

export const VaultDrill = memo(function VaultDrill({active,onFinish}:GameProps) {
  const [drill,setDrill]=useState(initialDrill);
  const state=useRef(drill);
  const keys=useRef(new Set<string>());
  const taps=useRef({pressure:0,throttle:0});
  const renderedAt=useRef(0);
  function press(key:string) {
    if(keys.current.has(key))return;
    keys.current.add(key);
    if(['w','arrowup'].includes(key))taps.current.pressure++;
    if(['s','arrowdown'].includes(key))taps.current.pressure--;
    if(['d','arrowright'].includes(key))taps.current.throttle++;
    if(['a','arrowleft'].includes(key))taps.current.throttle--;
  }
  useEffect(()=>{
    if(!active) {keys.current.clear();return;}
    const controls=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'];
    function down(e:KeyboardEvent){const key=e.key.toLowerCase();if(controls.includes(key)&&!e.ctrlKey&&!e.metaKey){e.preventDefault();press(key);}}
    function up(e:KeyboardEvent){keys.current.delete(e.key.toLowerCase());}
    function clear(){keys.current.clear();taps.current={pressure:0,throttle:0};}
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);
    return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);clear();};
  },[active]);
  useGameFrame(active,(dt,seconds)=>{
    const pressed=(a:string,b:string)=>keys.current.has(a)||keys.current.has(b);
    const pressure=Number(pressed('w','arrowup'))-Number(pressed('s','arrowdown'));
    const throttle=Number(pressed('d','arrowright'))-Number(pressed('a','arrowleft'));
    state.current=stepDrill(state.current,pressure,throttle,dt,taps.current);taps.current={pressure:0,throttle:0};
    if(seconds-renderedAt.current>=.05||state.current.heat>=1||state.current.position>=1){setDrill(state.current);renderedAt.current=seconds;}
    if(state.current.heat>=1) onFinish(false,'Drill overheated. Release pressure to cool before pushing again.');
    else if(state.current.position>=1) onFinish(true,'All pins breached. Vault unlocked.');
  });
  const pins=[0.25,0.5,0.75,1];
  function holdButton(label:string,key:string) {
    return <Button variant="outline" disabled={!active} className="hold-control" onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);press(key);}} onPointerUp={()=>keys.current.delete(key)} onPointerCancel={()=>keys.current.delete(key)} onLostPointerCapture={()=>keys.current.delete(key)} onKeyDown={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();press(key);}}} onKeyUp={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();keys.current.delete(key);}}} onBlur={()=>keys.current.delete(key)}>{label}</Button>;
  }
  return <div><div className={`drilling-game ${drill.heat>0.8?'drill-hot':''}`}><div className="drill-cutaway"><div className="lock-housing"><div className="drill-channel"/>{pins.map((depth,i)=><div key={i} className={`lock-pin ${drill.depth>=depth?'pin-broken':''}`} style={{bottom:`${12+depth*72}%`}}><span className="pin-spring"/><span className="pin-shaft"/><span className="pin-head"/></div>)}<div className="working-drill" style={{height:`${12+drill.position*76}%`,animationDuration:`${Math.max(0.05,0.8-drill.speed*0.75)}s`,animationPlayState:drill.speed>0.01?'running':'paused'}}/><div className="drill-motor">DRILL</div></div></div><div className="drill-instruments"><span className="instrument-label">VAULT ACCESS</span><strong>{Math.round(drill.depth*100)}<small>%</small></strong><p>{pins.filter(p=>drill.depth>=p).length} / 4 pins breached</p><label>Rotation <span>{Math.round(drill.speed*100)}%</span><meter min={0} max={1} value={drill.speed}/></label><label>Heat <span>{Math.round(drill.heat*100)}%</span><meter className="heat-meter" min={0} max={1} value={drill.heat} high={0.8} optimum={0.2}/></label><p className="heat-advice">{drill.heat>0.75?'Release pressure. Let the bit cool.':drill.speed<=0.1?'Increase speed, then gently push.':'Short pushes. Watch the temperature.'}</p></div></div><div className="drill-controls"><div><span>PRESSURE · CLICK OR HOLD</span><div className="control-row">{holdButton('↓ Withdraw','s')}{holdButton('↑ Push','w')}</div></div><div><span>ROTATION · CLICK OR HOLD</span><div className="control-row">{holdButton('− Slower','a')}{holdButton('+ Faster','d')}</div></div></div><p className="drill-pointer-tip">Mouse and touch work here. WASD or arrow keys also work.</p></div>;
},(before,after)=>before.active===after.active&&before.onFinish===after.onFinish);
