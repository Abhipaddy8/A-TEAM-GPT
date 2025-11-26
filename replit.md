# A-Team Trades Pipeline™ - Diagnostic Web Application

## Overview

A-Team Trades Pipeline™ is a web-based diagnostic tool designed for UK builders and contractors to assess their labour pipeline health. The application provides a conversational diagnostic experience that evaluates seven key areas of a trades business, generates a comprehensive score, and delivers a professional PDF report with actionable recommendations. The tool is built to identify labour-related inefficiencies costing businesses £20K-£90K annually.

The application serves as a lead generation and value demonstration tool for Develop Coaching, offering a free 3-minute assessment that culminates in a detailed report and CRM integration for follow-up.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing (single-page application with home and 404 routes)

**UI Component System**
- Radix UI primitives for accessible, unstyled components (dialogs, dropdowns, tooltips, etc.)
- shadcn/ui design system configured with "new-york" style variant
- Tailwind CSS for utility-first styling with custom design tokens
- Custom color system based on brand colors (Blue #0063FF, Teal #00C2C7) with traffic light scoring (red/amber/green)

**State Management**
- TanStack Query (React Query) for server state management and API caching
- Local component state with React hooks for UI interactions
- Custom toast notifications system for user feedback

**Design Philosophy**
- Enterprise SaaS aesthetic inspired by Linear and Stripe
- Inter font family from Google Fonts for professional typography
- Centered, single-column layout with max-width constraints (max-w-5xl containers)
- Traffic light color coding (red/amber/green) for score visualization
- Responsive design with mobile-first considerations

### Backend Architecture

**Server Framework**
- Express.js for HTTP routing and middleware
- Custom middleware for request logging and JSON response capture
- Development/production mode switching based on NODE_ENV

**Development & Production Setup**
- Vite middleware integration for HMR in development
- Static file serving for production builds
- Replit-specific plugins for runtime error overlay and dev tooling

**API Design Pattern**
- RESTful endpoint structure under `/api` namespace
- Single primary endpoint: `POST /api/submit-email` for report generation workflow
- Zod schema validation for request/response type safety
- Centralized error handling with structured error responses

**Report Generation Pipeline**
1. Email submission triggers contact creation/update in GHL CRM
2. GPT-5 generates personalized markdown report content based on diagnostic data
3. Markdown converted to styled PDF using md-to-pdf with custom CSS
4. PDF uploaded to Google Cloud Storage (when configured)
5. Email workflow triggered via GoHighLevel with PDF attachment

### Data Storage Solutions

**Database**
- PostgreSQL via Neon serverless database (@neondatabase/serverless)
- Drizzle ORM for type-safe database queries and schema management
- Schema-first approach with migrations directory

**Primary Tables**
- `diagnostic_sessions`: Stores completed diagnostic assessments with scores, answers, PDF URLs, and CRM contact IDs
- Session tracking includes UTM parameters for marketing attribution
- JSONB columns for flexible storage of diagnostic data and section scores

**Fallback Storage**
- In-memory storage implementation (MemStorage class) for development/testing
- Interface-based storage abstraction (IStorage) allows swapping implementations

### Authentication and Authorization

**Current Implementation**
- No authentication system implemented
- Public-facing diagnostic tool with anonymous access
- Session identification via client-generated UUID
- User schema exists in database but unused (prepared for future admin features)

**Future Considerations**
- User table structure suggests planned admin/management interface
- Session tracking prepared for user account linkage

### External Service Integrations

**GoHighLevel CRM (GHL)**
- Contact upsert functionality for lead management
- Custom field mapping for diagnostic scores and session IDs
- Tag-based segmentation ("Ateam-GPT" tag)
- Email/SMS workflow triggering capability
- Graceful degradation when credentials not configured (logs warnings, returns mock data)
- Environment variables: `GHL_DEVELOP_LOCATION_ID`, `GHL_DEVELOP_PIT_ID`

**OpenAI GPT-5**
- Markdown report content generation using latest GPT-5 model
- Structured prompting for consistent report formatting
- Personalized commentary based on diagnostic responses
- Custom AI integration base URL and API key configuration
- Environment variables: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`

**Google Cloud Storage**
- PDF storage and public URL generation
- Replit Object Storage integration via sidecar authentication
- External account credentials flow for Replit-managed buckets
- Public path configuration for accessible PDF URLs
- Graceful fallback to mock URLs when not configured
- Environment variables: `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PUBLIC_OBJECT_SEARCH_PATHS`

**PDF Generation**
- md-to-pdf library for Markdown to PDF conversion
- Custom CSS styling matching brand design system (Inter font, brand colors)
- A4 format with professional margins
- No Puppeteer/headless browser dependency (lighter weight solution)

**Session Management**
- connect-pg-simple for PostgreSQL-backed sessions (dependency present)
- Currently unused but prepared for future authenticated features

### Key Design Decisions

**Diagnostic Flow (GPT-Powered Conversational)**
- Full ChatGPT-style conversational interface - NO multiple choice options
- GPT-4o-mini powers both diagnostic questions and free-form conversation
- AI asks 7 diagnostic questions naturally based on conversation flow
- AI interprets free-text responses and assigns scores 1-10 per area
- Backend parses AI markers: `[DIAGNOSTIC_SCORE: X]`, `[DIAGNOSTIC_AREA: X]`, `[DIAGNOSTIC_ANSWER: X]`
- Frontend uses `accumulatedDataRef` (React ref) to accumulate data across async mutation callbacks
- This ref-based pattern solves React closure stale state issues in mutation callbacks
- Conversation continues intelligently post-lead capture

**Diagnostic Data Flow**
1. User types answer → `handleSend()` reads `accumulatedDataRef.current` into payload
2. Backend sends to GPT-4o-mini with scoring guidelines (1-3 poor, 4-6 average, 7-10 good)
3. AI response includes hidden markers with score, area, and answer summary
4. Backend parses markers → returns `diagnosticUpdate.collectedData` with NEW data only
5. Frontend `onSuccess` merges new data into `accumulatedDataRef.current`
6. After 7 questions, `calculateScoresFromData(accumulatedDataRef.current)` generates scores
7. ScoreWidget displays traffic light visualization of all section scores

**Diagnostic Areas Covered**
1. Trading Capacity - Project volume and workload management
2. Reliability - Subbie punctuality, no-shows, work completion
3. Recruitment - Difficulty finding skilled labour, pipeline strength
4. Systems - Scheduling tools, project management, organization
5. Time Spent - Hours wasted on labour issues weekly
6. Biggest Challenge - Main pain point with labour
7. Culture - Team morale, turnover, engagement

**Post-Diagnostic Flow**
1. Score widget displayed with traffic light visualization
2. Email form for PDF report generation
3. Phone form for SMS training link (via GHL)
4. Inline calendar booking widget (https://link.flow-build.com/widget/bookings/thefreedomroadmap)
5. Google Reviews carousel (9 real reviews from UK builders)

**Scoring System**
- 0-100 overall score derived from section scores
- Color-coded thresholds: Red (0-59), Amber (60-79), Green (80-100)
- Section-level scoring with individual commentary
- Risk profile assessment and labour leak projection
- Actionable recommendations prioritized by business impact

**Technology Trade-offs**
- GPT-4o-mini for fast, cost-effective conversational AI
- No ChatGPT SDK - full control over UX and data extraction
- Selected Drizzle ORM over Prisma for lightweight bundle size and edge compatibility
- md-to-pdf instead of Puppeteer for simpler deployment and fewer dependencies
- In-memory storage fallback enables development without database provisioning

**UI Components Added**
- ReviewsCarousel - Horizontal scrollable Google Reviews (9 testimonials)
- CalendarEmbed - Inline iframe for Flow-Build booking widget
- Progress indicator during diagnostic mode