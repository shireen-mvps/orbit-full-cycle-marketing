# Orbit — Full-Cycle AI Marketing Platform

> Market intelligence. Brand strategy. Buyer personas. In three modules.

**Orbit** is a full-stack AI marketing tool that takes a product from zero context to a complete brand strategy — competitive landscape mapped, positioning defined, and high-fidelity buyer personas generated — all in one sequential workflow powered by Claude AI.

Built with **Next.js 16**, **Clerk authentication**, **Supabase**, and **Claude claude-sonnet-4-6**.

**Live demo:** [orbit-mkt.vercel.app](https://orbit-mkt.vercel.app)

---

## What it does

1. Sign in with Google via **Clerk** — your projects are private to your account
2. Create a **project** — name your product and Orbit sets up a workspace
3. Run **Module 1: Market Intelligence** — enter your industry, product category, and up to 5 competitors. Orbit returns a competitive positioning quadrant, market gaps, whitespace opportunities, and a full competitor breakdown
4. Run **Module 2: Brand Foundation** — fed directly from M1 data. Generate your positioning statement, value proposition, messaging pillars, brand voice descriptors, and 3 tagline options
5. Run **Module 3: Audience Studio** — grounded in M1 + M2 context. Generate 3 high-fidelity buyer personas with psychographics, pain points, buying triggers, objections, preferred channels, and sample ad hooks
6. Each module unlocks sequentially — the output of every phase becomes the input context for the next

---

## Key Features

| Feature | Description |
|---------|-------------|
| **3-module sequential workflow** | Market Intel → Brand Foundation → Audience Studio, each building on the last |
| **Competitive positioning quadrant** | SVG chart plotting your competitors by price and quality |
| **Market gap detection** | Numbered grid of gaps + teal-highlighted whitespace opportunities |
| **Brand strategy output** | Positioning statement, value prop, messaging pillars, brand voice, taglines |
| **Buyer personas** | 3 detailed personas with ad hooks — generated from full brand context |
| **Auth-gated projects** | Clerk auth with Google OAuth — each user's projects are private |
| **Rate limiting** | 30 AI calls/day per user (Upstash Redis sliding window) |
| **Usage meter** | Live credit counter in the top bar — X / 30 daily credits |
| **Animated dark UI** | Electric teal design system, Framer Motion transitions, mobile responsive |

---

## How It Works

Orbit's core insight: most AI marketing tools treat each output in isolation. Orbit chains them.

```
Industry + Competitors
        ↓
  Market Intelligence  →  gaps, whitespace, positioning map
        ↓
  Brand Foundation     →  positioning statement, messaging pillars, taglines
        ↓
  Audience Studio      →  3 buyer personas grounded in brand + market context
```

Every Claude prompt in M2 and M3 is injected with the structured output of the previous module — so the personas aren't generic, they're built on top of your actual competitive landscape and brand voice.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| AI | Claude claude-sonnet-4-6 via Anthropic API |
| Auth | Clerk (Google OAuth, middleware-protected routes) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Rate limiting | Upstash Redis (sliding window, 30 calls/day per user) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animation | Framer Motion |
| Typography | Syne (headings) + Plus Jakarta Sans (body) |
| Language | TypeScript |
| Deployment | Vercel |

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/shireen-mvps/orbit-full-cycle-marketing.git
cd orbit-full-cycle-marketing
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Clerk (create app at clerk.com — enable Google OAuth)
CLERK_SECRET_KEY=your_clerk_secret_key_here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Supabase (create project at supabase.com)
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Upstash Redis (create database at upstash.com)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here
```

### 4. Set up Supabase

Run this in the Supabase SQL editor to create the projects table:

```sql
create table orbit_projects (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  market_intel jsonb,
  brand_foundation jsonb,
  audience_studio jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table orbit_projects enable row level security;

create policy "Users can only access their own projects"
  on orbit_projects
  for all
  using (user_id = requesting_user_id());
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
3. Add all environment variables from `.env.example` in the Vercel project settings
4. In your Clerk dashboard, add your Vercel production URL to the allowed origins
5. Click **Deploy**

---

## Project Structure

```
orbit/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/   # Clerk sign-in page
│   │   └── sign-up/[[...sign-up]]/   # Clerk sign-up page
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Sidebar + topbar shell
│   │   ├── dashboard/page.tsx        # Projects list + new project CTA
│   │   └── projects/[id]/
│   │       ├── page.tsx              # Project overview (module unlock status)
│   │       ├── market-intel/         # Module 1 UI
│   │       ├── brand-foundation/     # Module 2 UI
│   │       └── audience-studio/      # Module 3 UI
│   ├── api/
│   │   ├── ai/
│   │   │   ├── analyze-market/       # Claude — market intelligence
│   │   │   ├── build-brand/          # Claude — brand foundation
│   │   │   └── generate-personas/    # Claude — audience personas
│   │   └── projects/[id]/            # CRUD — project data
│   ├── layout.tsx                    # Root layout + ClerkProvider
│   └── page.tsx                      # Public landing page
├── components/                       # shadcn/ui components
├── lib/
│   ├── anthropic.ts                  # Claude client (haiku/sonnet routing)
│   ├── rate-limit.ts                 # Upstash sliding window limiter
│   ├── supabase.ts                   # Supabase server client
│   └── validations.ts                # Input sanitizer
├── types/
│   └── orbit.ts                      # OrbitProject, MarketIntel, Persona types
├── proxy.ts                          # Clerk auth middleware (Next.js 16)
├── .env.example
└── README.md
```

---

## Roadmap

- [ ] **PDF export** — download the full brand strategy as a branded PDF report
- [ ] **Module 4: Campaign Builder** — generate a 4-week content calendar from persona + brand data
- [ ] **Module 5: Ad Copy Generator** — platform-specific ad copy using persona hooks
- [ ] **Project sharing** — shareable read-only links for client delivery
- [ ] **Brand kit persistence** — save and reload brand inputs across sessions
- [ ] **Multi-model routing** — use Haiku for lighter tasks, Sonnet for deep analysis

---

Built by [Shireen](https://github.com/shireen-mvps) · Powered by Claude Code · View full AI marketing portfolio at [aiwithshireen.com](https://aiwithshireen.com)
