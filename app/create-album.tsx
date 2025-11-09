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
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { authService } from '../src/services/auth';
import { storageService } from '../src/services/storage';
import { firestoreService } from '../src/services/firestore';

interface AudioFile {
  uri: string;
  name: string;
  size?: number;
}

export default function CreateAlbumScreen() {
  const router = useRouter();
  const [albumTitle, setAlbumTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const pickCoverImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCoverImage(result.assets[0].uri);
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
        coverImage: coverImageUrl,
        tracks: trackUrls,
        createdBy: userId,
      });

      // Navigate to NFC writing screen
      router.push({
        pathname: '/write-nfc',
        params: { contentId: discId },
      });
    } catch (error) {
      console.error('Error creating album:', error);
      Alert.alert('Error', 'Failed to create album. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Album</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>👁</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>💾</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>🔥</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cover Image */}
        <TouchableOpacity style={styles.imageSection} onPress={pickCoverImage}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>+ Add Cover Art</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Album Title Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputHeader}>
            <Text style={styles.dragIcon}>⋮⋮</Text>
            <Text style={styles.inputLabel}>ALBUM TITLE</Text>
          </View>
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
          <View style={styles.inputHeader}>
            <Text style={styles.dragIcon}>⋮⋮</Text>
            <Text style={styles.inputLabel}>ARTIST NAME</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter artist name"
            placeholderTextColor="#666666"
            value={artistName}
            onChangeText={setArtistName}
            editable={!isUploading}
          />
        </View>

        {/* Audio Files Section */}
        <View style={styles.audioSection}>
          <Text style={styles.sectionTitle}>Tap buttons below to add content</Text>

          {audioFiles.map((file, index) => (
            <View key={index} style={styles.audioFileItem}>
              <Text style={styles.audioFileName} numberOfLines={1}>
                {file.name}
              </Text>
              <TouchableOpacity onPress={() => removeAudioFile(index)}>
                <Text style={styles.removeButton}>✕</Text>
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

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={pickCoverImage}>
            <Text style={styles.actionButtonText}>📷</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={pickCoverImage}>
            <Text style={styles.actionButtonText}>🖼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={pickAudioFiles}>
            <Text style={styles.actionButtonText}>🎵</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>T</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>🎤</Text>
          </TouchableOpacity>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, isUploading && styles.createButtonDisabled]}
          onPress={handleCreateAlbum}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Continue to Write NFC</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  imageSection: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 24,
    borderRadius: 8,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#666666',
    fontSize: 16,
  },
  inputContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dragIcon: {
    color: '#666666',
    fontSize: 12,
    marginRight: 8,
  },
  inputLabel: {
    color: '#999999',
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  audioSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#999999',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  audioFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  audioFileName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  removeButton: {
    color: '#FF006E',
    fontSize: 18,
    marginLeft: 8,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#333333',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#06FFA5',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  actionButton: {
    width: 56,
    height: 56,
    backgroundColor: '#1a1a1a',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 24,
  },
  createButton: {
    backgroundColor: '#06FFA5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#333333',
  },
  createButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

