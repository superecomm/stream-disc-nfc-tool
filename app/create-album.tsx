import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../src/services/auth';
import { storageService } from '../src/services/storage';
import { firestoreService } from '../src/services/firestore';
import { AdBanner } from '../src/components/AdBanner';
import { NfcScanModal } from '../src/components/NfcScanModal';
import { BottomNav } from '../src/components/BottomNav';

interface AudioFile {
  uri: string;
  name: string;
  size?: number;
}

export default function CreateAlbumScreen() {
  const router = useRouter();
  const [albumTitle, setAlbumTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isPremium, setIsPremium] = useState(false);
  const [publishToStore, setPublishToStore] = useState(false);
  const [storePrice, setStorePrice] = useState('');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showNfcModal, setShowNfcModal] = useState(false);
  const [createdDiscId, setCreatedDiscId] = useState<string | null>(null);

  React.useEffect(() => {
    async function checkPremiumStatus() {
      const premium = await authService.isPremium();
      setIsPremium(premium);
    }
    checkPremiumStatus();
  }, []);

  // Helper function to get approximate file size
  const getApproximateFileSize = async (uri: string): Promise<number> => {
    try {
      // For images, estimate based on URI (actual size would require native module)
      // Rough estimate: assume average compressed image is 1-2MB
      return 1500000; // 1.5MB estimate
    } catch (error) {
      console.error('Error getting file size:', error);
      return 1000000; // 1MB default estimate
    }
  };

  const checkStorageAvailability = async (fileSize: number): Promise<boolean> => {
    const userId = authService.getCurrentUserId();
    if (!userId) {
      // Anonymous users can proceed (no limits enforced)
      return true;
    }

    const hasSpace = await firestoreService.hasAvailableStorage(userId, fileSize);
    if (!hasSpace) {
      Alert.alert(
        'Storage Limit Reached',
        'You have reached your storage limit. Please upgrade your plan or delete some discs to free up space.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/subscription') },
        ]
      );
      return false;
    }
    return true;
  };

  const pickCoverImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const estimatedSize = await getApproximateFileSize(imageUri);
        
        // Check storage availability
        const hasSpace = await checkStorageAvailability(estimatedSize);
        if (!hasSpace) {
          return;
        }
        
        setCoverImage(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickAudioFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        // Calculate total size of new files
        const totalNewSize = result.assets.reduce((sum, asset) => sum + (asset.size || 0), 0);
        
        // Check storage availability
        const hasSpace = await checkStorageAvailability(totalNewSize);
        if (!hasSpace) {
          return;
        }
        
        const newFiles = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
        }));
        setAudioFiles([...audioFiles, ...newFiles]);
      }
    } catch (error) {
      console.error('Error picking audio files:', error);
      Alert.alert('Error', 'Failed to pick audio files');
    }
  };

  const removeAudioFile = (index: number) => {
    setAudioFiles(audioFiles.filter((_, i) => i !== index));
  };

  const handleVideoPress = () => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Video support is available for premium users. Upgrade to unlock this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/') }
        ]
      );
    } else {
      Alert.alert('Coming Soon', 'Video support coming soon!');
    }
  };

  const handleCreateAlbum = async () => {
    // Validation
    if (!albumTitle.trim()) {
      Alert.alert('Error', 'Please enter an album title');
      return;
    }
    if (!artistName.trim()) {
      Alert.alert('Error', 'Please enter an artist name');
      return;
    }
    if (!coverImage) {
      Alert.alert('Error', 'Please select a cover image');
      return;
    }
    if (audioFiles.length === 0) {
      Alert.alert('Error', 'Please add at least one audio track');
      return;
    }

    setIsUploading(true);

    try {
      const userId = authService.getCurrentUserId() || 'anonymous';

      // Upload cover image
      setUploadProgress({ coverImage: 0 });
      const coverImageUrl = await storageService.uploadImage(
        coverImage,
        userId,
        'cover.jpg',
        (progress) => {
          setUploadProgress((prev) => ({ ...prev, coverImage: progress }));
        }
      );

      // Upload audio files
      const trackUrls = await Promise.all(
        audioFiles.map(async (file, index) => {
          const url = await storageService.uploadAudio(
            file.uri,
            userId,
            file.name,
            (progress) => {
              setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
            }
          );

          return {
            title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            fileUrl: url,
            duration: 0, // TODO: Get actual duration
            order: index,
          };
        })
      );

      // Create disc document in Firestore
      const discId = await firestoreService.createDisc({
        type: 'album',
        title: albumTitle,
        artist: artistName,
        description: description,
        coverImage: coverImageUrl,
        tracks: trackUrls,
        createdBy: userId,
        publishedToStore: publishToStore,
        storePrice: publishToStore ? parseFloat(storePrice) || 0 : null,
        physicalDiscAvailable: publishToStore,
      });

      // Update storage usage for the user
      if (userId !== 'anonymous') {
        const coverImageSize = await getApproximateFileSize(coverImage);
        const audioFilesSize = audioFiles.reduce((sum, file) => sum + (file.size || 0), 0);
        const totalSize = coverImageSize + audioFilesSize;
        
        await firestoreService.updateStorageUsage(userId, totalSize);
      }

      // Store the disc ID and show NFC modal
      setCreatedDiscId(discId);
      setShowNfcModal(true);
    } catch (error) {
      console.error('Error creating album:', error);
      Alert.alert('Error', 'Failed to create album. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNfcScanComplete = () => {
    setShowNfcModal(false);
    if (createdDiscId) {
      // Navigate to write-nfc screen with the disc ID
      router.push({
        pathname: '/write-nfc',
        params: { contentId: createdDiscId },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Album</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="save-outline" size={20} color="#9A9A9A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cover Image */}
        <TouchableOpacity style={styles.imageSection} onPress={pickCoverImage}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={48} color="#9A9A9A" />
              <Text style={styles.imagePlaceholderText}>Add Cover Art</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Album Title Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>ALBUM TITLE</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter album title"
            placeholderTextColor="#666666"
            value={albumTitle}
            onChangeText={setAlbumTitle}
            editable={!isUploading}
          />
        </View>

        {/* Artist Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>ARTIST NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter artist name"
            placeholderTextColor="#666666"
            value={artistName}
            onChangeText={setArtistName}
            editable={!isUploading}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add album description, story, or notes..."
            placeholderTextColor="#666666"
            value={description}
            onChangeText={setDescription}
            editable={!isUploading}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Audio Files Section */}
        {audioFiles.length > 0 && (
          <View style={styles.audioSection}>
            <Text style={styles.sectionTitle}>Tracks ({audioFiles.length})</Text>
            {audioFiles.map((file, index) => (
              <View key={index} style={styles.audioFileItem}>
                <View style={styles.audioFileInfo}>
                  <Ionicons name="musical-note" size={16} color="#9A9A9A" />
                  <Text style={styles.audioFileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeAudioFile(index)}>
                  <Ionicons name="close-circle" size={20} color="#9A9A9A" />
                </TouchableOpacity>
                {uploadProgress[file.name] !== undefined && (
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${uploadProgress[file.name]}%` },
                      ]}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={pickAudioFiles}
            activeOpacity={0.5}
          >
            <Ionicons name="musical-notes-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Tracks</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, !isPremium && styles.actionButtonLocked]} 
            onPress={handleVideoPress}
            activeOpacity={0.5}
          >
            <View style={styles.buttonIconContainer}>
              <Ionicons name="videocam-outline" size={18} color={isPremium ? "#FFFFFF" : "#9A9A9A"} />
              {!isPremium && (
                <View style={styles.lockIconBadge}>
                  <Ionicons name="lock-closed" size={10} color="#FFFFFF" />
                </View>
              )}
            </View>
            <Text style={[styles.actionButtonText, !isPremium && styles.actionButtonTextLocked]}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={pickCoverImage}
            activeOpacity={0.5}
          >
            <Ionicons name="image-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => Alert.alert('Add Text', 'Use the Description field above to add stories, poems, track notes, or any text content.')}
            activeOpacity={0.5}
          >
            <Ionicons name="text-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Text</Text>
          </TouchableOpacity>
        </View>

        {/* Publish to Store Toggle (Premium Only) */}
        {isPremium && (
          <TouchableOpacity
            style={styles.publishToggle}
            onPress={() => {
              if (!publishToStore) {
                setShowPublishModal(true);
              } else {
                setPublishToStore(false);
                setStorePrice('');
              }
            }}
            activeOpacity={0.5}
          >
            <View style={styles.publishContent}>
              <Ionicons
                name={publishToStore ? 'checkbox' : 'square-outline'}
                size={24}
                color={publishToStore ? '#06FFA5' : '#9A9A9A'}
              />
              <View style={styles.publishTextContainer}>
                <Text style={styles.publishTitle}>Publish to Stream Disc Store</Text>
                <Text style={styles.publishSubtitle}>
                  {publishToStore
                    ? `Listed for ${storePrice ? `$${storePrice}` : 'Free'}`
                    : 'Make your disc available for purchase'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Ad Banner */}
        <AdBanner />

        {/* Save Draft Button */}
        <TouchableOpacity
          style={styles.saveDraftButton}
          onPress={() => Alert.alert('Save Draft', 'Draft saved successfully!')}
          activeOpacity={0.5}
        >
          <Ionicons name="bookmark-outline" size={18} color="#9A9A9A" />
          <Text style={styles.saveDraftText}>Save as Draft</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Publish Modal */}
      <Modal
        visible={showPublishModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPublishModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Publish to Store</Text>
            <Text style={styles.modalDescription}>
              Set a price for physical Stream Discs. Digital content will always be accessible to buyers.
            </Text>

            <View style={styles.modalInputContainer}>
              <Text style={styles.modalInputLabel}>Price (USD)</Text>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0.00"
                  placeholderTextColor="#666666"
                  keyboardType="decimal-pad"
                  value={storePrice}
                  onChangeText={setStorePrice}
                />
              </View>
              <Text style={styles.modalHint}>Leave blank or 0 for free physical discs</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowPublishModal(false);
                  setStorePrice('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={() => {
                  setPublishToStore(true);
                  setShowPublishModal(false);
                }}
              >
                <Text style={styles.modalConfirmText}>Publish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* NFC Scan Modal */}
      <NfcScanModal
        visible={showNfcModal}
        onClose={() => setShowNfcModal(false)}
        onScan={handleNfcScanComplete}
        mode="write"
      />

      {/* Bottom Navigation */}
      <BottomNav
        onBurnPress={handleCreateAlbum}
        isScanning={showNfcModal || isUploading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSection: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#9A9A9A',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '400',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#9A9A9A',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    fontWeight: '400',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  audioSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  audioFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  audioFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  audioFileName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#06FFA5',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  actionButtonLocked: {
    opacity: 0.5,
  },
  actionButtonTextLocked: {
    color: '#9A9A9A',
  },
  buttonIconContainer: {
    position: 'relative',
  },
  lockIconBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveDraftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  saveDraftText: {
    color: '#9A9A9A',
    fontSize: 14,
    fontWeight: '500',
  },
  publishToggle: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  publishContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  publishTextContainer: {
    flex: 1,
  },
  publishTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  publishSubtitle: {
    fontSize: 12,
    color: '#9A9A9A',
    fontWeight: '400',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  modalDescription: {
    fontSize: 14,
    color: '#9A9A9A',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalInputContainer: {
    marginBottom: 24,
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9A9A9A',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
  },
  dollarSign: {
    fontSize: 18,
    fontWeight: '600',
    color: '#06FFA5',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
    fontWeight: '400',
  },
  modalHint: {
    fontSize: 11,
    color: '#666666',
    marginTop: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9A9A9A',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#06FFA5',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
});

