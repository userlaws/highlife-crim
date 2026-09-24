'use client';
import { memo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { dataBarMatches, dataBarPosition } from '@/lib/games';
import { GameProps, useGameFrame, useGameKeys } from './use-game-input';

export const DataCrack = memo(function DataCrack({active, onFinish, difficulty}:GameProps & {difficulty:number}) {
  const [locked, setLocked] = useState(0);
  const count = useRef(0);
  const time = useRef(0);
  const bars = useRef<(HTMLSpanElement|null)[]>([]);
  const [message, setMessage] = useState('Click when the yellow column’s gap reaches the red line.');
  useGameFrame(active, (_, elapsed) => {
    time.current = elapsed;
    bars.current.forEach((bar,i) => {
      if(bar) bar.style.transform=`translate3d(0,${(i<count.current?0.572:dataBarPosition(elapsed,i,difficulty))*100}%,0)`;
    });
  });
  function lock() {
    if (!active || count.current === 7) return;
    if (dataBarMatches(dataBarPosition(time.current, count.current, difficulty))) {
      count.current++; setLocked(count.current);
      bars.current[count.current-1]?.style.setProperty('transform','translate3d(0,57.2%,0)');
      setMessage(`Column ${count.current} locked. ${7-count.current} remaining.`);
      if (count.current === 7) onFinish(true,'All seven bars aligned. Data cracked.');
    } else {
      if (count.current === 0) {
        setMessage('First bar missed. Run failed.');
        onFinish(false, 'First bar missed. Run failed.');
        return;
      }
      count.current = Math.max(0,count.current-1); setLocked(count.current);
      setMessage('Missed the center. Previous column released.');
    }
  }
  useGameKeys(active, (_, repeat) => { if (!repeat) lock(); }, [' ','enter']);
  return <div>
    <div className="data-pc">
      <div className="pc-shortcut computer-shortcut" aria-hidden="true"><i className="pc-drive"/>My<br/>Computer</div>
      <button className="pc-shortcut power-shortcut" disabled={!active} onClick={()=>onFinish(false,'Hack aborted.')} aria-label="Power off and abort hack"><i>⏻</i>Power Off</button>
      <div className="data-window"><div className="data-titlebar"><span>▣ Data Crack</span><span>− ×</span></div><div className="data-desktop"><div className="data-grid"/><div className="data-logo"><h2>DATA CRACK</h2><p>SELLING YOUR SECRETS SINCE 1996</p></div></div></div>
      <button className="data-field" disabled={!active} onClick={lock} aria-label="Lock active bar on center line"><span className="data-center"/></button>
      <div className="data-columns" aria-hidden="true">{Array.from({length:7},(_,i)=><span key={i} ref={node=>{bars.current[i]=node;}} className={`crack-column ${i===locked?'bar-active':''}`} style={{left:`${35+i*5}%`,transform:'translate3d(0,74.4%,0)'}}><span className="split-bar"><i/><i/></span></span>)}</div>
    </div>
    <p className="game-feedback" role="status">{message}</p><div className="control-row"><span>{locked} / 7 locked</span><Button disabled={!active} onClick={lock}>Lock bar</Button></div>
  </div>;
},(before,after)=>before.active===after.active&&before.onFinish===after.onFinish&&before.difficulty===after.difficulty);
