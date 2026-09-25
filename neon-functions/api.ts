import { Pool } from 'pg';

// Module scope survives across requests on the same isolate, so the pool and
// the rate-limit buckets are reused rather than rebuilt per call.
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

const games = new Set(['code', 'drill', 'data', 'volt', 'meth']);
// Ranked by purity (highest first) instead of time.
const purityGames = new Set(['meth']);
const writeWindowMs = 60_000;
const writesPerWindow = 10;
const writes = new Map<string, { count: number; resetAt: number }>();

function allowWrite(caller: string) {
  const now = Date.now();
  const bucket = writes.get(caller);
  if (!bucket || now >= bucket.resetAt) {
    writes.set(caller, { count: 1, resetAt: now + writeWindowMs });
    return true;
  }
  if (bucket.count >= writesPerWindow) return false;
  bucket.count += 1;
  return true;
}

const headers = {
  'content-type': 'application/json',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'cache-control': 'no-store',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

async function readScores(url: URL) {
  const game = url.searchParams.get('game');
  if (game && !games.has(game)) return json({ error: 'unknown game' }, 400);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 10, 1), 50);

  // One row per player per game: their personal best (fastest time, or highest purity
  // for purity games). Times and percentages can't be compared, so the all-games view
  // orders by each entry's rank within its own game, then by the value itself.
  // purity is stored in hundredths of a percent and is null for timed games.
  const { rows } = await pool.query(
    `with best as (
       select distinct on (player, game) player, game, ms, purity
       from scores
       where ($1::text is null or game = $1::text)
       order by player, game, purity desc nulls last, ms asc
     ), ranked as (
       select *, rank() over (partition by game order by purity desc nulls last, ms asc) as game_rank
       from best
     )
     select player, game, ms, purity from ranked
     order by game_rank, purity is not null, ms asc, player asc
     limit $2`,
    [game, limit],
  );
  return json({ scores: rows.map((row, index) => ({
    rank: index + 1, player: row.player, game: row.game, ms: row.ms,
    purity: row.purity === null ? null : row.purity / 100,
  })) });
}

async function writeScore(request: Request, caller: string) {
  if (!allowWrite(caller)) return json({ error: 'too many submissions, slow down' }, 429);

  let body: { player?: unknown; game?: unknown; ms?: unknown; purity?: unknown };
  try { body = await request.json(); } catch { return json({ error: 'invalid json' }, 400); }

  const player = typeof body.player === 'string' ? body.player.replace(/[\p{C}]/gu, '').trim() : '';
  const game = typeof body.game === 'string' ? body.game : '';
  const ms = Math.round(Number(body.ms));

  if (player.length < 1 || player.length > 24) return json({ error: 'player must be 1-24 characters' }, 400);
  if (!games.has(game)) return json({ error: 'unknown game' }, 400);
  if (!Number.isFinite(ms) || ms < 1 || ms > 600_000) return json({ error: 'ms out of range' }, 400);
  const byPurity = purityGames.has(game);
  const purity = byPurity ? Math.round(Number(body.purity) * 100) : null;
  if (byPurity && (!Number.isFinite(purity) || purity! < 0 || purity! > 10_000)) return json({ error: 'purity must be 0-100' }, 400);

  const { rows: [score] } = await pool.query(
    `insert into scores (player, game, ms, purity) values ($1, $2, $3, $4) returning id, player, game, ms, purity, created_at`,
    [player, game, ms, purity],
  );
  const { rows: [{ best }] } = await pool.query(
    byPurity
      ? `select max(purity)::int as best from scores where player = $1 and game = $2`
      : `select min(ms)::int as best from scores where player = $1 and game = $2`,
    [player, game],
  );
  return json({ score, personalBest: best }, 201);
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const caller = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });

    try {
      if (url.pathname === '/health') return json({ ok: true });
      if (url.pathname === '/scores' && request.method === 'GET') return await readScores(url);
      if (url.pathname === '/scores' && request.method === 'POST') return await writeScore(request, caller);
      return json({ error: 'not found' }, 404);
    } catch (error) {
      console.error('api error', error);
      return json({ error: 'internal error' }, 500);
    }
  },
};
