# Wish & Find website: what to change where

The site is split so that one kind of change touches one place only.

## 1. Changes you make yourself, no code

Open the site, scroll to the footer and choose **Admin**. Only the owner and editors of the site can open it.

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
| `index.html` | Generated. Do not edit by hand; it also carries the published content. |

## 4. Asking Claude for a change

Name the file and the item, so nothing else is touched. For example:

- "In site-config.js, block 6 PLANS, set the Buyer report price to Rs 999."
- "In styles.css, change the brand colour to navy. Leave everything else."
- "In app.js, move the Reels section above Properties."
