# SkillSwap 🔄

A modern web platform that connects people worldwide to exchange skills and knowledge. Share what you know, learn what you love, and grow together in a vibrant community of learners and experts.

## 👥 Team Members

- **Nileemoy Pathak**
- **Partha Pratim Kashyap**
- **Shayan Chakroborty**
- **Ratush Pandit**

## ✨ Features

- **Skill Exchange**: Request and offer skill swaps with other users
- **User Profiles**: Showcase your skills and what you want to learn
- **Real-time Messaging**: Communicate with other users through built-in chat
- **Request Management**: Track incoming and outgoing swap requests
- **Admin Panel**: Comprehensive admin dashboard for platform management
- **Google Authentication**: Secure login with Google OAuth
- **Responsive Design**: Beautiful UI that works on all devices
- **Rating System**: Rate and review completed skill exchanges

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB
- **AI Integration**: Google AI (Genkit)
- **Deployment**: Vercel-ready
- **UI Components**: Custom design system with shadcn/ui

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Parthakashyap/Skill-Swap.git
   cd Skill-Swap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:9002](http://localhost:9002)

## 📱 Key Pages

- **Home** (`/`): Discover users and search for skills
- **Profile** (`/profile`): Manage your profile and skills
- **Requests** (`/requests`): Handle swap requests
- **Messages** (`/messages`): Chat with other users
- **Admin** (`/admin`): Admin dashboard (admin users only)


## 🎯 Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── admin/          # Admin panel
│   ├── api/            # API routes
│   ├── login/          # Authentication
│   ├── messages/       # Messaging system
│   ├── profile/        # User profiles
│   └── requests/       # Swap requests
├── components/         # Reusable UI components
├── lib/               # Utilities and configurations
├── hooks/             # Custom React hooks

```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

## 🌟 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


---

**SkillSwap** - Building bridges between knowledge and curiosity. Join our community of learners and experts sharing skills worldwide.
