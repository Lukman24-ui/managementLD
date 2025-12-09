import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// --- Definisi Tipe ---
interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
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
      // Menggunakan Promise.all untuk mengambil data secara paralel (efisien)
      const [
        { data: profileData },
        { data: coupleData }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('couples')
          .select('*')
          .or(`partner_a_id.eq.${userId},partner_b_id.eq.${userId}`)
          .eq('status', 'active')
          .maybeSingle()
      ]);
      
      setProfile(profileData as Profile || null);
      setCouple(coupleData as Couple || null);
      setPartnerProfile(null); // Reset partner data

      // Fetch partner profile jika couple ada
      if (coupleData) {
        const partnerId = (coupleData as Couple).partner_a_id === userId 
          ? (coupleData as Couple).partner_b_id 
          : (coupleData as Couple).partner_a_id;
        
        if (partnerId) {
          const { data: partnerData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', partnerId)
            .maybeSingle();
          
          setPartnerProfile(partnerData as Profile || null);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
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
    setLoading(true); // Opsional: tampilkan loading saat signout
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
        // Generate invite code
        const { data: inviteCode, error: codeError } = await supabase.rpc('generate_invite_code');
        
        if (codeError) throw new Error('Gagal menghasilkan kode undangan.');

        const { data, error } = await supabase
            .from('couples')
            .insert({
                partner_a_id: user.id,
                invite_code: inviteCode,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;
        
        setCouple(data as Couple);
        toast.success("Couple dibuat! Bagikan kode undangan.");
        return { inviteCode: data.invite_code, error: null };

    } catch (e: any) {
        console.error('Error creating couple:', e);
        toast.error(e.message || 'Gagal membuat couple.');
        return { inviteCode: null, error: e };
    }
  }, [user]);


  const joinCouple = useCallback(async (inviteCode: string) => {
    if (!user) return { error: 'Pengguna tidak ditemukan' };

    try {
        // 1. Cari couple dengan invite code
        const { data: coupleData, error: findError } = await supabase
            .from('couples')
            .select('*')
            .eq('invite_code', inviteCode.toUpperCase())
            .eq('status', 'pending')
            .maybeSingle();

        if (findError) throw new Error('Error mencari couple.');
        if (!coupleData) throw new Error('Kode undangan tidak valid atau sudah digunakan.');

        if (coupleData.partner_a_id === user.id) {
            throw new Error('Tidak bisa bergabung dengan couple Anda sendiri');
        }

        // 2. Update couple dengan partner_b dan set status to active
        const { error: updateError } = await supabase
            .from('couples')
            .update({
                partner_b_id: user.id,
                status: 'active'
            })
            .eq('id', coupleData.id);

        if (updateError) throw updateError;
        
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
    // 1. Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            // Fetch data jika user baru masuk atau ada perubahan sesi
            if (currentUser) {
                fetchUserData(currentUser.id);
            } else {
                setProfile(null);
                setCouple(null);
                setPartnerProfile(null);
                setLoading(false); // Pastikan loading berhenti saat signed_out
            }
        }
    );

    // 2. THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
            fetchUserData(currentUser.id);
        } else {
            setLoading(false); // Hanya set loading false di sini jika tidak ada user
        }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]); // Dependency fetchUserData ditambahkan


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
      {children}
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