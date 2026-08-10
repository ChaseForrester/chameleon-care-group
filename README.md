# Chameleon Care Group

Modern Next.js website + Firebase Super Admin CMS for [Chameleon Care Group](https://chameleoncaregroup.com.au/) — personalised NDIS, aged care and private nursing across Sutherland Shire, Illawarra, Central Coast and Sydney.

## Features

### Public website
- Redesigned UI/UX (brand-aligned greens, gradient accents, accessible navigation)
- Pages: Home, About, Services, Success Stories, Blog, Offers, Contact, Book, Referral
- Brand assets from the original site (`public/images/`)
- Mobile-first responsive layout, FAQ accordion, enquiry forms

### Super Admin (`/admin`)
Signed-in admins can:
- **Blogs** — create, edit, publish, upload cover images
- **Offers & campaigns** — promotional CTAs with dates
- **Success stories** — case studies with consent flag
- **Services** — update service copy, order and visibility
- **Page content** — override hero/body copy without a developer
- **Inquiries** — view contact / book / referral submissions
- **Settings** — seed Firestore defaults, register super admin, site contact fields

### Firebase
| Product | Use |
|--------|-----|
| **Authentication** | Email/password Super Admin login |
| **Cloud Firestore** | Blogs, offers, stories, services, pages, settings, inquiries |
| **Storage** | Blog/cover image uploads |

**Firebase project:** `chameleon-care-group-au`  
**Console:** https://console.firebase.google.com/project/chameleon-care-group-au/overview

## Quick start

```bash
npm install
cp .env.example .env.local   # fill with Firebase web config
npm run dev
```

Open http://localhost:3000 and http://localhost:3000/admin

### Environment variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chameleon-care-group-au
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Super Admin setup (one-time)

1. Open [Firebase Authentication](https://console.firebase.google.com/project/chameleon-care-group-au/authentication/providers)
2. Click **Get started** (if prompted)
3. Enable **Email/Password**
4. Under **Users**, add the client’s admin email + a strong password
5. Sign in at `/admin/login`
6. Go to **Settings & seed** → **Register me as super admin**
7. Optionally **Seed default content**
8. Deploy secure rules:

```bash
firebase deploy --only firestore:rules,storage --project chameleon-care-group-au
```

> Until Auth is enabled in the Console, admin login will show `CONFIGURATION_NOT_FOUND`. The public site works with built-in seed content either way.

## Deploy rules / indexes

```bash
firebase deploy --only firestore,storage --project chameleon-care-group-au
```

## Deploy on Vercel (GitHub)

This repo is set up for the standard **GitHub → Vercel** workflow.

1. Import [ChaseForrester/chameleon-care-group](https://github.com/ChaseForrester/chameleon-care-group) in [Vercel](https://vercel.com/new)
2. Framework preset: **Next.js** (auto-detected)
3. Root directory: `.` (repo root)
4. Env vars are optional — Firebase public config is baked in with safe defaults
5. Optional: set `NEXT_PUBLIC_SITE_URL` to your custom domain

Or from the CLI:

```bash
npm i -g vercel
vercel link
vercel --prod
```

Every push to `main` rebuilds production. Pull requests get preview URLs.

### Firebase Auth domains

After deploying, add your Vercel domain(s) under  
Firebase Console → Authentication → Settings → Authorized domains  
(e.g. `your-app.vercel.app` and `chameleoncaregroup.com.au`).

## Stack

- Next.js 16 (App Router) + React 19
- Firebase JS SDK (Auth, Firestore, Storage)
- CSS Modules + global design system

## Credits

- Original brand visuals: Chase Forrester  
- NDIS & care copy adapted from chameleoncaregroup.com.au  
- Built for Tech Aid Australia / Chameleon Care Group
