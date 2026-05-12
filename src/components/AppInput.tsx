import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

interface Props extends Omit<TextInputProps, 'style'> {
  label?: string;
  required?: boolean;
  helper?: string;
  errorText?: string;
  successText?: string;
  iconLeft?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  prefix?: string;
  onPressRightIcon?: () => void;
  containerClassName?: string;
}

export const AppInput = forwardRef<TextInput, Props>(function AppInput(
  {
    label,
    required,
    helper,
    errorText,
    successText,
    iconLeft,
    iconRight,
    prefix,
    onPressRightIcon,
    containerClassName = '',
    editable = true,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const [focused, setFocused] = useState(false);

  const state: 'default' | 'focused' | 'error' | 'success' | 'disabled' = !editable
    ? 'disabled'
    : errorText
      ? 'error'
      : successText
        ? 'success'
        : focused
          ? 'focused'
          : 'default';

  const borderColor =
    state === 'error'
      ? 'border-danger border-[1.5px]'
      : state === 'success'
        ? 'border-success'
        : state === 'focused'
          ? 'border-brand border-[1.5px]'
          : 'border-line-subtle';

  const bgColor = state === 'disabled' ? 'bg-page-light dark:bg-page-dark/40' : 'bg-surface-light dark:bg-surface-dark';

  return (
    <View className={containerClassName}>
      {label ? (
        <View className="mb-1.5">
          <Text className="text-[11px] uppercase tracking-wider font-medium text-ink-secondary-light dark:text-ink-secondary-dark">
            {label}
            {required ? <Text className="text-danger">{'  *'}</Text> : null}
          </Text>
        </View>
      ) : null}

      <View
        className={[
          'flex-row items-center rounded-lg border min-h-touch-md',
          iconLeft ? 'pl-2' : 'pl-3',
          iconRight ? 'pr-2' : 'pr-3',
          borderColor,
          bgColor,
        ].join(' ')}
      >
        {iconLeft ? <Ionicons name={iconLeft} size={18} color="#64748B" style={{ marginRight: 6 }} /> : null}
        {prefix ? (
          <Text className="text-body mr-1 text-ink-tertiary-light dark:text-ink-tertiary-dark">{prefix}</Text>
        ) : null}
        <TextInput
          ref={ref}
          editable={editable}
          placeholderTextColor="#94A3B8"
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className="flex-1 py-3 text-body text-ink-primary-light dark:text-ink-primary-dark"
          {...rest}
        />
        {iconRight ? (
          <Pressable onPress={onPressRightIcon} hitSlop={10}>
            <Ionicons name={iconRight} size={18} color={state === 'error' ? '#DC2626' : '#64748B'} />
          </Pressable>
        ) : state === 'success' ? (
          <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
        ) : state === 'error' ? (
          <Ionicons name="alert-circle" size={18} color="#DC2626" />
        ) : null}
      </View>

      {errorText ? (
        <View className="flex-row items-center mt-1">
          <Ionicons name="alert-circle" size={12} color="#DC2626" />
          <Text className="text-caption text-danger ml-1">{errorText}</Text>
        </View>
      ) : successText ? (
        <View className="flex-row items-center mt-1">
          <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
          <Text className="text-caption text-success ml-1">{successText}</Text>
        </View>
      ) : helper ? (
        <Text className="text-caption text-ink-tertiary-light dark:text-ink-tertiary-dark mt-1">{helper}</Text>
      ) : null}
    </View>
  );
});
