// Artists - Luna Rey and other artists from main app
export type Artist = {
  id: string;
  name: string;
  bio: string;
  profileImage: string;
  coverImage: string;
  genre: string[];
  verified: boolean;
  stats: {
    monthlyListeners: number;
    totalStreams: number;
    totalReleases: number;
    followers: number;
  };
  socials: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
};

export const ARTISTS: Artist[] = [
  {
    id: 'artist-luna-rey',
    name: 'Luna Rey',
    bio: 'Electronic music producer and DJ based in Los Angeles. Known for creating ethereal soundscapes and nocturnal beats that explore the liminal space between waking and dreaming.',
    profileImage: 'https://i.pravatar.cc/400?img=5',
    coverImage: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=1200&h=400&fit=crop',
    genre: ['Electronic', 'Ambient', 'Downtempo'],
    verified: true,
    stats: {
      monthlyListeners: 1245000,
      totalStreams: 28500000,
      totalReleases: 3,
      followers: 456000,
    },
    socials: {
      instagram: 'https://instagram.com/lunarey',
      twitter: 'https://twitter.com/lunarey',
      website: 'https://lunarey.com',
    },
  },
  {
    id: 'artist-sunset',
    name: 'The Sunset Collective',
    bio: 'Indie pop band creating warm, melodic sounds inspired by golden hour moments.',
    profileImage: 'https://i.pravatar.cc/400?img=8',
    coverImage: 'https://images.unsplash.com/photo-1458560871784-56d23406c091?w=1200&h=400&fit=crop',
    genre: ['Indie Pop', 'Alternative'],
    verified: true,
    stats: {
      monthlyListeners: 987000,
      totalStreams: 18900000,
      totalReleases: 2,
      followers: 320000,
    },
    socials: {
      instagram: 'https://instagram.com/sunsetcollective',
      website: 'https://sunsetcollective.com',
    },
  },
  {
    id: 'artist-metro',
    name: 'Metro Beats',
    bio: 'Hip hop producer capturing the pulse of the city after dark.',
    profileImage: 'https://i.pravatar.cc/400?img=15',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=400&fit=crop',
    genre: ['Hip Hop', 'Trap', 'Urban'],
    verified: true,
    stats: {
      monthlyListeners: 2100000,
      totalStreams: 34500000,
      totalReleases: 4,
      followers: 680000,
    },
    socials: {
      instagram: 'https://instagram.com/metrobeats',
      twitter: 'https://twitter.com/metrobeats',
    },
  },
];

export const findArtistById = (id: string): Artist | undefined => {
  return ARTISTS.find(artist => artist.id === id);
};

