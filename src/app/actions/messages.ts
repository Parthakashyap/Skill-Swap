'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  createdAt: Date;
}

export interface Chat {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar: string;
  }[];
  swapRequestId: string;
  swapRequest: {
    offeredSkill: string;
    wantedSkill: string;
  };
  lastMessage?: {
    content: string;
    senderName: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  isCleared: boolean;
}

export async function getChats(userId: string): Promise<Chat[]> {
  try {
    const { db } = await connectToDatabase();
    const chatsCollection = db.collection('chats');
    const swapRequestsCollection = db.collection('swapRequests');

    if (!ObjectId.isValid(userId)) {
      return [];
    }

    // Get all chats where the user is a participant
    const chats = await chatsCollection.find({
      'participants.id': userId
    }).sort({ updatedAt: -1 }).toArray();

    // Get the corresponding swap requests for context
    const swapRequestIds = chats.map(chat => new ObjectId(chat.swapRequestId));
    const swapRequests = await swapRequestsCollection.find({
      _id: { $in: swapRequestIds }
    }).toArray();

    const swapRequestsMap = new Map(
      swapRequests.map(req => [req._id.toString(), req])
    );

    return chats.map(chat => ({
      id: chat._id.toString(),
      participants: chat.participants.map((participant: any) => ({
        id: participant.id.toString(),
        name: participant.name,
        avatar: participant.avatar
      })),
      swapRequestId: chat.swapRequestId.toString(),
      swapRequest: {
        offeredSkill: swapRequestsMap.get(chat.swapRequestId.toString())?.offeredSkill || '',
        wantedSkill: swapRequestsMap.get(chat.swapRequestId.toString())?.wantedSkill || ''
      },
      lastMessage: chat.lastMessage ? {
        content: chat.lastMessage.content,
        senderName: chat.lastMessage.senderName,
        createdAt: chat.lastMessage.createdAt
      } : undefined,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      isCleared: chat.isCleared || false
    })) as Chat[];
  } catch (error) {
    console.error('Failed to get chats:', error);
    return [];
  }
}

export async function getMessages(chatId: string): Promise<Message[]> {
  try {
    const { db } = await connectToDatabase();
    const messagesCollection = db.collection('messages');

    if (!ObjectId.isValid(chatId)) {
      return [];
    }

    const messages = await messagesCollection.find({
      chatId: new ObjectId(chatId)
    }).sort({ createdAt: 1 }).toArray();

    return messages.map(message => ({
      id: message._id.toString(),
      chatId: message.chatId.toString(),
      senderId: message.senderId.toString(),
      senderName: message.senderName,
      senderAvatar: message.senderAvatar,
      content: message.content,
      createdAt: message.createdAt
    })) as Message[];
  } catch (error) {
    console.error('Failed to get messages:', error);
    return [];
  }
}

export async function sendMessage(
  chatId: string,
  content: string
): Promise<{ success: boolean; message: string; messageId?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to send a message.' };
    }

    const { db } = await connectToDatabase();
    const messagesCollection = db.collection('messages');
    const chatsCollection = db.collection('chats');
    const usersCollection = db.collection('users');

    if (!ObjectId.isValid(chatId)) {
      return { success: false, message: 'Invalid chat ID.' };
    }

    // Verify the user is a participant in this chat
    const chat = await chatsCollection.findOne({
      _id: new ObjectId(chatId),
      'participants.id': session.user.id
    });

    if (!chat) {
      return { success: false, message: 'You are not a participant in this chat.' };
    }

    // Get user info
    const user = await usersCollection.findOne({ _id: new ObjectId(session.user.id) });
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    // Create the message
    const message = {
      chatId: new ObjectId(chatId),
      senderId: new ObjectId(session.user.id),
      senderName: user.name,
      senderAvatar: user.avatar,
      content: content.trim(),
      createdAt: new Date()
    };

    const result = await messagesCollection.insertOne(message);
    const messageId = result.insertedId.toString();

    // Update the chat's last message
    await chatsCollection.updateOne(
      { _id: new ObjectId(chatId) },
      {
        $set: {
          lastMessage: {
            content: content.trim(),
            senderName: user.name,
            createdAt: new Date()
          },
          updatedAt: new Date()
        }
      }
    );

    revalidatePath('/messages');
    revalidatePath('/messages/[chatId]');

    return { 
      success: true, 
      message: 'Message sent successfully.',
      messageId 
    };
  } catch (error) {
    console.error('Failed to send message:', error);
    return { success: false, message: 'Failed to send message. Please try again.' };
  }
}

