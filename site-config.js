/* =====================================================================
   WISH & FIND - SITE SETTINGS
   ---------------------------------------------------------------------
   This is the one file to edit when wording, contact details, services,
   plans or FAQs need to change. Nothing here touches layout or logic.

   Rules for editing:
   - Change only the text between the quotes.
   - Keep every comma, bracket and quote mark where it is.
   - Listings, reels, locality reports and the WhatsApp number can also be
     changed from the Admin page (footer > Admin) without opening this file.
     Whatever is published from the Admin page wins over the values here.
   ===================================================================== */

window.SITE_CONFIG = {

  /* ---------- 1. BRAND ---------- */
  brand: {
    name: "Wish & Find",
    tagline: "Neighbourhood reports and verified homes in Gurugram",
    footerNote: "Real estate advisory and neighbourhood insight."
  },

  /* ---------- 2. CONTACT ---------- */
  contact: {
    // Digits only, with country code, no + or spaces. Example: "919812345678"
    whatsappNumber: "",
    // The message that is pre-typed when a visitor opens WhatsApp
    whatsappMessage: "Hello Wish & Find, I would like to know more about your properties and neighbourhood reports.",
    phone: "",
    email: "",
    // Each new line of the address goes on its own line
    address: "Wish & Find\nUdyog Vihar Phase 5\nGurugram, Haryana, India",
    hours: "Monday to Saturday, 10:00 am to 7:00 pm",
    // What Google Maps searches for when a visitor taps "Open in Google Maps"
    mapsQuery: "Udyog Vihar Phase 5, Gurugram, Haryana"
  },

  /* ---------- 3. TOP OF THE HOME PAGE ---------- */
  hero: {
    eyebrow: "Gurugram homes, checked before you buy",
    headline: "Know the neighbourhood before you sign.",
    sub: "Wish & Find scores every locality on safety, amenities, connectivity and what residents actually say, then matches you with properties we have checked ourselves.",
    searchPlaceholder: "Search a sector or locality, e.g. Sector 56"
  },

  // A thin notice bar above the header. Leave as "" to hide it.
  announcement: "",

  /* ---------- 4. SERVICES ("Why Wish & Find") ---------- */
  services: [
    { title: "Neighbourhood quality reports",
      text: "One standard scorecard per locality, built from public reviews, local news and community discussion, so two sectors can be compared like for like." },
    { title: "Pre-purchase property checks",
      text: "Every listing is visited and its basic paperwork reviewed before it appears here. You see the property and the facts together." },
    { title: "Guided site visits",
      text: "We plan the visit, come along, and point out what the brochure leaves out: approach roads, water supply, power backup, parking." },
    { title: "Documentation support",
      text: "Help reading the title chain, RERA registration, builder-buyer agreement and society dues before any token money moves." },
    { title: "Home loan assistance",
      text: "Introductions to lenders and help comparing offers, so the financing is settled alongside the purchase." },
    { title: "After-sale help",
      text: "Registration day, possession checklist and handover follow-up until the keys are in your hand." }
  ],

  /* ---------- 5. HOW IT WORKS (shown in this order) ---------- */
  steps: [
    { title: "Tell us what you want", text: "Budget, family size, commute. A two-minute chat on WhatsApp is enough to start." },
    { title: "Read the locality reports", text: "We send the scorecards for the areas that fit, with the reasons behind each score." },
    { title: "Visit shortlisted homes", text: "See only the properties that passed our checks, with an advisor on site." },
    { title: "Buy with the paperwork clear", text: "We stay with you through negotiation, documents and registration." }
  ],

  /* ---------- 6. PLANS ---------- */
  plans: [
    { name: "Snapshot", price: "Free", note: "For a first look",
      features: ["Overall locality score", "Four category scores", "Three localities a month"] },
    { name: "Buyer report", price: "Price on request", note: "For a serious shortlist", highlight: true,
      features: ["Full report with sources", "Recent local events", "Side-by-side comparison", "Downloadable PDF"] },
    { name: "Buyer Plus", price: "Price on request", note: "Report plus our advisory",
      features: ["Everything in Buyer report", "Guided site visits", "Documentation review", "Dedicated advisor on WhatsApp"] }
  ],

  /* ---------- 7. QUESTIONS AND ANSWERS ---------- */
  faqs: [
    { q: "Where does the report data come from?",
      a: "From public sources: map and business reviews, local news coverage, public records and open community discussion. Each report lists the source types it used and the date it was last refreshed." },
    { q: "Is a score a guarantee about an area?",
      a: "No. A score summarises public information at a point in time. It is a starting point for your own visit and judgement, not a legal or safety guarantee." },
    { q: "Do you charge buyers for property visits?",
      a: "Message us on WhatsApp and we will explain the current terms for the property you are interested in." },
    { q: "Which areas do you cover?",
      a: "We are based in Udyog Vihar Phase 5 and focus on Gurugram. Ask us about a specific sector and we will tell you whether a report is available." }
  ],

  /* ---------- 8. STARTER CONTENT ----------
     Shown until you publish your own from the Admin page.
     Every item is marked "Sample" on the site so visitors are not misled. */

  sampleProperties: [
    { id: "p1", title: "3 BHK apartment with park view", type: "Apartment", bhk: 3, area: 1850, price: 215, locality: "Sector 56", status: "Ready to move", featured: true,  visible: true, rera: "", photo: "", description: "Corner unit on a mid floor, two covered parking bays, gated society with power backup." },
    { id: "p2", title: "4 BHK independent builder floor", type: "Builder floor", bhk: 4, area: 2700, price: 390, locality: "Sector 46", status: "Ready to move", featured: true,  visible: true, rera: "", photo: "", description: "Second floor with lift and stilt parking, on a 300 sq yd plot facing a 12 m road." },
    { id: "p3", title: "2 BHK apartment near expressway", type: "Apartment", bhk: 2, area: 1180, price: 96,  locality: "Sector 82", status: "Under construction", featured: false, visible: true, rera: "", photo: "", description: "Tower handover planned in phases. Clubhouse and school plot inside the township." },
    { id: "p4", title: "Residential plot, 250 sq yd", type: "Plot", bhk: 0, area: 2250, price: 310, locality: "Sohna Road", status: "Ready to move", featured: false, visible: true, rera: "", photo: "", description: "East facing plot in a licensed colony with water and sewer lines in place." },
    { id: "p5", title: "Office space, bare shell", type: "Commercial", bhk: 0, area: 1400, price: 185, locality: "Udyog Vihar", status: "Ready to move", featured: false, visible: true, rera: "", photo: "", description: "Fourth floor unit with two reserved parking slots, close to the metro feeder route." },
    { id: "p6", title: "3 BHK with study, new launch", type: "Apartment", bhk: 3, area: 2100, price: 265, locality: "Sector 82", status: "New launch", featured: true,  visible: true, rera: "", photo: "", description: "Low-density tower, three-side open units, construction-linked payment plan." }
  ],

  sampleReels: [
    { id: "r1", title: "Sector 56 walk-through", caption: "Markets, parks and the evening traffic test.", assetId: "", link: "", visible: true },
    { id: "r2", title: "What we check before listing", caption: "Our pre-purchase checklist in sixty seconds.", assetId: "", link: "", visible: true },
    { id: "r3", title: "Builder floor or apartment?", caption: "Costs and trade-offs for a family of four.", assetId: "", link: "", visible: true },
    { id: "r4", title: "Reading a locality report", caption: "How the four scores are built.", assetId: "", link: "", visible: true }
  ],

  sampleLocalities: [
    { id: "l1", name: "Sector 56", city: "Gurugram", updated: "Sample", summary: "Established residential sector with mature markets and schools. Peak-hour congestion on the main approach is the common complaint.",
      scores: { safety: 78, amenities: 86, connectivity: 74, sentiment: 80 },
      events: ["Resurfacing completed on the main sector road", "New neighbourhood park opened to residents", "Evening traffic diversions reported near the market"] },
    { id: "l2", name: "Sector 82", city: "Gurugram", updated: "Sample", summary: "Newer township area with wide roads and newer societies. Daily-needs retail is still catching up with the number of residents.",
      scores: { safety: 72, amenities: 61, connectivity: 79, sentiment: 68 },
      events: ["Two new society towers received possession", "Residents raised street-lighting gaps on an internal road", "Supermarket opened inside the township"] },
    { id: "l3", name: "Sohna Road", city: "Gurugram", updated: "Sample", summary: "Long mixed-use corridor. Well served by shops and offices, with noise and construction dust the usual trade-off.",
      scores: { safety: 70, amenities: 82, connectivity: 71, sentiment: 64 },
      events: ["Flyover section opened to traffic", "Waterlogging reported at one junction after heavy rain", "New hospital outpatient wing started operations"] },
    { id: "l4", name: "Udyog Vihar", city: "Gurugram", updated: "Sample", summary: "Primarily a business district. Strong for commercial buyers and commuters, thin on residential amenities after office hours.",
      scores: { safety: 66, amenities: 58, connectivity: 88, sentiment: 60 },
      events: ["Feeder bus frequency increased on the metro route", "Parking enforcement drive on internal lanes", "Several older plots under redevelopment"] }
  ]
};
