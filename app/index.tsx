import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const contentTypes = [
  {
    id: 'album',
    title: 'Album',
    gradient: ['#FF006E', '#8338EC'],
    route: '/create-album',
  },
  {
    id: 'mixtape',
    title: 'Mixtape',
    gradient: ['#FFBE0B', '#06FFA5'],
    route: '/create-album', // Will differentiate later
  },
  {
    id: 'film',
    title: 'Film',
    gradient: ['#06FFA5', '#3A86FF'],
    route: '/create-album', // Placeholder
  },
  {
    id: 'podcast',
    title: 'Podcast',
    gradient: ['#8338EC', '#FF006E'],
    route: '/create-album', // Placeholder
  },
  {
    id: 'audiobook',
    title: 'Audiobook',
    gradient: ['#FB5607', '#06FFA5'],
    route: '/create-album', // Placeholder
  },
  {
    id: 'create',
    title: 'Create',
    gradient: ['#FF006E', '#FFBE0B'],
    route: '/create-album', // Placeholder
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const handleCardPress = (route: string, type: string) => {
    if (type === 'album' || type === 'mixtape') {
      router.push('/create-album');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.title}>Creative Freedom</Text>

        {/* Content Type Cards */}
        <View style={styles.cardsContainer}>
          {contentTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              onPress={() => handleCardPress(type.route, type.id)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={type.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <Text style={styles.cardTitle}>{type.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Text */}
        <View style={styles.bottomTextContainer}>
          <Text style={styles.bottomTitle}>
            DIY content creation for Stream Discs
          </Text>
          <Text style={styles.bottomSubtitle}>
            Create music, films, podcasts, or interactive experiences
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingBottom: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 48,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 32,
    gap: 16,
  },
  card: {
    width: cardWidth,
    height: cardWidth * 0.75,
    borderRadius: 16,
    justifyContent: 'flex-end',
    padding: 16,
    marginBottom: 0,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomTextContainer: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
  },
  bottomTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  bottomSubtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});

