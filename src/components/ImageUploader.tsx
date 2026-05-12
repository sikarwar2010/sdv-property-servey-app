import { useTheme } from '@/src/theme';
import type { PhotoRef } from '@/src/types';
import { makeId } from '@/src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, Pressable, Text, View } from 'react-native';

interface SlotConfig {
  slot: PhotoRef['slot'];
  label: string;
  required?: boolean;
}

interface Props {
  slots: SlotConfig[];
  photos: PhotoRef[];
  onAdd: (photo: PhotoRef) => void;
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
}

export function ImageUploader({ slots, photos, onAdd, onRemove, onRetry }: Props) {
  const handlePick = async (slot: PhotoRef['slot']) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access to attach images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    onAdd({
      id: makeId('photo'),
      localUri: asset.uri,
      slot,
      sizeKb: Math.round((asset.fileSize ?? 0) / 1024),
      uploadStatus: 'idle',
    });
  };

  const findFor = (slot: PhotoRef['slot']) => photos.find((p) => p.slot === slot);

  return (
    <View className="flex-row flex-wrap -mx-1">
      {slots.map((s) => {
        const photo = findFor(s.slot);
        return (
          <View key={s.slot} className="w-1/2 px-1 mb-2">
            <SlotCard
              config={s}
              photo={photo}
              onPick={() => handlePick(s.slot)}
              onRemove={onRemove}
              onRetry={onRetry}
            />
          </View>
        );
      })}
    </View>
  );
}

function SlotCard({
  config,
  photo,
  onPick,
  onRemove,
  onRetry,
}: {
  config: SlotConfig;
  photo: PhotoRef | undefined;
  onPick: () => void;
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
}) {
  const { radius } = useTheme();

  if (!photo) {
    return (
      <Pressable
        onPress={onPick}
        className="aspect-square rounded-xl border-[1.5px] border-dashed border-line-subtle items-center justify-center bg-page-light dark:bg-page-dark/40"
      >
        <View className="w-9 h-9 rounded-full bg-brand-soft items-center justify-center">
          <Ionicons name="camera" size={18} color="#003B8E" />
        </View>
        <Text className="text-caption text-ink-primary-light dark:text-ink-primary-dark font-medium mt-1.5">
          {config.label}
        </Text>
        {config.required ? (
          <Text className="text-caption text-danger mt-0.5">Required</Text>
        ) : (
          <Text className="text-caption text-ink-disabled-light mt-0.5">Optional</Text>
        )}
      </Pressable>
    );
  }

  return (
    <View
      className="aspect-square rounded-xl overflow-hidden border border-line-subtle"
      style={{ borderRadius: radius.lg }}
    >
      <Image source={{ uri: photo.localUri }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
      <View className="absolute top-1 right-1 flex-row gap-1">
        {photo.uploadStatus === 'failed' && onRetry ? (
          <Pressable
            onPress={() => onRetry(photo.id)}
            className="w-7 h-7 rounded-full bg-danger items-center justify-center"
          >
            <Ionicons name="refresh" size={14} color="#FFFFFF" />
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => onRemove(photo.id)}
          className="w-7 h-7 rounded-full bg-black/60 items-center justify-center"
        >
          <Ionicons name="close" size={14} color="#FFFFFF" />
        </Pressable>
      </View>
      <View className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-black/55 flex-row items-center justify-between">
        <Text className="text-caption font-medium text-white">{config.label}</Text>
        {photo.uploadStatus === 'uploading' ? (
          <Text className="text-caption text-white">{photo.uploadProgress ?? 0}%</Text>
        ) : photo.uploadStatus === 'done' ? (
          <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
        ) : photo.uploadStatus === 'failed' ? (
          <Ionicons name="alert-circle" size={12} color="#DC2626" />
        ) : (
          <Text className="text-caption text-white/80">{photo.sizeKb} KB</Text>
        )}
      </View>
    </View>
  );
}
