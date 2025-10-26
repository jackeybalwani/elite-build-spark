# Challenge Platform - Project Documentation

## 📋 Project Overview

**Project Name:** Challenge Platform  
**Type:** Full-Stack Web Application  
**Technology Stack:** React + TypeScript + Lovable Cloud (Supabase)  
**Purpose:** A role-based platform connecting challenge sponsors with skilled builders

## 🎯 Project Objectives

- Enable sponsors to create and manage coding challenges with prizes
- Allow builders to participate in challenges and submit solutions
- Provide secure role-based authentication and authorization
- Track submissions, scores, and maintain a competitive leaderboard
- Facilitate communication between sponsors and builders

## 🏗️ System Architecture

### Frontend Architecture
- **Framework:** React 18.3 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with shadcn/ui components
- **State Management:** React Query (@tanstack/react-query)
- **Routing:** React Router DOM v6
- **UI Components:** Radix UI primitives with custom theming

### Backend Architecture
- **Platform:** Lovable Cloud (Supabase)
- **Database:** PostgreSQL with Row-Level Security (RLS)
- **Authentication:** Supabase Auth with email/password
- **Storage:** Supabase Storage for file uploads
- **Real-time:** WebSocket support for live updates

## 📁 Project Structure

```
challenge-platform/
├── documents/                    # Project documentation
│   ├── PROJECT_DOCUMENTATION.md
│   ├── PRESENTATION_OUTLINE.md
│   └── DEMO_SCRIPT.md
│
├── src/                         # Frontend source code
│   ├── components/              # React components
│   │   ├── ui/                 # shadcn UI components
│   │   ├── sponsor/            # Sponsor-specific components
│   │   │   ├── ChallengeWizard.tsx
│   │   │   ├── MyChallengesView.tsx
│   │   │   ├── SubmissionsView.tsx
│   │   │   └── AnalyticsView.tsx
│   │   ├── ChallengeCard.tsx
│   │   └── Navigation.tsx
│   │
│   ├── pages/                   # Route pages
│   │   ├── Index.tsx           # Landing page
│   │   ├── Auth.tsx            # Login/Signup with role selection
│   │   ├── Challenges.tsx      # Browse challenges
│   │   ├── ChallengeDetail.tsx # Individual challenge view
│   │   ├── Leaderboard.tsx     # Rankings
│   │   ├── Profile.tsx         # User profile
│   │   ├── SponsorDashboard.tsx # Sponsor management
│   │   └── NotFound.tsx        # 404 page
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useUserRole.ts      # Role management
│   │   └── use-toast.ts        # Toast notifications
│   │
│   ├── integrations/            # Third-party integrations
│   │   └── supabase/           # Supabase client & types
│   │
│   ├── lib/                     # Utility functions
│   │   └── utils.ts            # Helper functions
│   │
│   └── index.css               # Global styles & design tokens
│
├── supabase/                    # Backend configuration
│   ├── config.toml             # Supabase configuration
│   └── migrations/             # Database migrations
│
└── public/                      # Static assets
    └── robots.txt
```

## 👥 User Roles

### 1. Builder (Default Role)
**Capabilities:**
- Browse available challenges
- View challenge details and requirements
- Submit solutions via GitHub repository links
- Track submission status and scores
- View global leaderboard
- Manage personal profile

**Dashboard Access:** Standard challenge browsing interface

### 2. Sponsor
**Capabilities:**
- All builder capabilities
- Create new challenges with custom requirements
- Set challenge prizes and deadlines
- Review and score submissions
- Download candidate information
- View analytics on challenge performance
- Manage challenge lifecycle (draft, active, closed)

**Dashboard Access:** Dedicated Sponsor Dashboard with tabs:
- My Challenges
- Create Challenge
- Submissions Review
- Analytics

### 3. Admin (Future Enhancement)
**Planned Capabilities:**
- Platform-wide moderation
- User management
- Challenge approval workflow
- System analytics

## 🗄️ Database Schema

### Core Tables

#### profiles
```sql
- id: uuid (Primary Key, references auth.users)
- full_name: text
- role: text (builder/sponsor/admin)
- avatar_url: text
- bio: text
- github_username: text
- created_at: timestamp
- updated_at: timestamp
```

#### user_roles
```sql
- id: uuid (Primary Key)
- user_id: uuid (Foreign Key to auth.users)
- role: app_role enum (admin/moderator/user)
- unique(user_id, role)
```

#### challenges
```sql
- id: uuid (Primary Key)
- title: text (NOT NULL)
- description: text
- difficulty: text (beginner/intermediate/advanced)
- domain: text (frontend/backend/fullstack/mobile/ai)
- requirements: text
- prize_amount: numeric
- deadline: timestamp
- status: text (draft/active/closed)
- sponsor_id: uuid (Foreign Key to auth.users)
- created_at: timestamp
- updated_at: timestamp
```

#### submissions
```sql
- id: uuid (Primary Key)
- challenge_id: uuid (Foreign Key to challenges)
- user_id: uuid (Foreign Key to auth.users)
- repository_url: text
- description: text
- score: integer (0-100)
- status: text (pending/under_review/approved/rejected)
- submitted_at: timestamp
- reviewed_at: timestamp
```

