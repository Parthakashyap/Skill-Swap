'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import UserProfileCard from '@/components/user-profile-card';
import { Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getUsers } from './actions/user';
import type { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      const users = await getUsers(searchTerm);
      setFilteredUsers(users);
      setIsLoading(false);
    };
    
    // Debounce search
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary mb-4">
          Swap Skills, Gain Knowledge
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Join a community of learners and experts. Offer what you know, and learn what you don't.
          It's that simple.
        </p>
      </section>

      <section>
        <div className="relative mb-8 max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, skill offered, or skill wanted..."
            className="pl-10 h-12 text-lg rounded-full shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user) => (
               <UserProfileCard key={user.id} user={user} currentUser={session?.user} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const CardSkeleton = () => (
  <div className="flex flex-col space-y-3 p-4 border rounded-lg shadow-sm">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
    <div className="space-y-2 pt-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
     <div className="space-y-2 pt-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);
