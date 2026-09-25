'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/theme-toggle';
import { CollageBackground } from '@/components/collage-background';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { videos } from '@/lib/videos';
import { fetchScores, formatScore, titleToGame, type Score } from '@/lib/leaderboard';
import { gameCatalog } from '@/lib/games';

type Game = 'DES Code Match' | 'Vault Drill' | 'Data Crack' | 'VOLTlab' | 'Meth Cook';


const games: { title: Game; description: string; time: string; type: string }[] = [
  { title: 'DES Code Match', description: 'Match both code blocks as fast as you can.', time: 'No limit', type: 'code' },
  { title: 'Vault Drill', description: 'Breach the pins without overheating.', time: '30s', type: 'drill' },
  { title: 'Data Crack', description: 'Line up each gap with the center bar.', time: '30s', type: 'data' },
  { title: 'VOLTlab', description: 'Connect the values and match the target.', time: '30s', type: 'volt' },
  { title: 'Meth Cook', description: 'Find the right heat and hold it for a clean batch.', time: '~140s', type: 'meth' },
];

const hex = ['7','2','3','3','2','8','2','3','8','3','3','8','8','4','3','4','4','7','8','2','3','3','8','2'];

function Preview({ type, video = false }: { type: string; video?: boolean }) {
  return (
    <div className={`preview preview-${type} ${video ? 'video-preview' : ''}`} aria-hidden="true">
      {type === 'code' && <div className="hex-grid">{hex.map((value, index) => <span key={index}>{value}</span>)}</div>}
      {type === 'drill' && <><div className="drill-ring ring-one"/><div className="drill-ring ring-two"/><div className="drill-bit"/></>}
      {type === 'data' && <div className="data-bars">{[33,46,61,74,89,54,37].map((height,index)=><i key={index} style={{height:`${height}%`}} />)}</div>}
      {type === 'volt' && <><div className="circuit-lines"/><div className="volt-core">ϟ</div>{[1,2,3,4].map(n=><i className={`node node-${n}`} key={n}/>)}</>}
      
      {video && <span className="play-button" aria-hidden="true">▶</span>}
    </div>
  );
}

export function Home({ photos }: { photos: string[] }) {
  const [filter, setFilter] = useState('All Minigames');
  const [leaders, setLeaders] = useState<Score[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    fetchScores(titleToGame.get(filter) ?? null, controller.signal)
      .then((scores) => { setLeaders(scores); setStatus('ready'); })
      .catch((error) => { if (error.name !== 'AbortError') setStatus('error'); });
    return () => controller.abort();
  }, [filter]);

  return (
    <div className="page-shell collage-home">
      <ThemeToggle />
      <CollageBackground photos={photos} />

      <main className="content" id="top">
        <section className="intro" id="tutorial">
          <Link className="home-logo" href="/" aria-label="Return to How to Crim home">
            <h1>How to <span>Crim</span></h1>
          </Link>
          <p>Learn the minigames. Play. Get faster.</p>
          <nav className="home-nav" aria-label="More">
            <Link prefetch href="/resources">Resources</Link>
          </nav>
        </section>

        <section className="site-section" id="leaderboard">
          <div className="section-header leaderboard-title">
            <div><h2>Leaderboard</h2><p>Everyone's personal best. Meth Cook is ranked by purity.</p></div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="leaderboard-select" aria-label="Filter leaderboard">
                <SelectValue placeholder="All Minigames" />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectItem value="All Minigames">All Minigames</SelectItem>
                {games.map((game)=><SelectItem value={game.title} key={game.title}>{game.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="score-table">
            <Table className="leaderboard-table">
              <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Player</TableHead><TableHead>Minigame</TableHead><TableHead>{filter === 'Meth Cook' ? 'Best Purity' : filter === 'All Minigames' ? 'Best' : 'Best Time'}</TableHead></TableRow></TableHeader>
              <TableBody>
                {leaders.map((leader) => (
                  <TableRow key={`${leader.rank}-${leader.player}`}>
                    <TableCell><strong className={`rank rank-${leader.rank}`}>{leader.rank}</strong></TableCell>
                    <TableCell>{leader.player}</TableCell><TableCell>{gameCatalog[leader.game].title}</TableCell><TableCell><time>{formatScore(leader)}</time></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {status === 'loading' && leaders.length === 0 && <p className="empty-state">Loading times…</p>}
            {status === 'error' && <p className="empty-state">Could not load the leaderboard. Try again shortly.</p>}
            {status === 'ready' && leaders.length === 0 && <p className="empty-state">No times submitted yet.</p>}
          </div>
        </section>

        <section className="site-section" id="practice">
          <div className="section-header"><div><h2>Play</h2><p>Learn the controls and try to beat your best time.</p></div></div>
          <div className="practice-grid">
            {games.map((game) => (
              <Card className="practice-card" key={game.title}>
                <Preview type={game.type}/>
                <div className="game-copy"><h3>{game.title}</h3><p>{game.description}</p><small>{game.type === 'meth' ? 'Cook time' : 'Timer preset'}: <strong>{game.time}</strong></small></div>
                <div className="card-actions">
                  <Button asChild className="practice-button"><Link prefetch href={`/play/${game.type}`}>Play <span aria-hidden="true">→</span></Link></Button>
                  <Button asChild variant="link" size="sm" className="how-link"><Link prefetch href={`/play/${game.type}`}>How it works <span aria-hidden="true">→</span></Link></Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="site-section videos-section" id="videos">
          <div className="section-header video-heading">
            <div><h2>Video Guides</h2><p>Watch walkthroughs and tips from the community.</p></div>
            <Button asChild variant="outline" className="view-all"><Link prefetch href="/videos">View All Videos <span aria-hidden="true">→</span></Link></Button>
          </div>
          <div className="video-grid">
            {videos.map((video) => (
              <Card className="video-card" key={video.title}>
                <a className="video-image" href={video.url} target="_blank" rel="noreferrer" style={{ backgroundImage: `url(${video.thumbnail})` }} aria-label={`Watch ${video.title} on YouTube`}>
                  <span className="play-button" aria-hidden="true">▶</span><time>{video.length}</time>
                </a>
                <div className="video-copy"><h3>{video.title}</h3><div><p>{video.description}</p><Button asChild variant="link" size="xs"><a href={video.url} target="_blank" rel="noreferrer">Watch <span aria-hidden="true">→</span></a></Button></div></div>
              </Card>
            ))}
          </div>
        </section>
      </main>

    </div>
  );
}
