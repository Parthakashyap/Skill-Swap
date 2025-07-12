'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Trash2, CheckCircle, MessageCircle, Clock, Users } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50/30 via-blue-50/30 to-indigo-100/30 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-indigo-900/10">
        <Card className="max-w-md text-center p-8 border-0 shadow-xl">
          <CardContent>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-headline text-2xl mb-4">Chat</h1>
            <p className="text-muted-foreground">Please log in to view this chat.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50/30 via-blue-50/30 to-indigo-100/30 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-indigo-900/10">
        <Card className="max-w-md text-center p-8 border-0 shadow-xl">
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading chat...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50/30 via-blue-50/30 to-indigo-100/30 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-indigo-900/10">
        <Card className="max-w-md text-center p-8 border-0 shadow-xl">
          <CardContent>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="font-headline text-2xl mb-4">Chat Not Found</h1>
            <p className="text-muted-foreground mb-6">This chat does not exist or you do not have access to it.</p>
            <Button 
              onClick={() => router.push('/messages')}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              Back to Messages
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const otherUser = getOtherParticipant();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-blue-50/30 to-indigo-100/30 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-indigo-900/10">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Chat Header */}
        <Card className="mb-4 sm:mb-6 border-0 shadow-xl bg-gradient-to-r from-white via-white to-purple-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-purple-900/20 backdrop-blur-sm">
          <div className="h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push('/messages')}
                  className="hover:bg-primary/5 flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-primary/20">
                      <AvatarImage src={otherUser?.avatar} alt={otherUser?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary font-semibold">
                        {otherUser?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="font-headline text-lg sm:text-2xl text-primary truncate">{otherUser?.name}</h1>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                        {chat.swapRequest.offeredSkill}
                      </Badge>
                      <ArrowLeft className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <Badge variant="outline" className="text-xs border-amber-500/20 text-amber-600 dark:text-amber-400">
                        {chat.swapRequest.wantedSkill}
                      </Badge>
                      {chat.isCleared && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTalentSwapped}
                  disabled={chat.isCleared}
                  className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200 dark:bg-green-900/10 dark:hover:bg-green-900/20 flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  <CheckCircle className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Talent Swapped</span>
                  <span className="sm:hidden">Swapped</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearChat}
                  disabled={clearing}
                  className="text-red-600 hover:bg-red-50 border-red-200 dark:hover:bg-red-900/10 flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{clearing ? 'Clearing...' : 'Clear Chat'}</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages Container */}
        <Card className="border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm flex flex-col h-[calc(100vh-200px)] sm:h-[calc(100vh-250px)]">
          <div className="h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
          
          <CardHeader className="pb-3 sm:pb-4 border-b border-muted/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Messages
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">{messages.length} messages</span>
                <span className="sm:hidden">{messages.length}</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-gradient-to-b from-transparent to-gray-50/30 dark:to-gray-900/30">
            {messages.length === 0 ? (
              <div className="text-center py-8 sm:py-16">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                <p className="text-muted-foreground text-sm sm:text-base px-4">Start the conversation! Share your knowledge and learn something new.</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.senderId === session.user?.id;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4`}
                  >
                    <div className={`flex items-end gap-2 sm:gap-3 max-w-[85%] sm:max-w-[75%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isOwnMessage && (
                        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 border border-muted flex-shrink-0">
                          <AvatarImage src={message.senderAvatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {message.senderName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm ${
                          isOwnMessage 
                            ? 'bg-gradient-to-r from-primary to-purple-600 text-white' 
                            : 'bg-white dark:bg-gray-700 border border-muted'
                        }`}>
                          <p className="text-sm leading-relaxed break-words">{message.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 px-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          
          {/* Message Input */}
          <div className="p-3 sm:p-6 border-t border-muted/50 bg-gradient-to-r from-white via-white to-purple-50/20 dark:from-gray-800 dark:via-gray-800 dark:to-purple-900/10 flex-shrink-0">
            <div className="flex gap-2 sm:gap-3">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={sending || chat.isCleared}
                className="flex-1 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-primary/20 focus:border-primary/50 rounded-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim() || sending || chat.isCleared}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 rounded-full px-4 sm:px-6 shadow-lg flex-shrink-0"
                size="sm"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            {chat.isCleared && (
              <div className="mt-3 sm:mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  This chat has been marked as completed. New messages are disabled.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 