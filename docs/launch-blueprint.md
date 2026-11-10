# [PRODUCT_NAME] Launch Blueprint

**Working name:** WishAndFindReviews (Wish & Find) · **Base:** Udyog Vihar Phase 5, Gurugram · **Target audience:** [TARGET_AUDIENCE] · **Launch date:** [LAUNCH_DATE] · **Budget:** [BUDGET] · **Team:** [TEAM_SIZE]

**Premise.** [PRODUCT_NAME] gives homebuyers one standard, data-driven scorecard per neighbourhood (safety, amenities, connectivity, community sentiment, recent events), built from public sources. Because Wish & Find is also a real estate firm with pre-purchase checked listings, the report is both a product on its own and the reason buyers trust the listings.

**Reading guide.** Square-bracket items are placeholders to fill in. Nothing below quotes competitor figures; market statements are general trends only.

---

## 1️⃣ Validation Questions

Aim for 15 to 20 buyer interviews, 8 to 10 agent interviews and 5 to 8 local business interviews before building beyond Phase 1. Ask about past behaviour, not hypothetical intent.

### Homebuyers
- Think of the last area you seriously considered. How did you find out what living there is really like?
- Which sources did you use (maps reviews, news, WhatsApp or society groups, friends, brokers)? Which did you trust least, and why?
- How many hours did that research take? What was still unanswered when you decided?
- Did anything surprise you after a visit or after moving in? Could you have known earlier?
- When comparing two sectors, what three things decide it for you?
- What does "safe" mean for your family in practical terms (lighting, gated entry, late-evening footfall, police response)?
- Have you ever paid for property-related information (legal check, inspection, valuation)? How much, and was it worth it?
- If a report cost [PRICE_POINT], what would it have to contain for you to pay without hesitating?
- Would a score from a company that also sells properties feel trustworthy? What would make it more so?
- How would you want to receive it: web page, PDF, WhatsApp message?

### Real-estate agents and brokers
- What neighbourhood questions do buyers ask that you find hard to answer with evidence?
- How often does a deal stall or collapse because of doubts about the area rather than the property?
- Do you prepare any locality material for clients today? How long does it take?
- Would you share a neutral third-party report with a client, even if it flagged weaknesses?
- Would you pay per report, per month, or not at all? Who in your firm approves that spend?
- What would make you distrust or stop using such a tool?
- Would a co-branded report with your name on it change your answer?

### Local businesses and community stakeholders
- How do new residents usually discover your business?
- Do your online reviews reflect reality? What do they miss?
- What changes in this area over the past year would a newcomer want to know about?
- Would you correct or add information about your locality if asked? What would you expect in return?
- Would a "verified local business" listing inside neighbourhood reports be worth paying for?
- Which community channels (RWA, market association, local pages) carry reliable area news?

### Decision rules (set before interviewing)
- **Proceed** if at least [X]% of buyers describe more than [N] hours of unstructured research and name an unanswered question a report would have covered.
- **Rethink pricing** if fewer than [Y]% have ever paid for any property information.
- **Rethink positioning** if most buyers distrust a score from a firm that also sells property; the fix is published methodology and visible sources.

---

## 2️⃣ Roadmap

### Phase 1: MVP (months 0 to 3)
**Goal:** prove buyers read, trust and act on a report for a small number of localities.

- **Scope:** [10 to 20] Gurugram localities, reports assembled semi-manually with tooling support, the marketing site, WhatsApp as the only contact channel, admin dashboard for listings, reels and reports.
- **Milestones**
  - Week 2: validation interviews complete, scoring method written down in one page.
  - Week 4: site live with sample reports replaced by real ones for the first [5] localities.
  - Week 8: [10 to 20] localities covered, refresh routine in place (monthly).
  - Week 12: first paid report or paid advisory conversion.
- **Success metrics**
  - [200] report views per month; [15]% of viewers open WhatsApp.
  - [10] qualified enquiries per month traced to a report.
  - At least [5] buyers say in follow-up that the report changed or confirmed a decision.
  - Report preparation time under [3] hours per locality.

### Phase 2: Feature expansion (months 4 to 9)
**Goal:** make report production repeatable and start charging.

- **Scope:** automated ingestion for approved sources, sentiment and topic scoring with human review, user accounts, side-by-side comparison, PDF export, payments, saved searches, alerts.
- **Milestones**
  - Month 5: ingestion pipeline produces a draft report an editor only needs to review.
  - Month 6: paid Buyer report tier live.
  - Month 8: comparison and alerts live; coverage at [50 to 80] localities.
