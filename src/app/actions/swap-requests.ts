'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/mongodb';
import { SwapRequest, SwapRequestStatus, User } from '@/lib/types';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createChatFromSwapRequest } from '@/app/actions/messages';

export async function createSwapRequest(
  toUserId: string,
  offeredSkill: string,
  wantedSkill: string,
  message?: string
): Promise<{ success: boolean; message: string; requestId?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to create a swap request.' };
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    const swapRequestsCollection = db.collection('swapRequests');
    const notificationsCollection = db.collection('notifications');

    // Validate user IDs
    if (!ObjectId.isValid(session.user.id) || !ObjectId.isValid(toUserId)) {
      return { success: false, message: 'Invalid user ID format.' };
    }

    // Get both users
    const fromUser = await usersCollection.findOne({ _id: new ObjectId(session.user.id) });
    const toUser = await usersCollection.findOne({ _id: new ObjectId(toUserId) });

    if (!fromUser || !toUser) {
      return { success: false, message: 'One or both users not found.' };
    }

    // Check if user is trying to request from themselves
    if (session.user.id === toUserId) {
      return { success: false, message: 'You cannot request a swap with yourself.' };
    }

    // Check if there's already a pending request between these users
    const existingRequest = await swapRequestsCollection.findOne({
      fromUserId: new ObjectId(session.user.id),
      toUserId: new ObjectId(toUserId),
      status: 'pending'
    });

    if (existingRequest) {
      return { success: false, message: 'You already have a pending request with this user.' };
    }

    // Create the swap request
    const swapRequest = {
      fromUserId: new ObjectId(session.user.id),
      toUserId: new ObjectId(toUserId),
      fromUser: {
        id: fromUser._id.toString(),
        name: fromUser.name,
        avatar: fromUser.avatar
      },
      toUser: {
        id: toUser._id.toString(),
        name: toUser.name,
        avatar: toUser.avatar
      },
      offeredSkill,
      wantedSkill,
      status: 'pending' as SwapRequestStatus,
      createdAt: new Date(),
      message: message || undefined
    };

    const result = await swapRequestsCollection.insertOne(swapRequest);
    const requestId = result.insertedId.toString();

    // Create notification for the recipient
    const notification = {
      userId: new ObjectId(toUserId),
      type: 'swap_request',
      title: 'New Swap Request',
      message: `${fromUser.name} wants to swap ${offeredSkill} for ${wantedSkill}`,
      swapRequestId: result.insertedId,
      fromUserId: new ObjectId(session.user.id),
      fromUserName: fromUser.name,
      fromUserAvatar: fromUser.avatar,
      isRead: false,
      createdAt: new Date()
    };

    await notificationsCollection.insertOne(notification);

    revalidatePath('/requests');
    revalidatePath('/');

    return { 
      success: true, 
      message: `Swap request sent to ${toUser.name} successfully.`,
      requestId 
    };
  } catch (error) {
    console.error('Failed to create swap request:', error);
    return { success: false, message: 'Failed to create swap request. Please try again.' };
  }
}

export async function getSwapRequests(userId: string): Promise<SwapRequest[]> {
  try {
    const { db } = await connectToDatabase();
    const swapRequestsCollection = db.collection('swapRequests');

    if (!ObjectId.isValid(userId)) {
      return [];
    }

    const requests = await swapRequestsCollection.find({
      $or: [
        { fromUserId: new ObjectId(userId) },
        { toUserId: new ObjectId(userId) }
      ]
    }).sort({ createdAt: -1 }).toArray();

    return requests.map(request => ({
      id: request._id.toString(),
      fromUser: request.fromUser,
      toUser: request.toUser,
      offeredSkill: request.offeredSkill,
      wantedSkill: request.wantedSkill,
      status: request.status,
      createdAt: request.createdAt,
      message: request.message
    })) as SwapRequest[];
  } catch (error) {
    console.error('Failed to get swap requests:', error);
    return [];
  }
}

export async function updateSwapRequestStatus(
  requestId: string,
  status: SwapRequestStatus
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to update a swap request.' };
    }

    const { db } = await connectToDatabase();
    const swapRequestsCollection = db.collection('swapRequests');
    const notificationsCollection = db.collection('notifications');

    if (!ObjectId.isValid(requestId)) {
      return { success: false, message: 'Invalid request ID format.' };
    }

    // Get the swap request
    const swapRequest = await swapRequestsCollection.findOne({ _id: new ObjectId(requestId) });
    if (!swapRequest) {
      return { success: false, message: 'Swap request not found.' };
    }

    // Check if the current user is the recipient of the request
    if (swapRequest.toUserId.toString() !== session.user.id) {
      return { success: false, message: 'You can only update requests sent to you.' };
    }

    // Update the swap request status
    await swapRequestsCollection.updateOne(
      { _id: new ObjectId(requestId) },
      { $set: { status } }
    );

    // Create notification for the requester
    const notificationMessage = status === 'accepted' 
      ? `${swapRequest.toUser.name} accepted your swap request!`
      : `${swapRequest.toUser.name} rejected your swap request.`;

    const notification = {
      userId: swapRequest.fromUserId,
      type: 'swap_response',
      title: `Swap Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: notificationMessage,
      swapRequestId: new ObjectId(requestId),
      fromUserId: swapRequest.toUserId,
      fromUserName: swapRequest.toUser.name,
      fromUserAvatar: swapRequest.toUser.avatar,
      isRead: false,
      createdAt: new Date()
    };

    await notificationsCollection.insertOne(notification);

    // If the request was accepted, create a chat
    if (status === 'accepted') {
      await createChatFromSwapRequest(requestId);
    }

    revalidatePath('/requests');
    revalidatePath('/messages');
    revalidatePath('/');

    return { 
      success: true, 
      message: `Swap request ${status} successfully.` 
    };
  } catch (error) {
    console.error('Failed to update swap request status:', error);
    return { success: false, message: 'Failed to update swap request status.' };
  }
}

export async function getNotifications(userId: string): Promise<any[]> {
  try {
    const { db } = await connectToDatabase();
    const notificationsCollection = db.collection('notifications');

    if (!ObjectId.isValid(userId)) {
      return [];
    }

    const notifications = await notificationsCollection.find({
      userId: new ObjectId(userId)
    }).sort({ createdAt: -1 }).limit(50).toArray();

    return notifications.map(notification => ({
      id: notification._id.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      swapRequestId: notification.swapRequestId?.toString(),
      fromUserId: notification.fromUserId?.toString(),
      fromUserName: notification.fromUserName,
      fromUserAvatar: notification.fromUserAvatar,
      isRead: notification.isRead,
      createdAt: notification.createdAt
    }));
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
  try {
    const { db } = await connectToDatabase();
    const notificationsCollection = db.collection('notifications');

    if (!ObjectId.isValid(notificationId)) {
      return { success: false };
    }

    await notificationsCollection.updateOne(
      { _id: new ObjectId(notificationId) },
      { $set: { isRead: true } }
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return { success: false };
  }
} 