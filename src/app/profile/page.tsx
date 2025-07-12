'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Star, Edit, Eye, EyeOff, MapPin, Calendar, Users } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4">User not found</h2>
            <p className="text-muted-foreground">Could not find your profile data. Please try logging out and back in.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-blue-50/30 to-indigo-100/30 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-indigo-900/10">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Card */}
          <Card className="mb-8 border-0 shadow-2xl bg-gradient-to-r from-white via-white to-purple-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-purple-900/20 backdrop-blur-sm overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
            <CardHeader className="relative pb-6">
              <div className="flex flex-col lg:flex-row items-start gap-6">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-xl">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary text-2xl font-bold">
                      {user.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="font-headline text-4xl mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    {user.name}
                  </CardTitle>
                  <div className="flex items-center gap-3 mb-3">
                    <RatingStars rating={user.rating} />
                    <span className="text-sm text-muted-foreground">({user.reviews} reviews)</span>
                    <Badge variant="secondary" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      Active Member
                    </Badge>
                  </div>
                  <CardDescription className="text-base leading-relaxed max-w-2xl">
                    {user.bio || "Welcome to my profile! I'm excited to share knowledge and learn new skills with the community."}
                  </CardDescription>
                </div>
              </div>
              <div className="absolute top-6 right-6 flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setIsPublic(!isPublic)} 
                  className="hover:bg-primary/5 hover:border-primary/50"
                  aria-label={isPublic ? 'Profile is public' : 'Profile is private'}
                >
                  {isPublic ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsEditing(!isEditing)}
                  className="hover:bg-primary/5 hover:border-primary/50"
                  aria-label="Edit Profile"
                >
                  <Edit className="w-4 h-4 text-primary" />
                </Button>
              </div>
            </CardHeader>
          </Card>

          {isEditing ? (
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
                <CardDescription>Update your skills and information</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm user={user} onSave={() => setIsEditing(false)} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Skills Offered */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-primary/5 dark:from-gray-800 dark:to-primary/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    Skills I Offer
                  </CardTitle>
                  <CardDescription>
                    Knowledge and expertise I can share with others
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {user.skillsOffered?.length > 0 ? (
                      user.skillsOffered.map((skill) => (
                        <Badge 
                          key={skill} 
                          variant="secondary" 
                          className="text-sm py-2 px-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                        >
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No skills offered yet.</p>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(true)}
                          className="mt-2"
                        >
                          Add Skills
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Skills Wanted */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-amber-50/50 dark:from-gray-800 dark:to-amber-900/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-amber-500/10 rounded-full">
                      <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    Skills I Want to Learn
                  </CardTitle>
                  <CardDescription>
                    Areas where I'd love to gain new knowledge
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {user.skillsWanted?.length > 0 ? (
                      user.skillsWanted.map((skill) => (
                        <Badge 
                          key={skill} 
                          variant="outline" 
                          className="text-sm py-2 px-3 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
                        >
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No skills wanted yet.</p>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(true)}
                          className="mt-2"
                        >
                          Add Learning Goals
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Availability */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-blue-500/10 rounded-full">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    My Availability
                  </CardTitle>
                  <CardDescription>
                    When I'm available for skill exchanges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm font-medium">
                      {user.availability || 'Not specified'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50/50 dark:from-gray-800 dark:to-green-900/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-green-500/10 rounded-full">
                      <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    Location
                  </CardTitle>
                  <CardDescription>
                    Where I'm based for in-person meetups
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-4 bg-green-50/50 dark:bg-green-900/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm font-medium">
                      {user.location || 'Not specified'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ProfileSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-blue-50/30 to-indigo-100/30 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-indigo-900/10">
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-8 border-0 shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
          <CardHeader>
            <div className="flex flex-col lg:flex-row items-start gap-6">
              <Skeleton className="w-32 h-32 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </CardHeader>
        </Card>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  </div>
);
