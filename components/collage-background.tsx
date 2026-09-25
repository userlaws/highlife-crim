'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Switch } from '@/components/ui/switch';

const storageKey = 'how-to-crim-collage-v1';

function shuffle(photos: string[]): string[] {
  const order = [...photos];
  for (let index = order.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  return order;
}

// Every photo is used at most once, so the grid can never hold more cells than
// we have pictures. Pick the split that keeps cells closest to 4:3 while
// spending as many of the photos as possible.
function fitGrid(photos: string[], width: number, height: number) {
  let best = {columns: 1, rows: photos.length, score: Infinity};
  for (let columns = 1; columns <= photos.length; columns++) {
    const rows = Math.floor(photos.length / columns);
    if (!rows) break;
    const aspect = (width / columns) / (height / rows);
    const score = Math.abs(Math.log(aspect / (4 / 3))) + (photos.length - columns * rows) * 0.08;
    if (score < best.score) best = {columns, rows, score};
  }
  return best;
}

// photos is the list of tile names in public/collage, read from the folder by the page.
export function CollageBackground({ photos }: { photos: string[] }) {
  const [enabled, setEnabled] = useState(false);
  const [order, setOrder] = useState<string[]>([]);
  const [grid, setGrid] = useState({columns: 0, rows: 0});
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { if (localStorage.getItem(storageKey) === 'on') setEnabled(true); } catch {}
  }, []);

  useEffect(() => {
    if (enabled) setOrder(shuffle(photos));
  }, [enabled, photos]);

  // The layer is sized by the page, not by its own contents, so measuring it
  // and filling it cell by cell cannot feed back into the layout.
  useEffect(() => {
    const element = layer.current;
    if (!element) return;
    function measure() {
      const {width, height} = element!.getBoundingClientRect();
      if (!width || !height) return;
      const {columns, rows} = fitGrid(photos, width, height);
      setGrid((current) => current.columns === columns && current.rows === rows ? current : {columns, rows});
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, photos]);

  const placements = useMemo(
    () => order.slice(0, grid.columns * grid.rows),
    [order, grid.columns, grid.rows],
  );

  function change(value: boolean) {
    setEnabled(value);
    try { localStorage.setItem(storageKey, value ? 'on' : 'off'); } catch {}
  }

  return <>
    <div className="collage-switch" aria-label="Background collage">
      <span>Collage</span>
      <Switch checked={enabled} onCheckedChange={change} aria-label="Show background collage" />
    </div>
    {enabled && <div
      className="collage-layer"
      ref={layer}
      aria-hidden="true"
      style={{
        gridTemplateColumns: `repeat(${grid.columns || 1},minmax(0,1fr))`,
        gridTemplateRows: `repeat(${grid.rows || 1},minmax(0,1fr))`,
      }}
    >
      {placements.map((image) => <span
        className="collage-photo"
        key={image}
      ><span className="collage-photo-art" style={{backgroundImage:`url(/collage/${image}.webp)`}} /></span>)}
    </div>}
  </>;
}

