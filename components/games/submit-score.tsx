'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameId } from '@/lib/games';
import { nameKey, submitScore } from '@/lib/leaderboard';

type State = 'idle' | 'sending' | 'sent' | 'error';

export function SubmitScore({ game, seconds }: { game: GameId; seconds: number }) {
  // Only ever mounted after a win, i.e. client-side, so reading storage here
  // cannot desync a server render.
  const [player, setPlayer] = useState(() => {
    try { return localStorage.getItem(nameKey) ?? ''; } catch { return ''; }
  });
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState('');

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const name = player.trim();
    if (!name) { setState('error'); setMessage('Enter a name first.'); return; }
    setState('sending');
    try {
      try { localStorage.setItem(nameKey, name); } catch {}
      await submitScore(name, game, Math.round(seconds * 1000));
      setState('sent');
      setMessage('Time submitted to the leaderboard.');
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Could not submit that time.');
    }
  }

  if (state === 'sent') return <p className="submit-score-done" role="status">{message}</p>;

  return <form className="submit-score" onSubmit={send}>
    <label htmlFor="player-name">Post this time</label>
    <input
      id="player-name"
      value={player}
      onChange={(event) => setPlayer(event.target.value)}
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
