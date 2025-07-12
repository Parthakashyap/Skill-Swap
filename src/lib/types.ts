export interface User {
  _id: string; // MongoDB uses _id, but we'll handle ObjectId conversion on server side
  id: string; // Keep `id` as a string for easier use in components
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location?: string;
  isPublic?: boolean;
  isAdmin?: boolean; // Add admin field
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string;
  rating: number;
  reviews: number;
}

export type SwapRequestStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface SwapRequest {
  id: string;
  fromUser: Pick<User, 'id' | 'name' | 'avatar'>;
  toUser: Pick<User, 'id' | 'name' | 'avatar'>;
  offeredSkill: string;
  wantedSkill: string;
  status: SwapRequestStatus;
  createdAt: Date;
  message?: string;
}

export interface Feedback {
  id: string;
  swapId: string;
  fromUser: Pick<User, 'id' | 'name' | 'avatar'>;
  toUser: Pick<User, 'id' | 'name' | 'avatar'>;
  rating: number;
  comment: string;
  createdAt: Date;
}
