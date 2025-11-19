# Project Scope: A-Team Trades Pipeline™ Diagnostic Application

## Project Definition

**Project Name**: A-Team Trades Pipeline™ Diagnostic Web Application  
**Client**: Develop Coaching  
**Project Type**: Lead Generation Tool / Marketing Diagnostic  
**Timeline**: Development Complete - Production Ready  
**Status**: ✅ Ready for Deployment

---

## Executive Summary

The A-Team Trades Pipeline™ is a web-based diagnostic tool that helps UK builders and contractors identify and quantify labour pipeline inefficiencies costing their businesses £20K-£90K annually. The application serves as both a lead generation platform and value demonstration tool for Develop Coaching, delivering personalized PDF reports and integrating with GoHighLevel CRM for automated follow-up.

This document defines the project boundaries, deliverables, stakeholder responsibilities, and constraints.

---

## In Scope

### Core Deliverables

#### 1. Diagnostic Assessment Application ✅
**Description**: Web-based conversational diagnostic tool  
**Components**:
- Landing/welcome screen with value proposition
- 7-question assessment flow with progress tracking
- Real-time score calculation (0-100 scale)
- Visual results summary with traffic light coloring
- Mobile-responsive design (320px to 1920px)
- UTM parameter capture and persistence

**Acceptance Criteria**:
- ✅ All 7 questions implemented with multiple-choice answers
- ✅ Scoring algorithm validated against test cases
- ✅ Smooth transitions and keyboard navigation
- ✅ Mobile responsive on iOS/Android devices
- ✅ UTM parameters captured from URL and persisted

#### 2. Data Capture Forms ✅
**Description**: Contact information collection for lead generation  
**Components**:
- Email form (firstName, lastName, email)
- Phone form (phone number, SMS opt-in)
- Form validation with error messaging
- Loading states and success confirmations
- UTM parameter inclusion in submissions

**Acceptance Criteria**:
- ✅ Email form collects full name and valid email
- ✅ Phone form validates E.164 format
- ✅ All fields validated before submission
- ✅ User-friendly error messages displayed
- ✅ UTM parameters included in payloads

#### 3. AI-Powered Report Generation ✅
**Description**: Personalized PDF report generation using GPT-5  
**Components**:
- GPT-5 integration for markdown content generation
- md-to-pdf conversion with custom CSS styling
- Brand-compliant design (Develop Coaching colors/fonts)
- Google Cloud Storage upload for PDF hosting
- Public URL generation for download links

**Acceptance Criteria**:
- ✅ GPT-5 generates personalized, actionable content
- ✅ PDF includes brand styling (Inter font, blue/teal colors)
- ✅ A4 format with professional margins
- ✅ PDFs uploaded to cloud storage successfully
- ✅ Public download URLs generated and accessible

#### 4. GoHighLevel CRM Integration ✅
**Description**: Full CRM integration for lead management  
**Components**:
- Contact creation/update with full details
- Custom field mapping for diagnostic data
- UTM parameter tracking in CRM
- Email delivery via Conversations API
- SMS delivery via Conversations API
- Tag-based segmentation

**Acceptance Criteria**:
- ✅ Contacts created/updated in GHL CRM
- ✅ Email sent with PDF download link
- ✅ SMS sent with Quick Win Pack content (no emojis)
- ✅ UTM parameters saved to custom fields
- ✅ Tags applied correctly ("Ateam-GPT", "Ateam-SMS-OK")
- ✅ Phone number saved to standard contact field

#### 5. Marketing Attribution System ✅
**Description**: Complete UTM parameter tracking across user journey  
**Components**:
- URL query string capture on page load
- SessionStorage persistence for page reloads
- Database storage on email submission
- Smart merging on phone submission (stored + fresh)
- GHL custom field synchronization

**Acceptance Criteria**:
- ✅ UTM parameters captured from URL
- ✅ Persisted to sessionStorage
- ✅ Stored in database session record
- ✅ Merged correctly on phone submission (fresh overrides stored)
- ✅ Sent to GHL custom fields for reporting

#### 6. Database & Session Management ✅
**Description**: PostgreSQL database for session persistence  
**Components**:
- diagnostic_sessions table schema
- In-memory storage fallback for development
- Session lookup by email
- UTM parameter storage and retrieval
- Storage layer preserves all fields on updates

