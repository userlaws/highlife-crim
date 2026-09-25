'use client';
import { useEffect, useRef } from 'react';

export function useGameKeys(active:boolean, handler:(key:string, repeated:boolean) => void, keys:string[]) {
  const latest = useRef(handler);
  latest.current = handler;
  const keyList = keys.join('|');
  useEffect(() => {
    if (!active) return;
    const allowed = keyList.split('|');
    function onKey(event:KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.target instanceof HTMLElement && ['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName)) return;
      const key = event.key.toLowerCase();
      if (allowed.includes(key)) { event.preventDefault(); latest.current(key, event.repeat); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, keyList]);
}

export function useGameFrame(active:boolean, frame:(dt:number, seconds:number) => void) {
  const callback = useRef(frame);
  callback.current = frame;
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    let last = start;
    let handle = 0;
    function tick(now:number) {
      callback.current(Math.min((now-last)/1000, 0.05), (now-start)/1000);
      last = now;
      handle = requestAnimationFrame(tick);
    }
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [active]);
}

// clock is the run clock: seconds left, or seconds elapsed when duration is 0 (no limit).
// Graded games pass a score to onFinish instead of being ranked by time.
export type GameProps = {active:boolean; clock:number; duration:number; onFinish:(success:boolean, message:string, score?:number) => void};
