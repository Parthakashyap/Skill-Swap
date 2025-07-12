import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      isNewUser?: boolean;
    } & DefaultSession['user'];
  }
  
  interface User {
    isNewUser?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    isNewUser?: boolean;
  }
}
