export const gameCatalog = {
  code: {
    title: 'DES Code Match', limit: 15,
    description: 'Find both constant code blocks in a changing hex grid.',
    instructions: 'Move the left selection with W A S D and confirm with Space. Move the right selection with the arrow keys and confirm with Enter. Match both seven-character targets. Wrong confirmations deduct 5 seconds, then 10 seconds, and so on.',
    source: 'https://github.com/DV-studios/mhacking',
    sourceName: 'mhacking',
  },
  drill: {
    title: 'Vault Drill', limit: 30,
    description: 'Breach the pins without overheating the drill.',
    instructions: 'Click and hold Faster to spin up, then click or hold Push to advance. Brief Push taps move the bit in small steps; release Push to cool. Use Withdraw if needed. The buttons also work with touch, and WASD or arrow keys remain available. Reach full depth before the timer ends without overheating.',
    source: 'https://github.com/meta-hub/fivem-drilling',
    sourceName: 'meta-hub / fivem-drilling',
  },
  data: {
    title: 'Data Crack', limit: 30,
    description: 'Stop each moving gap on the center line.',
    instructions: 'Click the play area or Lock bar when the active yellow gap reaches the red center line. Lock all seven bars; each one moves faster than the last. Missing the first bar ends the run. Later misses release the previous bar. Space and Enter also work.',
    source: 'https://github.com/utkuali/datacrack',
    sourceName: 'utkuali / datacrack',
  },
  volt: {
    title: 'VOLTlab', limit: 30,
    description: 'Route each input through a multiplier to reach the target.',
    instructions: 'Use W / S to pick an input and Up / Down to pick an output, matching the in-game controls. The three outputs hide multipliers ×1, ×10, and ×50 behind symbols that change every attempt. RESULT previews the total of your committed wires plus the selected match as you move between sockets. Press Enter to confirm; connections are irreversible. Wire all three inputs to hit the target. Touch users can select both sides and tap Connect.',
    source: 'https://github.com/ultrahacx/ultra-voltlab',
    sourceName: 'ultra-voltlab',
  },
} as const;

export type GameId = keyof typeof gameCatalog;
export function isGameId(value: string): value is GameId { return Object.hasOwn(gameCatalog, value); }

export const HEX = '0123456789ABCDEF';
export const dataSpeedPresets = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] as const;
export const dataSpeedDefault = 12;
export const randomInt = (max: number) => Math.floor(Math.random() * max);
export const randomHex = () => HEX[randomInt(HEX.length)];
export const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

export function createCodePuzzle() {
  const first = randomInt(9)*18+randomInt(11);
  let second = randomInt(9)*18+randomInt(11);
  while(Math.floor(first/18)===Math.floor(second/18)&&Math.abs(first-second)<=7) second=randomInt(9)*18+randomInt(11);
  const starts = [first,second];
  const targets = [Array.from({length:7}, randomHex).join(''), Array.from({length:7}, randomHex).join('')];
  return { starts, targets };
}

export function codeGrid(puzzle: ReturnType<typeof createCodePuzzle>) {
  const cells = Array.from({length:162}, randomHex);
  puzzle.starts.forEach((start, i) => [...puzzle.targets[i]].forEach((char, j) => { cells[start + j] = char; }));
  return cells;
}

export function moveCodeCursor(position: number, dx: number, dy: number) {
  const row = Math.floor(position / 18);
  const col = ((position % 18) + 18) % 18;
  return clamp(row + dy, -1, 8) * 18 + clamp(col + dx, 0, 11);
}

export function createVoltPuzzle() {
  const values = Array.from({length:3}, () => 1 + randomInt(8));
  const multipliers = [1, 10, 50];
  for (let i = 2; i > 0; i--) { const j = randomInt(i + 1); [multipliers[i], multipliers[j]] = [multipliers[j], multipliers[i]]; }
  const solution = [0, 1, 2];
  for (let i = 2; i > 0; i--) { const j = randomInt(i + 1); [solution[i], solution[j]] = [solution[j], solution[i]]; }
  return { values, multipliers, target: values.reduce((total, value, i) => total + value * multipliers[solution[i]], 0) };
}

export function voltageTotal(values: number[], multipliers: number[], connections: number[]) {
  return connections.reduce((total, socket, i) => total + (socket < 0 ? 0 : values[i] * multipliers[socket]), 0);
}

// Original browser simulations of the observed FiveM mechanics. See docs/game-sources.md.
export function dataBarPosition(seconds: number, bar: number, difficulty = 5) {
  const phase = seconds * (0.02 + 0.005 * bar) * 0.55 * difficulty * 10;
  return 0.572 + 0.172 * Math.cos(Math.PI * phase);
}
export function dataBarMatches(position: number) { return position >= 0.51 && position <= 0.62; }
export type DrillState = {position:number; depth:number; speed:number; heat:number};
export const initialDrill = (): DrillState => ({position:0, depth:0.1, speed:0, heat:0});
export const drillCutThreshold = 0.1;
export function stepDrill(previous: DrillState, pressure:number, throttle:number, dt:number, taps = {pressure:0, throttle:0}): DrillState {
  const speed = clamp(previous.speed + (taps.throttle ? taps.throttle * 0.05 : throttle * 0.5 * dt), 0, 1);
  // A hot bit stops biting, so overheating costs progress before it ends the run.
  const bite = speed * (1 - previous.heat * 0.75);
  const advance = taps.pressure ? taps.pressure * 0.01
    : pressure > 0 ? 0.3 * bite * dt
    : pressure * 0.1 * dt;
  const pressing = pressure > 0 || taps.pressure > 0;
  let position = clamp(previous.position + advance, 0, 1);
  let {depth, heat} = previous;
  if (position > depth) {
    if (speed > drillCutThreshold) {
      depth = position;
      // A tap advances a fixed amount regardless of frame rate, so it carries
      // its own heat cost; a purely time-based model lets fast clicking outrun
      // the temperature entirely.
      heat += dt * (0.15 + speed * speed * 0.95) + Math.max(0, taps.pressure) * 0.05;
    } else position = depth;
  } else if (!pressing) heat -= dt * 0.5;
  return {position, depth, speed, heat:clamp(heat, 0, 1)};
}
