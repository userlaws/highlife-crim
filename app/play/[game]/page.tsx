import { notFound } from 'next/navigation';
import { gameCatalog, isGameId } from '@/lib/games';
import { GameRoom } from '@/components/games/game-room';

export async function generateMetadata({params}: {params: Promise<{game:string}>}) {
  const {game} = await params;
  if (!isGameId(game)) return {title:'Game not found'};
  return {title:`${gameCatalog[game].title} · How to Crim`, description:gameCatalog[game].description};
}

export default async function PlayPage({params}: {params: Promise<{game:string}>}) {
  const {game} = await params;
  if (!isGameId(game)) notFound();
  return <GameRoom key={game} game={game} />;
}
