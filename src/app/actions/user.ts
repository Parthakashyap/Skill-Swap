'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/types';
import { ObjectId } from 'mongodb';

export async function getUsers(searchTerm: string = ''): Promise<User[]> {
  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection<User>('users');
    
    let query = {};
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, 'i');
      query = {
        $or: [
          { name: searchRegex },
          { skillsOffered: searchRegex },
          { skillsWanted: searchRegex },
        ],
      };
    }

    const users = await usersCollection.find(query).toArray();
    
    // Convert ObjectId to string for client-side compatibility
    return users.map(user => ({
      ...user,
      id: user._id.toString(),
      _id: user._id.toString(), // Also alias _id to string
    })) as User[];
  } catch (error) {
    console.error('Failed to get users:', error);
    return [];
  }
}

export async function getUserById(userId: string): Promise<User | null> {
    try {
        const { db } = await connectToDatabase();
        const usersCollection = db.collection<User>('users');
        
        if (!ObjectId.isValid(userId)) {
            console.error('Invalid user ID format');
            return null;
        }

        const user = await usersCollection.findOne({ _id: new ObjectId(userId) as any });

        if (user) {
          // Convert ObjectId to string
          return { ...user, id: user._id.toString(), _id: user._id.toString() } as User;
        }

        return null;
    } catch (error) {
        console.error('Failed to get user by ID:', error);
        return null;
    }
}


export async function updateUserProfile(userId: string, data: Partial<User>) {
  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    if (!ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID format');
    }
    const objectId = new ObjectId(userId);

    const updateData: any = { ...data };
    
    // Convert comma-separated strings to arrays
    if (typeof data.skillsOffered === 'string') {
        updateData.skillsOffered = data.skillsOffered.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof data.skillsWanted === 'string') {
        updateData.skillsWanted = data.skillsWanted.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    delete updateData.id; // Don't try to update the id field
    delete updateData._id;

    const result = await usersCollection.updateOne(
      { _id: objectId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      throw new Error('User not found');
    }

    revalidatePath('/profile');
    revalidatePath('/');

    return { success: true, message: 'Profile updated successfully.' };
  } catch (error) {
    console.error('Failed to update profile:', error);
    return { success: false, message: 'Failed to update profile.' };
  }
}
