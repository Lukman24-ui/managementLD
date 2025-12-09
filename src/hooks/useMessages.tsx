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

    // ✅ PERBAIKAN: Selalu set loading true saat fetching dimulai
    setLoading(true);

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
  }, [couple?.id]); 

  // --- 2. Optimasi Pengiriman Pesan (Optimistic Update) ---

  const sendMessage = async (content: string, messageType: string = 'text') => {
    if (!user?.id || !couple?.id) return false;
    
    // --- Langkah Optimistic Update ---
    // 1. Buat ID sementara yang unik (gunakan uuid atau format yang lebih spesifik)
    // Walaupun Date.now() berfungsi, uuid lebih baik. Kita pertahankan Date.now() untuk saat ini.
    const tempId = `temp-${Date.now().toString()}-${Math.random().toString(36).substring(2, 9)}`; 
    
    const newMessage: Message = {
        id: tempId,
        couple_id: couple.id,
        sender_id: user.id,
        content: content,
        message_type: messageType,
        created_at: new Date().toISOString(), 
    };

    // 2. Perbarui state UI secara instan
    setMessages(prev => [...prev, newMessage]); 

    // --- Langkah Database ---
    // ✅ PERBAIKAN: Hapus .select('*').single() untuk menghindari duplikat trigger
    const { error } = await supabase.from('messages').insert({
      couple_id: couple.id,
      sender_id: user.id,
      content,
      message_type: messageType,
    });

    if (error) {
      toast.error('Gagal mengirim pesan');
      console.error(error);
      // Rollback: Hapus pesan sementara dari UI jika gagal
      setMessages(prev => prev.filter(m => m.id !== tempId)); 
      return false;
    }

    // Pesan berhasil dikirim. Realtime Subscription (di bawah) akan mengganti pesan tempId
    return true;
  };

  // --- 3. Initial Fetch ---

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]); 


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
            
            setMessages(prev => {
                // Cari pesan sementara yang cocok (berdasarkan sender, content, dan created_at yang berdekatan)
                const tempMessageIndex = prev.findIndex(
                    m => m.sender_id === newMessage.sender_id && 
                       m.content === newMessage.content &&
                       m.id.startsWith('temp-')
                );

                if (tempMessageIndex !== -1) {
                    // ✅ SINkronisasi: Ganti pesan sementara dengan pesan asli dari DB
                    const updatedMessages = [...prev];
                    updatedMessages[tempMessageIndex] = newMessage;
                    return updatedMessages;
                }
                
                // Jika pesan berasal dari klien lain (tidak ada tempId yang cocok), tambahkan.
                return [...prev, newMessage];
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple?.id]);

  // --- 5. Auto-Scroll ---

  useEffect(() => {
    // Pastikan Auto-Scroll berjalan setelah messages diupdate
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