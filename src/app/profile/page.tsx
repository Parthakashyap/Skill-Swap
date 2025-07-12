'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Star, Edit, Eye, EyeOff } from 'lucide-react';
import RatingStars from '@/components/rating-stars';
import ProfileForm from '@/components/profile-form';
import { getUserById } from '../actions/user';
import type { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session.user.id) {
      setIsLoading(true);
      getUserById(session.user.id)
        .then(userData => {
          if (userData) {
            setUser(userData);
            setIsPublic(userData.isPublic ?? true);
            // If user is new (has no skills), force edit mode
            if (session.user.isNewUser) {
              setIsEditing(true);
            }
          }
        })
        .finally(() => setIsLoading(false));
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [status, session]);

  if (isLoading || status === 'loading') {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">User not found</h2>
        <p className="text-muted-foreground">Could not find your profile data. Please try logging out and back in.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="relative">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="w-24 h-24 border-4 border-primary">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 mt-2">
              <CardTitle className="font-headline text-4xl">{user.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <RatingStars rating={user.rating} />
                <span className="text-sm text-muted-foreground">({user.reviews} reviews)</span>
              </div>
              <CardDescription className="mt-2 text-base">{user.bio}</CardDescription>
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
             <Button variant="outline" size="icon" onClick={() => setIsPublic(!isPublic)} aria-label={isPublic ? 'Profile is public' : 'Profile is private'}>
                {isPublic ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}
             </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
              aria-label="Edit Profile"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <ProfileForm user={user} onSave={() => setIsEditing(false)} />
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 text-primary">
                  <BookOpen className="w-5 h-5" /> Skills I Offer
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.skillsOffered?.length > 0 ? (
                     user.skillsOffered.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-md py-1 px-3">{skill}</Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No skills offered yet.</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 text-accent">
                  <Star className="w-5 h-5" /> Skills I Want to Learn
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.skillsWanted?.length > 0 ? (
                    user.skillsWanted.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-md py-1 px-3">{skill}</Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No skills wanted yet.</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5" /> My Availability
                </h3>
                <p className="text-muted-foreground">{user.availability || 'Not specified'}</p>
              </div>
               <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                   Location
                </h3>
                <p className="text-muted-foreground">{user.location || 'Not specified'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const ProfileSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex-1 mt-2 space-y-3">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/3" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/3" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
