import { Image, ImageStyle, StyleSheet, View, ViewStyle, Text } from 'react-native';
import { lightColors } from '../theme/tokens';

export interface AvatarProps {
  name?: string;
  uri?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  colors?: typeof lightColors;
  style?: ViewStyle;
}

const dims = { sm: 32, md: 44, lg: 64, xl: 80 };
const fontSize = { sm: 13, md: 17, lg: 22, xl: 30 };

export function Avatar({ name, uri, size = 'md', colors = lightColors, style }: AvatarProps) {
  const dim = dims[size];
  const initial = (name || '').trim().charAt(0).toUpperCase() || '?';
  return (
    <View
      style={[
        styles.base,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: colors.primary,
        },
        style,
      ]}
      accessibilityLabel={uri ? undefined : `Avatar for ${name || 'user'}`}
    >
      {uri ? (
        <Image source={{ uri }} alt={name} style={styles.image} resizeMode="cover" accessible accessibilityLabel={name ? `Avatar for ${name}` : undefined} />
      ) : (
        <Text style={[styles.initial, { fontSize: fontSize[size], color: colors.textOnAccent }]}>
          {initial}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  } as ViewStyle,
  image: { width: '100%', height: '100%' } as ImageStyle,
  initial: {
    fontWeight: '600',
  } as any,
});