- **Success metrics**
  - Free to paid conversion of [3 to 5]%.
  - Editor time per report under [45] minutes.
  - [30]% of paying users return within 60 days.
  - Refund or complaint rate under [2]%.

### Phase 3: Scaling (months 10 to 18)
**Goal:** expand coverage and open a business channel.

- **Scope:** second and third city, agent and developer plans, public API, co-branded reports, data quality monitoring, optional mobile app wrapper.
- **Milestones**
  - Month 12: second city launched with the same method.
  - Month 14: first [10] paying agent or brokerage accounts.
  - Month 18: API with at least [3] integration partners.
- **Success metrics**
  - Monthly recurring revenue of [TARGET_MRR].
  - Cost to produce one refreshed report under [COST_TARGET].
  - Business plans contributing [30]% of revenue.
  - Coverage of [X] localities across [3] cities with refresh no older than 30 days.

### Risks to manage across all phases
| Risk | Why it matters | Mitigation |
|---|---|---|
| Source terms of use | Review platforms and social networks restrict scraping and redistribution | Use official APIs and licensed feeds; store derived scores, not copied text; keep a source register |
| Fairness and defamation | Labelling an area "unsafe" can harm residents and invite complaints | Score observable factors only, publish the method, show sources and dates, offer a correction route |
| Conflict of interest | The firm sells homes in the areas it scores | Same method for every locality, method page public, flag listings clearly as commercial |
| Data protection | Personal data in reviews and posts | Aggregate only, drop usernames, follow the Digital Personal Data Protection Act, 2023 and take legal advice before launch |
| Thin data | Newer sectors have few reviews | Show a confidence level; do not publish a score below a minimum evidence threshold |
| Advertising rules | Property promotion is regulated | Show RERA registration numbers on listings where applicable |

---

## 3️⃣ Feature List

| Feature | Description | Phase | Priority |
|---|---|---|---|
| Locality scorecard | Overall score plus safety, amenities, connectivity and sentiment, each out of 100 | 1 | High |
| Report page | Summary, score reasons, recent events, source types, last refreshed date | 1 | High |
| Locality search | Search by sector or locality name | 1 | High |
| WhatsApp contact | Every call to action opens a pre-filled WhatsApp chat | 1 | High |
| Property listings | Pre-purchase checked properties with price, size, status, enquiry button | 1 | High |
| Reels slider | Short walkthrough videos managed from the admin page | 1 | Med |
| Admin dashboard | Manage listings, reels, reports, contact details; publish with one button | 1 | High |
| Settings file | One file for wording, services, plans and FAQs | 1 | High |
| Method page | Plain-language explanation of how scores are built | 1 | High |
| Sample and confidence labels | Mark sample data and low-evidence scores clearly | 1 | High |
| Enquiry tracking | Record which report or listing each WhatsApp enquiry came from | 1 | Med |
| Automated ingestion | Scheduled collection from approved APIs and feeds | 2 | High |
| Sentiment and topic scoring | Classify review and news text into the four categories | 2 | High |
| Editor review queue | Human approval before a report goes live | 2 | High |
| User accounts | Email or phone sign-in, saved localities | 2 | Med |
| Side-by-side comparison | Compare two or three localities | 2 | High |
| PDF export | Branded downloadable report | 2 | Med |
| Payments | One-off report purchase and subscriptions via an Indian payment gateway | 2 | High |
| Alerts | Notify when a saved locality's score or events change | 2 | Med |
| Map view | Localities and listings on a map | 2 | Med |
| Commute estimates | Travel time to a chosen workplace | 2 | Low |
| Resident corrections | Residents and businesses submit corrections for review | 2 | Med |
| Multi-city coverage | Same method in additional cities | 3 | High |
| Agent and brokerage plans | Seats, co-branded reports, bulk credits | 3 | High |
| Public API | Scores and report data for partners | 3 | Med |
| Verified business listings | Paid local business placement inside reports | 3 | Low |
| Data quality monitoring | Drift, staleness and anomaly alerts on scores | 3 | High |
| Roles and audit log | Admin, editor and viewer roles with a change history | 3 | Med |
| Regional languages | Hindi first, then others by demand | 3 | Low |

---

## 4️⃣ UI Wireframe Descriptions

**Visual rules for every screen:** flat surfaces, hairline borders, no 3D effects, shadows or gradients. One brand colour, a separate green reserved for WhatsApp actions, semantic colours for scores. Numbers in a monospaced face. Works at phone width first.

