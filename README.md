# StudyBug MVP

A Next.js SaaS starter with authentication, payments, and email built in.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Auth**: Better Auth (email/password + Google OAuth)
- **Database**: PostgreSQL via Prisma ORM
- **Payments**: Stripe
- **Email**: Resend + React Email
- **UI**: Tailwind CSS, Radix UI (shadcn/ui), Lucide icons
- **Error tracking**: Sentry

## Getting Started

### 1. Install dependencies

```bash
yarn install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Random secret for session signing |
| `BETTER_AUTH_URL` | App base URL (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `EMAIL_FROM` | Sender address (e.g. `noreply@yourdomain.com`) |
| `SENTRY_DSN` | Sentry DSN for error tracking |

### 3. Set up the database

```bash
yarn db:push      # push schema to your database (dev)
yarn db:generate  # regenerate Prisma client after schema changes
```

For production, use migrations instead:

```bash
yarn db:migrate
```

### 4. Run the dev server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  (auth)/           # Sign in, sign up, reset password pages
  (dashboard)/      # Protected dashboard and settings pages
  actions/          # Server actions (auth)
  api/
    auth/           # Better Auth API handler
    stripe/         # Stripe webhook handler
    user/           # User API routes
components/
  auth/             # Sign-in and sign-up forms
  layout/           # Header, footer, sidebar
  marketing/        # Hero, features, pricing sections
  providers/        # Session provider
  ui/               # shadcn/ui components
emails/             # React Email templates (welcome, reset password)
lib/
  auth.ts           # Better Auth server config
  auth-client.ts    # Better Auth browser client
  db.ts             # Prisma client instance
  email.ts          # Resend client
  stripe.ts         # Stripe client
prisma/
  schema.prisma     # Database schema
```

## Database

User data is stored entirely in your own PostgreSQL database. Better Auth manages the following tables:

- `user` — user profiles (also holds `stripeCustomerId` and `plan`)
- `session` — active sessions
- `account` — OAuth provider links
- `verification` — email verification / password reset tokens

To browse your data locally:

```bash
yarn db:studio
```

This opens Prisma Studio at [http://localhost:5555](http://localhost:5555).

## Scripts

| Script | Description |
|---|---|
| `yarn dev` | Start development server |
| `yarn build` | Build for production |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn db:push` | Push schema changes to DB (no migration history) |
| `yarn db:migrate` | Create and apply a named migration |
| `yarn db:generate` | Regenerate Prisma client |
| `yarn db:studio` | Open Prisma Studio |
