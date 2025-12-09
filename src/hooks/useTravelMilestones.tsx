import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface TravelMilestone {
  id: string;
  couple_id: string;
  title: string;
  description: string | null;
  location: string | null;
  photo_url: string | null;
  photo_caption: string | null;
  visited: boolean;
  visited_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useTravelMilestones = () => {
  const [milestones, setMilestones] = useState<TravelMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const { couple } = useAuth();
  const coupleId = couple?.id;

  const fetchMilestones = async () => {
    if (!coupleId) return;
    
    try {
      const { data, error } = await supabase
        .from('travel_milestones')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error: any) {
      console.error('Error fetching milestones:', error);
      toast.error('Gagal memuat milestone');
    } finally {
      setLoading(false);
    }
  };

  const addMilestone = async (milestone: Omit<TravelMilestone, 'id' | 'couple_id' | 'created_at' | 'updated_at'>) => {
    if (!coupleId) return;

    try {
      const { error } = await supabase
        .from('travel_milestones')
        .insert({
          ...milestone,
          couple_id: coupleId,
        });

      if (error) throw error;
      toast.success('Milestone ditambahkan!');
    } catch (error: any) {
      console.error('Error adding milestone:', error);
      toast.error('Gagal menambahkan milestone');
    }
  };

  const updateMilestone = async (id: string, updates: Partial<TravelMilestone>) => {
    try {
      const { error } = await supabase
        .from('travel_milestones')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Milestone diperbarui!');
    } catch (error: any) {
      console.error('Error updating milestone:', error);
      toast.error('Gagal memperbarui milestone');
    }
  };

  const deleteMilestone = async (id: string) => {
    try {
      const { error } = await supabase
        .from('travel_milestones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Milestone dihapus!');
    } catch (error: any) {
      console.error('Error deleting milestone:', error);
      toast.error('Gagal menghapus milestone');
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${coupleId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('milestone-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('milestone-photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast.error('Gagal mengupload foto');
      return null;
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [coupleId]);

  useEffect(() => {
    if (!coupleId) return;

    const channel = supabase
      .channel('travel-milestones-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'travel_milestones',
          filter: `couple_id=eq.${coupleId}`,
        },
        () => {
          fetchMilestones();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId]);

  return {
    milestones,
    loading,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    uploadPhoto,
    refetch: fetchMilestones,
  };
};
