/**
 * Camera + gallery photo capture with auto-compression and persistence.
 *
 * Workflow:
 *   1. Permission check (camera or media library).
 *   2. Launch picker.
 *   3. Compress via uploadService.compress (≤ 200 KB JPEG, 1600px max).
 *   4. Insert Photo row in WatermelonDB with `upload_state = 'pending'`.
 *   5. Kick the upload queue (it will batch and retry independently).
 */
import { useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadService } from '@/src/services/uploads/upload.service';
import { photoRepo } from '@/src/database/survey.repo';
import { uploadQueue } from '@/src/sync/upload-queue';
import type { Photo, PhotoSlot } from '@/src/database/models';

interface UsePhotoCaptureResult {
  busy: boolean;
  error: string | null;
  captureFromCamera: (surveyId: string, slot: PhotoSlot) => Promise<Photo | null>;
  pickFromGallery: (surveyId: string, slot: PhotoSlot) => Promise<Photo | null>;
}

export function usePhotoCapture(): UsePhotoCaptureResult {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResult = async (
    surveyId: string,
    slot: PhotoSlot,
    result: ImagePicker.ImagePickerResult,
  ): Promise<Photo | null> => {
    if (result.canceled || !result.assets[0]) return null;
    const asset = result.assets[0];
    setBusy(true);
    try {
      const compressed = await uploadService.compress(asset.uri);
      const photo = await photoRepo.add({
        surveyId,
        slot,
        localUri: compressed.uri,
        sizeKb: compressed.sizeKb,
        width: compressed.width,
        height: compressed.height,
        capturedAt: new Date().toISOString(),
      });
      void uploadQueue.run();
      setError(null);
      return photo;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Photo capture failed';
      setError(message);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const captureFromCamera = async (surveyId: string, slot: PhotoSlot) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      promptOpenSettings('camera');
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      exif: false,
    });
    return handleResult(surveyId, slot, result);
  };

  const pickFromGallery = async (surveyId: string, slot: PhotoSlot) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      promptOpenSettings('photo library');
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      exif: false,
    });
    return handleResult(surveyId, slot, result);
  };

  return { busy, error, captureFromCamera, pickFromGallery };
}

function promptOpenSettings(kind: 'camera' | 'photo library') {
  Alert.alert(
    `${kind === 'camera' ? 'Camera' : 'Photos'} access needed`,
    `Grant ${kind} access to add survey photos.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open settings',
        onPress: () => (Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings()),
      },
    ],
  );
}
