import { Home } from '@/components/home';
import { collagePhotos } from '@/lib/collage-photos';

export default function Page() {
  return <Home photos={collagePhotos()} />;
}
