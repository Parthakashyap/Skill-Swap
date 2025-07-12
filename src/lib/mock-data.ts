// This file is now deprecated in favor of fetching data from MongoDB.
// It is kept here for reference for the requests page, which still uses it.
import type { User, SwapRequest } from './types';

export const mockUsers: User[] = [
  {
    _id: '1',
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://placehold.co/96x96.png',
    bio: 'Frontend developer with a passion for design systems and a knack for baking sourdough bread.',
    skillsOffered: ['React', 'TypeScript', 'Figma', 'Sourdough Baking'],
    skillsWanted: ['Guitar', 'Creative Writing', 'Data Visualization'],
    availability: 'Weekends, Mon/Wed evenings',
    rating: 4.8,
    reviews: 24,
  },
  // Other mock users...
];

export const currentUser = {
    _id: '1',
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://placehold.co/96x96.png',
    bio: 'Frontend developer with a passion for design systems and a knack for baking sourdough bread.',
    skillsOffered: ['React', 'TypeScript', 'Figma', 'Sourdough Baking'],
    skillsWanted: ['Guitar', 'Creative Writing', 'Data Visualization'],
    availability: 'Weekends, Mon/Wed evenings',
    rating: 4.8,
    reviews: 24,
    location: 'San Francisco, CA',
    isPublic: true,
};

export const mockRequests: SwapRequest[] = [
  {
    id: 'req1',
    fromUser: {id: '2', name: 'Bob Williams', avatar: 'https://placehold.co/96x96.png'},
    toUser: {id: '1', name: 'Alice Johnson', avatar: 'https://placehold.co/96x96.png'},
    offeredSkill: 'Python',
    wantedSkill: 'Sourdough Baking',
    status: 'pending',
    createdAt: new Date('2024-05-20T10:00:00Z'),
    message: 'Hey Alice! I saw you\'re a pro at baking sourdough. I\'d love to learn. I can teach you the basics of Python for data analysis in return. Let me know what you think!',
  },
  {
    id: 'req2',
    fromUser: {id: '3', name: 'Charlie Brown', avatar: 'https://placehold.co/96x96.png'},
    toUser: {id: '1', name: 'Alice Johnson', avatar: 'https://placehold.co/96x96.png'},
    offeredSkill: 'Guitar',
    wantedSkill: 'React',
    status: 'accepted',
    createdAt: new Date('2024-05-18T14:30:00Z'),
  },
  // Other mock requests...
];