export async function createChatFromSwapRequest(swapRequestId: string): Promise<{ success: boolean; message: string; chatId?: string }> {
  try {
    const { db } = await connectToDatabase();
    const swapRequestsCollection = db.collection('swapRequests');
    const chatsCollection = db.collection('chats');

    if (!ObjectId.isValid(swapRequestId)) {
      return { success: false, message: 'Invalid swap request ID.' };
    }

    // Check if chat already exists
    const existingChat = await chatsCollection.findOne({
      swapRequestId: new ObjectId(swapRequestId)
    });

    if (existingChat) {
      return { 
        success: true, 
        message: 'Chat already exists.',
        chatId: existingChat._id.toString()
      };
    }

    // Get the swap request
    const swapRequest = await swapRequestsCollection.findOne({
      _id: new ObjectId(swapRequestId)
    });

    if (!swapRequest) {
      return { success: false, message: 'Swap request not found.' };
    }

    if (swapRequest.status !== 'accepted') {
      return { success: false, message: 'Can only create chat for accepted swap requests.' };
    }

    // Create the chat
    const chat = {
      participants: [
        {
          id: swapRequest.fromUser.id,
          name: swapRequest.fromUser.name,
          avatar: swapRequest.fromUser.avatar
        },
        {
          id: swapRequest.toUser.id,
          name: swapRequest.toUser.name,
          avatar: swapRequest.toUser.avatar
        }
      ],
      swapRequestId: new ObjectId(swapRequestId),
      createdAt: new Date(),
      updatedAt: new Date(),
      isCleared: false
    };

    const result = await chatsCollection.insertOne(chat);
    const chatId = result.insertedId.toString();

    revalidatePath('/messages');

    return { 
      success: true, 
      message: 'Chat created successfully.',
      chatId 
    };
  } catch (error) {
    console.error('Failed to create chat:', error);
    return { success: false, message: 'Failed to create chat. Please try again.' };
  }
}

export async function clearChat(chatId: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to clear a chat.' };
    }

    const { db } = await connectToDatabase();
    const chatsCollection = db.collection('chats');
    const messagesCollection = db.collection('messages');

    if (!ObjectId.isValid(chatId)) {
      return { success: false, message: 'Invalid chat ID.' };
    }

    // Verify the user is a participant in this chat
    const chat = await chatsCollection.findOne({
      _id: new ObjectId(chatId),
      'participants.id': session.user.id
    });

    if (!chat) {
      return { success: false, message: 'You are not a participant in this chat.' };
    }

    // Mark the chat as cleared for this user
    await chatsCollection.updateOne(
      { _id: new ObjectId(chatId) },
      { 
        $set: { 
          isCleared: true,
          updatedAt: new Date()
        } 
      }
    );

    // Delete all messages in the chat
    await messagesCollection.deleteMany({
      chatId: new ObjectId(chatId)
    });

    revalidatePath('/messages');
    revalidatePath('/messages/[chatId]');

    return { 
      success: true, 
      message: 'Chat cleared successfully.' 
    };
  } catch (error) {
    console.error('Failed to clear chat:', error);
    return { success: false, message: 'Failed to clear chat. Please try again.' };
  }
}

export async function markChatAsCleared(chatId: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to mark a chat as cleared.' };
    }

    const { db } = await connectToDatabase();
    const chatsCollection = db.collection('chats');

    if (!ObjectId.isValid(chatId)) {
      return { success: false, message: 'Invalid chat ID.' };
    }

    // Verify the user is a participant in this chat
    const chat = await chatsCollection.findOne({
      _id: new ObjectId(chatId),
      'participants.id': session.user.id
    });

    if (!chat) {
      return { success: false, message: 'You are not a participant in this chat.' };
    }

    // Mark the chat as cleared for this user
    await chatsCollection.updateOne(
      { _id: new ObjectId(chatId) },
      { 
        $set: { 
          isCleared: true,
          updatedAt: new Date()
        } 
      }
    );

    revalidatePath('/messages');
    revalidatePath('/messages/[chatId]');

    return { 
      success: true, 
      message: 'Chat marked as cleared.' 
    };
  } catch (error) {
    console.error('Failed to mark chat as cleared:', error);
    return { success: false, message: 'Failed to mark chat as cleared. Please try again.' };
  }
} 