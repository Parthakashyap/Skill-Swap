'use client';

import type { User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Swords, BookOpen, Star, MapPin } from 'lucide-react';
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
      <Card className="group flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 backdrop-blur-sm overflow-hidden">
        {/* Decorative top border */}
        <div className="h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
        
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <div className="relative">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
              <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="user avatar" />
              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary font-semibold">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors duration-300 truncate">
              {user.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <RatingStars rating={user.rating} />
              <span className="text-xs text-muted-foreground">({user.reviews} reviews)</span>
            </CardDescription>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>Available for swaps</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow space-y-4 px-6">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/10">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-primary">
                <BookOpen className="w-4 h-4" /> 
                <span>Teaches</span>
              </h4>
              <div className="flex flex-wrap gap-1">
                {skillsOffered.slice(0, 3).map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="secondary" 
                    className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    {skill}
                  </Badge>
                ))}
                {skillsOffered.length > 3 && (
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                    +{skillsOffered.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/10">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Star className="w-4 h-4" /> 
                <span>Wants to Learn</span>
              </h4>
              <div className="flex flex-wrap gap-1">
                {skillsWanted.slice(0, 3).map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="outline" 
                    className="text-xs border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
                  >
                    {skill}
                  </Badge>
                ))}
                {skillsWanted.length > 3 && (
                  <Badge variant="outline" className="text-xs border-amber-500/20 text-amber-600 dark:text-amber-400">
                    +{skillsWanted.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-4 pb-6 px-6">
          {user.id !== currentUser?.id && (
            <Button 
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg group-hover:shadow-xl transition-all duration-300 rounded-full" 
              onClick={handleRequestSwap}
            >
              <Swords className="mr-2 h-4 w-4" /> 
              Request Swap
            </Button>
          )}
          {user.id === currentUser?.id && (
            <div className="w-full text-center py-2 text-sm text-muted-foreground bg-muted/50 rounded-full">
              This is your profile
            </div>
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
