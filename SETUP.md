# Forge — Setup Guide

Follow these steps in order. Each step links to the right place.

---

## Step 1 — Push to GitHub

1. Download and install **GitHub Desktop**: https://desktop.github.com
2. Open GitHub Desktop → **File → Add Local Repository**
3. Navigate to your `Dating App/forge` folder and select it
4. Click **"create a repository"** when prompted
5. Name it `forge`, leave everything else as default → **Create Repository**
6. Click **Publish repository** (top right) → uncheck "Keep this code private" if you want → **Publish**

Your code is now on GitHub at: `https://github.com/kalyan-cmyk/forge`

---

## Step 2 — Create a Supabase project (database + auth)

1. Go to: https://supabase.com and sign up with your GitHub account (free)
2. Click **New project**
   - Name: `forge`
   - Database password: generate a strong one and save it somewhere
   - Region: pick the closest to your city
3. Wait ~2 minutes for the project to set up
4. Go to **SQL Editor** (left sidebar) → **New query**
5. Open the file `forge/supabase/schema.sql` from your Dating App folder
6. Copy the entire contents → paste into the SQL editor → click **Run**
7. You should see "Success" — this creates all your tables

---

## Step 3 — Get your Supabase keys

1. In Supabase, go to **Settings → API**
2. Copy:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public key** (the long string under "Project API keys")

---

## Step 4 — Deploy to Vercel (free hosting)

1. Go to: https://vercel.com and sign up with your GitHub account
2. Click **Add New → Project**
3. Find `forge` in your GitHub repositories → **Import**
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL from Step 3
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key from Step 3
5. Click **Deploy**
6. Wait ~2 minutes → your app is live at `https://forge-xxx.vercel.app`

---

## Step 5 — Set up your first curator account

1. Open your live app and sign up as a normal user
2. In Supabase, go to **Table Editor → profiles**
3. Find your row and change `role` from `user` to `curator`
4. Sign out and sign back in — you'll now land on the curator dashboard

---

## That's it.

The app is live. Share the URL with your first users and curators.

Every time Claude updates the code in your Dating App folder:
1. Open GitHub Desktop → it shows the changes
2. Write a short message (e.g. "update dashboard") → **Commit to main**
3. Click **Push origin**
4. Vercel auto-deploys in ~2 minutes