**Acceptance Criteria**:
- ✅ All session data persisted correctly
- ✅ Session retrieval by email functional
- ✅ UTM parameters stored and retrieved
- ✅ Storage updates preserve existing fields
- ✅ Graceful fallback to in-memory storage

#### 7. Error Handling & Logging ✅
**Description**: Comprehensive error handling and structured logging  
**Components**:
- Try-catch blocks around all async operations
- User-friendly error messages (no stack traces)
- Structured console logging with context
- Graceful fallbacks for external service failures
- Detailed error logging for debugging

**Acceptance Criteria**:
- ✅ No uncaught exceptions in production
- ✅ Error messages clear and actionable
- ✅ Structured logs with timestamps and context
- ✅ Fallbacks prevent user-facing failures
- ✅ Debug information available without exposing secrets

#### 8. Documentation ✅
**Description**: Complete project documentation for GitHub  
**Components**:
- README.md with setup and deployment instructions
- context.md with project background
- requirement.md with functional/technical requirements
- project-scope.md (this document)
- .gitignore properly configured
- Environment variable documentation

**Acceptance Criteria**:
- ✅ README includes all setup steps
- ✅ All documentation files comprehensive
- ✅ .gitignore excludes sensitive files
- ✅ Environment variables documented
- ✅ Troubleshooting guide included

---

## Out of Scope

### Explicitly Excluded Features

#### 1. Authentication & User Accounts ❌
**Rationale**: Public-facing diagnostic tool, no login required  
**Future Consideration**: Admin dashboard may require auth in Phase 2

#### 2. Multi-Language Support ❌
**Rationale**: UK market only, English-only content  
**Future Consideration**: Polish/Romanian for tradespeople in Phase 3

#### 3. Payment Processing ❌
**Rationale**: Free diagnostic tool for lead generation  
**Future Consideration**: Paid premium reports in Phase 4

#### 4. Advanced Analytics Dashboard ❌
**Rationale**: Use GHL reporting for now  
**Future Consideration**: Custom analytics in Phase 2

#### 5. A/B Testing Framework ❌
**Rationale**: Manual testing sufficient for MVP  
**Future Consideration**: Automated A/B testing in Phase 3

#### 6. Real-time Chat Support ❌
**Rationale**: No support needed for self-service tool  
**Future Consideration**: Chatbot in Phase 4

#### 7. Video-Based Diagnostic ❌
**Rationale**: Text-based sufficient for target audience  
**Future Consideration**: Video variant for different segment

#### 8. Industry-Specific Variants ❌
**Rationale**: General trades focus for MVP  
**Future Consideration**: Electrical, plumbing variants in Phase 3

#### 9. Mobile Native Apps ❌
**Rationale**: Mobile web sufficient for user needs  
**Future Consideration**: iOS/Android apps if usage warrants

#### 10. Integration with Other CRMs ❌
**Rationale**: GoHighLevel is primary platform  
**Future Consideration**: Salesforce, HubSpot connectors if requested

---

## Project Boundaries

### Technical Boundaries

**Platform**: Replit
- Must use Replit-compatible solutions
- No Docker/containerization
- File system is ephemeral (use cloud storage)
- Limited background job capabilities

**Frontend**: React + TypeScript
- Must use provided tech stack
- No framework changes (Angular, Vue, etc.)
- shadcn/ui component library required

**Backend**: Express.js + TypeScript
- RESTful API design
- No GraphQL or WebSocket requirements
- Stateless server (session data in database)

**Database**: PostgreSQL (Neon) or In-Memory
- Must support both for development flexibility
- Drizzle ORM for type safety
- No migration to other databases (MongoDB, etc.)

### Integration Boundaries

**CRM**: GoHighLevel Only
- No integration with other CRM platforms
- Must use GHL Conversations API for email/SMS
- No direct SMTP or Twilio integration

**AI**: OpenAI GPT-5 Only
- No alternative AI providers (Claude, Gemini, etc.)
- Report generation only (not conversational interface)
- Must handle API failures gracefully

**Storage**: Google Cloud Storage (Replit Object Storage)
- No S3 or Azure Blob Storage
- Public URLs for PDF access
- Must handle unavailability gracefully

