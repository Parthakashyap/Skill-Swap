'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MoreHorizontal, Shield, Users, MessageSquare, TrendingUp, Settings, Crown, UserCheck } from 'lucide-react';
import { getAllUsers, updateUserAdminStatus, getAdminStats } from '@/app/actions/admin';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      if (!session?.user?.isAdmin) {
        router.push('/');
        return;
      }
      loadData();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        getAllUsers(),
        getAdminStats()
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminToggle = async (userId: string, currentAdminStatus: boolean) => {
    try {
      const success = await updateUserAdminStatus(userId, !currentAdminStatus);
      if (success) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isAdmin: !currentAdminStatus } : user
        ));
        toast({
          title: 'Success',
          description: `User ${!currentAdminStatus ? 'promoted to' : 'removed from'} admin.`,
        });
        const newStats = await getAdminStats();
        setStats(newStats);
      } else {
        throw new Error('Failed to update admin status');
      }
    } catch (error) {
      console.error('Failed to update admin status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update admin status.',
        variant: 'destructive',
      });
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50/30 via-blue-50/30 to-indigo-100/30 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-indigo-900/10">
        <Card className="max-w-md text-center p-8 border-0 shadow-xl">
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h1 className="font-headline text-2xl mb-4">Admin Panel</h1>
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50/30 via-blue-50/30 to-indigo-100/30 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-indigo-900/10">
        <Card className="max-w-md text-center p-8 border-0 shadow-xl">
          <CardContent>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="font-headline text-2xl mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">You don't have permission to access the admin panel.</p>
            <Button 
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              Go to Home
            </Button>
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
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-headline text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-muted-foreground text-lg">
                  Manage users, monitor activity, and oversee the SkillSwap community
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm bg-primary/10 text-primary">
                  <Crown className="w-4 h-4 mr-1" />
                  Administrator
                </Badge>
                <Avatar className="w-10 h-10 border-2 border-primary/20">
                  <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {session.user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/5 hover:shadow-2xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Active community members
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/5 hover:shadow-2xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                    <Shield className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{stats.adminUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Platform administrators
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50/50 dark:from-gray-800 dark:to-green-900/5 hover:shadow-2xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats.totalRequests}</div>
                  <p className="text-xs text-muted-foreground">
                    Skill swap requests
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-amber-50/50 dark:from-gray-800 dark:to-amber-900/5 hover:shadow-2xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-full">
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-600">{stats.pendingRequests}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting response
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-lg">
              <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="swaps" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                Swaps
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card className="border-0 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
                <div className="h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-muted/50">
                          <TableHead className="font-semibold">User</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold">Rating</TableHead>
                          <TableHead className="font-semibold">Skills Offered</TableHead>
                          <TableHead className="font-semibold">Admin Status</TableHead>
                          <TableHead className="font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className="border-muted/50 hover:bg-muted/30">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8 border border-muted">
                                  <AvatarImage src={user.avatar} alt={user.name} />
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {user.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="font-medium">{user.name}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{user.rating.toFixed(1)}</span>
                                <span className="text-xs text-muted-foreground">({user.reviews})</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-md">
                                {user.skillsOffered.slice(0, 3).map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs bg-primary/10 text-primary">
                                    {skill}
                                  </Badge>
                                ))}
                                {user.skillsOffered.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{user.skillsOffered.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Switch
                                  checked={user.isAdmin || false}
                                  onCheckedChange={() => handleAdminToggle(user.id, user.isAdmin || false)}
                                  disabled={user.id === session.user.id}
                                />
                                {user.isAdmin && (
                                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-600 border-yellow-200">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Admin
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <AdminActionMenu user={user} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="swaps">
              <Card className="border-0 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
                <div className="h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Swap Management</h3>
                  <p className="text-muted-foreground mb-6">
                    Swap management features will be available here. Monitor active exchanges and resolve disputes.
                  </p>
                  <Badge variant="outline" className="text-sm">
                    Coming Soon
                  </Badge>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="border-0 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
                <div className="h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Platform Settings</h3>
                  <p className="text-muted-foreground mb-6">
                    Configure platform settings, manage announcements, and customize the user experience.
                  </p>
                  <Badge variant="outline" className="text-sm">
                    Coming Soon
                  </Badge>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

const AdminActionMenu = ({ user }: { user: User }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/5">
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuLabel>User Actions</DropdownMenuLabel>
      <DropdownMenuItem className="cursor-pointer">
        <UserCheck className="mr-2 h-4 w-4" />
        View Profile
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer">
        <MessageSquare className="mr-2 h-4 w-4" />
        View Messages
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer text-amber-600">
        <Shield className="mr-2 h-4 w-4" />
        Suspend User
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer text-red-600">
        <Users className="mr-2 h-4 w-4" />
        Delete User
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
