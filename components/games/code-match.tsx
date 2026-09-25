'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { codeGrid, createCodePuzzle, moveCodeCursor } from '@/lib/games';
import { GameProps, useGameKeys } from './use-game-input';

export function CodeMatch({active, clock, duration, onFinish, onPenalty}:GameProps & {onPenalty:(seconds:number)=>void}) {
  const [puzzle] = useState(createCodePuzzle);
  const [cells, setCells] = useState(() => codeGrid(puzzle));
  const [positions, setPositions] = useState([-18, -7]);
  const [locked, setLocked] = useState([false,false]);
  const [selected, setSelected] = useState(0);
  const [message, setMessage] = useState('Find the two constant code blocks.');
  const mistakes = useRef(0);
  const locks = useRef(locked);
  useEffect(() => { if (!active) return; const timer = setInterval(() => setCells(codeGrid(puzzle)), 200); return () => clearInterval(timer); }, [active, puzzle]);
  function move(side:number, dx:number, dy:number) {
    if (!active || locks.current[side]) return;
    setPositions(old => old.map((p,i) => i === side ? moveCodeCursor(p,dx,dy) : p));
  }
  function confirm(side:number) {
    if (!active || locks.current[side]) return;
    if (positions[side] === puzzle.starts[side]) {
      const next = locks.current.map((v,i) => v || i === side);
      locks.current = next; setLocked(next);
      setSelected(side === 0 ? 1 : 0);
      setMessage(`${side === 0 ? 'Left' : 'Right'} block confirmed.`);
      if (next.every(Boolean)) onFinish(true, 'Both code blocks matched. Keypad overridden.');
    } else {
      mistakes.current++;
      const penalty = mistakes.current * 5;
      setMessage(`Wrong block. ${penalty} seconds ${duration ? 'deducted' : 'added'}.`);
      onPenalty(penalty);
    }
  }
  useGameKeys(active, (key, repeat) => {
    if (key === ' ' || key === 'enter') { if (!repeat) confirm(key === ' ' ? 0 : 1); return; }
    const directions:Record<string,[number,number,number]> = {w:[0,0,-1],a:[0,-1,0],s:[0,0,1],d:[0,1,0],arrowup:[1,0,-1],arrowleft:[1,-1,0],arrowdown:[1,0,1],arrowright:[1,1,0]};
    const [side,dx,dy] = directions[key]; move(side,dx,dy);
  }, ['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','enter']);
  return <div className="code-game">
    <div className="phone-frame"><div className="phone-speaker"/><div className="code-screen">
      <div className="code-header">{Array.from({length:18},(_,i)=>{
        const index=i-18;
        const left=index>=positions[0]&&index<positions[0]+7;
        const right=index>=positions[1]&&index<positions[1]+7;
        return <span key={i} className={right?'header-right':left?'header-left':''}>{right?puzzle.targets[1][index-positions[1]]:left?puzzle.targets[0][index-positions[0]]:'\u00a0'}</span>;
      })}<time>{clock.toFixed(2)}s</time></div>
      <div className="code-board" role="group" aria-label="Hexadecimal code grid">
        {cells.map((char,index) => {
          const left = index >= positions[0] && index < positions[0]+7;
          const right = index >= positions[1] && index < positions[1]+7;
          const display=right?puzzle.targets[1][index-positions[1]]:left?puzzle.targets[0][index-positions[0]]:char;
          return <button key={index} tabIndex={-1} aria-label={`Row ${Math.floor(index/18)+1}, column ${index%18+1}: ${display}`} className={`${left ? 'cursor-left' : ''} ${right ? 'cursor-right' : ''} ${(left && locked[0]) || (right && locked[1]) ? 'code-locked' : ''}`} onClick={() => { if (active && !locks.current[selected]) setPositions(old => old.map((p,i) => i === selected ? Math.floor(index/18)*18+Math.min(index%18,11) : p)); }}>{display}</button>;
        })}
      </div>
    </div></div>
    <p className="game-feedback" role="status">{message}</p>
    <div className="code-touch"><div className="control-row"><Button variant={selected === 0 ? 'default' : 'outline'} disabled={locked[0] || !active} onClick={() => setSelected(0)}>Left {locked[0] ? '✓' : '· WASD'}</Button><Button variant={selected === 1 ? 'default' : 'outline'} disabled={locked[1] || !active} onClick={() => setSelected(1)}>Right {locked[1] ? '✓' : '· arrows'}</Button></div><p>Tap a cell to position the selected block.</p><div className="control-row"><Button variant="outline" disabled={!active} aria-label="Move block left" onClick={() => move(selected,-1,0)}>←</Button><Button variant="outline" disabled={!active} aria-label="Move block up" onClick={() => move(selected,0,-1)}>↑</Button><Button variant="outline" disabled={!active} aria-label="Move block down" onClick={() => move(selected,0,1)}>↓</Button><Button variant="outline" disabled={!active} aria-label="Move block right" onClick={() => move(selected,1,0)}>→</Button><Button disabled={!active || locked[selected]} onClick={() => confirm(selected)}>Confirm block</Button></div></div>
  </div>;
}
