export type ContentType = 'album' | 'mixtape' | 'film' | 'podcast' | 'audiobook' | 'create';

export interface Track {
  title: string;
  fileUrl: string;
  duration: number; // in seconds
  order: number;
}

export interface Disc {
  id: string;
  type: ContentType;
  title: string;
  artist: string;
  description?: string;
  coverImage: string; // Firebase Storage URL
  tracks?: Track[]; // For album/mixtape
  createdBy: string | null; // userId or null for anonymous
  createdAt: Date;
  nfcUrl?: string;
  discUID?: string;
  nonce?: string;
  metadata?: Record<string, any>;
  // Store-related fields
  publishedToStore?: boolean;
  storePrice?: number | null; // null or 0 means free
  physicalDiscAvailable?: boolean;
  publishedAt?: Date | null;
}

export interface UploadProgress {
  fileName: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

