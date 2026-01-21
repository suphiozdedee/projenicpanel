import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

// Simple beep sound
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export function useNotificationSound() {
  const { user } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_settings')
        .eq('id', user.id)
        .single();

      if (data?.notification_settings) {
        setSoundEnabled(data.notification_settings.sound_enabled !== false);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const playNotificationSound = useCallback(() => {
    if (soundEnabled) {
      const audio = new Audio(NOTIFICATION_SOUND_URL);
      audio.volume = 0.5;
      audio.play().catch(err => console.error("Audio play failed", err));
    }
  }, [soundEnabled]);

  const toggleSound = async (enabled) => {
    setSoundEnabled(enabled);
    if (user) {
        await supabase
            .from('profiles')
            .update({
                notification_settings: { sound_enabled: enabled }
            })
            .eq('id', user.id);
    }
  };

  return { playNotificationSound, soundEnabled, toggleSound };
}