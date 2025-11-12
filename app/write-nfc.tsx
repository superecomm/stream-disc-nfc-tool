import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { nfcService } from '../src/services/nfc';
import { firestoreService } from '../src/services/firestore';
import { NfcWriteModal } from '../src/components/NfcWriteModal';

export default function WriteNfcScreen() {
  const router = useRouter();
  const { contentId } = useLocalSearchParams<{ contentId: string }>();
  const [showModal, setShowModal] = useState(true);
  const [albumData, setAlbumData] = useState<any>(null);

  useEffect(() => {
    loadAlbumData();
    return () => {
      nfcService.cancelOperation();
    };
  }, []);

  const loadAlbumData = async () => {
    if (!contentId) return;
    try {
      // Load album data from Firestore to get cover image
      const album = await firestoreService.getAlbum(contentId);
      setAlbumData(album);
    } catch (error) {
      console.error('Error loading album:', error);
    }
  };

  const handleWriteComplete = (url: string) => {
    // Navigate to success screen
    router.push({
      pathname: '/success',
      params: { contentId, url },
    });
  };

  const handleClose = () => {
    setShowModal(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <NfcWriteModal
        visible={showModal}
        onClose={handleClose}
        contentId={contentId || ''}
        albumCoverUrl={albumData?.coverImage}
        onWriteComplete={handleWriteComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
