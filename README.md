# ZWriter

**ZWriter** is an AI-powered content management system and blog platform built with Next.js 16. It combines the power of modern web development with advanced AI capabilities to help content creators write, edit, and manage their blog posts with intelligent assistance.

## ✨ Features

### 🤖 AI-Powered Writing
- **Content Generation**: AI-assisted blog post creation using OpenAI
- **SEO Optimization**: Automatic SEO metadata generation
- **Content Rewriting**: Smart content improvement suggestions
- **Custom Prompts**: Tailored AI prompts for different content types

### 📝 Content Management
- **Rich Editor**: Intuitive content creation and editing
- **Draft & Publish**: Full post lifecycle management
- **Version Control**: Post versioning system
- **Media Management**: File upload and media handling
- **Slug Generation**: Automatic URL-friendly slug creation

### 👤 User System
- **Authentication**: Secure NextAuth.js integration with Google OAuth
- **User Roles**: Admin dashboard for content management
- **Profile Management**: User account and preferences
- **Password Security**: BCrypt-based password hashing

### 🛡️ Enterprise Features
- **GraphQL API**: Modern API with Apollo Server integration
- **Rate Limiting**: API protection and usage quotas
- **Database**: MongoDB with Mongoose ODM
- **Responsive Design**: Mobile-first Tailwind CSS styling
- **TypeScript**: Full type safety throughout the application

## 🚀 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React features
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Modern styling
- **Radix UI** - Accessible component library
- **Lucide React** - Beautiful icons

### Backend
- **GraphQL** - Apollo Server integration
- **MongoDB** - Document database
- **Mongoose** - MongoDB object modeling
- **NextAuth.js** - Authentication system

### AI & Integrations
- **OpenAI SDK** - AI content generation
- **Vercel AI SDK** - Streaming AI responses
- **React Hook Form** - Form management
- **Zod** - Schema validation

## 🛠️ Installation

### Prerequisites
- Node.js 18+ or Bun
- MongoDB instance
- OpenAI API key
- Google OAuth credentials (optional)

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd zwriter
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or npm install
   ```

3. **Environment configuration**
   ```bash
   cp env-example.txt .env.local
   ```

   Configure the following variables:
   ```env
   # Required
   OPENAI_API_KEY=your_openai_api_key_here
   MONGODB_URI=mongodb://localhost:27017/zwriter
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=http://localhost:3000
   
   # Optional - for Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # Rate limiting (optional)
   RATE_LIMIT_REQUESTS_PER_MINUTE=60
   TOKEN_CAP_PER_REQUEST=4096
   DAILY_QUOTA_REQUESTS=1000
   
   # Password security
   SALT_ROUNDS=12
   ```

4. **Run the development server**
   ```bash
   bun dev
   # or npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── ai/                    # AI integration and prompts
│   ├── generatePost.ts    # Post generation logic
│   ├── generateSeo.ts     # SEO metadata generation
│   ├── prompts.ts         # AI prompt templates
│   └── providers.ts       # AI provider configuration
├── app/                   # Next.js App Router pages
│   ├── (auth)/           # Authentication pages
│   ├── (public)/         # Public blog pages
│   ├── admin/            # Admin dashboard
│   └── api/              # API routes
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   └── providers/       # Context providers
├── models/              # Database models
├── services/            # Business logic services
├── lib/                 # Utilities and configurations
└── types/               # TypeScript type definitions
```

## 🚀 Usage

### Creating Content

1. **Sign in** to your account or create a new one
2. **Navigate to Admin** dashboard (`/admin`)
3. **Create a new post** using the editor
4. **Use AI assistance** for content generation and SEO optimization
5. **Preview and publish** your content

### AI Features

- **Generate content**: Use AI to create blog posts on any topic
- **SEO optimization**: Automatically generate SEO metadata
- **Content improvement**: Get suggestions for better content

### API Usage

The GraphQL API is available at `/api/graphql` with the following capabilities:
- Post management (CRUD operations)
- User management
- Media uploads
- Category organization

## 🧪 Available Scripts

```bash
# Development
bun dev          # Start development server
bun build        # Build for production
bun start        # Start production server

# Code quality
bun lint         # Run ESLint
```

## 🌐 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in the Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Make sure to set all required environment variables:
- `OPENAI_API_KEY`
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- OAuth credentials (if using Google login)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support, please open an issue in the repository or contact the development team.

---

Built with ❤️ using Next.js, TypeScript, and AI
