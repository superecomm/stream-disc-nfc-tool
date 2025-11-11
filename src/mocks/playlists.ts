// Playlists - Complete copy from main app
export type Playlist = {
  id: string;
  name: string;
  description: string;
  coverGradient: string[];
  trackIds: string[];
  createdAt: Date;
};

export const PLAYLISTS: Playlist[] = [
  {
    id: 'playlist-1',
    name: 'New Music Mix',
    description: 'Your weekly mix of fresh tracks',
    coverGradient: ['#FF6B9D', '#FFA07A', '#FF8E8E'],
    trackIds: ['t1', 't7', 't10', 't17', 't21'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'playlist-2',
    name: 'Chill Vibes',
    description: 'Relaxing tunes for any moment',
    coverGradient: ['#4FACFE', '#00F2FE'],
    trackIds: ['t2', 't8', 't14', 't15', 't22'],
    createdAt: new Date('2024-01-05'),
  },
  {
    id: 'playlist-3',
    name: 'Workout Energy',
    description: 'High energy tracks to power your workout',
    coverGradient: ['#FA709A', '#FEE140'],
    trackIds: ['t10', 't11', 't12', 't17', 't18'],
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 'playlist-4',
    name: 'Late Night',
    description: 'Perfect for those quiet evening hours',
    coverGradient: ['#667EEA', '#764BA2'],
    trackIds: ['t3', 't9', 't16', 't21', 't23'],
    createdAt: new Date('2024-01-15'),
  },
];

