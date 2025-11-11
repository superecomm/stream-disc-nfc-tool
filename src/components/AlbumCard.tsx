import React from 'react';
import { Text, Image, StyleSheet, TouchableOpacity, Dimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Album } from '../mocks/albums';

type AlbumCardProps = {
  album: Partial<Album>;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  showBuyButton?: boolean;
};

const { width } = Dimensions.get('window');

export default function AlbumCard({ album, onPress, size = 'medium', showBuyButton = false }: AlbumCardProps) {
  const cardWidth = size === 'small' ? width * 0.35 : size === 'large' ? width * 0.7 : width * 0.42;

  const handleBuyPress = (e: any) => {
    e.stopPropagation();
    console.log('Adding to cart:', album.title);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: album.coverUrl }} style={[styles.cover, { width: cardWidth, height: cardWidth }]} />
      <Text style={styles.title} numberOfLines={1}>
        {album.title}
      </Text>
      <Text style={styles.artist} numberOfLines={1}>
        {album.artist}
      </Text>
      {showBuyButton && album.price && (
        <TouchableOpacity
          style={styles.buySection}
          onPress={handleBuyPress}
          activeOpacity={0.7}
        >
          <View style={styles.buyContent}>
            <View style={styles.buyRow}>
              <Ionicons name="cart-outline" size={14} color="#FF3B5C" />
              <Text style={styles.price}>${album.price.toFixed(2)}</Text>
            </View>
            <Text style={styles.buyLabel}>Buy on Stream Disc</Text>
          </View>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  cover: {
    borderRadius: 8,
    backgroundColor: '#1C1C1E',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  artist: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 2,
  },
  buySection: {
    marginTop: 8,
  },
  buyContent: {
    gap: 2,
  },
  buyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  buyLabel: {
    color: '#8E8E93',
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginTop: 1,
  },
});

