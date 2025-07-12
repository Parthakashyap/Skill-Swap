'use client';

import type { User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Swords, BookOpen, Star } from 'lucide-react';
import RatingStars from './rating-stars';
import { RequestSwapDialog } from './request-swap-dialog';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

interface UserProfileCardProps {
  user: User;
  currentUser?: { id?: string | null } | null;
}

export default function UserProfileCard({ user, currentUser }: UserProfileCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleRequestSwap = () => {
    if (!currentUser) {
      signIn('google');
    } else {
      setIsDialogOpen(true);
    }
  }

  // Ensure skills arrays exist to prevent errors
  const skillsOffered = user.skillsOffered || [];
  const skillsWanted = user.skillsWanted || [];

  return (
    <>
      <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="user avatar" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="font-headline text-2xl">{user.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <RatingStars rating={user.rating} />
              <span className="text-xs text-muted-foreground">({user.reviews} reviews)</span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-primary">
              <BookOpen className="w-4 h-4" /> Offers to Teach
            </h4>
            <div className="flex flex-wrap gap-1">
              {skillsOffered.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
              {skillsOffered.length > 4 && <Badge variant="secondary">...</Badge>}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-accent">
              <Star className="w-4 h-4" /> Wants to Learn
            </h4>
            <div className="flex flex-wrap gap-1">
              {skillsWanted.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="outline">{skill}</Badge>
              ))}
              {skillsWanted.length > 4 && <Badge variant="outline">...</Badge>}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {user.id !== currentUser?.id && (
            <Button 
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90" 
              onClick={handleRequestSwap}
            >
              <Swords className="mr-2 h-4 w-4" /> Request Swap
            </Button>
          )}
        </CardFooter>
      </Card>
      {currentUser && (
        <RequestSwapDialog 
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          fromUserId={currentUser.id ?? undefined}
          toUser={user} 
        />
      )}
    </>
  );
}
