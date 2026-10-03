/* Projects shown as cards. `bg` paints the visual panel, `screens` are the phones shown in it (up to 3). */
window.SCREENS = {
  "lamma-en": "assets/img/lamma/home-english.webp",
  "lamma-search": "assets/img/lamma/search-results.webp",
  "lamma-outing": "assets/img/lamma/outing-details.webp",
  "lamma-chat": "assets/img/lamma/group-chat.webp",
  "lamma-wallet": "assets/img/lamma/wallet-top-up.webp",
  "nabdy": "assets/img/nabdy/splash.webp",
  "tasks-light": "assets/img/tasks/projects.webp",
  "tasks-detail": "assets/img/tasks/tasks.webp",
  "tasks-dark": "assets/img/tasks/projects-dark.webp",
  "tasks-ar": "assets/img/tasks/projects-arabic.webp"
};

window.PROJECTS = [
  {
    id: "lamma",
    name: { en: "Lamma", ar: "لمّة" },
    tag: { en: "Personal product · Sole developer, app + backend", ar: "منتج شخصي · المطوّر الوحيد، تطبيق + باك إند" },
    bg: "linear-gradient(160deg, #FDE9E4 0%, #F6D7CF 100%)",
    screens: ["lamma-search", "lamma-en", "lamma-chat"],
    desc: {
      en: "A group-outings app for Egypt. I own it end to end: I took the UX designer's Figma and built the whole Flutter app and the entire Supabase backend behind it, from bookings and payments to realtime chat.",
      ar: "تطبيق خروجات جماعية في مصر. أنا ماسكه من أوله لآخره: أخدت تصميم الـ UX designer على Figma، وبنيت تطبيق Flutter كله والباك إند كله على Supabase، من الحجز والدفع لحد الشات اللحظي."
    },
    points: {
      en: [
        "Whole Supabase backend: Postgres schema, Row-Level Security, RPCs and 177 SQL migrations",
        "7 Edge Functions for payments, webhooks and push; bookings confirm only via the HMAC-verified Paymob webhook",
        "Atomic booking under a row lock, so the last seat is never sold twice; refunds and waiting lists run server-side",
        "Paymob cards, mobile wallets and InstaPay, plus an in-app wallet",
        "Realtime group chat with voice notes, images, mentions and reactions",
        "14 Clean Architecture modules, Arabic-first RTL, 1,302 tests in CI"
      ],
      ar: [
        "الباك إند كله على Supabase: سكيما Postgres وRow-Level Security وRPCs و177 SQL migration",
        "7 Edge Functions للدفع والـ webhooks والإشعارات، والحجز مبيتأكدش غير من webhook Paymob موثّق بـ HMAC",
        "حجز ذرّي جوه row lock فآخر مكان مستحيل يتباع مرتين، والاسترداد وقوائم الانتظار على السيرفر",
        "دفع بكروت Paymob والمحافظ الإلكترونية وInstaPay، ومحفظة جوه التطبيق",
        "شات جماعي لحظي فيه رسايل صوتية وصور ومنشن وريأكشنز",
        "14 موديول Clean Architecture، عربي أولًا RTL، و1,302 تست في CI"
      ]
    },
    metrics: [
      { v: "14", l: { en: "features", ar: "فيتشر" } },
      { v: "1,302", l: { en: "tests", ar: "تست" } },
      { v: "177", l: { en: "migrations", ar: "migration" } },
      { v: "7", l: { en: "edge functions", ar: "Edge Function" } }
    ],
    stack: ["Flutter", "Cubit", "Clean Architecture", "Supabase", "Postgres + RLS", "Edge Functions", "Realtime", "Paymob", "FCM", "Figma"],
    links: [{ label: { en: "Showcase on GitHub", ar: "الـ Showcase على GitHub" }, href: "https://github.com/sheriffahmy74/lamma-showcase" }],
    social: [
      { label: "Instagram", href: "https://www.instagram.com/lamma_experiences" },
      { label: "TikTok", href: "https://www.tiktok.com/@experiences.eg" }
    ]
  },
  {
    id: "nabdy",
    name: { en: "Nabdy", ar: "نبضي" },
    tag: { en: "Client work · INETWORK Middle East", ar: "شغل لعميل · INETWORK Middle East" },
    bg: "linear-gradient(160deg, #EFE9F8 0%, #DCD1F0 100%)",
    screens: ["nabdy"],
    desc: {
      en: "A healthcare super-app covering doctors, pharmacies, medical centers and orders. I took it through a full production audit for App Store and Google Play.",
      ar: "تطبيق رعاية صحية شامل: دكاترة وصيدليات ومراكز طبية وطلبات. عملتله مراجعة إنتاج كاملة عشان يتنشر على App Store وGoogle Play."
    },
    points: {
      en: ["Resolved the iOS Privacy Manifest issues that blocked App Store review", "Fixed Google Maps SDK authorization conflicts", "Reduced APK/AAB size and upgraded outdated packages", "Set up Play Console and Apple Developer for release"],
      ar: ["حلّيت مشاكل iOS Privacy Manifest اللي كانت موقفة مراجعة App Store", "حلّيت تعارضات تصاريح Google Maps SDK", "صغّرت حجم APK/AAB وحدّثت الباكدجات القديمة", "جهّزت Play Console وApple Developer للنشر"]
    },
    metrics: [],
    stack: ["Flutter", "Cubit", "Dio", "Firebase", "Google Maps"],
    links: [{ label: { en: "Google Play", ar: "Google Play" }, href: "https://play.google.com/store/apps/details?id=com.flutter.nabdi" }]
  },
  {
    id: "tasks",
    name: { en: "Task Manager", ar: "Task Manager" },
    tag: { en: "Technical assessment · Electro Pi", ar: "تقييم تقني · Electro Pi" },
    bg: "linear-gradient(160deg, #EEF2FE 0%, #D9E2FD 100%)",
    screens: ["tasks-dark", "tasks-light", "tasks-ar"],
    desc: {
      en: "Projects and tasks on a Supabase REST backend, with JWT auth, auto-login, dark mode and a full English/Arabic switch.",
      ar: "مشاريع ومهام على باك إند Supabase REST، فيه تسجيل دخول بـ JWT، ودخول تلقائي، ووضع ليلي، وتبديل كامل بين العربي والإنجليزي."
    },
    points: {
      en: ["Clean Architecture with Either<Failure, T> errors", "Auth-aware routing with go_router", "Light, dark and Arabic RTL themes, all persisted"],
      ar: ["Clean Architecture والأخطاء بـ Either<Failure, T>", "Routing بيعرف حالة الدخول بـ go_router", "ثيم فاتح وغامق وعربي RTL، وكلهم بيتحفظوا"]
    },
    metrics: [],
    stack: ["Flutter", "Cubit", "Dio", "go_router", "get_it", "fpdart", "Supabase"],
    links: [{ label: { en: "Code on GitHub", ar: "الكود على GitHub" }, href: "https://github.com/sheriffahmy74/task_manager" }]
  }
];
