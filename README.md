# BRSI VIT Chapter - Website

Welcome to the BRSI VIT Chapter website project. This is a fully static vanilla HTML/CSS/JS site powered by Supabase for its backend, database, and storage.

## Features
- Dynamic fetching of Events, Biobuzz issues, Board members, and Team events.
- On-the-fly theme switching configurable by admins.
- Full Admin Panel for managing all content without code deployments.

## Local Setup

1. **Clone the repository.**
2. **Serve the files:** You need to run a local web server to avoid CORS issues and allow JavaScript modules to work properly.
   - Using VS Code: Install the **Live Server** extension, open `index.html`, right-click and select "Open with Live Server".
   - Using Python: Open a terminal in the folder and run `python -m http.server 8000`, then visit `http://localhost:8000`.

## Supabase Setup

1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open the `supabase-schema.sql` file in this repository, copy its contents, and run it in the SQL Editor. This will create all necessary tables, set default values, and configure policies.
4. Go to **Project Settings -> API**.
   - Copy the **Project URL**.
   - Copy the **anon / public API key**.
5. Open `js/supabase.js` and paste your URL and API Key where indicated.

### Storage Buckets
If the SQL script did not automatically create the buckets, go to the **Storage** section in Supabase and manually create these buckets. **Make sure to mark them as Public**:
- `events-images`
- `biobuzz-covers`
- `board-photos`
- `team-images`
- `site-assets`

## Admin Panel & Passwords

The admin dashboard is located at `/admin/index.html`.

**Default Login Credentials:**
- Admin 1: `brsi2025admin1`
- Admin 2: `brsi2025admin2`

**To change passwords:**
1. Log into the admin panel.
2. Navigate to the **Settings** tab.
3. Under "Admin Security", you can update the passwords. You will need to provide the current password to save a new one.

*Note on Security*: This app uses client-side SHA-256 hashing matched against the database for simplicity. Because of this, Row Level Security (RLS) is configured to allow public access. Do not store highly sensitive personal information in this database.

## Vercel Deployment

1. Create a [Vercel](https://vercel.com) account and connect your GitHub repository.
2. Select your repository to import.
3. Leave the **Framework Preset** as `Other`.
4. Ensure the **Build Command** is empty and **Output Directory** is empty (Vercel will serve the root folder statically).
5. Click **Deploy**.
6. Whenever you update content via the Admin panel, the live site updates immediately without needing a re-deployment!
