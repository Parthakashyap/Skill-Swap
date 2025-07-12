'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogIn, LogOut, User, MessageCircle, Settings, Bell, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { NotificationDropdown } from '../notification-dropdown';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/requests', label: 'Requests' },
  { href: '/messages', label: 'Messages' },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [isOpen, setIsOpen] = useState(false);

  // Add admin link conditionally
  const allNavLinks = [
    ...navLinks,
    ...(session?.user?.isAdmin ? [{ href: '/admin', label: 'Admin' }] : [])
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/20 dark:border-gray-700/20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-gray-800/75">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/2 via-blue-500/2 to-indigo-500/2"></div>
      <div className="container relative flex h-16 items-center">
        <Link href="/" className="mr-8 flex items-center group">
          <span className="font-headline text-2xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
            SkillSwap
          </span>
        </Link>
        
        <nav className="hidden md:flex flex-1 items-center space-x-2">
          {allNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:bg-primary/5',
                pathname === link.href 
                  ? 'text-primary bg-primary/10 shadow-sm' 
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              {link.label}
              {pathname === link.href && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
              )}
            </Link>
          ))}
        </nav>
        
        <div className="hidden md:flex items-center justify-end space-x-3">
          {isAuthenticated ? (
            <>
              <NotificationDropdown />
              <UserMenu />
            </>
          ) : (
            <Button 
              onClick={() => signIn()}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full px-6"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login / Register
            </Button>
          )}
        </div>
        
        <div className="flex flex-1 items-center justify-end md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/5">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
                         <SheetContent side="right" className="w-80 bg-gradient-to-b from-background to-muted/30">
               <nav className="grid gap-4 text-lg font-medium mt-8">
                 <Link href="/" onClick={handleLinkClick} className="flex items-center mb-8 group">
                   <span className="font-headline text-2xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                     SkillSwap
                   </span>
                 </Link>
                 
                 {/* Main Navigation */}
                 <Link
                   href="/"
                   onClick={handleLinkClick}
                   className={cn(
                     'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-primary/5',
                     pathname === '/' 
                       ? 'text-primary bg-primary/10 shadow-sm border-l-4 border-primary' 
                       : 'text-muted-foreground hover:text-primary'
                   )}
                 >
                   <span>Home</span>
                 </Link>
                 
                 {isAuthenticated ? (
                   <>
                     <Link 
                       href="/profile" 
                       onClick={handleLinkClick}
                       className={cn(
                         'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-primary/5',
                         pathname === '/profile' 
                           ? 'text-primary bg-primary/10 shadow-sm border-l-4 border-primary' 
                           : 'text-muted-foreground hover:text-primary'
                       )}
                     >
                       <User className="h-5 w-5" />
                       <span>Profile</span>
                     </Link>
                     <Link 
                       href="/requests" 
                       onClick={handleLinkClick}
                       className={cn(
                         'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-primary/5',
                         pathname === '/requests' 
                           ? 'text-primary bg-primary/10 shadow-sm border-l-4 border-primary' 
                           : 'text-muted-foreground hover:text-primary'
                       )}
                     >
                       <Users className="h-5 w-5" />
                       <span>Requests</span>
                     </Link>
                     <Link 
                       href="/messages" 
                       onClick={handleLinkClick}
                       className={cn(
                         'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-primary/5',
                         pathname === '/messages' 
                           ? 'text-primary bg-primary/10 shadow-sm border-l-4 border-primary' 
                           : 'text-muted-foreground hover:text-primary'
                       )}
                     >
                       <MessageCircle className="h-5 w-5" />
                       <span>Messages</span>
                     </Link>
                     {session?.user?.isAdmin && (
                       <Link 
                         href="/admin" 
                         onClick={handleLinkClick}
                         className={cn(
                           'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-primary/5',
                           pathname === '/admin' 
                             ? 'text-primary bg-primary/10 shadow-sm border-l-4 border-primary' 
                             : 'text-muted-foreground hover:text-primary'
                         )}
                       >
                         <Settings className="h-5 w-5" />
                         <span>Admin</span>
                       </Link>
                     )}
                     <div className="border-t border-muted/20 my-4"></div>
                     <Button 
                       variant="ghost" 
                       onClick={() => {
                         signOut();
                         handleLinkClick();
                       }}
                       className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 justify-start text-lg h-auto"
                     >
                       <LogOut className="h-5 w-5" />
                       <span>Logout</span>
                     </Button>
                   </>
                 ) : (
                   <>
                     <div className="border-t border-muted/20 my-4"></div>
                     <Button 
                       onClick={() => {
                         signIn();
                         handleLinkClick();
                       }}
                       className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg justify-start text-lg h-auto"
                     >
                       <LogIn className="h-5 w-5" />
                       <span>Login</span>
                     </Button>
                   </>
                 )}
               </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

const UserMenu = () => {
  const { data: session } = useSession();
  
  if (!session?.user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary/5">
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary font-semibold">
              {session.user.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50 shadow-xl" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary font-semibold text-sm">
                  {session.user.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{session.user.name}</p>
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
        <DropdownMenuItem asChild className="hover:bg-primary/5 cursor-pointer">
          <Link href="/profile" className="flex items-center space-x-3 px-4 py-3">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="hover:bg-primary/5 cursor-pointer">
          <Link href="/requests" className="flex items-center space-x-3 px-4 py-3">
            <Users className="h-4 w-4" />
            <span>My Swaps</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="hover:bg-primary/5 cursor-pointer">
          <Link href="/messages" className="flex items-center space-x-3 px-4 py-3">
            <MessageCircle className="h-4 w-4" />
            <span>Messages</span>
          </Link>
        </DropdownMenuItem>
        {session?.user?.isAdmin && (
          <DropdownMenuItem asChild className="hover:bg-primary/5 cursor-pointer">
            <Link href="/admin" className="flex items-center space-x-3 px-4 py-3">
              <Settings className="h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
        <DropdownMenuItem 
          onClick={() => signOut()}
          className="hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 cursor-pointer"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
