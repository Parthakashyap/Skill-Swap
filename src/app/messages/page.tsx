'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowRight, Trash2 } from 'lucide-react';
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
    e.stopPropagation(); // Prevent chat click
    
    try {
      const result = await clearChat(chatId);
      
      if (result.success) {
        toast({
          title: 'Chat Cleared',
          description: result.message,
        });
        loadChats(); // Refresh the chats list
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="font-headline text-4xl mb-6">Messages</h1>
          <p className="text-muted-foreground">Please log in to view your messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-4xl">Messages</h1>
        <Badge variant="secondary" className="text-sm">
          {chats.length} {chats.length === 1 ? 'chat' : 'chats'}
        </Badge>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading chats...</p>
        </div>
      ) : chats.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
            <p className="text-muted-foreground mb-4">
              Start chatting with users after accepting their swap requests.
            </p>
            <Button onClick={() => router.push('/requests')}>
              View Swap Requests
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {chats.map((chat) => {
            const otherUser = getOtherParticipant(chat);
            if (!otherUser) return null;

            return (
              <Card 
                key={chat.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleChatClick(chat.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                        <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{otherUser.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {chat.swapRequest.offeredSkill} ↔ {chat.swapRequest.wantedSkill}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleClearChat(chat.id, e)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {chat.lastMessage ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        <span className="font-medium">{chat.lastMessage.senderName}:</span> {chat.lastMessage.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No messages yet
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-xs text-muted-foreground">
                      Created {formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 