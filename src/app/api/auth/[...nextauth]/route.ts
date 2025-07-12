import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { connectToDatabase } from '@/lib/mongodb';
import type { User } from '@/lib/types';
import { ObjectId } from 'mongodb';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false; // Prevent sign-in if email is not provided
      }
      
      try {
        const { db } = await connectToDatabase();
        const usersCollection = db.collection('users');

        // Check if user exists in our DB
        let existingUser = await usersCollection.findOne({ email: user.email });

        if (existingUser) {
          // User exists, not a new user
          (user as any).isNewUser = existingUser.skillsOffered?.length === 0;
          // Use existing DB _id
          (user as any).id = existingUser._id.toString();
        } else {
          // New user, create a new record in the database
          (user as any).isNewUser = true;
          
          const newUser: Omit<User, 'id' | '_id'> = {
              name: user.name ?? 'New User',
              email: user.email,
              avatar: user.image ?? `https://placehold.co/96x96.png`,
              bio: '',
              skillsOffered: [],
              skillsWanted: [],
              availability: '',
              rating: 0,
              reviews: 0,
              isPublic: true,
              location: ''
          };

          const result = await usersCollection.insertOne(newUser as any);
          (user as any).id = result.insertedId.toString();
        }
        return true;
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.isNewUser = (user as any).isNewUser;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isNewUser = token.isNewUser as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect to login page on error
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
