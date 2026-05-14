/**
 * Photo upload service.
 *  - Compresses to ≤ 200 KB JPEG (configurable via env) before upload.
 *  - Sends as multipart/form-data with progress events.
 *  - Returns the server-side photo record on success.
 */
import { env } from '@/src/config/env';
import { apiClient } from '@/src/services/api/client';
import { tokenStorage } from '@/src/services/auth/token-storage';
import type { ApiEnvelope, PhotoUploadResponse } from '@/src/types/api';
import axios from 'axios';
import { File as ExpoFile } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

function fileSizeKb(uri: string): number {
  const f = new ExpoFile(uri);
  return f.exists ? Math.round(f.size / 1024) : 0;
}

export interface CompressionResult {
  uri: string;
  sizeKb: number;
  width: number;
  height: number;
}

export interface UploadOptions {
  surveyId: string;
  slot: 'front' | 'side';
  capturedAt: string;
  onProgress?: (loaded: number, total: number) => void;
  signal?: AbortSignal;
}

export const uploadService = {
  /**
   * Iteratively compress until the result is ≤ targetKb or 4 attempts spent.
   * Strategy: resize first, then drop quality.
   */
  async compress(sourceUri: string): Promise<CompressionResult> {
    const targetKb = env.photoMaxKb;
    const maxDim = env.photoMaxDimension;

    let quality = 0.85;
    let lastResult: ImageManipulator.ImageResult | null = null;

    for (let attempt = 0; attempt < 4; attempt++) {
      const actions: ImageManipulator.Action[] = attempt === 0 ? [{ resize: { width: maxDim } }] : [];
      lastResult = await ImageManipulator.manipulateAsync(attempt === 0 ? sourceUri : lastResult!.uri, actions, {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      const sizeKb = fileSizeKb(lastResult.uri);
      if (sizeKb <= targetKb) {
        return { uri: lastResult.uri, sizeKb, width: lastResult.width, height: lastResult.height };
      }
      quality = Math.max(0.4, quality - 0.15);
    }

    // Even after 4 attempts, return what we have (don't block the user).
    return {
      uri: lastResult!.uri,
      sizeKb: fileSizeKb(lastResult!.uri),
      width: lastResult!.width,
      height: lastResult!.height,
    };
  },

  async uploadPhoto(localUri: string, opts: UploadOptions): Promise<PhotoUploadResponse> {
    const compressed = await this.compress(localUri);

    const form = new FormData();
    form.append('surveyId', opts.surveyId);
    form.append('slot', opts.slot);
    form.append('capturedAt', opts.capturedAt);
    form.append('width', String(compressed.width));
    form.append('height', String(compressed.height));
    form.append('file', {
      uri: compressed.uri,
      type: 'image/jpeg',
      name: `${opts.slot}-${Date.now()}.jpg`,
    } as unknown as Blob);

    const tokens = await tokenStorage.load();
    const headers: Record<string, string> = { 'content-type': 'multipart/form-data' };
    if (tokens) headers.authorization = `Bearer ${tokens.accessToken}`;

    const res = await axios.post<ApiEnvelope<PhotoUploadResponse>>(
      `${apiClient.defaults.baseURL}/uploads/photo`,
      form,
      {
        headers,
        timeout: 60_000,
        signal: opts.signal,
        onUploadProgress: (event) => {
          if (opts.onProgress && event.total) {
            opts.onProgress(event.loaded, event.total);
          }
        },
      },
    );
    return res.data.data;
  },
};