### Home
```
+--------------------------------------------------------------+
| [Logo] [PRODUCT_NAME]   Reports Properties Reels ... [WhatsApp] |
+--------------------------------------------------------------+
| Eyebrow line                      | +----------------------+ |
| HEADLINE: Know the neighbourhood  | | Sample report card   | |
| before you sign.                  | | Locality   Score /100| |
| Supporting sentence               | | four score bars      | |
| [ Search a sector or locality ][Go]| +----------------------+ |
| [Chat on WhatsApp]  Browse properties                        |
+--------------------------------------------------------------+
| NEIGHBOURHOOD REPORTS  locality buttons > full report        |
| PROPERTIES             filters > card grid                   |
| REELS                  horizontal slider with arrows         |
| WHY [PRODUCT_NAME]     six services > four numbered steps    |
| PLANS                  three tiers > FAQ                     |
| CONTACT                WhatsApp button | office, hours, map  |
| Footer links ... Admin                    [Chat with us] (fixed) |
+--------------------------------------------------------------+
```
- **Key elements:** sticky header, search field, live report card in the first screen, fixed WhatsApp button bottom right.
- **Navigation:** header links scroll to sections; search with a matching locality jumps to its report, otherwise to filtered properties.
- **Placeholder text:** "Search a sector or locality, e.g. Sector 56".

### Search results
```
| [ search field: "Sector 5" ]  Type v  Status v  Budget v     |
| 6 properties                                                 |
| +-----------+ +-----------+ +-----------+                    |
| | photo     | | photo     | | photo     |  status chip on photo
| | LOCALITY  | | ...       | | ...       |                    |
| | Title     | |           | |           |                    |
| | Type · 3 BHK · 1,850 sq ft            |                    |
| | Rs 2.15 Cr      [Enquire]             |                    |
| +-----------+ +-----------+ +-----------+                    |
```
- **Key elements:** filters update results as they change, result count, matching locality report linked above the grid.
- **Empty state:** "No properties match these filters." with a WhatsApp button, "Ask on WhatsApp".
- **Navigation:** card button opens WhatsApp with the property name pre-filled. Phase 2 adds a property detail page and map toggle.

### Report view
```
| NEIGHBOURHOOD REPORT                         80 /100  STRONG |
| Sector 56, Gurugram                                          |
| Safety               [==============    ] 78                 |
| Amenities            [================  ] 86                 |
| Connectivity         [=============     ] 74                 |
| Community sentiment  [===============   ] 80                 |
| Summary paragraph (two or three sentences)                   |
| Recent in the area                                           |
|  - event one   - event two   - event three                   |
| Sources: public reviews, local news ...   Last refreshed: [DATE] |
| [Compare]  [Download PDF]  [Ask about this area on WhatsApp] |
```
- **Key elements:** overall score with a word label, four bars, plain-language reasons, dated events, source types, refresh date, confidence note when evidence is thin.
- **Navigation:** locality buttons switch reports; Phase 2 adds compare and PDF, with the full report behind the paid tier.
- **Placeholder text:** "Reports are being prepared. Message us with the sector you are considering."

### Admin dashboard
```
| [PRODUCT_NAME] ADMIN                               View site |
| Unpublished changes.                [Discard] [Publish changes] |
+---------------+----------------------------------------------+
| Overview      | Tiles: Listings | Featured | Reels | Reports |
| Properties    | Listings by status (bars) | by type (bars)   |
| Reels         | Launch checklist (WhatsApp set? photos? ...) |
| Locality rep. |                                              |
| Site details  | Properties: search, table, Add / Edit / Delete,
| Backup        |   Featured and Visible switches              |
|               | Reels: upload video or paste link, reorder   |
|               | Reports: edit four scores, summary, events   |
|               | Site details: WhatsApp, phone, address, headline
|               | Backup: copy and restore all content         |
+---------------+----------------------------------------------+
```
- **Key elements:** draft then publish (visitors see nothing until Publish), inline delete confirmation, sample badges, launch checklist.
- **Navigation:** left menu on desktop, scrolling tab row on phones.
- **Access:** owner and editors only. Phase 3 adds roles and an audit log.

---

## 5️⃣ Technical Architecture

```
 SOURCES                 INGESTION              PROCESSING               STORAGE
 Places/reviews API  -+
 News feeds/RSS      -+-> Scheduler ---> Queue --> Clean + dedupe ---> Raw store (object storage)
 Licensed social data-+   (cron jobs)             Geo-tag to locality   Relational DB (PostgreSQL
 Public records      -+                           Classify topic        + PostGIS): localities,
 Admin manual entry  ------------------------->   Sentiment score       scores, events, listings,
                                                  Aggregate to 0-100    users, orders
                                                  Editor review queue   Cache (reports as JSON)
                                                          |
                                                          v
 FRONT END  <----  API (REST, read-mostly)  <----  Published report snapshot
 Public site, report pages, admin dashboard        Media storage + CDN (photos, reels)
```

