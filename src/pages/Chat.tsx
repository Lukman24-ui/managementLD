import { useState } from 'react';
import { CoupleAvatar } from "@/components/couple/Avatar";
import { ChatBubble } from "@/components/couple/ChatBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { Send, Heart, Bell, Image, Mic, Loader2 } from "lucide-react";
import { toast } from 'sonner';

const Chat = () => {
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const { profile, partnerProfile, user } = useAuth();
  // Pastikan useMessages hook mengembalikan nilai yang konsisten
  const { messages, loading, sendMessage, messagesEndRef } = useMessages();
  
  // Pastikan ada fallback yang kuat
  const partnerName = partnerProfile?.full_name?.split(' ')[0] || 'Pasangan';
  const isPartnerAvailable = !!partnerProfile;

  const quickStickers = ["❤️", "😘", "🥰", "💕", "✨", "🙌"];
  const isMessageValid = messageText.trim().length > 0;

  const handleSend = async () => {
    if (!isMessageValid) return;
    setSending(true);
    
    // Gunakan try-catch untuk menangkap error dari hook
    try {
        const success = await sendMessage(messageText.trim());
        if (success) {
            setMessageText("");
        } else {
            toast.error("Gagal mengirim pesan. Coba lagi.");
        }
    } catch (e) {
        toast.error("Terjadi kesalahan jaringan.");
        console.error("Send message error:", e);
    } finally {
        setSending(false);
    }
  };

  const handleSendSticker = async (sticker: string) => {
    // Pengiriman stiker tidak perlu memblokir UI dengan state 'sending'
    await sendMessage(sticker, 'sticker');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && isMessageValid && !sending) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    // Cek jika dateStr valid (untuk pesan optimistik/sementara)
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Sending...';

    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // --- Conditional Rendering Content ---

  const renderChatContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-turquoise" />
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Heart className="h-12 w-12 text-turquoise/30 mb-4" />
          <p className="text-muted-foreground">Belum ada pesan</p>
          <p className="text-sm text-muted-foreground">Kirim pesan pertamamu!</p>
        </div>
      );
    }

    return (
      <>
        {messages.map((msg) => (
            // ✅ PERBAIKAN: Gunakan msg.sender_id untuk menentukan pengirim
          <ChatBubble 
            key={msg.id} 
            message={msg.content}
            time={formatTime(msg.created_at)}
            isOwn={msg.sender_id === user?.id}
            // Kirim partnerName hanya jika bukan pesan kita sendiri
            senderName={msg.sender_id !== user?.id ? partnerName : undefined} 
          />
        ))}
        <div ref={messagesEndRef} />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col">
      <div className="max-w-lg mx-auto px-4 pt-6 flex-1 flex flex-col w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 opacity-0 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <CoupleAvatar 
                name={partnerName} 
                size="lg" 
                ring 
                src={partnerProfile?.avatar_url || undefined} // Menambahkan avatar URL dari partner
            />
            <div>
              <h1 className="text-lg font-bold text-foreground">{partnerName} {isPartnerAvailable ? '💕' : ''}</h1>
              <p className="text-xs text-mint-dark">
                  {isPartnerAvailable ? 'Online • Terakhir aktif baru saja' : 'Pasangan belum terhubung'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>

        {/* Messages Content Wrapper */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 -mx-4 px-4">
          {renderChatContent()}
        </div>

        {/* Quick Stickers */}
        <div className="flex items-center gap-2 mb-3">
          {quickStickers.map((sticker, index) => (
            <button
              key={index}
              onClick={() => handleSendSticker(sticker)}
              className="w-10 h-10 rounded-xl bg-muted hover:bg-mint/30 flex items-center justify-center text-lg transition-all hover:scale-110"
              type="button" // Ditambahkan: Pastikan ini adalah tombol, bukan submit
            />
          ))}
        </div>

        {/* Encouragement Button */}
        <Button 
          variant="mint" 
          className="w-full mb-3"
          onClick={() => sendMessage("Aku sayang kamu! ❤️")}
          type="button"
        >
          <Heart className="h-4 w-4 mr-2" fill="currentColor" />
          Kirim Semangat
        </Button>

        {/* Input */}
        <div className="flex items-center gap-2 p-2 bg-card rounded-3xl shadow-card">
          <Button variant="ghost" size="icon-sm" type="button" disabled={sending}>
            <Image className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Input
            placeholder="Ketik pesan..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm"
            disabled={sending}
          />
          <Button variant="ghost" size="icon-sm" type="button" disabled={sending}>
            
          </Button>
          <Button variant="ghost" size="icon-sm" type="button" disabled={sending}>
            <Mic className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button 
            size="icon-sm" 
            className="rounded-full"
            onClick={handleSend}
            disabled={sending || !isMessageValid}
            type="button"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;