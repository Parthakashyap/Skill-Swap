'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ArrowRight, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { getUserById } from '@/app/actions/user';
import { createSwapRequest } from '@/app/actions/swap-requests';

interface RequestSwapDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  fromUserId?: string;
  toUser: User;
}

export function RequestSwapDialog({ isOpen, setIsOpen, fromUserId, toUser }: RequestSwapDialogProps) {
  const { toast } = useToast();
  const [fromUser, setFromUser] = useState<User | null>(null);
  const [offeredSkill, setOfferedSkill] = useState<string>('');
  const [wantedSkill, setWantedSkill] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && fromUserId) {
      getUserById(fromUserId).then(setFromUser);
    }
  }, [isOpen, fromUserId]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setOfferedSkill('');
      setWantedSkill('');
      setMessage('');
    }
  }, [isOpen]);

  const handleSendRequest = async () => {
    if (!offeredSkill || !wantedSkill) {
      toast({
        title: 'Missing Information',
        description: 'Please select both the skill you want to offer and the skill you want to learn.',
        variant: 'destructive',
      });
      return;
    }

    if (!fromUserId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to send a swap request.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createSwapRequest(toUser.id, offeredSkill, wantedSkill, message);
      
      if (result.success) {
        toast({
          title: 'Request Sent!',
          description: result.message,
        });
        setIsOpen(false);
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to send swap request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send swap request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!fromUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl text-primary">Request a Skill Swap</DialogTitle>
          <DialogDescription>
            Propose a skill exchange with {toUser.name}. Select one of your skills to offer and one of their skills you'd like to learn.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={fromUser.avatar} alt={fromUser.name} />
                <AvatarFallback>{fromUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{fromUser.name}</span>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={toUser.avatar} alt={toUser.name} />
                <AvatarFallback>{toUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{toUser.name}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">You Offer:</label>
              <Select value={offeredSkill} onValueChange={setOfferedSkill}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select a skill to teach" />
                </SelectTrigger>
                <SelectContent>
                  {fromUser.skillsOffered.map((skill) => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">You Request:</label>
              <Select value={wantedSkill} onValueChange={setWantedSkill}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select a skill to learn" />
                </SelectTrigger>
                <SelectContent>
                  {toUser.skillsOffered.map((skill) => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Add a message (optional)</label>
            <Textarea
              placeholder={`Hi ${toUser.name}, I'd love to swap skills with you...`}
              className="mt-1"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendRequest} 
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={isSubmitting || !offeredSkill || !wantedSkill}
          >
            <Send className="mr-2 h-4 w-4" /> 
            {isSubmitting ? 'Sending...' : 'Send Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
