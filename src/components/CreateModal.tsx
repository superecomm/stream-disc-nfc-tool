import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface CreateModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreateModal({ visible, onClose }: CreateModalProps) {
  const router = useRouter();
  const [activeStudioMode, setActiveStudioMode] = useState(false);

  const contentTypes = [
    {
      id: 'album',
      title: 'Album',
      icon: 'disc-outline',
      color: '#06FFA5',
      description: 'Create a full album',
    },
    {
      id: 'mixtape',
      title: 'Mixtape',
      icon: 'musical-notes-outline',
      color: '#3A86FF',
      description: 'Curate a mixtape',
    },
    {
      id: 'playlist',
      title: 'Playlist',
      icon: 'list-outline',
      color: '#FF6B9D',
      description: 'Build a playlist',
    },
    {
      id: 'video',
      title: 'Video Album',
      icon: 'videocam-outline',
      color: '#FFD60A',
      description: 'Video collection',
    },
    {
      id: 'photo',
      title: 'Photo Album',
      icon: 'images-outline',
      color: '#FF9F0A',
      description: 'Photo memories',
    },
    {
      id: 'podcast',
      title: 'Podcast',
      icon: 'mic-outline',
      color: '#BF5AF2',
      description: 'Audio podcast',
    },
  ];

  const handleContentTypePress = (contentType: string) => {
    // Close modal and navigate to create screen for that type
    onClose();
    if (contentType === 'album') {
      router.push('/create-album' as any);
    } else {
      // For other types, show coming soon or navigate to respective screens
      console.log('Creating:', contentType);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#000000', '#0a0a0a', '#000000']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Studio Mode Indicator */}
          {activeStudioMode && (
            <View style={styles.studioModeIndicator}>
              <View style={styles.fireIconContainer}>
                <Ionicons name="flame" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.studioModeText}>Studio Mode Active</Text>
            </View>
          )}

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Create and burn your content to Stream Discs
            </Text>

            {/* Content Type Cards */}
            <View style={styles.cardsContainer}>
              {contentTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={styles.card}
                  onPress={() => handleContentTypePress(type.id)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                    style={styles.cardGradient}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: type.color + '20' }]}>
                      <Ionicons name={type.icon as any} size={32} color={type.color} />
                    </View>
                    <Text style={styles.cardTitle}>{type.title}</Text>
                    <Text style={styles.cardDescription}>{type.description}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
              <Ionicons name="information-circle-outline" size={24} color="#06FFA5" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Create on Stream Disc Studio</Text>
                <Text style={styles.infoDescription}>
                  Build your content, burn to NFC discs, and share with the world. Your creations
                  will be available on the Stream Disc Player app.
                </Text>
              </View>
            </View>

            {/* Features List */}
            <View style={styles.featuresSection}>
              <Text style={styles.featuresTitle}>Studio Features</Text>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#06FFA5" />
                <Text style={styles.featureText}>Professional content creation tools</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#06FFA5" />
                <Text style={styles.featureText}>NFC programming & verification</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#06FFA5" />
                <Text style={styles.featureText}>Cloud storage & backup</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#06FFA5" />
                <Text style={styles.featureText}>Instant publishing to player app</Text>
              </View>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 44,
  },
  studioModeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 59, 92, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 59, 92, 0.2)',
  },
  fireIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B5C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  studioModeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
    lineHeight: 24,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  card: {
    width: (width - 36) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardDescription: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
  },
  infoSection: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 32,
    padding: 16,
    backgroundColor: 'rgba(6, 255, 165, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 255, 165, 0.2)',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    color: '#06FFA5',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  featuresSection: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  featuresTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 12,
  },
  bottomSpacer: {
    height: 40,
  },
});

