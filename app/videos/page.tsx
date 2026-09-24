import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { videos } from '@/lib/videos';

export const metadata: Metadata = {
  title: 'Video Guides | How to Crim',
  description: 'Watch Highlife robbery and minigame walkthroughs.',
};

export default function VideosPage() {
  return <div className="page-shell gallery-page">
    <ThemeToggle />
    <main className="gallery-content">
      <Link prefetch href="/" className="game-brand">How to <span>Crim</span></Link>
      <Link prefetch href="/#videos" className="back-link">← Back to home</Link>
      <div className="gallery-heading">
        <div>
          <p className="gallery-eyebrow">THE LIBRARY</p>
          <h1>Video Guides</h1>
          <p>Watch the run, then try the minigames yourself.</p>
        </div>
        <span>{videos.length} videos</span>
      </div>
      <div className="gallery-grid">
        {videos.map(video => <Card key={video.id} className="gallery-card">
          <a href={video.url} target="_blank" rel="noreferrer" className="gallery-thumbnail" aria-label={`Watch ${video.title} on YouTube`}>
            <span className="gallery-thumbnail-art" style={{backgroundImage:`url(${video.thumbnail})`}} />
            <span className="play-button" aria-hidden="true">▶</span>
            <time>{video.length}</time>
          </a>
          <div className="gallery-card-body">
            <span className="gallery-topic">{video.topic}</span>
            <h2>{video.title}</h2>
            <p>{video.description}</p>
            <div className="gallery-card-bottom">
              <span>By {video.creator}</span>
              <Button asChild variant="outline" size="sm"><a href={video.url} target="_blank" rel="noreferrer">Watch video <span aria-hidden="true">↗</span></a></Button>
            </div>
          </div>
        </Card>)}
      </div>
    </main>
  </div>;
}