### Functional Boundaries

**Diagnostic**: 7 Questions Fixed
- No dynamic question generation
- No personalized question selection
- No skipping questions (linear flow)

**Report**: PDF Only
- No HTML/email-only reports
- No video reports
- No printed mail delivery

**Communication**: Email + SMS Only
- No WhatsApp, Telegram, etc.
- No phone call automation
- No postal mail

### Geographic Boundaries

**Target Market**: United Kingdom Only
- UK trades businesses (builders, contractors)
- UK phone numbers (+44 prefix)
- GBP currency references (£)
- UK business terminology

### Data Boundaries

**PII Collection**: Minimal
- Name, email, phone only
- No financial data
- No payment card information
- No identification documents

**Retention**: 90 Days for Inactive
- No indefinite storage guarantee
- No GDPR full compliance (out of EU)
- Manual data deletion on request

---

## Stakeholder Responsibilities

### Develop Coaching (Client)

**Responsibilities**:
- Provide GoHighLevel account credentials
- Configure GHL workflows and automations
- Manage sales follow-up from leads
- Monitor PDF report quality and relevance
- Provide feedback on diagnostic questions
- Approve final messaging and branding
- Supply marketing campaign UTM parameters

**Not Responsible For**:
- Technical infrastructure management
- Code maintenance and bug fixes
- API integration troubleshooting
- Database administration

### Development Team

**Responsibilities**:
- Build application per requirements
- Integrate with GoHighLevel, OpenAI, GCS
- Implement UTM tracking system
- Ensure mobile responsiveness
- Write comprehensive documentation
- Test end-to-end functionality
- Deploy to Replit platform
- Provide handoff documentation

**Not Responsible For**:
- Creating diagnostic questions/scoring logic (client-provided)
- Managing GHL account or workflows
- Sales follow-up or lead nurturing
- Marketing campaign execution
- Business outcomes or lead quality

### Replit (Hosting Platform)

**Responsibilities**:
- Provide hosting infrastructure
- Maintain uptime and reliability
- Manage SSL certificates
- Provide database (Neon PostgreSQL)
- Provide object storage integration
- Handle automatic deployments

**Not Responsible For**:
- Application code or bugs
- External API failures (GHL, OpenAI)
- Content or messaging
- Lead generation outcomes

### GoHighLevel (CRM Platform)

**Responsibilities**:
- Maintain API uptime and stability
- Deliver emails via Conversations API
- Deliver SMS via Conversations API
- Store contacts and custom fields
- Execute configured workflows

**Not Responsible For**:
- Application integration code
- Data validation before API calls
- PDF generation or hosting
- Diagnostic logic or scoring

### OpenAI (AI Provider)

**Responsibilities**:
- Provide GPT-5 API access
- Generate report content from prompts
- Maintain API uptime (SLA)

**Not Responsible For**:
- Prompt engineering or quality
- PDF formatting or styling
- Content appropriateness
- API integration code

---

## Dependencies

### External Dependencies

#### Critical (Application Cannot Function Without)
1. **GoHighLevel API** - Contact management, email, SMS
   - Impact if unavailable: No email/SMS delivery
   - Mitigation: Graceful fallback with local logging

2. **OpenAI GPT-5 API** - Report content generation
   - Impact if unavailable: No personalized reports
   - Mitigation: Fallback to template content

3. **Google Cloud Storage** - PDF hosting
   - Impact if unavailable: No PDF download links
   - Mitigation: Fallback to mock URLs (temporary)

4. **Replit Platform** - Hosting and deployment
   - Impact if unavailable: Application offline
   - Mitigation: None (platform dependency)

#### Important (Degraded Experience Without)
5. **Neon PostgreSQL** - Session persistence
   - Impact if unavailable: Session data lost on restart
   - Mitigation: In-memory storage fallback

6. **Google Fonts** - Inter font family
   - Impact if unavailable: System font fallback
   - Mitigation: Automatic browser fallback

### Internal Dependencies

1. **Diagnostic Questions** - Client must finalize 7 questions
   - Status: ✅ Complete
   
2. **Scoring Algorithm** - Client must validate calculation logic
   - Status: ✅ Complete

