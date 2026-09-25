'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameId, purityGames } from '@/lib/games';
import { nameKey, submitScore } from '@/lib/leaderboard';

type State = 'idle' | 'sending' | 'sent' | 'error';

// The name is owned by the game room so the win banner above the game can show it as it is typed.
export function SubmitScore({ game, seconds, purity, player, onPlayerChange }: { game: GameId; seconds: number; purity?: number; player: string; onPlayerChange: (name: string) => void }) {
  const byPurity = purityGames.includes(game);
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState('');

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const name = player.trim();
    if (!name) { setState('error'); setMessage('Enter a name first.'); return; }
    try { localStorage.setItem(nameKey, name); } catch {}
    setState('sending');
    try {
      await submitScore(name, game, Math.round(seconds * 1000), byPurity ? purity : undefined);
      setState('sent');
      setMessage(byPurity ? 'Batch submitted to the leaderboard.' : 'Time submitted to the leaderboard.');
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Could not submit that time.');
    }
  }

  if (state === 'sent') return <p className="submit-score-done" role="status">{message}</p>;

  return <form className="submit-score" onSubmit={send}>
    <label htmlFor="player-name">{byPurity ? 'Post this batch' : 'Post this time'}</label>
    <input
      id="player-name"
      value={player}
      onChange={(event) => onPlayerChange(event.target.value)}
      placeholder="Your name"
      maxLength={24}
      autoComplete="nickname"
      disabled={state === 'sending'}
    />
    <Button type="submit" variant="outline" disabled={state === 'sending'}>
      {state === 'sending' ? 'Submitting…' : 'Submit'}
    </Button>
    {state === 'error' && <small role="alert">{message}</small>}
  </form>;
}
