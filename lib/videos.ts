export const videos = [
  {
    id: '8_0NV9hkrMo',
    title: 'Vangelico Robbery Guide',
    description: 'Setup, approach, and full robbery route.',
    length: '3:14',
    creator: 'TayFive',
    topic: 'Robbery walkthrough',
  },
  {
    id: 'aKGhLgsoPN8',
    title: 'Humane Labs Guide',
    description: 'Preparation, execution, and escape.',
    length: '19:59',
    creator: 'TayFive',
    topic: 'Robbery walkthrough',
  },
  {
    id: 'jBhRWcbLJsQ',
    title: 'USB & DES Cracker Guide',
    description: 'USB, DES cracker, and house walkthrough.',
    length: '2:16',
    creator: 'TayFive',
    topic: 'Minigame guide',
  },
  {
    id: 'wT-ZzCXaWHA',
    title: 'Bank Robbery Guide',
    description: 'A quick Highlife bank robbery run.',
    length: '3:59',
    creator: 'JAY',
    topic: 'Robbery walkthrough',
  },
].map(video => ({
  ...video,
  url: `https://www.youtube.com/watch?v=${video.id}`,
  thumbnail: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
}));
