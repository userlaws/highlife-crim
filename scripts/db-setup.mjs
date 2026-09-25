import { readFile } from 'node:fs/promises';
import pg from 'pg';

const env = Object.fromEntries(
  (await readFile('.env.local', 'utf8')).split(/\r?\n/)
    .filter((line) => line.includes('=') && !line.startsWith('#'))
    .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1).replace(/^["']|["']$/g, '')]),
);

const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
await pool.query(`
  create table if not exists scores (
    id          bigint generated always as identity primary key,
    player      text        not null check (length(trim(player)) between 1 and 24),
    game        text        not null,
    ms          integer     not null check (ms between 1 and 600000),
    created_at  timestamptz not null default now()
  );
`);
await pool.query(`create index if not exists scores_game_ms_idx on scores (game, ms, created_at);`);
// Meth Cook is ranked by purity (hundredths of a percent) instead of time.
await pool.query(`alter table scores add column if not exists purity integer check (purity between 0 and 10000);`);
await pool.query(`alter table scores drop constraint if exists scores_game_check;`);
await pool.query(`alter table scores add constraint scores_game_check check (game in ('code','drill','data','volt','meth'));`);
await pool.query(`alter table scores drop constraint if exists scores_purity_game_check;`);
await pool.query(`alter table scores add constraint scores_purity_game_check check ((game = 'meth') = (purity is not null));`);

const { rows: columns } = await pool.query(
  `select column_name, data_type from information_schema.columns where table_name = 'scores' order by ordinal_position`,
);
const { rows: [{ count }] } = await pool.query('select count(*)::int as count from scores');
console.log('scores columns:', columns.map((c) => `${c.column_name}:${c.data_type}`).join(', '));
console.log('existing rows:', count);
await pool.end();
