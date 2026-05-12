import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props extends ViewProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  showHandle?: boolean;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, title, showHandle = true, children }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <SafeAreaView edges={['bottom']}>
          <View className="bg-surface-light dark:bg-surface-dark rounded-t-2xl pb-3">
            {showHandle ? (
              <View className="items-center pt-2.5 pb-1">
                <View className="w-10 h-1 bg-line-subtle rounded-full" />
              </View>
            ) : null}
            {title ? (
              <View className="flex-row items-center justify-between px-4 pb-3 border-b border-line-subtle">
                <Text className="text-h3 font-medium text-ink-primary-light dark:text-ink-primary-dark">{title}</Text>
                <Pressable onPress={onClose} hitSlop={12}>
                  <Ionicons name="close" size={22} color="#475569" />
                </Pressable>
              </View>
            ) : null}
            {children}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
