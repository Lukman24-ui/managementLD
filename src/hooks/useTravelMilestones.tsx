import { useState, useEffect, useCallback } from 'react';
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

    // --- 1. Optimasi Fetching dengan useCallback ---

    const fetchMilestones = useCallback(async () => {
        if (!coupleId) {
            setLoading(false);
            setMilestones([]);
            return;
        }

        // ✅ PERBAIKAN: Selalu set loading true saat fetching dimulai
        setLoading(true);
        
        try {
            const { data, error } = await supabase
                .from('travel_milestones')
                .select('*')
                .eq('couple_id', coupleId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMilestones(data as TravelMilestone[] || []);
        } catch (error: any) {
            console.error('Error fetching milestones:', error);
            toast.error('Gagal memuat milestone');
        } finally {
            setLoading(false);
        }
    }, [coupleId]); 

    // --- 2. Mutasi CRUD: Gunakan State Lokal dan Sinkronisasi Realtime ---

    const addMilestone = useCallback(async (milestone: Omit<TravelMilestone, 'id' | 'couple_id' | 'created_at' | 'updated_at'>) => {
        if (!coupleId) return false;

        try {
            // ✅ PERBAIKAN: Hapus .select() untuk insert
            // Kita mengandalkan Realtime Subscription untuk update state
            const { error } = await supabase
                .from('travel_milestones')
                .insert({
                    ...milestone,
                    couple_id: coupleId,
                });

            if (error) throw error;
            
            toast.success('Milestone ditambahkan!');
            // Biarkan Realtime Subscription yang menangani setMilestones
            return true;
        } catch (error: any) {
            console.error('Error adding milestone:', error);
            toast.error('Gagal menambahkan milestone');
            return false;
        }
    }, [coupleId]);

    const updateMilestone = useCallback(async (id: string, updates: Partial<TravelMilestone>) => {
        const originalMilestones = milestones;
        
        // Optimistic Update: Perbarui UI sebelum konfirmasi DB
        setMilestones(prev => 
            prev.map(m => m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m)
        );

        try {
            // Kita tidak perlu .select('*') di sini karena Realtime akan memberikan data terbaru ke klien lain.
            // Data yang kita set secara Optimistic di atas sudah cukup untuk klien ini.
            const { error } = await supabase
                .from('travel_milestones')
                .update({ ...updates, updated_at: new Date().toISOString() }) 
                .eq('id', id);

            if (error) throw error;
            
            toast.success('Milestone diperbarui!');
            // ✅ PERBAIKAN: Hapus setMilestones di sini. 
            // Optimistic update sudah menangani UI, Realtime menangani konfirmasi dari server.
            return true;
        } catch (error: any) {
            console.error('Error updating milestone:', error);
            toast.error('Gagal memperbarui milestone');
            setMilestones(originalMilestones); // Rollback
            return false;
        }
    }, [milestones]);

    const deleteMilestone = useCallback(async (id: string) => {
        const originalMilestones = milestones;
        
        // Optimistic Update: Hapus dari UI sebelum konfirmasi DB
        setMilestones(prev => prev.filter(m => m.id !== id));

        try {
            const { error } = await supabase
                .from('travel_milestones')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Milestone dihapus!');
            // ✅ PERBAIKAN: Hapus setMilestones di sini. 
            // Optimistic update sudah menangani UI, Realtime menangani konfirmasi dari server.
            return true;
        } catch (error: any) {
            console.error('Error deleting milestone:', error);
            toast.error('Gagal menghapus milestone');
            setMilestones(originalMilestones); // Rollback
            return false;
        }
    }, [milestones]);

    // --- 3. Upload Foto (tetap sama) ---
    
    const uploadPhoto = useCallback(async (file: File): Promise<string | null> => {
        if (!coupleId) return null;

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
    }, [coupleId]);


    // --- 4. Initial Fetch Effect ---

    useEffect(() => {
        // Pindahkan setLoading(true) ke fetchMilestones
        if (coupleId) {
            fetchMilestones();
        }
    }, [fetchMilestones, coupleId]);


    // --- 5. Realtime Subscription (Optimasi dengan Payload) ---

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
                (payload) => {
                    const newMilestone = payload.new as TravelMilestone;
                    const oldMilestone = payload.old as TravelMilestone;

                    if (payload.eventType === 'INSERT') {
                        // ✅ PERBAIKAN: Cegah duplikasi saat INSERT (jika optimasi lokal tidak dihapus)
                        setMilestones(prev => {
                            if (prev.some(m => m.id === newMilestone.id)) return prev;
                            return [newMilestone, ...prev];
                        });
                    } else if (payload.eventType === 'UPDATE') {
                        // Perbarui item yang sudah ada dengan data final dari DB
                        setMilestones(prev => 
                            prev.map(m => m.id === newMilestone.id ? newMilestone : m)
                        );
                    } else if (payload.eventType === 'DELETE') {
                        // Hapus item dari state
                        setMilestones(prev => prev.filter(m => m.id !== oldMilestone.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [coupleId]);

    // --- Return Values ---

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