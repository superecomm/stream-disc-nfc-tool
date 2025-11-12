import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';

interface StreamDiscLogoProps {
  /** Size of the logo (width and height) */
  size?: number;
  /** Theme: 'light' (black logo) or 'dark' (white logo) */
  theme?: 'light' | 'dark';
  /** Additional styles for the container */
  style?: ViewStyle;
}

/**
 * Stream Disc Logo Component
 * 
 * Displays the official Stream Disc logo with consistent branding
 * 
 * @param size - Logo dimensions (default: 100)
 * @param theme - 'light' for black logo on light bg, 'dark' for white logo on dark bg
 * @param style - Additional custom styles
 */
export const StreamDiscLogo: React.FC<StreamDiscLogoProps> = ({
  size = 100,
  theme = 'dark',
  style,
}) => {
  // Select the appropriate logo based on theme
  const logoSource = theme === 'dark'
    ? require('../../assets/images/stream-disc-logo-white.png')
    : require('../../assets/images/stream-disc-logo-black.png');

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={logoSource}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});

