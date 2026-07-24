import * as Haptics from 'expo-haptics';

export function useHaptics() {
  function impact(style: 'light' | 'medium' | 'heavy' = 'light') {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle[style.charAt(0).toUpperCase() + style.slice(1)]); } catch {}
  }
  function notification(type: 'success' | 'warning' | 'error' = 'success') {
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType[type.charAt(0).toUpperCase() + type.slice(1)]); } catch {}
  }
  return { impact, notification };
}