import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client'; // Pastikan path ini benar
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react'; 

// --- Definisi Tipe ---
interface Profile { 
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  couple_id: string | null; // Diperlukan untuk menautkan profil ke pasangan
  created_at: string;
  updated_at: string;
}

interface Couple {
  id: string;
  partner_a_id: string; 
  partner_b_id: string | null; 
  invite_code: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  couple: Couple | null;
  partnerProfile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  createCouple: () => Promise<{ inviteCode: string | null; error: any }>;
  joinCouple: (inviteCode: string) => Promise<{ error: any }>;
  refreshCoupleData: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // --- 1. Fetch User Data (Profile, Couple, Partner) ---
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      // Ambil data profil terlebih dahulu
      const [{ data: profileData, error: profileError }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      ]);

      if (profileError) throw profileError;

      setProfile(profileData as Profile || null);
      setCouple(null); 
      setPartnerProfile(null); 

      // BARU: Ambil data couple menggunakan couple_id di profile
      if (profileData?.couple_id) {
        const { data: coupleData, error: coupleError } = await supabase.from('couples')
          .select('*')
          .eq('id', profileData.couple_id)
          .maybeSingle();

        if (coupleError) throw coupleError;

        setCouple(coupleData as Couple || null);

        // Ambil data pasangan jika couple aktif
        if (coupleData && coupleData.status === 'active') {
          const partnerId = (coupleData as Couple).partner_a_id === userId 
            ? (coupleData as Couple).partner_b_id 
            : (coupleData as Couple).partner_a_id;
        
          if (partnerId) {
            const { data: partnerData, error: partnerError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', partnerId)
              .maybeSingle();
            
            if (partnerError) throw partnerError;
            setPartnerProfile(partnerData as Profile || null);
          }
        }
      }

    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast.error(`Gagal memuat data: ${error.message}`);
    } finally {
        setLoading(false);
    }
  }, []);


  // --- 2. Fungsi CRUD Couple & Auth (useCallback) ---

  const refreshCoupleData = useCallback(async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  }, [user, fetchUserData]);


  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
        toast.error(error.message);
    } else {
        toast.success("Cek email Anda untuk link verifikasi!");
    }
    return { error };
  }, []);


  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
        toast.error(error.message);
    }
    return { error };
  }, []);


  const signOut = useCallback(async () => {
    setLoading(true); 
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setCouple(null);
    setPartnerProfile(null);
    setLoading(false);
    toast.info("Anda telah keluar.");
  }, []);


  const updateProfile = useCallback((data: Partial<Profile>) => {
    setProfile(prev => prev ? { ...prev, ...data } : null);
  }, []);


  const createCouple = useCallback(async () => {
    if (!user) return { inviteCode: null, error: 'Pengguna tidak ditemukan' };

    try {
        // 1. Generate invite code & Buat couple
        const { data: inviteCode, error: codeError } = await supabase.rpc('generate_invite_code'); 
        
        if (codeError) throw new Error('Gagal menghasilkan kode undangan.');

        const { data: newCoupleData, error: coupleError } = await supabase
            .from('couples')
            .insert({
                partner_a_id: user.id,
                invite_code: inviteCode,
                status: 'pending'
            })
            .select()
            .single();

        if (coupleError) throw coupleError;

        // 2. Update profile pengguna (Partner A) dengan couple_id
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ couple_id: newCoupleData.id })
            .eq('id', user.id);

        if (profileError) throw profileError;
        
        // 3. Update state di frontend
        setCouple(newCoupleData as Couple);
        setProfile(prev => prev ? { ...prev, couple_id: newCoupleData.id } : null); 

        toast.success("Couple dibuat! Bagikan kode undangan.");
        return { inviteCode: newCoupleData.invite_code, error: null };

    } catch (e: any) {
        console.error('Error creating couple:', e);
        toast.error(e.message || 'Gagal membuat couple.');
        return { inviteCode: null, error: e };
    }
  }, [user]);


  const joinCouple = useCallback(async (inviteCode: string) => {
    if (!user) return { error: 'Pengguna tidak ditemukan' };

    const UPPERCASE_CODE = inviteCode.toUpperCase().trim();

    try {
        // 1. UPDATE Atomik: Mencari baris yang valid (pending, belum ada partner B) dan memperbarui secara bersamaan
        const { data: coupleData, error: updateError } = await supabase
            .from('couples')
            .update({
                partner_b_id: user.id, 
                status: 'active'       
            })
            .eq('invite_code', UPPERCASE_CODE) 
            .eq('status', 'pending')           
            .is('partner_b_id', null)           
            .select('id, partner_a_id')
            .maybeSingle(); 

        if (updateError) throw updateError;

        if (!coupleData) {
            throw new Error('Kode undangan tidak valid, sudah digunakan, atau tidak ditemukan.');
        }

        // Safety check: Cegah bergabung dengan pasangan sendiri
        if (coupleData.partner_a_id === user.id) {
            throw new Error('Anda tidak bisa bergabung dengan couple yang Anda buat sendiri.');
        }

        // 2. Update profile pengguna (Pasangan B) dengan couple_id
        const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update({ couple_id: coupleData.id }) 
            .eq('id', user.id);

        if (profileUpdateError) throw profileUpdateError;
        
        // 3. Refresh data untuk memuat status couple baru dan profil pasangan
        await fetchUserData(user.id);
        
        toast.success("Berhasil bergabung dengan couple!");
        return { error: null };

    } catch (e: any) {
        console.error('Error joining couple:', e);
        toast.error(e.message || 'Gagal bergabung dengan couple.');
        return { error: e };
    }
  }, [user, fetchUserData]);


  // --- 3. Initial Auth Setup & Listener (useEffect) ---
  useEffect(() => {
    let isMounted = true; 

    const loadInitialSession = async () => {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        const currentUser = currentSession?.user ?? null;
        setSession(currentSession);
        setUser(currentUser);

        if (currentUser) {
            await fetchUserData(currentUser.id);
        } else {
            setLoading(false); 
        }
    };

    loadInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
            if (!isMounted) return;

            const currentUser = session?.user ?? null;
            setSession(session);
            setUser(currentUser);

            if (currentUser) {
                fetchUserData(currentUser.id);
            } else if (event === 'SIGNED_OUT') {
                setProfile(null);
                setCouple(null);
                setPartnerProfile(null);
                setLoading(false); 
            }
        }
    );

    return () => {
        isMounted = false;
        subscription.unsubscribe();
    };
  }, [fetchUserData]);


  // --- 4. Context Provider Return ---
  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      couple,
      partnerProfile,
      loading,
      signUp,
      signIn,
      signOut,
      createCouple,
      joinCouple,
      refreshCoupleData,
      updateProfile
    }}>
      {loading ? (
        // Loading Guard: Mencegah komponen anak me-render sebelum data auth dimuat
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-turquoise" />
            <p className="ml-2 text-muted-foreground">Memuat sesi...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// --- Custom Hook useAuth ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};