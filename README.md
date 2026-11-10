# Wish & Find website: what to change where

The site is split so that one kind of change touches one place only.

## 0. One-time setup on Vercel

The Admin page needs three things on the host. None of them is stored in this repository.

1. **Import the project.** In Vercel choose Add New > Project, import `wish-and-find`, leave Framework Preset as Other, and deploy.
2. **Connect file storage.** In the project open Storage > Create > Blob. Set access to **Public**, tick **Add a read-write token env var to this connection**, and create it. This holds the published content, photos and reels.
3. **Set the admin password.** In Settings > Environment Variables add `ADMIN_PASSWORD` with the password you want, for the Production environment. Never put the password in a file here: the repository is public.
4. **Redeploy** (Deployments > latest > Redeploy) so the new settings take effect.
5. Open `your-site-address/#admin` and sign in.

Optional: add `SESSION_SECRET` (any long random text) and, for stronger storage of the password, replace `ADMIN_PASSWORD` with `ADMIN_PASSWORD_HASH` produced by `node scripts/hash-password.mjs`.

To change the password later, edit the variable and redeploy. Everyone is signed out when it changes.

## 1. Changes you make yourself, no code

Open the site, scroll to the footer and choose **Admin**, then sign in with the admin password. Five wrong attempts lock sign-in for 15 minutes, and a session lasts 8 hours.

| I want to change | Admin section |
|---|---|
| Add, edit, hide or delete a property; mark it Featured | Properties |
| Upload a reel (MP4 or WebM, up to 20 MB) or paste a reel link; reorder the slider | Reels |
| Add or edit a locality's scores, summary and recent events | Locality reports |
| WhatsApp number, phone, email, address, hours, headline, announcement bar | Site details |
| Save or restore a copy of everything | Backup |

Edits are kept as a draft. Visitors see them only after **Publish changes**.

## 2. Changes to wording: one file

`site-config.js` holds all fixed text. Each block is labelled.

| I want to change | Block in site-config.js |
|---|---|
| Company name, tagline, footer line | 1. BRAND |
| Default contact details, Google Maps search | 2. CONTACT |
| Small line above the headline, search hint | 3. TOP OF THE HOME PAGE |
| The six services | 4. SERVICES |
| The four "How it works" steps | 5. HOW IT WORKS |
| Plan names, prices, features | 6. PLANS |
| Questions and answers | 7. QUESTIONS AND ANSWERS |
| Starter listings, reels and reports | 8. STARTER CONTENT |

If the same detail is set in both places, the Admin page wins.

## 3. Changes to look or behaviour

| File | What it controls |
|---|---|
| `styles.css` | Colours, fonts, spacing. The colours are the short list at the very top. |
| `app.js` | The public pages: sections, search, filters, slider. |
| `admin.js` | The Admin dashboard. |
| `shell.js` | Page skeleton and browser-tab title. |
| `index.html` | Page skeleton. Rarely needs editing. |
| `api/index.js` | Server routes: sign-in, sign-out, read and publish content, upload permission. |
| `lib/auth.js` | Password check, session cookie, lockout. |
| `lib/content.js` | Saves and loads the published content; keeps the last ten versions. |
| `vendor/blob-client.js` | Upload helper, generated from the `@vercel/blob` package. Do not edit. |
| `vercel.json` | Routing and security headers. |

## 4. Asking Claude for a change

Name the file and the item, so nothing else is touched. For example:

- "In site-config.js, block 6 PLANS, set the Buyer report price to Rs 999."
- "In styles.css, change the brand colour to navy. Leave everything else."
- "In app.js, move the Reels section above Properties."
