# App Launcher

## Overview

This is an App Launcher application that provides a clean, utility-focused interface for organizing and accessing favorite applications. The system follows a design approach inspired by Linear's functionality and Chrome's new tab page simplicity, prioritizing efficiency and ease of use.

The application allows users to:
- View all saved apps in a responsive grid layout with automatic favicon display
- Add new apps with name, URL, and optional category
- Delete existing apps
- Click app cards to navigate to saved URLs in new tabs
- See app favicons automatically fetched from DuckDuckGo's icon service
- View full URLs via tooltip on hover (only domain shown in card)
- Search and filter apps in real-time by name or URL
- Organize apps by categories with tab-based filtering
- View apps in grouped sections by category (when "All" tab is selected)
- Filter apps by specific category or view uncategorized apps
- Reorder apps via drag-and-drop (enabled only in "All" view without search active)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and development server.

**UI Component Library**: shadcn/ui components built on Radix UI primitives, providing accessible and customizable UI elements. The design system uses the "new-york" style variant with Tailwind CSS for styling.

**State Management**: TanStack Query (React Query) handles server state management, providing caching, synchronization, and automatic refetching capabilities. The query client is configured with infinite stale time and disabled automatic refetching to reduce unnecessary network requests.

**Routing**: Wouter for lightweight client-side routing (currently single route to AppLauncher page).

**Form Handling**: React Hook Form with Zod resolver for type-safe form validation, leveraging the schema definitions from the shared layer.

**Styling System**: Tailwind CSS with custom design tokens defined in CSS variables. The design uses a neutral base color palette with systematic spacing primitives (2, 4, 6, 8 units). Typography uses the Inter font family from Google Fonts CDN.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript for type safety.

**API Design**: RESTful API with four endpoints:
- `GET /api/apps` - Retrieve all apps, ordered by position
- `POST /api/apps` - Create new app
- `DELETE /api/apps/:id` - Delete app by ID
- `PATCH /api/apps/positions` - Update positions for all apps (for drag-and-drop reordering)

**Data Storage**: PostgreSQL database with Drizzle ORM (`DbStorage` class). The storage layer is abstracted behind an `IStorage` interface. All app data persists across server restarts. Database connection configured in `server/db.ts` using Neon PostgreSQL with `@neondatabase/serverless`.

**Schema Validation**: Zod schemas defined in the shared layer ensure type safety and validation across both client and server. The `insertAppSchema` validates app creation with proper URL format checking.

**Development Server**: Vite middleware integration for hot module replacement and development features. Custom logging middleware tracks API request duration and response data.

### Database Schema

**ORM**: Drizzle ORM configured for PostgreSQL dialect.

**Schema Definition**: Located in `shared/schema.ts` for code sharing between client and server:
- `apps` table with columns:
  - `id` (varchar, primary key, auto-generated UUID)
  - `name` (text, required)
  - `url` (text, required, validated as proper URL)
  - `category` (text, optional, nullable for backward compatibility)
  - `position` (integer, default 0, for custom drag-and-drop ordering)

**Migration Strategy**: Drizzle Kit configured to output migrations to `./migrations` directory. Database push script available via `npm run db:push`.

**Current Status**: Fully migrated to PostgreSQL. The application uses `DbStorage` class with Drizzle ORM for all database operations. All CRUD operations (create, read, delete) use typed Drizzle queries with proper returning clauses for reliability. Data persists across server restarts.

### External Dependencies

**UI Component System**:
- Radix UI primitives for accessible headless components
- shadcn/ui for pre-built component implementations
- Lucide React for icon library
- @dnd-kit for drag-and-drop functionality (core, sortable, utilities)

**Styling & Design**:
- Tailwind CSS for utility-first styling
- PostCSS for CSS processing
- Custom CSS variables for theming

**Database & ORM**:
- Drizzle ORM for type-safe database queries
- @neondatabase/serverless for PostgreSQL connection
- Drizzle Zod for schema-to-Zod conversion

**Build & Development Tools**:
- Vite for fast development and optimized builds
- esbuild for server bundling
- TypeScript for type safety
- Replit-specific plugins for development environment integration

**Form & Validation**:
- React Hook Form for performant form handling
- Zod for runtime type validation
- @hookform/resolvers for integration

**State Management**:
- TanStack Query for server state and caching

**Routing**:
- Wouter for lightweight client-side routing

**Session Management**:
- connect-pg-simple configured for PostgreSQL session storage (not currently active)