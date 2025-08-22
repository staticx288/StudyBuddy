# Learning VI - AI Chat Interface

## Overview

Learning VI is a sophisticated AI chat interface application built as a full-stack web application. The system provides a ChatGPT-like experience with advanced features including intelligent model routing, conversation management, real-time messaging, and multi-session support. The application uses a modern React frontend with a Node.js/Express backend, PostgreSQL database with Drizzle ORM, and WebSocket integration for real-time features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server
- **TailwindCSS** with shadcn/ui component library for consistent styling
- **Wouter** for client-side routing
- **TanStack Query** for server state management and caching
- **Context API** for theme management and WebSocket communication
- **Dark/Light theme support** with persistent user preferences

### Backend Architecture
- **Express.js** server with TypeScript for API endpoints
- **RESTful API design** with proper error handling and middleware
- **WebSocket integration** using 'ws' library for real-time features like typing indicators
- **Session-based authentication** using express-session with PostgreSQL store
- **Replit Authentication** integration for user management
- **Model routing system** that automatically selects AI models based on message prefixes (code:, research:, creative:, analysis:)

### Database Design
- **PostgreSQL** as the primary database
- **Drizzle ORM** for type-safe database operations and migrations
- **Database schema** includes:
  - Users table for authentication and profile data
  - Conversations table for chat session management
  - Messages table for storing chat history with role-based messaging (user/assistant)
  - Sessions table for secure session management

### Real-time Communication
- **WebSocket server** for bidirectional communication
- **Typing indicators** and real-time message delivery
- **Connection management** with automatic reconnection logic
- **Message broadcasting** for multi-client scenarios

### UI/UX Design Patterns
- **Responsive design** with mobile-first approach
- **Sidebar navigation** with collapsible conversation list
- **Chat interface** with message bubbles, timestamps, and action buttons
- **Loading states** and error handling throughout the application
- **Accessibility features** with proper ARIA labels and keyboard navigation

### State Management Strategy
- **TanStack Query** for server state, caching, and background refetching
- **React Context** for global UI state (theme, WebSocket connection)
- **Local component state** for form inputs and temporary UI state
- **Optimistic updates** for improved user experience

## External Dependencies

### AI Services
- **OpenAI API** integration for GPT models with intelligent routing
- **Model selection system** supporting multiple AI providers
- **Automatic fallback mechanisms** for model availability

### Database Services
- **Neon Database** (serverless PostgreSQL) for production deployment
- **Connection pooling** for efficient database resource management
- **Migration system** using Drizzle Kit for schema management

### Authentication
- **Replit Auth** integration using OpenID Connect
- **Session management** with secure cookie handling
- **User profile management** with avatar and profile data

### Development Tools
- **ESBuild** for production bundling
- **TypeScript** for type safety across the entire stack
- **Prettier** and **ESLint** for code formatting and quality
- **PostCSS** with Autoprefixer for CSS processing

### UI Framework
- **Radix UI** primitives for accessible component foundations
- **Lucide React** for consistent iconography
- **Class Variance Authority** for component variant management
- **React Hook Form** with Zod validation for form handling

### Real-time Features
- **WebSocket (ws)** for server-side WebSocket implementation
- **Custom WebSocket context** for client-side connection management
- **Automatic reconnection** and connection state management