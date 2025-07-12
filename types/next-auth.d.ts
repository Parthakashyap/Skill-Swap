import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      isNewUser?: boolean;
      isAdmin?: boolean; // Add admin field
    } & DefaultSession['user'];
  }
  
  interface User {
    isNewUser?: boolean;
    isAdmin?: boolean; // Add admin field
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    isNewUser?: boolean;
    isAdmin?: boolean; // Add admin field
  }
}
