# Requirements Specification: A-Team Trades Pipeline™ Diagnostic

## Document Overview

This document outlines the functional and technical requirements for the A-Team Trades Pipeline™ diagnostic web application. Requirements are categorized by priority using MoSCoW methodology (Must Have, Should Have, Could Have, Won't Have).

---

## Functional Requirements

### FR1: Diagnostic Assessment Flow

#### FR1.1: Welcome Screen [MUST HAVE]
- **Description**: Landing page introducing the diagnostic tool
- **Requirements**:
  - Display A-Team Trades Pipeline™ branding
  - Explain diagnostic purpose (identify £20K-£90K labour leaks)
  - Show time commitment (3 minutes)
  - Highlight free PDF report benefit
  - Include "Start Diagnostic" CTA button
  - Capture UTM parameters from URL on page load
  - Store UTM parameters in sessionStorage for persistence

#### FR1.2: Question Presentation [MUST HAVE]
- **Description**: Conversational interface for 7 diagnostic questions
- **Requirements**:
  - Display one question at a time
  - Show progress indicator (Question X of 7)
  - Present multiple-choice answer options
  - Support keyboard navigation (arrow keys, Enter)
  - Include contextual help text for clarity
  - Validate answer selection before proceeding
  - Allow back navigation to previous questions
  - Auto-scroll to question on navigation

**Question Set:**
1. **Trading Capacity**: Current vs. desired workload level
2. **Reliability**: Frequency of no-shows and late arrivals
3. **Retention**: Staff turnover frequency
4. **Recruitment**: Pipeline strength and proactivity
5. **Onboarding**: Training effectiveness and integration
6. **Culture**: Team morale and communication quality
7. **Systems**: Administrative efficiency and processes

#### FR1.3: Real-time Scoring [MUST HAVE]
- **Description**: Calculate scores as questions are answered
- **Requirements**:
  - Calculate section score (0-10) per question
  - Calculate overall score (0-100) across all questions
  - Determine score color: Red (0-59), Amber (60-79), Green (80-100)
  - Store scores in component state
  - Validate score calculation logic with test cases

#### FR1.4: Results Summary [MUST HAVE]
- **Description**: Visual summary of diagnostic results
- **Requirements**:
  - Display overall score with prominent typography
  - Show color-coded badge (red/amber/green)
  - Display breakdown by section with individual scores
  - Show progress bars for each section
  - Include interpretation text for score ranges
  - Explain labour leak cost estimate (£15K-£90K range)
  - Present CTA to receive full PDF report

---

### FR2: Data Capture Forms

#### FR2.1: Email Form [MUST HAVE]
- **Description**: Collect user contact information for report delivery
- **Requirements**:
  - Collect first name (required, 2-50 characters)
  - Collect last name (required, 2-50 characters)
  - Collect email address (required, valid email format)
  - Display clear value proposition above form
  - Show loading state during submission
  - Validate all fields before submission
  - Display error messages for validation failures
  - Disable submit button during processing
  - Show success message after submission
  - Include UTM parameters in submission payload

#### FR2.2: Phone Form [SHOULD HAVE]
- **Description**: Optional phone number collection for SMS follow-up
- **Requirements**:
  - Collect UK mobile number (E.164 format: +447...)
  - Display SMS opt-in value proposition
  - Show examples of Quick Win Pack content
  - Validate phone number format
  - Explicitly request SMS consent
  - Show loading state during submission
  - Display success message after SMS sent
  - Allow users to skip this step
  - Include UTM parameters in submission payload

---

### FR3: Report Generation

#### FR3.1: AI Content Generation [MUST HAVE]
- **Description**: Generate personalized report content using GPT-5
- **Requirements**:
  - Send diagnostic data to OpenAI GPT-5 API
  - Include: overall score, section scores, all answers
  - Request markdown-formatted output
  - Receive personalized commentary for each section
  - Get actionable recommendations prioritized by impact
  - Include industry-specific insights for UK trades
  - Validate GPT-5 response structure
  - Handle API errors with fallback messaging
  - Log GPT-5 costs for budget tracking

#### FR3.2: PDF Generation [MUST HAVE]
- **Description**: Convert markdown content to branded PDF
- **Requirements**:
  - Use md-to-pdf library for conversion
  - Apply custom CSS with brand colors:
    - Primary Blue: #0063FF
    - Primary Teal: #00C2C7
    - Traffic light colors for scores
  - Use Inter font family (Google Fonts)
  - Format as A4 size with professional margins
  - Include company logo and branding
  - Add footer with copyright and CTA link
  - Generate unique filename (session-id-timestamp.pdf)
  - Validate PDF file integrity

#### FR3.3: PDF Storage [MUST HAVE]
- **Description**: Upload PDF to cloud storage and generate public URL
- **Requirements**:
  - Upload to Google Cloud Storage (Replit Object Storage)
  - Store in public directory for web access
  - Generate publicly accessible download URL
  - Include session ID in file path for organization
  - Handle upload failures with retry logic
  - Log storage operations for debugging
  - Implement graceful fallback if storage unavailable

---

### FR4: CRM Integration (GoHighLevel)

#### FR4.1: Contact Management [MUST HAVE]
- **Description**: Create/update contacts in GoHighLevel CRM
- **Requirements**:
  - Look up existing contact by email
  - Create new contact if not found
  - Update existing contact if found
  - Store: firstName, lastName, email, phone (if provided)
  - Apply tags: "Ateam-GPT" (all), "Ateam-SMS-OK" (phone opt-in)
  - Map UTM parameters to custom fields:
    - `utm_source` → GHL custom field
    - `utm_medium` → GHL custom field
    - `utm_campaign` → GHL custom field
  - Store GHL contact ID in local database
  - Handle API errors gracefully

#### FR4.2: Email Delivery [MUST HAVE]
- **Description**: Send PDF report via GoHighLevel Conversations API
- **Requirements**:
  - Use FROM address: greg@mail.develop-coaching.com
  - Include recipient email in TO field
  - Send HTML-formatted email with:
    - Personalized greeting using first name
    - Summary of diagnostic score
    - Direct download link to PDF report
    - Call-to-action to book discovery call
    - Develop Coaching branding and signature
  - Handle email delivery failures with retries
  - Log email sending operations
  - Confirm delivery via API response

#### FR4.3: SMS Delivery [SHOULD HAVE]
- **Description**: Send Quick Win Pack via GoHighLevel Conversations API
- **Requirements**:
  - Send to phone number provided in form
  - Include contact ID from GHL
  - Message content: Three actionable quick wins
    - #1: Reliability fix (text top 3 subbies)
    - #2: Pipeline fix (post Facebook ad)
    - #3: Retention fix (ask best subbie feedback)
  - Include time estimate (20 mins to complete)
  - Include savings estimate (£15K-£35K/year)
  - Include CTA link to book discovery call
  - NO emojis in SMS content (professional tone)
  - Handle SMS delivery failures
  - Log SMS sending operations

#### FR4.4: Conversion Tracking [COULD HAVE]
- **Description**: Track when users click CTA links in reports
- **Requirements**:
  - Include tracking parameter in PDF CTA links (`?cid=<session-id>`)
  - Create `/api/visit` endpoint to capture clicks
  - Update GHL contact custom field: `converted_yn = "true"`
  - Capture UTM parameters from click (if present)
  - Redirect to Develop Coaching booking page
  - Log conversion events for analytics

---

### FR5: Data Management

#### FR5.1: Session Storage [MUST HAVE]
- **Description**: Store diagnostic session data in database
- **Requirements**:
  - Store: email, firstName (via builderName), phone (if provided)
  - Store: overallScore, sectionScores (JSON)
  - Store: diagnosticData (all questions/answers, JSON)
  - Store: pdfUrl (cloud storage link)
  - Store: ghlContactId (CRM reference)
  - Store: utmSource, utmMedium, utmCampaign
  - Store: sessionId (for tracking)
  - Store: phoneOptIn ("true"/"false")
  - Store: convertedYn ("true"/"false")
  - Store: createdAt timestamp
  - Generate unique session ID (UUID)
  - Support retrieval by email and session ID

#### FR5.2: UTM Parameter Persistence [MUST HAVE]
- **Description**: Capture and persist marketing attribution data
- **Requirements**:
  - Capture UTM parameters from URL query string on page load
  - Store in sessionStorage (key: 'utm_params')
  - Include in email form submission payload
  - Include in phone form submission payload
  - Store in database session record on email submission
  - Merge stored UTMs with fresh UTMs on phone submission
    - Priority: fresh request UTMs override stored session UTMs
    - Fallback: use stored session UTMs if request missing UTMs
  - Send merged UTMs to GHL custom fields
  - Persist merged UTMs back to database on phone submission
  - Log UTM capture, storage, and retrieval operations

#### FR5.3: Data Validation [MUST HAVE]
- **Description**: Validate all user input and API data
- **Requirements**:
  - Use Zod schemas for type-safe validation
  - Validate email format (RFC 5322 compliant)
  - Validate phone format (E.164 international format)
  - Validate name fields (2-50 characters, letters/spaces/hyphens)
  - Validate score ranges (0-10 section, 0-100 overall)
  - Validate required fields before processing
  - Return structured error messages on validation failure
  - Sanitize inputs to prevent injection attacks

---

## Non-Functional Requirements

### NFR1: Performance

#### NFR1.1: Page Load Performance [MUST HAVE]
- **Target**: < 2 seconds on 4G mobile connection
- **Metrics**: First Contentful Paint, Largest Contentful Paint
- **Techniques**: Code splitting, lazy loading, image optimization

#### NFR1.2: API Response Times [MUST HAVE]
- Email submission: < 30 seconds end-to-end
- Phone submission: < 5 seconds end-to-end
- Question navigation: < 100ms client-side
- Score calculation: < 50ms client-side

#### NFR1.3: Concurrent Users [SHOULD HAVE]
- Support: 100 concurrent diagnostic sessions
- No performance degradation under normal load
- Graceful degradation under high load

### NFR2: Reliability

#### NFR2.1: Uptime [MUST HAVE]
- **Target**: 99.9% uptime (< 9 hours downtime/year)
- **Monitoring**: Health checks, error tracking
- **Failover**: Graceful fallbacks for external services

#### NFR2.2: Error Handling [MUST HAVE]
- All API calls wrapped in try-catch blocks
- User-friendly error messages (no stack traces)
- Structured error logging with context
- Retry logic for transient failures
- Fallback behavior when services unavailable:
  - GPT-5 unavailable → use template report content
  - GHL unavailable → log contact data locally
  - Storage unavailable → use mock PDF URLs

#### NFR2.3: Data Integrity [MUST HAVE]
- No data loss during form submissions
- Atomic database operations
- Validation at every layer (frontend, API, database)
- Storage layer preserves all fields on updates

### NFR3: Security

#### NFR3.1: Data Protection [MUST HAVE]
- HTTPS only in production
- Environment variables for all secrets
- No API keys in client-side code
- No logging of sensitive data (PII, API keys)
- Input sanitization to prevent XSS/injection

#### NFR3.2: API Security [SHOULD HAVE]
- Rate limiting on expensive endpoints
- Request validation (Zod schemas)
- Bearer token authentication for GHL API
- API key rotation policy

#### NFR3.3: Privacy [MUST HAVE]
- Minimal data collection (only business-necessary)
- No third-party tracking scripts
- Clear value exchange for data (free report)
- Session isolation (no cross-session data leaks)

### NFR4: Usability

#### NFR4.1: Accessibility [SHOULD HAVE]
- Keyboard navigation support
- ARIA labels for screen readers
- Sufficient color contrast (WCAG AA)
- Focus indicators on interactive elements
- Error messages associated with form fields

#### NFR4.2: Mobile Responsiveness [MUST HAVE]
- Mobile-first design approach
- Touch-friendly hit targets (min 44x44px)
- Readable text without zooming (min 16px)
- Responsive layouts at breakpoints: 320px, 768px, 1024px
- No horizontal scrolling on small screens

#### NFR4.3: Browser Compatibility [MUST HAVE]
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- iOS Safari 14+
- Android Chrome 90+

### NFR5: Maintainability

#### NFR5.1: Code Quality [MUST HAVE]
- TypeScript for type safety
- Consistent code formatting (Prettier)
- Meaningful variable/function names
- Comments for complex logic
- No dead code or unused imports

#### NFR5.2: Documentation [MUST HAVE]
- README with setup instructions
- API endpoint documentation
- Environment variable descriptions
- Deployment guide
- Troubleshooting section

#### NFR5.3: Testing [SHOULD HAVE]
- Manual testing checklist for key flows
- Standalone test scripts for integrations
- End-to-end testing of complete user journey
- Browser/device testing matrix

### NFR6: Scalability

#### NFR6.1: Database [SHOULD HAVE]
- Connection pooling for PostgreSQL
- Indexed queries for common lookups
- Efficient JSON storage for diagnostic data
- Prepared for migration to dedicated database

#### NFR6.2: External Services [SHOULD HAVE]
- Graceful handling of API rate limits
- Caching where appropriate
- Prepared for CDN integration for PDFs
- Monitoring of API usage and costs

---

## Integration Requirements

### INT1: GoHighLevel API

#### INT1.1: Authentication [MUST HAVE]
- Use Private Integration Token (PIT) as Bearer token
- Include Location ID in request bodies
- Store credentials in environment variables:
  - `GHL_API_KEY` (for future use)
  - `GHL_DEVELOP_PIT_ID` (current auth method)
  - `GHL_DEVELOP_LOCATION_ID`

#### INT1.2: Endpoints Used [MUST HAVE]
- `POST /contacts` - Create contact
- `GET /contacts/lookup` - Find existing contact
- `PUT /contacts/:id` - Update contact
- `POST /conversations/messages` - Send email
- `POST /conversations/messages` - Send SMS

#### INT1.3: Error Handling [MUST HAVE]
- Handle 401 Unauthorized (bad credentials)
- Handle 429 Rate Limit Exceeded (retry with backoff)
- Handle 500 Server Error (retry once)
- Log all GHL API errors with context
- Fallback to local storage on persistent failures

### INT2: OpenAI API

#### INT2.1: Authentication [MUST HAVE]
- Use API key in Authorization header
- Store in environment variable: `AI_INTEGRATIONS_OPENAI_API_KEY`
- Configure base URL: `AI_INTEGRATIONS_OPENAI_BASE_URL`

#### INT2.2: Model Configuration [MUST HAVE]
- Model: `gpt-4` (or latest available GPT-5 variant)
- Temperature: 0.7 (balanced creativity/consistency)
- Max tokens: 2000 (sufficient for report content)
- System prompt: Define role as UK trades business consultant

#### INT2.3: Error Handling [MUST HAVE]
- Handle 401 Unauthorized (invalid API key)
- Handle 429 Rate Limit (retry with exponential backoff)
- Handle 500 Server Error (retry once)
- Timeout after 30 seconds
- Fallback to template content on persistent failures

### INT3: Google Cloud Storage

#### INT3.1: Authentication [MUST HAVE]
- Use Replit Object Storage sidecar authentication
- External account credentials flow
- Environment variables:
  - `DEFAULT_OBJECT_STORAGE_BUCKET_ID`
  - `PUBLIC_OBJECT_SEARCH_PATHS`

#### INT3.2: Operations [MUST HAVE]
- Upload PDF files to public directory
- Generate public download URLs
- Set appropriate content types (application/pdf)
- Handle upload failures with retries

#### INT3.3: Error Handling [MUST HAVE]
- Handle authentication failures
- Handle network timeouts
- Fallback to mock URLs on persistent failures
- Log all storage operations

---

## Data Requirements

### DR1: Database Schema

#### DR1.1: diagnostic_sessions Table [MUST HAVE]
```typescript
{
  id: UUID (primary key, auto-generated)
  email: TEXT (not null, indexed)
  phone: TEXT (nullable)
  builderName: TEXT (nullable) // Stores firstName for now
  overallScore: INTEGER (not null, 0-100)
  sectionScores: JSONB (not null) // { tradingCapacity: 8, ... }
  diagnosticData: JSONB (not null) // Full Q&A data
  pdfUrl: TEXT (nullable)
  ghlContactId: TEXT (nullable, indexed)
  utmSource: TEXT (nullable)
  utmMedium: TEXT (nullable)
  utmCampaign: TEXT (nullable)
  sessionId: TEXT (nullable)
  phoneOptIn: TEXT (default "false")
  convertedYn: TEXT (default "false")
  createdAt: TIMESTAMP (not null, auto-generated)
}
```

### DR2: Data Retention [SHOULD HAVE]
- Active sessions: Retained indefinitely
- Inactive sessions (no conversion): 90 days
- PDF files: Retained for 12 months
- Logs: Retained for 30 days

---

## API Requirements

### API1: Endpoint Specifications

#### API1.1: POST /api/submit-email [MUST HAVE]
**Purpose**: Submit diagnostic results and trigger PDF generation/delivery

**Request Body**:
```typescript
{
  email: string (required, email format)
  firstName: string (required, 2-50 chars)
  lastName: string (required, 2-50 chars)
  overallScore: number (required, 0-100)
  sectionScores: {
    tradingCapacity: number (0-10)
    reliability: number (0-10)
    retention: number (0-10)
    recruitment: number (0-10)
    onboarding: number (0-10)
    culture: number (0-10)
    systems: number (0-10)
  }
  diagnosticData: {
    question1: { question: string, answer: string }
    // ... all 7 questions
  }
  sessionId?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}
```

**Response**:
```typescript
{
  success: boolean
  message: string
  sessionId?: string
}
```

**Error Codes**:
- 400: Invalid request data
- 500: Server error (GPT-5, GHL, or storage failure)

#### API1.2: POST /api/submit-phone [MUST HAVE]
**Purpose**: Update contact with phone and trigger SMS

**Request Body**:
```typescript
{
  email: string (required, email format)
  phone: string (required, E.164 format)
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}
```

**Response**:
```typescript
{
  success: boolean
  message: string
}
```

**Error Codes**:
- 400: Invalid request data
- 404: Session not found for email
- 500: Server error (GHL failure)

#### API1.3: GET /api/visit [COULD HAVE]
**Purpose**: Track CTA clicks and update conversion status

**Query Parameters**:
- `cid` (required): Contact/session ID
- `utm_source` (optional): Attribution parameter
- `utm_medium` (optional): Attribution parameter
- `utm_campaign` (optional): Attribution parameter

**Response**: 302 Redirect to booking page

---

## Testing Requirements

### TR1: Unit Testing [COULD HAVE]
- Scoring algorithm validation
- Zod schema validation
- Utility function testing

### TR2: Integration Testing [SHOULD HAVE]
- Standalone GHL API test script
- Email delivery verification
- SMS delivery verification
- PDF generation pipeline

### TR3: End-to-End Testing [MUST HAVE]
- Complete diagnostic flow
- Email form submission with PDF delivery
- Phone form submission with SMS delivery
- UTM parameter tracking across journey
- Browser compatibility testing (Chrome, Safari, Firefox)
- Mobile device testing (iOS, Android)

### TR4: Performance Testing [SHOULD HAVE]
- Load testing at 100 concurrent users
- Page load speed verification
- API response time measurement

---

## Deployment Requirements

### DEP1: Environment Configuration [MUST HAVE]
All environment variables properly set:
- `GHL_DEVELOP_PIT_ID`
- `GHL_DEVELOP_LOCATION_ID`
- `AI_INTEGRATIONS_OPENAI_API_KEY`
- `AI_INTEGRATIONS_OPENAI_BASE_URL`
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID`
- `PUBLIC_OBJECT_SEARCH_PATHS`
- `SESSION_SECRET`

### DEP2: Platform [MUST HAVE]
- Deployed to Replit (optimized platform)
- Custom domain configured (if applicable)
- HTTPS enabled
- Environment variables in Replit Secrets

### DEP3: Monitoring [SHOULD HAVE]
- Error logging to console (structured JSON)
- Performance monitoring
- Uptime monitoring
- Cost tracking (GPT-5, GHL, storage)

---

## Success Criteria

### Acceptance Criteria for Launch

- ✅ All 7 diagnostic questions functional
- ✅ Scoring algorithm validated
- ✅ PDF generation working with brand styling
- ✅ Email delivery via GHL tested end-to-end
- ✅ SMS delivery via GHL tested with real phone
- ✅ UTM tracking verified across full journey
- ✅ Mobile responsive on iOS/Android
- ✅ Load tested at 100 concurrent users
- ✅ Error handling comprehensive
- ✅ Documentation complete

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Maintained By**: Development Team
