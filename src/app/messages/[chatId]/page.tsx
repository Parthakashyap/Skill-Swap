'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Trash2, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getMessages, sendMessage, getChats, type Message, type Chat, clearChat, markChatAsCleared } from '@/app/actions/messages';

export default function ChatPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const chatId = params.chatId as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatData = async () => {
    if (!session?.user?.id || !chatId) return;
    
    try {
      setLoading(true);
      
      // Load chat info
      const chats = await getChats(session.user.id);
      const currentChat = chats.find(c => c.id === chatId);
      
      if (!currentChat) {
        toast({
          title: 'Chat not found',
          description: 'This chat does not exist or you do not have access to it.',
          variant: 'destructive',
        });
        router.push('/messages');
        return;
      }
      
      setChat(currentChat);
      
      // Load messages
      const chatMessages = await getMessages(chatId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load chat data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChatData();
  }, [session?.user?.id, chatId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;
    
    try {
      setSending(true);
      const result = await sendMessage(chatId, newMessage);
      
      if (result.success) {
        setNewMessage('');
        // Reload messages to get the new one
        const updatedMessages = await getMessages(chatId);
        setMessages(updatedMessages);
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = async () => {
    if (!chatId) return;
    
    try {
      setClearing(true);
      const result = await clearChat(chatId);
      
      if (result.success) {
        toast({
          title: 'Chat Cleared',
          description: 'All messages have been cleared.',
        });
        setMessages([]);
        router.push('/messages');
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to clear chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear chat. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setClearing(false);
    }
  };

  const handleTalentSwapped = async () => {
    if (!chatId) return;
    
    try {
      const result = await markChatAsCleared(chatId);
      
      if (result.success) {
        toast({
          title: 'Talent Swapped',
          description: 'Chat marked as completed. Both users need to click this button to clear the chat.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to mark talent as swapped:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark talent as swapped. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getOtherParticipant = () => {
    if (!chat || !session?.user?.id) return null;
    return chat.participants.find(p => p.id !== session.user.id);
  };

  if (!session?.user?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="font-headline text-4xl mb-6">Chat</h1>
          <p className="text-muted-foreground">Please log in to view this chat.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="font-headline text-4xl mb-6">Chat Not Found</h1>
          <p className="text-muted-foreground">This chat does not exist or you do not have access to it.</p>
          <Button onClick={() => router.push('/messages')} className="mt-4">
            Back to Messages
          </Button>
        </div>
      </div>
    );
  }

  const otherUser = getOtherParticipant();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Chat Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/messages')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={otherUser?.avatar} alt={otherUser?.name} />
              <AvatarFallback>{otherUser?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-headline text-2xl">{otherUser?.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {chat.swapRequest.offeredSkill} ↔ {chat.swapRequest.wantedSkill}
                </Badge>
                {chat.isCleared && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTalentSwapped}
            disabled={chat.isCleared}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Talent Swapped
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearChat}
            disabled={clearing}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {clearing ? 'Clearing...' : 'Clear Chat'}
          </Button>
        </div>
      </div>

      {/* Messages */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-lg">Messages</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.senderId === session.user?.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isOwnMessage && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.senderAvatar} />
                        <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`rounded-lg px-3 py-2 ${
                      isOwnMessage 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        
        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={sending || chat.isCleared}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!newMessage.trim() || sending || chat.isCleared}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {chat.isCleared && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              This chat has been marked as completed. New messages are disabled.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
} 