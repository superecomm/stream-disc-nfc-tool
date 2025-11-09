'use client';

import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBxrwsHdKKMlysoIKoAQ1oEG93dFCIikKE',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'stream-disc.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'stream-disc',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'stream-disc.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '815980858345',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:815980858345:web:f82bf09c7852fbd01ed978',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Track {
  title: string;
  fileUrl: string;
  duration: number;
  order: number;
}

interface Disc {
  id: string;
  type: string;
  title: string;
  artist: string;
  coverImage: string;
  tracks?: Track[];
}

export default function ContentPage({ params }: { params: { contentId: string } }) {
  const [disc, setDisc] = useState<Disc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDisc();
  }, [params.contentId]);

  const loadDisc = async () => {
    try {
      const docRef = doc(db, 'discs', params.contentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setDisc({ id: docSnap.id, ...docSnap.data() } as Disc);
      } else {
        setError('Content not found');
      }
    } catch (err) {
      console.error('Error loading disc:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error || !disc) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error || 'Content not found'}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* App Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerContent}>
          <div>
            <h3 style={styles.bannerTitle}>Stream Disc NFC Tool</h3>
            <p style={styles.bannerSubtitle}>Get the full experience</p>
          </div>
          <a
            href="https://play.google.com/store"
            style={styles.bannerButton}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get App
          </a>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <img
          src={disc.coverImage}
          alt={disc.title}
          style={styles.coverImage}
        />
        
        <h1 style={styles.title}>{disc.title}</h1>
        <h2 style={styles.artist}>{disc.artist}</h2>

        {disc.tracks && disc.tracks.length > 0 && (
          <div style={styles.tracksContainer}>
            <h3 style={styles.tracksHeader}>Tracks</h3>
            {disc.tracks.map((track, index) => (
              <div key={index} style={styles.trackItem}>
                <div style={styles.trackNumber}>{index + 1}</div>
                <div style={styles.trackTitle}>{track.title}</div>
                <audio
                  controls
                  style={styles.audioPlayer}
                  src={track.fileUrl}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            ))}
          </div>
        )}

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Scan this Stream Disc with your phone to access this content anywhere
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#000000',
  },
  banner: {
    backgroundColor: '#1a1a1a',
    padding: '16px',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    borderBottom: '1px solid #333333',
  },
  bannerContent: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
  },
  bannerSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#999999',
  },
  bannerButton: {
    backgroundColor: '#06FFA5',
    color: '#000000',
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px 16px',
  },
  loading: {
    textAlign: 'center',
    padding: '64px 16px',
    fontSize: '18px',
    color: '#999999',
  },
  error: {
    textAlign: 'center',
    padding: '64px 16px',
    fontSize: '18px',
    color: '#ff4444',
  },
  coverImage: {
    width: '100%',
    maxWidth: '400px',
    aspectRatio: '1',
    borderRadius: '16px',
    margin: '0 auto 32px',
    display: 'block',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '8px',
    textAlign: 'center',
  },
  artist: {
    fontSize: '20px',
    color: '#999999',
    marginBottom: '48px',
    textAlign: 'center',
  },
  tracksContainer: {
    marginTop: '32px',
  },
  tracksHeader: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '24px',
  },
  trackItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    marginBottom: '12px',
    gap: '16px',
  },
  trackNumber: {
    width: '32px',
    textAlign: 'center',
    color: '#999999',
    fontSize: '14px',
  },
  trackTitle: {
    flex: 1,
    fontSize: '16px',
  },
  audioPlayer: {
    height: '32px',
  },
  footer: {
    marginTop: '64px',
    padding: '32px 16px',
    textAlign: 'center',
    borderTop: '1px solid #333333',
  },
  footerText: {
    color: '#999999',
    fontSize: '14px',
  },
};

