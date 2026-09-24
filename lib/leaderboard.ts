import { gameCatalog, GameId } from './games';

export type Score = { rank: number; player: string; game: GameId; ms: number };

const apiBase = (process.env.NEXT_PUBLIC_NEON_API_URL ?? '').replace(/\/$/, '');

export const nameKey = 'how-to-crim-player-v1';
export const gameIds = Object.keys(gameCatalog) as GameId[];
export const titleToGame = new Map<string, GameId>(gameIds.map((id) => [gameCatalog[id].title, id]));

export function formatTime(ms: number) {
  return `${(ms / 1000).toFixed(2)}s`;
}

async function call(path: string, init?: RequestInit) {
  if (!apiBase) throw new Error('Leaderboard API is not configured.');
  const response = await fetch(`${apiBase}${path}`, init);
  const body = await response.json().catch(() => ({})) as { error?: string; scores?: Score[] };
  if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`);
  return body;
}

export async function fetchScores(game: GameId | null, signal?: AbortSignal): Promise<Score[]> {
  const query = game ? `?game=${game}` : '';
  const body = await call(`/scores${query}`, { signal });
  return body.scores ?? [];
}

export async function submitScore(player: string, game: GameId, ms: number) {
  return call('/scores', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ player, game, ms }),
  });
}