## 🔐 Security Features

### Row-Level Security (RLS)
All tables implement RLS policies to ensure data security:
- Users can only view/edit their own profiles
- Builders can view all active challenges
- Sponsors can only modify their own challenges
- Submission access restricted to challenge sponsor and submitter
- Admin functions use security definer for privilege management

### Authentication Flow
1. User signs up with email/password and role selection
2. `handle_new_user()` trigger creates profile with selected role
3. `assign_default_role()` trigger assigns role to user_roles table
4. Auto-confirm email enabled for non-production environment
5. JWT tokens manage session state
6. Protected routes check authentication and role

### Authorization Checks
- Client-side: `useUserRole()` hook for UI rendering
- Server-side: RLS policies enforce data access
- Role-based redirects protect dashboard routes

## 🎨 Design System

### Color Palette
- Primary: Purple gradient (#9b87f5 to #7E69AB)
- Secondary: Dark tones for contrast
- Accent: Bright highlights for CTAs
- Success/Warning/Error states included

### Typography
- Font Family: Inter (system font fallback)
- Headings: Bold, gradient text effects
- Body: Regular weight, optimized line-height

### Component Library
- Built on shadcn/ui and Radix UI
- Fully accessible components (ARIA compliant)
- Dark mode support (via next-themes)
- Responsive design (mobile-first approach)

## 🚀 Key Features

### For Builders
1. **Challenge Discovery**
   - Filter by difficulty, domain, prize amount
   - Search functionality
   - Deadline indicators

2. **Submission Management**
   - GitHub repository integration
   - Submission history tracking
   - Real-time status updates

3. **Leaderboard**
   - Global rankings
   - Score visualization
   - Achievement badges

### For Sponsors
1. **Challenge Creation Wizard**
   - Step-by-step challenge setup
   - Rich text description editor
   - Custom requirements specification
   - Prize and deadline configuration

2. **Submission Review**
   - Filterable submission table
   - Repository quick access
   - Candidate information download
   - Scoring interface

3. **Analytics Dashboard**
   - Total challenges created
   - Submission statistics
   - Average submission scores
   - Prize pool tracking

## 🔄 User Workflows

### Builder Journey
1. Sign up with "Builder" role
2. Browse available challenges
3. Select a challenge matching skills
4. Develop solution
5. Submit GitHub repository link
6. Wait for review and scoring
7. View results on leaderboard

### Sponsor Journey
1. Sign up with "Sponsor" role
2. Access Sponsor Dashboard
3. Create new challenge via wizard
4. Set challenge live (active status)
5. Monitor submissions as they arrive
6. Review and score submissions
7. Communicate with top candidates
8. Close challenge and award prizes

## 🛠️ Development Guidelines

### Code Standards
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Functional React components with hooks
- Proper error handling and loading states
- Accessible UI components (WCAG 2.1 AA)

### State Management
- React Query for server state
- Local component state for UI state
- Supabase real-time for live updates
- Toast notifications for user feedback

### API Integration
- Supabase client wrapper for type safety
- Automatic JWT token management
- Error handling with user-friendly messages
- Loading states for async operations

## 📊 Performance Optimization

- Code splitting with React.lazy (when needed)
- Image optimization and lazy loading
- Debounced search inputs
- Pagination for large data sets
- Cached queries with React Query
- Indexed database queries

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Role-based signup flow
- [ ] Authentication (login/logout)
- [ ] Challenge creation workflow
- [ ] Submission process
- [ ] Scoring and review system
- [ ] Leaderboard calculations
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Dark mode functionality
- [ ] Error handling scenarios

### Test Accounts
- Builder: `builder@example.com` / `password123`
- Sponsor: `sponsor@example.com` / `password123`

## 🚢 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] Authentication email templates customized
- [ ] Error monitoring setup
- [ ] Performance monitoring enabled
- [ ] Backup strategy implemented
- [ ] SSL certificate active
- [ ] Custom domain connected
- [ ] CDN configured for assets

### Environment Variables
```
VITE_SUPABASE_URL=<your-project-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
VITE_SUPABASE_PROJECT_ID=<your-project-id>
```

## 🐛 Known Issues & Future Enhancements

### Current Limitations
- No email notifications for challenge updates
- No real-time chat between sponsors and builders
- Limited file upload for challenge assets
- No payment gateway integration for prizes

### Planned Features
- [ ] Email notification system
- [ ] In-app messaging
- [ ] Challenge templates library
- [ ] Advanced search filters
- [ ] Team challenges support
- [ ] Badge and achievement system
- [ ] Payment integration (Stripe)
- [ ] Challenge collaboration features
- [ ] Mobile app (React Native)
- [ ] AI-powered challenge recommendations

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- Database backup verification
- Security audit reviews
- Performance monitoring
- User feedback collection
- Bug tracking and resolution
- Feature request prioritization

### Documentation Updates
- Keep API documentation current
- Update user guides as features change
- Maintain changelog
- Document breaking changes

## 📄 License & Credits

**Built with:**
- React + TypeScript
- Lovable (Development Platform)
- Supabase (Backend as a Service)
- shadcn/ui (Component Library)
- Tailwind CSS (Styling)

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Maintained by:** Development Team
