// Categories and Promotional Ads - Complete copy from main app
export type MusicCategory = {
  id: string;
  title: string;
  albums: string[]; // Album IDs
  color?: string;
};

export type PromotionalAd = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  backgroundColor: string;
};

export const MUSIC_CATEGORIES: MusicCategory[] = [
  {
    id: 'trending',
    title: 'Trending Now',
    albums: ['album-3', 'album-1', 'album-5', 'album-2'],
    color: '#FF3B5C',
  },
  {
    id: 'new-releases',
    title: 'New Releases',
    albums: ['album-1', 'album-3', 'album-5'],
    color: '#1DB954',
  },
  {
    id: 'electronic',
    title: 'Electronic Vibes',
    albums: ['album-1', 'album-5'],
    color: '#8B5CF6',
  },
  {
    id: 'hip-hop',
    title: 'Hip Hop Essentials',
    albums: ['album-3'],
    color: '#F59E0B',
  },
  {
    id: 'chill',
    title: 'Chill & Relax',
    albums: ['album-4', 'album-6', 'album-2'],
    color: '#4A90E2',
  },
  {
    id: 'indie',
    title: 'Indie Discoveries',
    albums: ['album-2', 'album-4'],
    color: '#EF4444',
  },
  {
    id: 'exclusive',
    title: 'Stream Disc Exclusives',
    albums: ['album-3'],
    color: '#FF3B5C',
  },
];

export const PROMOTIONAL_ADS: PromotionalAd[] = [
  {
    id: 'superbowl-2025',
    title: 'Super Bowl LIX',
    subtitle: 'Stream the official halftime show album',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=400&fit=crop',
    ctaText: 'Listen Now',
    ctaLink: '/album/album-3',
    backgroundColor: '#1C1C1E',
  },
  {
    id: 'year-end-sale',
    title: 'Year-End Sale',
    subtitle: '50% off all Stream Discs - Limited time',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=400&fit=crop',
    ctaText: 'Shop Now',
    ctaLink: '/store',
    backgroundColor: '#FF3B5C',
  },
];

export const findCategoryById = (id: string): MusicCategory | undefined => {
  return MUSIC_CATEGORIES.find(cat => cat.id === id);
};

