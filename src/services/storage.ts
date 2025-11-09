import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from '../config/firebase';
import { UploadProgress } from '../types';

class StorageService {
  /**
   * Upload a file to Firebase Storage with progress tracking
   */
  async uploadFile(
    uri: string,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // Fetch the file as a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create a storage reference
      const storageRef = ref(storage, path);

      // Upload the file
      const uploadTask = uploadBytesResumable(storageRef, blob);

      // Return a promise that resolves with the download URL
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            // Calculate progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            // Upload completed successfully
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Upload an image file
   */
  async uploadImage(
    uri: string,
    userId: string,
    fileName: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const path = `images/${userId}/${Date.now()}_${fileName}`;
    return this.uploadFile(uri, path, onProgress);
  }

  /**
   * Upload an audio file
   */
  async uploadAudio(
    uri: string,
    userId: string,
    fileName: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const path = `audio/${userId}/${Date.now()}_${fileName}`;
    return this.uploadFile(uri, path, onProgress);
  }

  /**
   * Upload multiple files with progress tracking for each
   */
  async uploadMultipleFiles(
    files: Array<{ uri: string; name: string; type: 'image' | 'audio' }>,
    userId: string,
    onProgress?: (fileName: string, progress: number) => void
  ): Promise<Array<{ name: string; url: string }>> {
    const uploadPromises = files.map(async (file) => {
      const url = file.type === 'image'
        ? await this.uploadImage(file.uri, userId, file.name, (progress) => {
            onProgress?.(file.name, progress);
          })
        : await this.uploadAudio(file.uri, userId, file.name, (progress) => {
            onProgress?.(file.name, progress);
          });

      return { name: file.name, url };
    });

    return Promise.all(uploadPromises);
  }
}

export const storageService = new StorageService();

