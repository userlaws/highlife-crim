import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCodePuzzle, codeGrid, moveCodeCursor, createVoltPuzzle, voltageTotal, dataBarPosition, dataBarMatches, dataSpeedPresets, initialDrill, stepDrill, isGameId } from '../lib/games.ts';

test('only real game names resolve, including against prototype names', () => {
  for (const name of ['code','data','volt','drill']) assert.equal(isGameId(name),true);
  for (const name of ['constructor','toString','__proto__','missing']) assert.equal(isGameId(name),false);
});

test('DES targets stay constant during refresh and never overlap', () => {
  for(let run=0;run<100;run++) {
    const puzzle=createCodePuzzle();
    assert.ok(Math.floor(puzzle.starts[0]/18)!==Math.floor(puzzle.starts[1]/18)||Math.abs(puzzle.starts[0]-puzzle.starts[1])>7);
    for(let refresh=0;refresh<4;refresh++) {
      const cells=codeGrid(puzzle); assert.equal(cells.length,162);
      puzzle.starts.forEach((start,i)=>{
        assert.ok(start%18<=11);
        assert.equal(cells.slice(start,start+7).join(''),puzzle.targets[i]);
      });
    }
  }
});

test('DES cursors clamp at the edges and start above the playable grid', () => {
  assert.equal(moveCodeCursor(0,-1,0),0);
  assert.equal(moveCodeCursor(0,0,-1),-18);
  assert.equal(moveCodeCursor(-18,0,-1),-18);
  assert.equal(moveCodeCursor(-7,0,1),11);
  assert.equal(moveCodeCursor(155,1,1),155);
  for(let row=-1;row<9;row++) for(let col=0;col<12;col++) for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    const moved=moveCodeCursor(row*18+col,dx,dy);
    assert.ok(moved>=-18 && moved+6<162 && ((moved%18)+18)%18<=11);
  }
});

test('every voltage puzzle has a valid one-to-one solution', () => {
  const permutations=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
  for(let i=0;i<500;i++) {
    const puzzle=createVoltPuzzle();
    assert.deepEqual([...puzzle.multipliers].sort((a,b)=>a-b),[1,10,50]);
    assert.ok(puzzle.values.every(value=>value>=1 && value<=8));
    assert.ok(permutations.some(p=>voltageTotal(puzzle.values,puzzle.multipliers,p)===puzzle.target));
  }
  assert.equal(voltageTotal([6,6,5],[50,10,1],[0,1,2]),365);
  assert.equal(voltageTotal([6,6,5],[50,10,1],[-1,-1,-1]),0);
  assert.equal(voltageTotal([6,6,5],[50,10,1],[0,-1,-1]),300);
});

test('Data Crack uses the source speed curve and hit window', () => {
  assert.deepEqual(dataSpeedPresets,[5,6,7,8,9,10]);
  const firstSpeed=.02*.55*5*10;
  assert.ok(Math.abs(dataBarPosition(0,0)-.744)<1e-9);
  assert.ok(Math.abs(dataBarPosition(1/firstSpeed,0)-.4)<1e-9);
  assert.ok(dataBarMatches(dataBarPosition(.5/firstSpeed,0)));
  assert.ok(Math.abs(dataBarPosition(2/firstSpeed,0)-.744)<1e-9);
  for(let i=0;i<7;i++) for(const difficulty of [2,2.5,4,5]) {
    const speed=(.02+.005*i)*.55*difficulty*10;
    assert.ok(dataBarMatches(dataBarPosition(.5/speed,i,difficulty)));
  }
  for(let i=1;i<7;i++) {
    const earlier=(.02+.005*(i-1))*.55*5*10;
    const later=(.02+.005*i)*.55*5*10;
    assert.ok(later>earlier);
  }
  for(let i=1;i<dataSpeedPresets.length;i++) {
    assert.ok(dataSpeedPresets[i]>dataSpeedPresets[i-1]);
    assert.ok(dataBarPosition(.1,0,dataSpeedPresets[i])<dataBarPosition(.1,0,dataSpeedPresets[i-1]));
  }
  assert.equal(dataBarMatches(.509),false);assert.equal(dataBarMatches(.621),false);
  assert.equal(dataBarMatches(.51),true);assert.equal(dataBarMatches(.62),true);
});

test('drilling cannot advance without rotation, and idle cools without losing depth', () => {
  let drill=initialDrill();
  for(let i=0;i<300;i++)drill=stepDrill(drill,1,0,1/60);
  assert.ok(drill.position<=.1);assert.equal(drill.depth,.1);
  drill=stepDrill({position:.5,depth:.5,heat:.6,speed:.5},0,0,.1);
  assert.equal(drill.depth,.5);assert.equal(drill.position,.5);assert.ok(Math.abs(drill.heat-.5)<1e-9);
});

test('aggressive drilling overheats before opening the vault', () => {
  let drill={...initialDrill(),speed:1};
  for(let i=0;i<1200 && drill.heat<1;i++)drill=stepDrill(drill,1,0,1/60);
  assert.equal(drill.heat,1);assert.ok(drill.depth<1);
});

test('fresh drill presses have source-sized impulses and a stalled bit does not cool', () => {
  const drill=stepDrill(initialDrill(),1,1,1/60,{pressure:1,throttle:1});
  assert.equal(drill.position,.01);assert.equal(drill.speed,.05);
  const stalled=stepDrill({position:.1,depth:.1,heat:.5,speed:0},1,0,.1);
  assert.equal(stalled.position,.1);assert.equal(stalled.heat,.5);
});

test('controlled drilling can reach full depth inside the trainer preset', () => {
  let drill={...initialDrill(),speed:.15};
  let seconds=0;
  while(drill.position<1 && seconds<30) {
    drill=stepDrill(drill,drill.heat<.15?1:0,0,1/60);
    seconds+=1/60;
    assert.ok(drill.heat<1);
  }
  assert.equal(drill.position,1);
});
