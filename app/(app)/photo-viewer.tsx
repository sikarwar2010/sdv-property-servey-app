import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Sample local images for demo; in real app, photos come from store
const DEMO_PHOTOS = [
  {
    id: 'p1',
    slot: 'front' as const,
    uri: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    sizeKb: 122,
  },
  {
    id: 'p2',
    slot: 'side' as const,
    uri: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
    sizeKb: 118,
  },
];

export default function PhotoViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ index?: string }>();
  const [index, setIndex] = useState(Number(params.index ?? 0) || 0);
  const current = DEMO_PHOTOS[index];

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0 z-10">
        <View className="flex-row items-center justify-between px-4 py-2">
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-black/50 items-center justify-center"
            hitSlop={8}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </Pressable>
          <View className="bg-black/50 px-3 py-1 rounded-full">
            <Text className="text-[12px] font-medium text-white">
              {index + 1} of {DEMO_PHOTOS.length}
            </Text>
          </View>
          <Pressable className="w-9 h-9 rounded-full bg-black/50 items-center justify-center" hitSlop={8}>
            <Ionicons name="share-outline" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </SafeAreaView>

      <FlatList
        data={DEMO_PHOTOS}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        initialScrollIndex={index}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1 items-center justify-center">
            <Image source={{ uri: item.uri }} style={{ width, height: width }} resizeMode="contain" />
          </View>
        )}
      />

      <SafeAreaView edges={['bottom']} className="absolute bottom-0 left-0 right-0">
        <View className="px-4 py-3 bg-black/50 backdrop-blur">
          <Text className="text-[13px] font-medium text-white capitalize">{current?.slot ?? '—'} view</Text>
          <Text className="text-caption text-white/70 mt-0.5">{current?.sizeKb ?? 0} KB · JPEG</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
