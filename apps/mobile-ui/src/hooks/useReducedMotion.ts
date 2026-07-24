import { useWindowDimensions } from 'react-native';

export function useReducedMotion() {
  const { fontScale } = useWindowDimensions();
  return fontScale > 1.3;
}