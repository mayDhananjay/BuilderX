<<<<<<< HEAD
# BuilderX - AI-Powered Web App Builder

A comprehensive web application builder that enables users to create React and Node.js websites using AI assistance. Design, preview, edit, and download complete projects.

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Zustand** - State management
- **SWR** - Data fetching and caching

### Editor & Preview
- **Monaco Editor** (@monaco-editor/react) - VSCode-like code editor
- **Sandpack** (@codesandbox/sandpack-react) - Live React preview with bundling

### Backend & Database
- **Supabase** - Authentication (Google & GitHub OAuth) and PostgreSQL database
- **@supabase/ssr** - Server-side rendering support

### AI Integration
- **Google Gemini API** (@google/generative-ai) - Primary AI model
- **Ollama** - Local AI models (Phi 7B, CodeLlama)

### Utilities
- **JSZip** - Client-side ZIP file generation
- **file-saver** - File download utility
- **Lucide React** - Icon library

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- Supabase account
- Google AI API key (optional, for Gemini)
- Ollama installed locally (optional, for local AI models)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd builderx
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Run database migrations**
   
   The SQL migration file is located at `scripts/001_create_tables.sql`. Run it in your Supabase SQL Editor or use the Supabase CLI.

5. **Configure Supabase Auth Providers**
   
   In your Supabase Dashboard:
   - Go to Authentication > Providers
   - Enable Google OAuth and add your Google Client ID/Secret
   - Enable GitHub OAuth and add your GitHub Client ID/Secret
   - Add your site URL to the redirect URLs

6. **Start the development server**
   ```bash
   pnpm dev
   ```

7. **Open the app**
   
   Navigate to [https://builder-x-nine.vercel.app](https://builder-x-nine.vercel.app)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI API Keys (At least one required for AI features)
GEMINI_API_KEY=your-gemini-api-key

# Ollama Configuration (Optional - for local AI models)
OLLAMA_BASE_URL=http://localhost:11434

# Development Redirect URL (Auto-set in v0, optional locally)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://builder-x-nine.vercel.app/auth/callback
```

### Getting API Keys

| Service | How to Get |
|---------|-----------|
| **Supabase** | Create a project at [supabase.com](https://supabase.com) and copy the URL and anon key from Settings > API |
| **Gemini API** | Get a free API key at [ai.google.dev](https://ai.google.dev) |
| **Google OAuth** | Create credentials at [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| **GitHub OAuth** | Create an OAuth app at [GitHub Developer Settings](https://github.com/settings/developers) |

## Available Scripts

```bash
# Development
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Database (run in Supabase SQL Editor)
# scripts/001_create_tables.sql - Initial schema setup
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/           # AI chat endpoint
│   │   ├── download/       # ZIP download endpoint
│   │   ├── generate/       # Code generation endpoint
│   │   └── projects/       # Project CRUD endpoint
│   ├── auth/
│   │   ├── callback/       # OAuth callback handler
│   │   ├── error/          # Auth error page
│   │   ├── login/          # Login page
│   │   └── sign-up/        # Sign up page
│   ├── workspace/          # Main workspace page
│   ├── layout.tsx
│   ├── page.tsx            # Landing page
│   └── globals.css
├── components/
│   ├── ui/                 # Shadcn + Aceternity UI components
│   └── workspace/          # Workspace components
│       ├── chat-panel.tsx
│       ├── code-editor.tsx
│       ├── editor-tabs.tsx
│       ├── file-tree.tsx
│       ├── live-preview.tsx
│       ├── steps-panel.tsx
│       └── workspace-header.tsx
├── lib/
│   ├── supabase/           # Supabase client setup
│   ├── store.ts            # Zustand store
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Utility functions
├── scripts/
│   └── 001_create_tables.sql  # Database schema
└── middleware.ts           # Auth middleware
```

## Features

- **Landing Page** - Prompt input with Aceternity UI effects
- **Authentication** - Google & GitHub OAuth via Supabase
- **AI Code Generation** - Gemini, Ollama Phi 7B, CodeLlama support
- **Monaco Editor** - VSCode-like editing experience
- **Live Preview** - Real-time React preview with Sandpack
- **File Explorer** - Create, rename, delete files and folders
- **Project Management** - Save and load projects from database
- **ZIP Export** - Download complete projects

## Database Schema

The app uses four main tables:
- `profiles` - User profile data (auto-created on signup)
- `projects` - User projects with file data
- `chat_messages` - AI conversation history
- `templates` - Reusable project templates

All tables have Row Level Security (RLS) enabled.

## License

MIT
=======
# BulderX
Ai code Builder just prompt and create basic project 
>>>>>>> f0d3f1c05dfcd5d1d3f4f17febac23f136756d3c
