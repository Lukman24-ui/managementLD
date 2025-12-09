import { useState, useEffect, useCallback } from 'react';
import { useHabits } from './useHabits';
import { toast } from 'sonner';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const { habits } = useHabits();

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('Browser tidak mendukung notifikasi');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Notifikasi diaktifkan!');
        return true;
      } else {
        toast.error('Izin notifikasi ditolak');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback((title: string, options?: { body?: string; tag?: string }) => {
    if (permission !== 'granted') return;

    try {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [permission]);

  const scheduleHabitReminder = useCallback((habitTitle: string, hour: number, minute: number) => {
    if (permission !== 'granted') return null;

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      sendNotification(`Pengingat Kebiasaan: ${habitTitle}`, {
        body: `Jangan lupa untuk menyelesaikan kebiasaan "${habitTitle}" hari ini!`,
        tag: `habit-${habitTitle}`,
      });
    }, delay);

    return timeoutId;
  }, [permission, sendNotification]);

  const sendHabitReminder = useCallback(() => {
    if (permission !== 'granted' || habits.length === 0) return;

    const incompleteHabits = habits.filter(h => h.title);
    if (incompleteHabits.length > 0) {
      sendNotification('Pengingat Kebiasaan Harian', {
        body: `Kamu punya ${incompleteHabits.length} kebiasaan yang perlu diselesaikan hari ini!`,
        tag: 'daily-habits',
      });
    }
  }, [permission, habits, sendNotification]);

  const testNotification = useCallback(() => {
    if (permission !== 'granted') {
      toast.error('Aktifkan notifikasi terlebih dahulu');
      return;
    }
    
    sendNotification('Test Notifikasi CoupleSync', {
      body: 'Notifikasi berhasil! Kamu akan menerima pengingat kebiasaan.',
      tag: 'test',
    });
  }, [permission, sendNotification]);

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    scheduleHabitReminder,
    sendHabitReminder,
    testNotification,
  };
};
