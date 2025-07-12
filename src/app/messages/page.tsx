'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowRight, Trash2, Users, Clock, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getChats, type Chat, clearChat } from '@/app/actions/messages';

export default function MessagesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChats = async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const userChats = await getChats(session.user.id);
      setChats(userChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chats. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, [session?.user?.id]);

  const handleChatClick = (chatId: string) => {
    router.push(`/messages/${chatId}`);
  };

  const handleClearChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const result = await clearChat(chatId);
      
      if (result.success) {
        toast({
          title: 'Chat Cleared',
          description: result.message,
        });
        loadChats();
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
    }
  };

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find(p => p.id !== session?.user?.id);
  };

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50/30 via-blue-50/30 to-indigo-100/30 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-indigo-900/10">
        <Card className="max-w-md text-center p-8 border-0 shadow-xl">
          <CardContent>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-headline text-2xl mb-4">Messages</h1>
            <p className="text-muted-foreground">Please log in to view your messages.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-blue-50/30 to-indigo-100/30 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-indigo-900/10">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Messages
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Stay connected with your skill exchange partners
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {chats.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {chats.length === 1 ? 'Active Chat' : 'Active Chats'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading chats...</p>
            </div>
          ) : chats.length === 0 ? (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4">No messages yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Start chatting with users after accepting their swap requests. Your conversations will appear here.
                </p>
                <Button 
                  onClick={() => router.push('/requests')}
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  <Users className="mr-2 h-4 w-4" />
                  View Swap Requests
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {chats.map((chat) => {
                const otherUser = getOtherParticipant(chat);
                if (!otherUser) return null;

                return (
                  <Card 
                    key={chat.id} 
                    className="group cursor-pointer border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 backdrop-blur-sm overflow-hidden"
                    onClick={() => handleChatClick(chat.id)}
                  >
                    <div className="h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12 border-2 border-primary/20 group-hover:border-primary/40 transition-all duration-300">
                              <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary font-semibold">
                                {otherUser.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300 truncate">
                              {otherUser.name}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                  {chat.swapRequest.offeredSkill}
                                </Badge>
                                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                <Badge variant="outline" className="text-xs border-amber-500/20 text-amber-600 dark:text-amber-400">
                                  {chat.swapRequest.wantedSkill}
                                </Badge>
                              </div>
                            </CardDescription>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleClearChat(chat.id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {chat.lastMessage ? (
                        <div className="space-y-3">
                          <div className="p-3 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg border border-primary/10">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              <span className="font-medium text-primary">
                                {chat.lastMessage.senderName}:
                              </span>{' '}
                              {chat.lastMessage.content}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: true })}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      ) : (
                        <div className="py-4 text-center">
                          <Send className="w-6 h-6 text-muted-foreground mx-auto mb-2 opacity-50" />
                          <p className="text-sm text-muted-foreground">No messages yet</p>
                          <p className="text-xs text-muted-foreground">Start the conversation!</p>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-3 border-t border-muted/30">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            Created {formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 