### Data ingestion
- Scheduled jobs per source, each with its own rate limit and a written record of the terms it operates under.
- Use official APIs and licensed feeds. Do not scrape sources whose terms forbid it; that includes most social platforms and review sites.
- Store source type, fetch date and a locality tag with every item. Keep raw text only where the licence allows, otherwise keep derived values.

### Processing
- **Clean:** remove duplicates, spam and personal identifiers.
- **Locate:** map each item to a locality polygon; discard what cannot be placed.
- **Classify:** assign to safety, amenities, connectivity or sentiment. Start with a hosted language model API plus keyword rules; this avoids training costs.
- **Score:** weighted aggregate per category on a 0 to 100 scale, with a minimum evidence threshold and a confidence level. Fix the formula in a versioned document.
- **Review:** an editor approves each report before it is published. Phase 1 is mostly manual with this same flow.

### Storage
- PostgreSQL with PostGIS for localities, scores, events, listings, users and orders.
- Object storage for raw captures, photos and reels, served through a CDN.
- Each published report saved as an immutable, versioned snapshot so past scores can be audited.

### API
- Read endpoints: localities, report by locality, listings with filters, reels.
- Write endpoints (authenticated): listings, reels, reports, site settings.
- Phase 3: partner keys, usage quotas and rate limits.

### Front end
- Server-rendered or statically generated pages for speed and search visibility; reports are mostly static between refreshes.
- Content and wording separated from code in a settings file, as in the delivered website, so text changes never touch layout or logic.
- Admin dashboard as a protected area of the same application.

### Security and compliance
- HTTPS everywhere; secrets in a managed secret store, never in the code repository.
- Role-based admin access with two-step sign-in; audit log of every content change.
- Aggregated outputs only; no individual reviewers identified.
- Privacy notice, consent for contact data, and a deletion route in line with Indian data protection law.
- Daily database backups with a tested restore.
- A public correction form and a named contact for complaints about a score.

### Lean stack for [TEAM_SIZE] people on [BUDGET]
- One managed Postgres database, one application host, one object store with CDN, one scheduler. No Kubernetes, no data warehouse until volume demands it.
- Expected Phase 1 running cost is dominated by API usage and video storage; set monthly caps on both.

---

## 6️⃣ Monetization Options

### Freemium (recommended starting point)
- **Free:** overall score and four category scores for a limited number of localities per month.
- **Paid:** reasons behind each score, recent events, comparison, PDF.
- Rationale: buyers research intensely for a few months and then stop, so a free first look followed by a one-off or short subscription fits the behaviour better than an annual plan.

### Subscription tiers (B2C)
| Tier | Price | Who it is for | Includes |
|---|---|---|---|
| Snapshot | Free | First look | Overall and category scores, [3] localities a month |
| Buyer report | [PRICE_1] per report, or [PRICE_2] for 30 days unlimited | Active shortlist | Full reports, events, comparison, PDF |
| Buyer Plus | [PRICE_3] | Buyers who want help | Everything above plus guided visits, documentation review, advisor on WhatsApp |

- Offer a time-boxed pass (30 or 90 days) rather than monthly auto-renewal; it matches the buying window and reduces refund requests.
- Credit the report fee against advisory or brokerage fees when the buyer purchases through Wish & Find.

### Enterprise and business licensing (Phase 3)
- **Agent seat:** [PRICE_4] per seat per month for unlimited reports and co-branding.
- **Brokerage or developer licence:** annual contract with bulk credits and white-label PDFs.
- **API access:** tiered by request volume.

### Optional add-ons
- Custom report for a locality not yet covered, delivered within [N] days.
- Commute and school-catchment analysis for a specific address.
- Legal document check through a partner advocate.
- Home loan referral (commission from the lender; disclose it).
- Verified local business placement inside reports, labelled as paid.

### Guardrails
- Never sell a better score. Paid placements are labelled and cannot change scores.
- Keep the method page free and public; it is what makes the paid tiers credible.
- Test price points in validation interviews before fixing them; replace every [PRICE] placeholder only after that.

---

## Next actions

1. Fill the placeholders at the top of this document.
2. Run the validation interviews and apply the decision rules.
3. Replace the sample reports and listings on the website with real ones from the Admin page.
4. Take legal advice on source terms, data protection and RERA advertising requirements before paid launch.
