import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function BlankDiscScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Disc Icon */}
        <View style={styles.discIcon}>
          <View style={styles.discOuter}>
            <View style={styles.discInner} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Blank Stream Disc</Text>

        {/* Message */}
        <Text style={styles.message}>
          This is a blank stream disc. Use the stream disc nfc tool to burn
          something cool on the disc and share with the world.
        </Text>

        {/* Get Started Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  discIcon: {
    marginBottom: 48,
  },
  discOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333333',
  },
  discInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#333333',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  button: {
    width: '100%',
    backgroundColor: '#06FFA5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
});