3. **GHL Account Setup** - Client must configure location, workflows
   - Status: ✅ Complete

4. **Environment Variables** - All API keys and secrets configured
   - Status: ✅ Complete

5. **Brand Assets** - Logo, colors, fonts finalized
   - Status: ✅ Complete

---

## Constraints

### Technical Constraints

1. **Platform**: Must deploy to Replit (no other hosting)
2. **Frontend Framework**: Must use React (no Angular/Vue)
3. **Backend Framework**: Must use Express.js (no NestJS/Fastify)
4. **Database**: Must support PostgreSQL schema (Drizzle ORM)
5. **CRM**: Must use GoHighLevel (no Salesforce/HubSpot)
6. **AI**: Must use OpenAI GPT-5 (no Claude/Gemini)

### Business Constraints

1. **Budget**: No paid tools beyond existing subscriptions
2. **Timeline**: Production ready by January 2025
3. **Market**: UK trades businesses only
4. **Language**: English only
5. **Pricing**: Free diagnostic tool (no payment processing)

### Design Constraints

1. **Branding**: Must use Develop Coaching colors/fonts
2. **Aesthetic**: Enterprise SaaS style (Linear/Stripe inspired)
3. **Mobile**: Must work on iOS/Android mobile browsers
4. **Accessibility**: Should meet WCAG AA standards (best effort)

### Regulatory Constraints

1. **Privacy**: Minimal PII collection
2. **GDPR**: No full compliance required (UK only, post-Brexit)
3. **Email**: Must include unsubscribe capability (GHL handles)
4. **SMS**: Must obtain explicit opt-in consent

---

## Success Metrics

### Technical Metrics

- **Uptime**: 99.9% (< 9 hours downtime/year)
- **Page Load**: < 2 seconds on 4G mobile
- **Error Rate**: < 1% of requests fail
- **Email Delivery**: > 95% successfully delivered
- **SMS Delivery**: > 95% successfully delivered
- **UTM Accuracy**: 90%+ leads properly attributed

### Business Metrics

- **Completion Rate**: 15%+ of visitors complete diagnostic
- **Email Capture**: 80%+ provide email for report
- **Phone Opt-in**: 30%+ provide phone for SMS
- **Lead Quality**: 50%+ valid business contacts (not spam)
- **Conversion Rate**: 10%+ book discovery calls

### User Experience Metrics

- **Time to Complete**: 3-5 minutes average
- **Mobile Usage**: 60%+ sessions on mobile devices
- **Bounce Rate**: < 50% on landing page
- **Form Abandonment**: < 30% on email form

---

## Deliverable Checklist

### Phase 1: Core Application ✅

- [x] Frontend React application with diagnostic flow
- [x] 7-question assessment with scoring algorithm
- [x] Real-time score calculation and visualization
- [x] Email capture form (firstName, lastName, email)
- [x] Phone capture form (phone, SMS opt-in)
- [x] Mobile-responsive design (320px - 1920px)
- [x] UTM parameter capture and sessionStorage

### Phase 2: Integrations ✅

- [x] GoHighLevel contact creation/update
- [x] GoHighLevel email delivery (Conversations API)
- [x] GoHighLevel SMS delivery (Conversations API)
- [x] OpenAI GPT-5 report generation
- [x] Google Cloud Storage PDF upload
- [x] UTM parameter persistence (database + GHL)

### Phase 3: Polish & Testing ✅

- [x] Error handling and graceful fallbacks
- [x] Structured logging for debugging
- [x] Standalone GHL API test script
- [x] End-to-end testing (email, phone, UTM flow)
- [x] Browser compatibility testing
- [x] Mobile device testing

### Phase 4: Documentation ✅

- [x] README.md with setup instructions
- [x] context.md with project background
- [x] requirement.md with specifications
- [x] project-scope.md (this document)
- [x] .gitignore configuration
- [x] Environment variable documentation

### Phase 5: Deployment 🚀

- [ ] Environment variables configured in Replit Secrets
- [ ] GHL workflows configured for automation
- [ ] Custom domain configured (if applicable)
- [ ] Production testing with real contacts
- [ ] Monitoring and error tracking enabled
- [ ] Handoff documentation provided

---

## Assumptions

### Technical Assumptions

