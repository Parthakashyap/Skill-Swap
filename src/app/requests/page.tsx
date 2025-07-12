'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SwapRequest, SwapRequestStatus } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, ArrowRight, Check, ThumbsDown, ThumbsUp, X, Star, MessageCircle, CheckCircle, Clock, Users, BookOpen, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RatingStars from '@/components/rating-stars';
import { Textarea } from '@/components/ui/textarea';
import { getSwapRequests, updateSwapRequestStatus } from '@/app/actions/swap-requests';
import { submitFeedback, markSwapAsCompleted, checkFeedbackExists } from '@/app/actions/feedback';

const statusConfig: Record<SwapRequestStatus, { color: string; bgColor: string; icon: React.ElementType }> = {
  pending: { color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20', icon: Clock },
  accepted: { color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/20', icon: CheckCircle },
  rejected: { color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/20', icon: X },
  completed: { color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/20', icon: Award },
  cancelled: { color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/20', icon: X },
};

const RequestCard = ({ request, currentUserId, onStatusUpdate }: { 
  request: SwapRequest; 
  currentUserId: string;
  onStatusUpdate: () => void;
}) => {
  const { toast } = useToast();
  const isIncoming = request.toUser.id === currentUserId;
  const StatusIcon = statusConfig[request.status].icon;

  const handleAction = async (action: 'accept' | 'reject') => {
    try {
      const status = action === 'accept' ? 'accepted' : 'rejected';
      const result = await updateSwapRequestStatus(request.id, status);
      
      if (result.success) {
        toast({
          title: `Request ${action}ed`,
          description: result.message,
        });
        onStatusUpdate();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to update request status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update request status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsCompleted = async () => {
    try {
      const result = await markSwapAsCompleted(request.id);
      
      if (result.success) {
        toast({
          title: 'Swap Completed',
          description: result.message,
        });
        onStatusUpdate();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to mark swap as completed:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark swap as completed. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 backdrop-blur-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${statusConfig[request.status].bgColor}`}>
              <StatusIcon className={`w-4 h-4 ${statusConfig[request.status].color}`} />
            </div>
            <div className="flex flex-col">
              <Badge 
                variant={isIncoming ? "default" : "secondary"} 
                className="text-xs font-medium w-fit"
              >
                {isIncoming ? 'Incoming' : 'Outgoing'}
              </Badge>
              <span className={`text-xs font-medium capitalize ${statusConfig[request.status].color}`}>
                {request.status}
              </span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(request.createdAt, { addSuffix: true })}
          </span>
        </div>
        
        <CardDescription className="mt-3 text-sm">
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage 
                src={isIncoming ? request.fromUser.avatar : request.toUser.avatar} 
                alt={isIncoming ? request.fromUser.name : request.toUser.name} 
              />
              <AvatarFallback className="text-xs">
                {isIncoming ? request.fromUser.name.charAt(0) : request.toUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">
              {isIncoming 
                ? `${request.fromUser.name} wants to swap with you` 
                : `You sent a request to ${request.toUser.name}`
              }
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-6 pb-4">
        <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg p-4 border border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-primary" />
                <p className="text-xs text-muted-foreground font-medium">
                  {isIncoming ? 'They Offer' : 'You Offer'}
                </p>
              </div>
              <p className="font-semibold text-sm text-primary">{request.offeredSkill}</p>
            </div>
            <div className="px-3">
              <div className="p-2 bg-primary/10 rounded-full">
                {isIncoming ? (
                  <ArrowLeft className="w-4 h-4 text-primary" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-primary" />
                )}
              </div>
            </div>
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Star className="w-4 h-4 text-amber-500" />
                <p className="text-xs text-muted-foreground font-medium">
                  {isIncoming ? 'For Your' : 'For Their'}
                </p>
              </div>
              <p className="font-semibold text-sm text-amber-600 dark:text-amber-400">{request.wantedSkill}</p>
            </div>
          </div>
        </div>
        
        {request.message && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-muted">
            <p className="text-sm italic text-muted-foreground">
              <span className="font-medium">Message:</span> "{request.message}"
            </p>
          </div>
        )}
      </CardContent>
      
      {isIncoming && request.status === 'pending' && (
        <CardFooter className="flex justify-end gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAction('reject')}
            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            <ThumbsDown className="mr-2 h-4 w-4" /> Reject
          </Button>
          <Button 
            size="sm" 
            onClick={() => handleAction('accept')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <ThumbsUp className="mr-2 h-4 w-4" /> Accept
          </Button>
        </CardFooter>
      )}
      
      {request.status === 'accepted' && (
        <CardFooter className="flex justify-end gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAsCompleted}
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-900/20"
          >
            <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.href = '/messages'}
            className="bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/10 dark:hover:bg-purple-900/20"
          >
            <MessageCircle className="mr-2 h-4 w-4" /> Open Chat
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

const FeedbackCard = ({ request, currentUserId }: { request: SwapRequest; currentUserId: string }) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackExists, setFeedbackExists] = useState(false);
  const [loading, setLoading] = useState(true);

  const userToRate = request.fromUser.id === currentUserId ? request.toUser : request.fromUser;

  useEffect(() => {
    const checkExistingFeedback = async () => {
      try {
        const exists = await checkFeedbackExists(request.id, currentUserId);
        setFeedbackExists(exists);
      } catch (error) {
        console.error('Failed to check feedback existence:', error);
      } finally {
        setLoading(false);
      }
    };

    checkExistingFeedback();
  }, [request.id, currentUserId]);

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please provide a rating before submitting feedback.',
        variant: 'destructive',
      });
      return;
    }

    if (feedbackExists) {
      toast({
        title: 'Feedback Already Submitted',
        description: 'You have already submitted feedback for this swap.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const result = await submitFeedback(request.id, userToRate.id, rating, comment);
      
      if (result.success) {
        toast({
          title: 'Feedback Submitted',
          description: result.message,
        });
        setRating(0);
        setComment('');
        setFeedbackExists(true);
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading feedback form...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (feedbackExists) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50/50 dark:from-gray-800 dark:to-green-900/5">
        <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 border-2 border-green-500/20">
              <AvatarImage src={userToRate.avatar} />
              <AvatarFallback className="bg-green-100 dark:bg-green-900/20 text-green-600">
                {userToRate.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Feedback Submitted</CardTitle>
              <CardDescription>Swap of {request.offeredSkill} for {request.wantedSkill}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div className="inline-flex items-center gap-2 text-green-600 mb-2">
              <span className="font-medium">Feedback already submitted</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You have already provided feedback for your swap with {userToRate.name}.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/5">
      <div className="h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12 border-2 border-primary/20">
            <AvatarImage src={userToRate.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {userToRate.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">Rate your swap with {userToRate.name}</CardTitle>
            <CardDescription>Swap of {request.offeredSkill} for {request.wantedSkill}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg">
          <p className="text-sm font-medium mb-3">Your Rating</p>
          <RatingStars 
            rating={rating} 
            isEditable 
            onRatingChange={setRating} 
            size={28} 
          />
        </div>
        <div>
          <p className="text-sm font-medium mb-3">Comments</p>
          <Textarea 
            placeholder={`How was your experience with ${userToRate.name}? Share details about the knowledge exchange...`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="bg-muted/30 border-muted focus:border-primary/50"
          />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button 
          onClick={handleSubmitFeedback} 
          disabled={submitting || rating === 0}
          className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            'Submit Feedback'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function RequestsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const swapRequests = await getSwapRequests(session.user.id);
      setRequests(swapRequests);
    } catch (error) {
      console.error('Failed to load swap requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load swap requests. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [session?.user?.id]);

  const currentUserId = session?.user?.id;
  const incomingRequests = requests.filter(req => req.toUser.id === currentUserId && req.status === 'pending');
  const outgoingRequests = requests.filter(req => req.fromUser.id === currentUserId && req.status === 'pending');
  const acceptedRequests = requests.filter(req => req.status === 'accepted' && (req.toUser.id === currentUserId || req.fromUser.id === currentUserId));
  const completedSwaps = requests.filter(req => req.status === 'completed' && (req.toUser.id === currentUserId || req.fromUser.id === currentUserId));

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50/30 via-blue-50/30 to-indigo-100/30 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-indigo-900/10">
        <Card className="max-w-md text-center p-8 border-0 shadow-xl">
          <CardContent>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-headline text-2xl mb-4">Manage Your Swaps</h1>
            <p className="text-muted-foreground">Please log in to view your swap requests.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-blue-50/30 to-indigo-100/30 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-indigo-900/10">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Manage Your Swaps
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Track your skill exchange requests and provide feedback on completed swaps
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/5">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{incomingRequests.length}</div>
                <div className="text-xs text-muted-foreground">Incoming</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/5">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">{outgoingRequests.length}</div>
                <div className="text-xs text-muted-foreground">Outgoing</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/50 dark:from-gray-800 dark:to-green-900/5">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{acceptedRequests.length}</div>
                <div className="text-xs text-muted-foreground">Accepted</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/50 dark:from-gray-800 dark:to-amber-900/5">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-amber-600 mb-1">{completedSwaps.length}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="incoming" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-lg">
              <TabsTrigger value="incoming" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Incoming
              </TabsTrigger>
              <TabsTrigger value="outgoing" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Outgoing
              </TabsTrigger>
              <TabsTrigger value="accepted" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Accepted
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Completed
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="incoming">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading requests...</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {incomingRequests.length > 0 ? (
                    incomingRequests.map(req => (
                      <RequestCard 
                        key={req.id} 
                        request={req} 
                        currentUserId={currentUserId!}
                        onStatusUpdate={loadRequests}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No incoming requests</h3>
                      <p className="text-muted-foreground">New requests will appear here when others want to swap skills with you.</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="outgoing">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading requests...</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {outgoingRequests.length > 0 ? (
                    outgoingRequests.map(req => (
                      <RequestCard 
                        key={req.id} 
                        request={req} 
                        currentUserId={currentUserId!}
                        onStatusUpdate={loadRequests}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ArrowRight className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No outgoing requests</h3>
                      <p className="text-muted-foreground">Requests you send to others will appear here.</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="accepted">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading accepted requests...</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {acceptedRequests.length > 0 ? (
                    acceptedRequests.map(req => (
                      <RequestCard 
                        key={req.id} 
                        request={req} 
                        currentUserId={currentUserId!}
                        onStatusUpdate={loadRequests}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No accepted requests</h3>
                      <p className="text-muted-foreground">Accepted skill swaps will appear here.</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading completed swaps...</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {completedSwaps.length > 0 ? (
                    completedSwaps.map(req => (
                      <FeedbackCard 
                        key={req.id} 
                        request={req} 
                        currentUserId={currentUserId!}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No completed swaps</h3>
                      <p className="text-muted-foreground">Completed skill exchanges will appear here for you to rate.</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
