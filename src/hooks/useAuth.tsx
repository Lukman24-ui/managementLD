import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// 🛠️ PERBAIKAN 1: Tambahkan properti 'email' ke interface Profile
interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  // Ditambahkan: Properti email agar tidak error di Profile.tsx
  email: string | null; 
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

  // 🛠️ PERBAIKAN 2: Gabungkan logika fetch ke dalam fungsi asinkron dan kembalikan promise
  const fetchUserData = async (userId: string): Promise<void> => {
    try {
      // Fetch profile (termasuk email jika ada di tabel 'profiles')
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*') // Pastikan query ini mengambil kolom 'email'
        .eq('id', userId)
        .maybeSingle();
      
      setProfile(profileData as Profile | null); // Tipe assertion untuk kecocokan Profile interface

      // Fetch couple
      const { data: coupleData } = await supabase
        .from('couples')
        .select('*')
        .or(`partner_a_id.eq.${userId},partner_b_id.eq.${userId}`)
        .eq('status', 'active')
        .maybeSingle();

      setCouple(coupleData as Couple | null);

      // Fetch partner profile if couple exists
      if (coupleData) {
        const partnerId = coupleData.partner_a_id === userId 
          ? coupleData.partner_b_id 
          : coupleData.partner_a_id;
        
        if (partnerId) {
          const { data: partnerData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', partnerId)
            .maybeSingle();
          
          setPartnerProfile(partnerData as Profile | null);
        } else {
            setPartnerProfile(null);
        }
      } else {
          setPartnerProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error; // Propagate error for .finally()
    }
  };

  useEffect(() => {
    // 1. Dapatkan sesi pertama kali
    const initialFetch = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
            await fetchUserData(session.user.id);
        }
        
        // Hanya set loading false setelah semua data terambil
        setLoading(false);
    };

    initialFetch();

    // 2. Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Set loading true untuk event baru seperti sign in
            setLoading(true); 
          fetchUserData(session.user.id).finally(() => setLoading(false));
        } else {
          setProfile(null);
          setCouple(null);
          setPartnerProfile(null);
            // Tidak perlu setLoading(false) di sini karena initialFetch sudah menanganinya
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);


  const refreshCoupleData = async () => {
    if (user) {
        setLoading(true);
      await fetchUserData(user.id).finally(() => setLoading(false));
    }
  };

  // ... (Fungsi signUp, signIn, signOut, updateProfile, createCouple, joinCouple tetap sama)

  // NOTE: Saya mengasumsikan kode fungsi auth lainnya sama persis
  // Saya hanya akan menyertakan bagian yang diubah atau relevan dengan state

  const signUp = async (email: string, password: string, fullName: string) => {
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
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setCouple(null);
    setPartnerProfile(null);
    // Tidak perlu setLoading(false) karena event listener akan menangani state kosong
  };

  const updateProfile = (data: Partial<Profile>) => {
    setProfile(prev => prev ? { ...prev, ...data } : null);
  };

  const createCouple = async () => {
    if (!user) return { inviteCode: null, error: 'Pengguna tidak ditemukan' };

    // Generate invite code
    const { data: inviteCode, error: codeError } = await supabase.rpc('generate_invite_code');
    
    if (codeError) return { inviteCode: null, error: codeError };

    const { data, error } = await supabase
      .from('couples')
      .insert({
        partner_a_id: user.id,
        invite_code: inviteCode,
        status: 'pending'
      })
      .select()
      .single();

    if (!error) {
      setCouple(data as Couple);
    }

    return { inviteCode: data?.invite_code ?? null, error };
  };

  const joinCouple = async (inviteCode: string) => {
    if (!user) return { error: 'Pengguna tidak ditemukan' };

    // Find couple with invite code
    const { data: coupleData, error: findError } = await supabase
      .from('couples')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .eq('status', 'pending')
      .maybeSingle();

    if (findError || !coupleData) {
      return { error: 'Kode undangan tidak valid atau sudah digunakan' };
    }

    if (coupleData.partner_a_id === user.id) {
      return { error: 'Tidak bisa bergabung dengan couple Anda sendiri' };
    }

    // Update couple with partner_b and set status to active
    const { error } = await supabase
      .from('couples')
      .update({
        partner_b_id: user.id,
        status: 'active'
      })
      .eq('id', coupleData.id);

    if (!error) {
      await fetchUserData(user.id);
    }

    return { error };
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};