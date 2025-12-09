import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Message {
  id: string;
  couple_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
}

export const useMessages = () => {
  const { user, couple } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- 1. Optimasi Fetching dengan useCallback ---

  const fetchMessages = useCallback(async () => {
    if (!couple?.id) {
        setLoading(false);
        setMessages([]);
        return;
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('couple_id', couple.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      toast.error('Gagal memuat pesan.');
    } else {
        setMessages(data as Message[]);
    }

    setLoading(false);
  }, [couple?.id]); // Fungsi hanya dibuat ulang jika couple.id berubah

  // --- 2. Optimasi Pengiriman Pesan (Optimistic Update) ---

  const sendMessage = async (content: string, messageType: string = 'text') => {
    if (!user?.id || !couple?.id) return false;
    
    // --- Langkah Optimistic Update ---
    // 1. Buat ID sementara (untuk UX instan)
    const tempId = Date.now().toString(); 
    const newMessage: Message = {
        id: tempId,
        couple_id: couple.id,
        sender_id: user.id,
        content: content,
        message_type: messageType,
        created_at: new Date().toISOString(), // Waktu sementara
    };

    // 2. Perbarui state UI secara instan
    setMessages(prev => [...prev, newMessage]); 

    // --- Langkah Database ---
    // Minta Supabase mengembalikan data yang baru di-insert
    const { data: dbMessage, error } = await supabase.from('messages').insert({
      couple_id: couple.id,
      sender_id: user.id,
      content,
      message_type: messageType,
    })
      .select('*')
      .single();

    if (error) {
      toast.error('Gagal mengirim pesan');
      console.error(error);
      // Rollback: Hapus pesan sementara dari UI jika gagal
      setMessages(prev => prev.filter(m => m.id !== tempId)); 
      return false;
    }

    // 3. (Opsional) Ganti pesan sementara dengan data dari DB (Realtime akan menangani ini secara otomatis)
    // Jika tidak menggunakan Realtime, Anda akan melakukan update state di sini:
    // setMessages(prev => prev.map(m => m.id === tempId ? dbMessage as Message : m));
    
    // fetchMessages(); // TIDAK PERLU: Karena Realtime akan menerima INSERT dari DB dan memprosesnya
    return true;
  };

  // --- 3. Initial Fetch ---

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]); // Dependency adalah fungsi fetchMessages itu sendiri


  // --- 4. Optimasi Realtime Subscription (Menggunakan Payload) ---

  useEffect(() => {
    if (!couple?.id) return;

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `couple_id=eq.${couple.id}` },
        (payload) => {
            const newMessage = payload.new as Message;
            
            // Cek apakah pesan sudah ada di state (jika menggunakan Optimistic Update)
            // Jika sudah ada (berdasarkan content atau sender), abaikan, 
            // atau ganti pesan sementara (tempId) dengan ID asli dari payload.

            // Untuk obrolan yang sederhana, kita hanya memastikan tidak ada duplikat:
            setMessages(prev => {
                // Mencegah duplikat jika optimistic update dan realtime trigger bekerja bersamaan
                if (prev.some(m => m.id === newMessage.id)) {
                    return prev;
                }
                return [...prev, newMessage];
            });
            
            // fetchMessages(); // TIDAK PERLU
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple?.id]);

  // --- 5. Auto-Scroll ---
  // Fungsi ini sudah benar, tetapi dipindahkan ke akhir untuk struktur yang lebih baik.

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Return Values ---
  return {
    messages,
    loading,
    sendMessage,
    messagesEndRef,
    refetch: fetchMessages,
  };
};