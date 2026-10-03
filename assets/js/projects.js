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
    tag: { en: "Personal product · Flutter + Supabase", ar: "منتج شخصي · Flutter + Supabase" },
    bg: "linear-gradient(160deg, #FDE9E4 0%, #F6D7CF 100%)",
    screens: ["lamma-search", "lamma-en", "lamma-chat"],
    desc: {
      en: "A group-outings app for Egypt. Pick an outing, book a seat in the group that fits you, pay, and meet your group in a chat before you meet them in person.",
      ar: "تطبيق خروجات جماعية في مصر. بتختار خروجة، وتحجز مكانك في المجموعة اللي تناسبك، وتدفع، وتتعرف على مجموعتك في الشات قبل ما تقابلهم."
    },
    points: {
      en: ["Arabic-first with full RTL, every string in two languages", "Atomic bookings under a row lock, so the last seat is never sold twice", "Payments confirmed only by an HMAC-verified Paymob webhook"],
      ar: ["عربي أولًا مع RTL كامل، وكل نص باللغتين", "الحجز ذرّي جوه row lock، فآخر مكان مستحيل يتباع مرتين", "الدفع مبيتأكدش غير من webhook موثّق بـ HMAC من Paymob"]
    },
    metrics: [
      { v: "12", l: { en: "features", ar: "فيتشر" } },
      { v: "746+", l: { en: "tests", ar: "تست" } },
      { v: "75", l: { en: "migrations", ar: "migration" } }
    ],
    stack: ["Flutter", "Cubit", "Clean Architecture", "Supabase", "Realtime", "Paymob", "FCM"],
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
