import { useState, useEffect, useRef } from 'react';
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

  const fetchMessages = async () => {
    if (!couple?.id) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('couple_id', couple.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data as Message[]);
    setLoading(false);
  };

  const sendMessage = async (content: string, messageType: string = 'text') => {
    if (!user?.id || !couple?.id) return;

    const { error } = await supabase.from('messages').insert({
      couple_id: couple.id,
      sender_id: user.id,
      content,
      message_type: messageType,
    });

    if (error) {
      toast.error('Gagal mengirim pesan');
      console.error(error);
      return false;
    }

    return true;
  };

  useEffect(() => {
    fetchMessages();
  }, [couple?.id]);

  useEffect(() => {
    if (!couple?.id) return;

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return {
    messages,
    loading,
    sendMessage,
    messagesEndRef,
    refetch: fetchMessages,
  };
};
