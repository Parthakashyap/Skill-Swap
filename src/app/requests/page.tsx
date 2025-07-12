'use client';

// NOTE: This page still uses mock data. It needs to be updated to fetch
// swap requests from the database. This is a placeholder implementation.

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockRequests, currentUser } from '@/lib/mock-data'; // MOCK DATA
import type { SwapRequest, SwapRequestStatus } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, ArrowRight, Check, ThumbsDown, ThumbsUp, X, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RatingStars from '@/components/rating-stars';
import { Textarea } from '@/components/ui/textarea';

const statusConfig: Record<SwapRequestStatus, { color: string; icon: React.ElementType }> = {
  pending: { color: 'bg-yellow-500', icon: X },
  accepted: { color: 'bg-green-500', icon: Check },
  rejected: { color: 'bg-red-500', icon: X },
  completed: { color: 'bg-blue-500', icon: Star },
  cancelled: { color: 'bg-gray-500', icon: X },
};

const RequestCard = ({ request }: { request: SwapRequest }) => {
  const { toast } = useToast();
  const isIncoming = request.toUser.id === currentUser.id;

  const handleAction = (action: 'accept' | 'reject') => {
    toast({
      title: `Request ${action}ed`,
      description: `You have ${action}ed the request from ${request.fromUser.name}.`,
    });
    // In a real app, this would update the request status via an API call.
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusConfig[request.status].color}`}></div>
            <Badge variant={isIncoming ? "default" : "secondary"}>{isIncoming ? 'Incoming' : 'Outgoing'}</Badge>
            <span className="text-sm text-muted-foreground capitalize">{request.status}</span>
          </div>
          <span className="text-sm text-muted-foreground">{formatDistanceToNow(request.createdAt, { addSuffix: true })}</span>
        </div>
        <CardDescription className="pt-4">
          {isIncoming ? `${request.fromUser.name} wants to swap with you.` : `You sent a request to ${request.toUser.name}.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex-1 text-center">
            <p className="text-sm text-muted-foreground">{isIncoming ? 'They Offer' : 'You Offer'}</p>
            <p className="font-semibold">{request.offeredSkill}</p>
          </div>
          <div className="px-4">
            {isIncoming ? <ArrowLeft className="w-5 h-5 text-primary" /> : <ArrowRight className="w-5 h-5 text-primary" />}
          </div>
          <div className="flex-1 text-center">
            <p className="text-sm text-muted-foreground">{isIncoming ? 'For Your' : 'For Their'}</p>
            <p className="font-semibold">{request.wantedSkill}</p>
          </div>
        </div>
        {request.message && <p className="text-sm text-muted-foreground p-3 border rounded-lg italic">"{request.message}"</p>}
      </CardContent>
      {isIncoming && request.status === 'pending' && (
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => handleAction('reject')}>
            <ThumbsDown className="mr-2 h-4 w-4" /> Reject
          </Button>
          <Button size="sm" onClick={() => handleAction('accept')}>
            <ThumbsUp className="mr-2 h-4 w-4" /> Accept
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

const FeedbackCard = ({ request }: { request: SwapRequest }) => {
  const userToRate = request.fromUser.id === currentUser.id ? request.toUser : request.fromUser;
  const { toast } = useToast();

  const handleSubmitFeedback = () => {
    toast({
      title: 'Feedback Submitted',
      description: `Thank you for your feedback on ${userToRate.name}.`,
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={userToRate.avatar} />
            <AvatarFallback>{userToRate.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>Rate your swap with {userToRate.name}</CardTitle>
            <CardDescription>Swap of {request.offeredSkill} for {request.wantedSkill}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Your Rating</p>
          <RatingStars rating={0} isEditable onRatingChange={() => {}} size={24} />
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Comments</p>
          <Textarea placeholder={`How was your experience with ${userToRate.name}?`} />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={handleSubmitFeedback}>Submit Feedback</Button>
      </CardFooter>
    </Card>
  );
}

export default function RequestsPage() {
  const incomingRequests = mockRequests.filter(req => req.toUser.id === currentUser.id && req.status === 'pending');
  const outgoingRequests = mockRequests.filter(req => req.fromUser.id === currentUser.id && req.status === 'pending');
  const completedSwaps = mockRequests.filter(req => req.status === 'completed' && (req.toUser.id === currentUser.id || req.fromUser.id === currentUser.id));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-headline text-4xl mb-6">Manage Your Swaps</h1>
      <Tabs defaultValue="incoming">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="incoming">Incoming</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
          <TabsTrigger value="completed">Completed & Feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="incoming" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {incomingRequests.length > 0 ? (
              incomingRequests.map(req => <RequestCard key={req.id} request={req} />)
            ) : (
              <p className="text-muted-foreground col-span-full text-center py-8">No new incoming requests.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="outgoing" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {outgoingRequests.length > 0 ? (
              outgoingRequests.map(req => <RequestCard key={req.id} request={req} />)
            ) : (
              <p className="text-muted-foreground col-span-full text-center py-8">You haven't sent any pending requests.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
             {completedSwaps.length > 0 ? (
              completedSwaps.map(req => <FeedbackCard key={req.id} request={req} />)
            ) : (
              <p className="text-muted-foreground col-span-full text-center py-8">No completed swaps to review yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
