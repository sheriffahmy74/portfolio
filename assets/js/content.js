/* The content every version of the site shares, in one place and one order.
   Text is referenced by i18n key (English lives in index.html, Arabic in i18n.js);
   the hot-reload moods render their own layouts from this. Projects come from projects.js. */
window.CONTENT = {
  name: "Sherif Fahmy",
  photo: "assets/img/me/hero-suit.webp",
  aboutPhoto: "assets/img/me/work-16.webp",
  hero: { status: "hero.status", hi: "hero.hi", title: ["hero.t1", "hero.t2", "hero.t3"], sub: "hero.sub", cta1: "hero.cta1", cta2: "hero.cta2" },
  facts: [
    { v: "1", sup: "st", k: "facts.1" },
    { v: "94", suf: "%", k: "facts.2" },
    { v: "1,302", k: "facts.3" }
  ],
  stack: ["Flutter", "Dart", "Bloc / Cubit", "Clean Architecture", "Supabase", "Firebase", "REST · Dio", "Google Maps", "Paymob", "go_router", "get_it", "GitHub Actions"],
  projects: { k: "proj.k", title: "proj.title", sub: "proj.sub", did: { en: "What I did", ar: "اللي عملته" }, follow: { en: "Follow Lamma", ar: "تابع لمّة" } },
  others: {
    title: "other.title",
    items: [
      { name: "Rick & Morty", k: "other.1", href: "https://github.com/sheriffahmy74/-Bloc-", link: "GitHub ↗" },
      { name: "E-Commerce", k: "other.2", href: "https://lnkd.in/p/e7sqh8fZ", linkKey: "other.demo" },
      { name: "Gym App", k: "other.3" }
    ]
  },
  experience: {
    k: "exp.k", title: "exp.title",
    items: [
      { date: "INETWORK", place: "tl.1.place", t: "tl.1.t", points: ["tl.1.a", "tl.1.b", "tl.1.c"] },
      { dateKey: "tl.now", place: "tl.2.place", t: "tl.2.t", points: ["tl.2.a", "tl.2.b"] },
      { date: "2026 · 2025", placeText: "ITI · NTI", t: "tl.3.t", points: ["tl.3.a", "tl.3.b"] },
      { date: "2021 – 2025", place: "tl.4.place", t: "tl.4.t", points: ["tl.4.a"] }
    ]
  },
  certs: {
    k: "cert.k", title: "cert.title", sub: "cert.sub", show: { en: "Show credential", ar: "اعرض الشهادة" }, idLabel: { en: "Credential ID", ar: "رقم الشهادة" },
    // href: each certificate's own link (LinkedIn certifications page until the direct links are added)
    items: [
      { name: "Certificate of completion: Claude 101", issuer: "Anthropic", date: { en: "Issued May 2026", ar: "صدرت مايو 2026" }, id: "gf4rqxyzq9rn", mark: "A\\", tone: "#191919", href: "https://www.linkedin.com/in/sheriffahmy0/details/certifications/" },
      { name: "Mobile App Development – Digital Egypt Youth Program", issuer: "National Telecommunication Institute (NTI)", date: { en: "Issued Nov 2025", ar: "صدرت نوفمبر 2025" }, mark: "NTI", tone: "#1D4E89", href: "https://www.linkedin.com/in/sheriffahmy0/details/certifications/" },
      { name: "NVIDIA DLI Generative AI", issuer: "NVIDIA · ITI", date: { en: "Issued Jan 2026", ar: "صدرت يناير 2026" }, mark: "NV", tone: "#76B900", href: "https://www.linkedin.com/in/sheriffahmy0/details/certifications/" },
      { name: "Mobile Development Training Camp", issuer: "CAT Reloaded", date: { en: "Issued Aug 2025", ar: "صدرت أغسطس 2025" }, mark: "CAT", tone: "#C8102E", href: "https://www.linkedin.com/in/sheriffahmy0/details/certifications/" }
    ]
  },
  skills: {
    k: "sk.k", title: "sk.title",
    groups: [
      { t: "sk.1", tags: ["Flutter", "Dart", "Bloc / Cubit", "Animations", "Localization & RTL"] },
      { t: "sk.2", tags: ["Clean Architecture", "MVVM", "SOLID", "get_it", "go_router", "fpdart"] },
      { t: "sk.3", tags: ["Supabase", "Firebase", "REST · Dio", "SQLite", "Secure Storage"] },
      { t: "sk.4", tags: ["bloc_test", "mocktail", "GitHub Actions", "App Store Connect", "Play Console"] },
      { t: "sk.5", tags: ["Google Maps", "Geolocation", "Paymob payments", "Push notifications (FCM)", "Remote Config", "Realtime chat", "Image picker & cropper"] },
      { t: "sk.6", tags: ["Git & GitHub", "Postman", "Figma", "Android Studio", "Xcode", "AI-assisted development"] }
    ]
  },
  about: { k: "about.k", title: "about.title", p: ["about.p1", "about.p2"], langs: ["about.lang1", "about.lang2"], cap: "about.cap" },
  contact: {
    k: "contact.k", t1: "contact.t1", t2: "contact.t2", sub: "contact.sub", copy: "contact.copy", cv: "contact.cv",
    email: "sfhmy7124@gmail.com", whatsapp: { href: "https://wa.me/201004093899", label: "+20 100 409 3899" },
    links: [{ label: "LinkedIn ↗", href: "https://www.linkedin.com/in/sheriffahmy0/" }, { label: "GitHub ↗", href: "https://github.com/sheriffahmy74" }]
  },
  nav: [["projects", "nav.projects"], ["experience", "nav.experience"], ["skills", "nav.skills"], ["about", "nav.about"], ["contact", "nav.contact"]]
};
