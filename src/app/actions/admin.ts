'use server';

import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { User } from '@/lib/types';

export async function getAllUsers(): Promise<User[]> {
  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    const users = await usersCollection.find({}).toArray();
    
    return users.map(user => ({
      ...user,
      id: user._id.toString(),
      _id: user._id.toString()
    })) as User[];
  } catch (error) {
    console.error('Failed to get all users:', error);
    throw new Error('Failed to fetch users');
  }
}

export async function updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }
    
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { isAdmin } }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Failed to update user admin status:', error);
    throw new Error('Failed to update user admin status');
  }
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    if (!ObjectId.isValid(userId)) {
      return false;
    }
    
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { isAdmin: 1 } }
    );
    
    return user?.isAdmin || false;
  } catch (error) {
    console.error('Failed to check user admin status:', error);
    return false;
  }
}

export async function getAdminStats() {
  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    const swapRequestsCollection = db.collection('swapRequests');
    
    const totalUsers = await usersCollection.countDocuments();
    const adminUsers = await usersCollection.countDocuments({ isAdmin: true });
    const totalRequests = await swapRequestsCollection.countDocuments();
    const pendingRequests = await swapRequestsCollection.countDocuments({ status: 'pending' });
    
    return {
      totalUsers,
      adminUsers,
      totalRequests,
      pendingRequests
    };
  } catch (error) {
    console.error('Failed to get admin stats:', error);
    throw new Error('Failed to fetch admin statistics');
  }
} 