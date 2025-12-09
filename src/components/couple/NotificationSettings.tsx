import { Bell, BellOff, BellRing, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/hooks/useNotifications';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ReminderTime {
  hour: number;
  minute: number;
  enabled: boolean;
}

const NotificationSettings = () => {
  const { permission, isSupported, requestPermission, testNotification, sendHabitReminder } = useNotifications();
  const [morningReminder, setMorningReminder] = useState<ReminderTime>({ hour: 8, minute: 0, enabled: false });
  const [eveningReminder, setEveningReminder] = useState<ReminderTime>({ hour: 20, minute: 0, enabled: false });

  // Load saved settings
  useEffect(() => {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      setMorningReminder(settings.morning || { hour: 8, minute: 0, enabled: false });
      setEveningReminder(settings.evening || { hour: 20, minute: 0, enabled: false });
    }
  }, []);

  // Save settings and schedule notifications
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify({
      morning: morningReminder,
      evening: eveningReminder,
    }));

    // Schedule reminders if enabled
    if (permission === 'granted') {
      if (morningReminder.enabled) {
        scheduleReminder(morningReminder.hour, morningReminder.minute, 'morning');
      }
      if (eveningReminder.enabled) {
        scheduleReminder(eveningReminder.hour, eveningReminder.minute, 'evening');
      }
    }
  }, [morningReminder, eveningReminder, permission]);

  const scheduleReminder = (hour: number, minute: number, type: string) => {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();
    
    // Clear existing timeout if any
    const existingTimeout = localStorage.getItem(`reminder_${type}`);
    if (existingTimeout) {
      clearTimeout(Number(existingTimeout));
    }

    const timeoutId = setTimeout(() => {
      sendHabitReminder();
      // Reschedule for next day
      scheduleReminder(hour, minute, type);
    }, delay);

    localStorage.setItem(`reminder_${type}`, String(timeoutId));
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      setMorningReminder(prev => ({ ...prev, enabled: true }));
      setEveningReminder(prev => ({ ...prev, enabled: true }));
    }
  };

  if (!isSupported) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <BellOff className="w-5 h-5" />
            <span>Browser tidak mendukung notifikasi</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Pengingat Notifikasi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission !== 'granted' ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Aktifkan notifikasi untuk menerima pengingat kebiasaan harian
            </p>
            <Button onClick={handleEnableNotifications} className="w-full">
              <BellRing className="w-4 h-4 mr-2" />
              Aktifkan Notifikasi
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary" />
                <div>
                  <Label className="text-sm font-medium">Pengingat Pagi</Label>
                  <p className="text-xs text-muted-foreground">08:00</p>
                </div>
              </div>
              <Switch
                checked={morningReminder.enabled}
                onCheckedChange={(checked) => setMorningReminder(prev => ({ ...prev, enabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary" />
                <div>
                  <Label className="text-sm font-medium">Pengingat Malam</Label>
                  <p className="text-xs text-muted-foreground">20:00</p>
                </div>
              </div>
              <Switch
                checked={eveningReminder.enabled}
                onCheckedChange={(checked) => setEveningReminder(prev => ({ ...prev, enabled: checked }))}
              />
            </div>

            <Button variant="outline" onClick={testNotification} className="w-full">
              <Bell className="w-4 h-4 mr-2" />
              Test Notifikasi
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
