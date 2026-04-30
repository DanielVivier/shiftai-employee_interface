# ShiftAI v1 — Deployment Guide

This guide takes you from zero to a live ShiftAI deployment. Follow the steps in order.

---

## Step 1: Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up or log in.
2. Click **New project**. Choose a name (e.g. "shiftai"), pick a region close to your clients, create a password (save it somewhere).
3. Wait ~2 minutes for provisioning.
4. Go to **Settings → API** and copy these three values — you'll need them in Step 4:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (long string)
   - **service_role** key (long string — keep this secret)

## Step 2: Run the database migration

1. In Supabase, go to **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open the file `supabase/migrations/001_initial.sql` from this project.
4. Copy the entire contents and paste it into the SQL Editor.
5. Click **Run**. You should see "Success. No rows returned."

This creates all tables, security rules, and constraints.

## Step 3: Configure Supabase auth

1. In Supabase, go to **Authentication → Email** (under Providers).
2. Make sure **Enable email provider** is on.
3. Turn **OFF** "Confirm email" (we use magic links, not confirmations).
4. Turn **ON** "Enable magic link" if it's not already on.
5. Go to **Authentication → URL Configuration** and add your production URL to **Redirect URLs** (e.g. `https://your-app.vercel.app/auth/callback`). During development, `http://localhost:3000/auth/callback` is added automatically.

## Step 4: Add your first client and AI employee

You need to insert data manually for v1 (no admin UI yet).

In Supabase **SQL Editor**, run this (replace the values with real ones):

```sql
-- Add your client
INSERT INTO clients (email, company_name)
VALUES ('client@company.com', 'Acme Corp');

-- Add an AI employee for that client
-- First get the client's id:
SELECT id FROM clients WHERE email = 'client@company.com';

-- Then insert the employee (replace <client-id> with the UUID from above):
INSERT INTO ai_employees (client_id, name, role, department, model, system_prompt, quick_actions)
VALUES (
  '<client-id>',
  'Alex',
  'Marketing Manager',
  'Marketing',
  'claude-sonnet-4-6',
  'You are Alex, a marketing professional at Acme Corp. You help the team with campaign ideas, copywriting, market analysis, and strategy. You are direct, creative, and always bring data to back up your recommendations.',
  '[
    {"label": "Write a campaign brief", "prompt": "Help me write a campaign brief for a new product launch."},
    {"label": "Analyze competitors", "prompt": "Give me a competitive analysis framework for our market."},
    {"label": "Draft email copy", "prompt": "Help me draft a marketing email for our latest announcement."}
  ]'::jsonb
);
```

## Step 5: Push to GitHub

1. Create a new repository on [github.com](https://github.com) (click the **+** button → New repository).
2. Name it `shiftai-interface`. Keep it private.
3. Don't initialize with README (you already have one).
4. Copy the commands shown on GitHub after creation. They look like:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/shiftai-interface.git
   git push -u origin master
   ```
5. Run those two commands in your terminal from the `shiftai-interface` folder.

## Step 6: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New → Project**.
3. Import your `shiftai-interface` repository.
4. Vercel will auto-detect it's a Next.js project. Click **Deploy**.
5. The first deploy will fail — that's expected. You need to add environment variables first (Step 7), then redeploy.

## Step 7: Add environment variables in Vercel

1. In your Vercel project, go to **Settings → Environment Variables**.
2. Add each of these (copy from `.env.local.example` for the names):

| Name | Value | Where to get it |
|------|-------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Long string | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Long string | Supabase → Settings → API → service_role |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | console.anthropic.com → API Keys |
| `OPENAI_API_KEY` | `sk-...` | platform.openai.com → API Keys |
| `ADMIN_EMAIL` | `you@yourdomain.com` | Your own email |
| `UPSTASH_REDIS_REST_URL` | Optional | upstash.com → Redis → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | upstash.com → Redis → REST API |

3. After adding all variables, go to **Deployments** and click **Redeploy** on the latest deployment.

## Step 8: Update Supabase redirect URL

Once Vercel gives you a production URL (e.g. `https://shiftai-interface-abc123.vercel.app`):

1. Go to Supabase → **Authentication → URL Configuration**.
2. Add the production URL to **Redirect URLs**: `https://your-actual-url.vercel.app/auth/callback`.
3. Also set **Site URL** to your production URL.

## Step 9: Test the deployment

1. Open your Vercel URL.
2. You should see the login page.
3. Enter the email you added as a client in Step 4.
4. Check your inbox for a magic link.
5. Click the link — you should land on the home screen with your AI employee card.
6. Click the card — you should see the 3-panel interface.
7. Type a message — you should get a streaming response.

---

## Local development

```bash
# Copy the env example
cp .env.local.example .env.local

# Edit .env.local and add your credentials
# (just Supabase + Anthropic key is enough to start)

# Start the dev server
npm run dev

# Run tests
npm test
```

---

## Troubleshooting

**Magic link goes to "Link expired" page:**
Check that your Supabase redirect URL includes `http://localhost:3000/auth/callback` for development.

**Employee not showing up:**
Run `SELECT * FROM ai_employees;` in Supabase SQL Editor to verify the row was inserted, and check that `client_id` matches a row in the `clients` table.

**Chat returns 403:**
The employee's `client_id` doesn't match a `clients` row whose email matches the logged-in user. Double-check the SQL insert.

**Chat returns 500:**
Check Vercel logs (Deployments → your deployment → Functions tab → `/api/chat`). Usually a missing env var or an invalid model string.

**Rate limit hitting immediately:**
If `UPSTASH_REDIS_REST_URL` is set but incorrect, rate limiting may fail closed. Either fix the credentials or remove both Upstash env vars to disable rate limiting.
