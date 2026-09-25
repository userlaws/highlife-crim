'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { createMethCook, methIngredients, methOnTarget, methQuality, MethQuality, methShiftsDue, methStartTemperature, methYield, nextMethTarget } from '@/lib/games';
import { GameProps, useGameFrame, useGameKeys } from './use-game-input';

// The RV sits still while you load the batch; the smoke animation plays once the cook starts.
const sceneStill = '/meth/rv.webp';
const sceneCooking = '/meth/rv-cooking.gif';
const sceneBurning = '/meth/rv-burning.gif';

type Stage = 'idle' | 'loading' | 'cooking' | 'done';
type Batch = 'idle' | 'good' | 'bad';
const gradeLabel: Record<MethQuality, string> = {terrible:'Terrible', white:'White', cloudy:'Cloudy', blown:'Blown'};

function Key({children}:{children:React.ReactNode}) { return <kbd className="meth-key">{children}</kbd>; }

export function MethCook({active, onFinish}:GameProps) {
  const [stage, setStage] = useState<Stage>('idle');
  const [temperature, setTemperature] = useState(methStartTemperature);
  const [amounts, setAmounts] = useState([0, 0, 0]);
  const [quality, setQuality] = useState<MethQuality | null>(null);
  const [batch, setBatch] = useState<Batch>('idle');
  const [outcome, setOutcome] = useState<MethQuality | null>(null);
  const [setup] = useState(createMethCook);
  const cook = useRef(setup);
  const sim = useRef({stage:'idle' as Stage, temperature:methStartTemperature, elapsed:0, onTarget:0, target:setup.target, shifts:0, quality:null as MethQuality | null, sent:false, shown:false, pending:[] as {at:number; good:boolean}[]});
  const progress = useRef<HTMLSpanElement>(null);

  function begin() {
    if (!active || sim.current.stage !== 'idle') return;
    sim.current.stage = 'loading'; setStage('loading');
  }
  function heat(step:number) {
    const s = sim.current;
    if (!active || s.stage === 'idle' || s.stage === 'done') return;
    s.temperature = Math.max(0, Math.min(100, s.temperature + step)); setTemperature(s.temperature);
  }
  function add(index:number) {
    const s = sim.current;
    if (!active || s.stage === 'idle' || s.stage === 'done') return;
    setAmounts(old => {
      const next = old.map((amount, i) => i === index ? Math.min(amount + 1, methIngredients[i].max) : amount);
      if (s.stage === 'loading' && next.every(Boolean)) { s.stage = 'cooking'; setStage('cooking'); }
      return next;
    });
  }
  function complete(grade:MethQuality) {
    const s = sim.current;
    s.stage = 'done'; setStage('done'); setOutcome(grade); setBatch('idle');
    const purity = s.onTarget / s.elapsed * 100;
    if (grade === 'blown') { onFinish(false, 'The liquid started to bubble out of control and the batch was lost. Leave, and keep the heat on target next time.'); return; }
    const {trays, grade:name} = methYield[grade];
    onFinish(true, `${name} batch: -${trays} baking tray, +${trays} crystal meth tray (${name.toUpperCase()}). The heat was on target ${Math.round(purity)}% of the cook.`, purity);
  }

  useGameFrame(active, dt => {
    const s = sim.current;
    if (s.stage !== 'cooking') return;
    s.elapsed += dt;
    const due = methShiftsDue(s.elapsed, cook.current.firstShift);
    while (s.shifts < due) { s.target = nextMethTarget(s.target); s.shifts++; }
    const good = methOnTarget(s.temperature, s.target);
    if (good) s.onTarget += dt;
    // The batch reports how it is responding a beat late, like the in-game text.
    const last = s.pending.length ? s.pending[s.pending.length - 1].good : s.shown;
    if (good !== last || !s.sent) { s.pending.push({at:s.elapsed + cook.current.feedbackDelayMs / 1000, good}); s.sent = true; }
    let shown:boolean | null = null;
    while (s.pending.length && s.pending[0].at <= s.elapsed) shown = s.pending.shift()!.good;
    if (shown !== null) { s.shown = shown; setBatch(shown ? 'good' : 'bad'); }
    const grade = methQuality(s.elapsed, s.onTarget);
    if (grade !== s.quality) { s.quality = grade; setQuality(grade); }
    if (progress.current) progress.current.style.width = `${Math.min(1, s.elapsed / cook.current.length) * 100}%`;
    if (grade === 'blown') complete('blown');
    else if (s.elapsed >= cook.current.length) complete(grade);
  });

  useGameKeys(active, (key, repeat) => {
    if (repeat) return;
    if (key === 'e') begin();
    else if (key === 'arrowup' || key === 'arrowdown') heat(key === 'arrowup' ? 5 : -5);
    else add(methIngredients.findIndex(item => item.key === key));
  }, ['e', 'arrowup', 'arrowdown', 'a', 's', 'd']);

  // The burning animation is large; fetch it while the player cooks so it starts the moment the batch blows.
  useEffect(() => { if (stage === 'cooking') new Image().src = sceneBurning; }, [stage]);
  const cooking = stage === 'cooking';
  const loaded = amounts.every(Boolean);
  const trays = outcome && outcome !== 'blown' ? methYield[outcome].trays : 0;
  const feedback = stage === 'idle' ? 'Press E to fire up the burner.' : stage === 'loading' ? 'Add lithium, acetone, and sulfuric acid to start cooking.' : stage === 'done' ? (outcome === 'blown' ? 'The batch blew.' : 'The cook is finished.') : batch === 'good' ? 'The batch is responding well to the heat.' : 'The batch is not responding well to the heat.';

  return <div className="meth-game">
    <div className="meth-scene" data-batch={batch} data-stage={stage} data-outcome={outcome ?? ''} style={{backgroundImage:`url(${outcome === 'blown' ? sceneBurning : cooking ? sceneCooking : sceneStill})`}}>

      {stage === 'idle' && <div className="meth-hud hud-top-left"><p>Press <Key>E</Key> to start cooking</p></div>}
      {(stage === 'loading' || stage === 'cooking') && <div className="meth-hud hud-top-left hud-controls">
        <p><em>Quality</em> based on temp control</p>
        <p><em>Quantity</em> differs by ingredients</p>
        <p><em>Recipes</em> differ based on quality</p>
        <p><em>Recipes</em> change each month</p>
        <p><Key>↑</Key> Increase the temperature (<b>{temperature}</b>%)</p>
        <p><Key>↓</Key> Decrease the temperature</p>
        {methIngredients.map((item,i)=><p key={item.key}><Key>{item.key.toUpperCase()}</Key> Add more {item.name.toLowerCase()} (<b>{amounts[i]}</b>)</p>)}
      </div>}
      {(stage === 'loading' || stage === 'cooking') && <div className="meth-hud hud-bottom-right">
        <div className="hud-row"><span>Cook Quality</span><strong className={`grade-${cooking ? quality : 'none'}`}>{cooking && quality ? gradeLabel[quality] : 'Not Cooking'}</strong></div>
        <div className="hud-row"><span>Cook Progress</span><span className="hud-progress"><span ref={progress}/></span></div>
      </div>}
      {stage !== 'idle' && stage !== 'done' && <p className={`meth-subtitle ${!loaded ? '' : batch === 'good' ? 'subtitle-good' : batch === 'bad' ? 'subtitle-bad' : ''}`} aria-hidden="true">{!loaded ? 'Add items to start cooking' : batch === 'good' ? 'The batch is responding well to the heat' : batch === 'bad' ? 'The batch is not responding well to the heat' : ''}</p>}
      {outcome === 'blown' && <div className="meth-hud hud-bottom-left hud-blow"><p>The liquid starts to bubble <b>out of control</b>, <i>I should probably leave</i></p></div>}
      {outcome && outcome !== 'blown' && <div className="meth-result"><p>-{trays} BAKING TRAY</p><p>+{trays} CRYSTAL METH TRAY ({methYield[outcome].grade.toUpperCase()})</p></div>}
    </div>
    <p className="game-feedback" role="status">{feedback}</p>
    <div className="control-row meth-controls">
      <Button variant={stage === 'idle' ? 'default' : 'outline'} disabled={!active || stage !== 'idle'} onClick={begin}><Key>E</Key> Start cooking</Button>
      <Button variant="outline" disabled={!active || stage === 'idle' || stage === 'done'} onClick={() => heat(-5)} aria-label="Decrease the temperature"><Key>↓</Key> Cooler</Button>
      <Button variant="outline" disabled={!active || stage === 'idle' || stage === 'done'} onClick={() => heat(5)} aria-label="Increase the temperature"><Key>↑</Key> Hotter</Button>
      {methIngredients.map((item,i)=><Button key={item.key} variant="outline" disabled={!active || stage === 'idle' || stage === 'done' || amounts[i] >= item.max} onClick={() => add(i)}><Key>{item.key.toUpperCase()}</Key> {item.name}</Button>)}
    </div>
  </div>;
}
