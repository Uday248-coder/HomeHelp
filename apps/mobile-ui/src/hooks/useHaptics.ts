import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { haptics } from '../theme/tokens';

type Pattern = keyof typeof haptics;

const THROTTLE_MS = 80;

function isImpact(spec: { kind: string; style?: 1 | 2 | 3; type?: 1 | 2 | 3 }): spec is { kind: 'impact'; style: 1 | 2 | 3 } {
  return spec.kind === 'impact';
}

function isNotification(spec: { kind: string; style?: 1 | 2 | 3; type?: 1 | 2 | 3 }): spec is { kind: 'notification'; type: 1 | 2 | 3 } {
  return spec.kind === 'notification';
}

export function useHaptics() {
  const last = useRef<Record<Pattern, number>>({} as Record<Pattern, number>);

  return useCallback((pattern: Pattern) => {
    if (Platform.OS === 'web') return;
    const now = Date.now();
    if (last.current[pattern] && now - last.current[pattern] < THROTTLE_MS) return;
    last.current[pattern] = now;

    const spec = haptics[pattern] as { kind: string; style?: 1 | 2 | 3; type?: 1 | 2 | 3 };
    try {
      if (isImpact(spec)) {
        const style = spec.style === 1 ? Haptics.ImpactFeedbackStyle.Light
          : spec.style === 2 ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Heavy;
        void Haptics.impactAsync(style);
      } else if (isNotification(spec)) {
        const type = spec.type === 1 ? Haptics.NotificationFeedbackType.Success
          : spec.type === 2 ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Error;
        void Haptics.notificationAsync(type);
      }
    } catch {}
  }, []);
}