1. Replit platform remains stable and available
2. GoHighLevel API maintains backward compatibility
3. OpenAI GPT-5 API remains accessible and affordable
4. Google Cloud Storage pricing remains cost-effective
5. PostgreSQL database schema supports future needs
6. Modern browsers maintain standards compliance

### Business Assumptions

1. Develop Coaching has active GHL account
2. Target audience is comfortable with web-based tools
3. Email/SMS are effective communication channels
4. UK trades market has consistent labor challenges
5. Free report is sufficient value exchange for contact info
6. 7 questions are comprehensive enough for diagnosis

### User Assumptions

1. Users have access to modern web browsers
2. Users will complete diagnostic on first visit (no save/resume)
3. Users provide accurate email addresses (not disposable)
4. Users understand SMS opt-in consent
5. Users have sufficient internet connectivity
6. Mobile users are comfortable with form inputs

---

## Risk Management

### High-Risk Items

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| GHL API downtime | Medium | High | Graceful fallback, local logging, retry logic |
| OpenAI API rate limits | Medium | High | Rate limiting, fallback to templates, caching |
| Spam submissions | High | Medium | Email validation, honeypot fields, rate limiting |
| Mobile performance | Medium | Medium | Code splitting, lazy loading, optimization |
| UTM tracking failures | Low | High | Multiple persistence layers, extensive logging |

### Medium-Risk Items

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Browser compatibility | Low | Medium | Polyfills, progressive enhancement, testing |
| PDF generation errors | Low | Medium | Error handling, retry logic, template fallback |
| Database connection issues | Low | High | In-memory fallback, connection pooling |
| Storage quota exceeded | Low | Low | Monitoring, cleanup old files, alerts |

### Low-Risk Items

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Font loading failures | Low | Low | System font fallbacks |
| Slow page loads | Low | Medium | Performance optimization, CDN |
| Form validation bypass | Low | Low | Server-side validation, Zod schemas |

---

## Change Management

### Scope Change Process

1. **Request**: Stakeholder submits change request with justification
2. **Evaluation**: Development team assesses impact (timeline, cost, technical)
3. **Decision**: Client approves/rejects based on priorities
4. **Implementation**: Approved changes added to backlog
5. **Documentation**: Scope document updated with changes

### Out-of-Scope Request Handling

- Document request for Phase 2 consideration
- Provide effort estimate if requested
- Maintain focus on in-scope deliverables
- Regular stakeholder communication on priorities

---

## Sign-Off

### Acceptance Criteria for Project Completion

- ✅ All in-scope deliverables completed
- ✅ All integrations tested end-to-end
- ✅ Documentation complete and accurate
- ✅ No critical bugs or blockers
- ✅ Performance metrics met
- ✅ Stakeholder approval received

### Post-Launch Support

**Duration**: 30 days post-launch  
**Scope**:
- Bug fixes for production issues
- Minor adjustments to messaging/styling
- Performance optimization if needed
- Documentation updates

**Out of Support**:
- New feature development
- Integration with new platforms
- Scope expansion
- Ongoing maintenance beyond 30 days

---

## Appendices

### Appendix A: Technical Stack Summary

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, TypeScript, Drizzle ORM
- **Database**: PostgreSQL (Neon) with in-memory fallback
- **Integrations**: GoHighLevel, OpenAI GPT-5, Google Cloud Storage
- **Hosting**: Replit Deployments
- **Version Control**: Git (via Replit or GitHub)

### Appendix B: Environment Variables

Required for production deployment:
```
GHL_DEVELOP_PIT_ID
GHL_DEVELOP_LOCATION_ID
AI_INTEGRATIONS_OPENAI_API_KEY
AI_INTEGRATIONS_OPENAI_BASE_URL
DEFAULT_OBJECT_STORAGE_BUCKET_ID
PUBLIC_OBJECT_SEARCH_PATHS
SESSION_SECRET
```

### Appendix C: Key Contacts

- **Client**: Develop Coaching (Greg)
- **Development Team**: [Your Team]
- **Platform Support**: Replit Support
- **CRM Support**: GoHighLevel Support

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Prepared By**: Development Team  
**Approved By**: Develop Coaching

---

**Status**: ✅ Project Scope Approved - Ready for Production Deployment
