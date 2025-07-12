'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export interface Feedback {
  id: string;
  swapRequestId: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  toUserName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export async function submitFeedback(
  swapRequestId: string,
  toUserId: string,
  rating: number,
  comment: string
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to submit feedback.' };
    }

    const { db } = await connectToDatabase();
    const feedbackCollection = db.collection('feedback');
    const swapRequestsCollection = db.collection('swapRequests');
    const usersCollection = db.collection('users');

    if (!ObjectId.isValid(swapRequestId) || !ObjectId.isValid(toUserId)) {
      return { success: false, message: 'Invalid request or user ID.' };
    }

    // Verify the swap request exists and is completed
    const swapRequest = await swapRequestsCollection.findOne({
      _id: new ObjectId(swapRequestId),
      status: 'completed'
    });

    if (!swapRequest) {
      return { success: false, message: 'Swap request not found or not completed.' };
    }

    // Verify the current user is a participant in this swap
    if (swapRequest.fromUserId.toString() !== session.user.id && 
        swapRequest.toUserId.toString() !== session.user.id) {
      return { success: false, message: 'You are not a participant in this swap.' };
    }

    // Check if feedback already exists from this user for this swap
    const existingFeedback = await feedbackCollection.findOne({
      swapRequestId: new ObjectId(swapRequestId),
      fromUserId: new ObjectId(session.user.id)
    });

    if (existingFeedback) {
      return { success: false, message: 'You have already submitted feedback for this swap.' };
    }

    // Get user names
    const fromUser = await usersCollection.findOne({ _id: new ObjectId(session.user.id) });
    const toUser = await usersCollection.findOne({ _id: new ObjectId(toUserId) });

    if (!fromUser || !toUser) {
      return { success: false, message: 'User not found.' };
    }

    // Create the feedback
    const feedback = {
      swapRequestId: new ObjectId(swapRequestId),
      fromUserId: new ObjectId(session.user.id),
      toUserId: new ObjectId(toUserId),
      fromUserName: fromUser.name,
      toUserName: toUser.name,
      rating: Math.max(1, Math.min(5, rating)), // Ensure rating is between 1-5
      comment: comment.trim(),
      createdAt: new Date()
    };

    await feedbackCollection.insertOne(feedback);

    // Update the recipient's average rating
    await updateUserRating(toUserId);

    revalidatePath('/requests');
    revalidatePath('/profile');

    return { 
      success: true, 
      message: 'Feedback submitted successfully.' 
    };
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    return { success: false, message: 'Failed to submit feedback. Please try again.' };
  }
}

export async function updateUserRating(userId: string): Promise<void> {
  try {
    const { db } = await connectToDatabase();
    const feedbackCollection = db.collection('feedback');
    const usersCollection = db.collection('users');

    if (!ObjectId.isValid(userId)) {
      return;
    }

    // Get all feedback for this user
    const feedback = await feedbackCollection.find({
      toUserId: new ObjectId(userId)
    }).toArray();

    if (feedback.length === 0) {
      // No feedback yet, set default values
      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            rating: 0,
            reviews: 0
          } 
        }
      );
      return;
    }

    // Calculate average rating
    const totalRating = feedback.reduce((sum, fb) => sum + fb.rating, 0);
    const averageRating = totalRating / feedback.length;
    const reviewCount = feedback.length;

    // Update user's rating and review count
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
          reviews: reviewCount
        } 
      }
    );
  } catch (error) {
    console.error('Failed to update user rating:', error);
  }
}

export async function markSwapAsCompleted(swapRequestId: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to mark a swap as completed.' };
    }

    const { db } = await connectToDatabase();
    const swapRequestsCollection = db.collection('swapRequests');

    if (!ObjectId.isValid(swapRequestId)) {
      return { success: false, message: 'Invalid swap request ID.' };
    }

    // Get the swap request
    const swapRequest = await swapRequestsCollection.findOne({
      _id: new ObjectId(swapRequestId)
    });

    if (!swapRequest) {
      return { success: false, message: 'Swap request not found.' };
    }

    // Check if the current user is a participant
    if (swapRequest.fromUserId.toString() !== session.user.id && 
        swapRequest.toUserId.toString() !== session.user.id) {
      return { success: false, message: 'You are not a participant in this swap.' };
    }

    // Check if the swap is already accepted
    if (swapRequest.status !== 'accepted') {
      return { success: false, message: 'Can only mark accepted swaps as completed.' };
    }

    // Update the swap request status to completed
    await swapRequestsCollection.updateOne(
      { _id: new ObjectId(swapRequestId) },
      { $set: { status: 'completed' } }
    );

    revalidatePath('/requests');
    revalidatePath('/');

    return { 
      success: true, 
      message: 'Swap marked as completed successfully.' 
    };
  } catch (error) {
    console.error('Failed to mark swap as completed:', error);
    return { success: false, message: 'Failed to mark swap as completed. Please try again.' };
  }
} 

export async function checkFeedbackExists(
  swapRequestId: string,
  fromUserId: string
): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const feedbackCollection = db.collection('feedback');

    if (!ObjectId.isValid(swapRequestId) || !ObjectId.isValid(fromUserId)) {
      return false;
    }

    const existingFeedback = await feedbackCollection.findOne({
      swapRequestId: new ObjectId(swapRequestId),
      fromUserId: new ObjectId(fromUserId)
    });

    return !!existingFeedback;
  } catch (error) {
    console.error('Failed to check feedback existence:', error);
    return false;
  }
}

export async function getFeedbackForSwap(swapRequestId: string): Promise<Feedback[]> {
  try {
    const { db } = await connectToDatabase();
    const feedbackCollection = db.collection('feedback');

    if (!ObjectId.isValid(swapRequestId)) {
      return [];
    }

    const feedback = await feedbackCollection.find({
      swapRequestId: new ObjectId(swapRequestId)
    }).sort({ createdAt: -1 }).toArray();

    return feedback.map(fb => ({
      id: fb._id.toString(),
      swapRequestId: fb.swapRequestId.toString(),
      fromUserId: fb.fromUserId.toString(),
      toUserId: fb.toUserId.toString(),
      fromUserName: fb.fromUserName,
      toUserName: fb.toUserName,
      rating: fb.rating,
      comment: fb.comment,
      createdAt: fb.createdAt
    })) as Feedback[];
  } catch (error) {
    console.error('Failed to get feedback:', error);
    return [];
  }
} 