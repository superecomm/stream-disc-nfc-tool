// Mock Albums - Complete copy from main app
export type Track = {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  albumId: string;
  audioUrl?: string;
};

export type Album = {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  artistAvatar: string;
  coverUrl: string;
  year: number;
  genre: string;
  tracks: Track[];
  price: number;
  stats: {
    views: number;
    vibes: number;
    vibesUp: number;
    vibesDown: number;
    streams: number;
    discsSold: number;
    comments: number;
  };
  postedDate: Date;
  isStreamDiscExclusive?: boolean;
};

export const ALBUMS: Album[] = [
  {
    id: 'album-1',
    title: 'Midnight Dreams',
    artist: 'Luna Rey',
    artistId: 'artist-luna-rey',
    artistAvatar: 'https://i.pravatar.cc/150?img=5',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop',
    year: 2024,
    genre: 'Electronic',
    price: 24.99,
    postedDate: new Date('2024-10-15'),
    stats: {
      views: 1245000,
      vibes: 89500,
      vibesUp: 85000,
      vibesDown: 4500,
      streams: 2340000,
      discsSold: 450,
      comments: 1234,
    },
    tracks: [
      { id: 't1', title: 'Moonlight Sonata (Reimagined)', artist: 'Luna Rey', duration: 272, albumId: 'album-1', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: 't2', title: 'Neon Nights', artist: 'Luna Rey', duration: 225, albumId: 'album-1', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
      { id: 't3', title: 'Echo Chamber', artist: 'Luna Rey', duration: 312, albumId: 'album-1', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
      { id: 't4', title: 'Stardust Memories', artist: 'Luna Rey', duration: 258, albumId: 'album-1', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
      { id: 't5', title: 'Digital Dreams', artist: 'Luna Rey', duration: 236, albumId: 'album-1', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
      { id: 't6', title: 'Cosmic Lullaby', artist: 'Luna Rey', duration: 383, albumId: 'album-1', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
    ],
  },
  {
    id: 'album-2',
    title: 'Golden Hour',
    artist: 'The Sunset Collective',
    artistId: 'artist-sunset',
    artistAvatar: 'https://i.pravatar.cc/150?img=8',
    coverUrl: 'https://images.unsplash.com/photo-1458560871784-56d23406c091?w=400&h=400&fit=crop',
    year: 2023,
    genre: 'Indie Pop',
    price: 19.99,
    postedDate: new Date('2024-09-20'),
    stats: {
      views: 987000,
      vibes: 76300,
      vibesUp: 72000,
      vibesDown: 4300,
      streams: 1890000,
      discsSold: 320,
      comments: 892,
    },
    tracks: [
      { id: 't7', title: 'Summer Breeze', artist: 'The Sunset Collective', duration: 245, albumId: 'album-2', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
      { id: 't8', title: 'Golden Hour', artist: 'The Sunset Collective', duration: 267, albumId: 'album-2', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
      { id: 't9', title: 'Horizon', artist: 'The Sunset Collective', duration: 189, albumId: 'album-2', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    ],
  },
  {
    id: 'album-3',
    title: 'Urban Nights',
    artist: 'Metro Beats',
    artistId: 'artist-metro',
    artistAvatar: 'https://i.pravatar.cc/150?img=15',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    year: 2024,
    genre: 'Hip Hop',
    price: 22.99,
    postedDate: new Date('2024-10-28'),
    isStreamDiscExclusive: true,
    stats: {
      views: 2100000,
      vibes: 145000,
      vibesUp: 140000,
      vibesDown: 5000,
      streams: 3450000,
      discsSold: 680,
      comments: 2340,
    },
    tracks: [
      { id: 't10', title: 'City Lights', artist: 'Metro Beats', duration: 221, albumId: 'album-3', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
      { id: 't11', title: 'Midnight Run', artist: 'Metro Beats', duration: 198, albumId: 'album-3', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
      { id: 't12', title: 'Street Poetry', artist: 'Metro Beats', duration: 234, albumId: 'album-3', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
      { id: 't13', title: 'Urban Legend', artist: 'Metro Beats', duration: 256, albumId: 'album-3', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    ],
  },
  {
    id: 'album-4',
    title: 'Acoustic Sessions',
    artist: 'Sophie Walsh',
    artistId: 'artist-sophie',
    artistAvatar: 'https://i.pravatar.cc/150?img=10',
    coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
    year: 2023,
    genre: 'Acoustic',
    price: 18.99,
    postedDate: new Date('2024-08-12'),
    stats: {
      views: 654000,
      vibes: 54200,
      vibesUp: 52000,
      vibesDown: 2200,
      streams: 1230000,
      discsSold: 210,
      comments: 543,
    },
    tracks: [
      { id: 't14', title: 'Coffee Shop', artist: 'Sophie Walsh', duration: 203, albumId: 'album-4', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
      { id: 't15', title: 'Rainy Days', artist: 'Sophie Walsh', duration: 187, albumId: 'album-4', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
      { id: 't16', title: 'Home', artist: 'Sophie Walsh', duration: 245, albumId: 'album-4', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
    ],
  },
  {
    id: 'album-5',
    title: 'Synthwave Paradise',
    artist: 'Retro Future',
    artistId: 'artist-retro',
    artistAvatar: 'https://i.pravatar.cc/150?img=22',
    coverUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop',
    year: 2024,
    genre: 'Synthwave',
    price: 21.99,
    postedDate: new Date('2024-10-05'),
    stats: {
      views: 1567000,
      vibes: 112000,
      vibesUp: 108000,
      vibesDown: 4000,
      streams: 2890000,
      discsSold: 540,
      comments: 1567,
    },
    tracks: [
      { id: 't17', title: 'Neon Highway', artist: 'Retro Future', duration: 267, albumId: 'album-5', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: 't18', title: 'Chrome Dreams', artist: 'Retro Future', duration: 234, albumId: 'album-5', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
      { id: 't19', title: 'Digital Sunset', artist: 'Retro Future', duration: 289, albumId: 'album-5', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
      { id: 't20', title: 'Pixel Paradise', artist: 'Retro Future', duration: 245, albumId: 'album-5', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    ],
  },
  {
    id: 'album-6',
    title: 'Jazz After Dark',
    artist: 'The Midnight Trio',
    artistId: 'artist-midnight-trio',
    artistAvatar: 'https://i.pravatar.cc/150?img=28',
    coverUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop',
    year: 2023,
    genre: 'Jazz',
    price: 23.99,
    postedDate: new Date('2024-07-18'),
    stats: {
      views: 789000,
      vibes: 67800,
      vibesUp: 65000,
      vibesDown: 2800,
      streams: 1456000,
      discsSold: 290,
      comments: 678,
    },
    tracks: [
      { id: 't21', title: 'Moonlight Serenade', artist: 'The Midnight Trio', duration: 312, albumId: 'album-6', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
      { id: 't22', title: 'Blue Notes', artist: 'The Midnight Trio', duration: 289, albumId: 'album-6', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
      { id: 't23', title: 'Velvet Lounge', artist: 'The Midnight Trio', duration: 267, albumId: 'album-6', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
    ],
  },
];

export const findAlbumById = (id: string): Album | undefined => {
  return ALBUMS.find(album => album.id === id);
};

