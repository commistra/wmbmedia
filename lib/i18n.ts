export const SUPPORTED_LOCALES = ["id", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(value: unknown): value is Locale {
  return typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

type Dictionary = {
  header: {
    joinCta: string;
    nav: {
      home: string;
      about: string;
      activities: string;
      umkm: string;
      gallery: string;
      contact: string;
      allActivities: string;
      admin: string;
    };
    languageLabel: string;
  };
  landing: {
    badge: string;
    titleLines: [string, string, string];
    intro: string;
    ctaPrimary: string;
    ctaSecondary: string;
    stats: { k: string; v: string }[];
    aboutTitle: string;
    aboutBody: string;
    aboutCards: { title: string; desc: string }[];
    aboutPhotoTitle: string;
    aboutPhotoBody: string;
    activitiesTitle: string;
    activitiesBody: string;
    latestActivitiesTitle: string;
    latestActivitiesBody: string;
    founderTitle: string;
    founderName: string;
    founderRole: string;
    founderBody: string;
    contactTitle: string;
    contactBody: string;
    contactCta: string;
    footerOrg: string;
    footerCopyrightPrefix: string;
  };
  gallery: {
    title: string;
    body: string;
    latest: string;
    close: string;
    closeAria: string;
  };
  activities: {
    title: string;
    empty: string;
    readMore: string;
    back: string;
  };
  admin: {
    title: string;
    signIn: string;
    signOut: string;
    forbidden: string;
    form: {
      new: string;
      edit: string;
      name: string;
      date: string;
      location: string;
      summary: string;
      content: string;
      coverImage: string;
      galleryImages: string;
      publish: string;
      save: string;
      delete: string;
      uploading: string;
    };
  };
};

const DICTS: Record<Locale, Dictionary> = {
  id: {
    header: {
      joinCta: "Gabung Komunitas",
      nav: {
        home: "Beranda",
        about: "Tentang Kami",
        activities: "Kegiatan",
        umkm: "UMKM",
        gallery: "Galeri",
        contact: "Kontak",
        allActivities: "Semua Kegiatan",
        admin: "Admin",
      },
      languageLabel: "Bahasa",
    },
    landing: {
      badge: "Komunitas UMKM Tegal",
      titleLines: ["WMB", "Wirausaha", "Muda Bregas"],
      intro:
        "WMB adalah komunitas yang mempertemukan pelaku UMKM Tegal untuk belajar, berjejaring, dan kolaborasi. Kita tumbuh bareng lewat sharing, mentoring, dan kegiatan komunitas yang berdampak.",
      ctaPrimary: "Gabung Sekarang",
      ctaSecondary: "Tentang Kami",
      stats: [
        { k: "Sharing", v: "Rutin" },
        { k: "Kolaborasi", v: "Nyata" },
        { k: "UMKM", v: "Tegal" },
      ],
      aboutTitle: "Tentang Kami",
      aboutBody:
        "Company profile Komunitas WMB\n\nMembangun komunitas UMKM bukan sekadar mengumpulkan pelaku usaha dalam satu wadah, tetapi menciptakan ruang yang hidup dengan nilai silaturahmi yang kuat. Melalui silaturahmi, para pelaku UMKM dapat saling mengenal lebih dekat, membangun kepercayaan, serta memperluas jaringan bisnis secara alami. Hubungan yang terjalin dengan tulus sering kali menjadi pintu terbukanya peluang kolaborasi, akses pasar baru, hingga dukungan moral di saat menghadapi tantangan usaha. Dalam dunia bisnis yang kompetitif, kekuatan relasi sering kali menjadi pembeda antara bertahan dan berkembang.\n\nSelain itu, komunitas UMKM yang sehat juga bertumpu pada budaya berbagi dan bersinergi. Berbagi pengalaman, ilmu, hingga strategi bisnis memungkinkan setiap anggota belajar tanpa harus selalu memulai dari nol. Sementara itu, sinergi membuka peluang kolaborasi yang saling menguatkan, seperti promosi bersama, bundling produk, atau pengembangan usaha kolektif. Ketika pelaku UMKM tidak berjalan sendiri, melainkan bergerak bersama, maka pertumbuhan akan lebih cepat dan berkelanjutan. Dengan mengedepankan silaturahmi, berbagi, dan bersinergi, komunitas UMKM dapat menjadi motor penggerak ekonomi yang kokoh dan berdampak luas.",
      aboutCards: [
        {
          title: "Visi",
          desc: "VISI Komunitas WMB:\n\nMenumbuhkan Jiwa Kewirausahaan Pemuda di sekitar Brebes, Tegal, Slawi (Bregas) yang Mandiri, Sinergi dan Berbagi.",
        },
        {
          title: "Misi",
          desc: "Misi Komunitas WMB :\n\n1. Menjadi wadah pembinaan, pendidikan (pembelajaran) dan pelatihan Bisnis pelaku UMKM yang terpercaya dan unggul\n\n2. Menghasilkan binaan UMKM yang terampil dan tangguh untuk menjawab tantangan dan dinamika Bisnis\n\n3. Menjadi Komunitas Wirausaha terbaik dalam penyelenggaraan pembelajaran Bisnis bagi pelaku usaha UMKM\n\n4. Menjalin kerja sama yang saling menguntungkan dengan pemerintah maupun berbagai institusi Bisnis untuk memberikan kontribusi bagi penyelesaian berbagai persoalan yang dialami pelaku usaha UMKM",
        },
        {
          title: "Nilai",
          desc: "Komunikasi positif, gotong-royong, dan action oriented.",
        },
        {
          title: "Fokus",
          desc: "Branding, pemasaran, operasional, dan peningkatan kualitas produk.",
        },
      ],
      aboutPhotoTitle: "Foto bersama warga WMB",
      aboutPhotoBody:
        "Silakan ganti asset ini dengan foto asli kegiatan WMB di public/wmb-bersama.jpg (atau .png), lalu ubah src di komponen ini bila perlu.",
      activitiesTitle: "Kegiatan WMB",
      activitiesBody:
        "Sharing session, kunjungan UMKM, kolaborasi event, dan program mentoring.",
      latestActivitiesTitle: "Kegiatan Terbaru",
      latestActivitiesBody: "Beberapa postingan kegiatan terbaru dari WMB.",
      founderTitle: "Founder",
      founderName: "Founder Komunitas WMB",
      founderRole: "Wirausaha Muda Bregas",
      founderBody:
        "WMB lahir dari semangat silaturahmi, berbagi, dan sinergi antar pelaku UMKM. Bagian ini bisa kamu edit untuk menampilkan profil founder (nama, peran, dan cerita singkat).",
      contactTitle: "Siap tumbuh bareng WMB?",
      contactBody: "Klik tombol di samping untuk gabung via WhatsApp, atau cek sosial media WMB di bawah.",
      contactCta: "Hubungi Admin",
      footerOrg: "WMB - Tegal",
      footerCopyrightPrefix: "©",
    },
    gallery: {
      title: "Galeri Kegiatan WMB",
      body:
        "Dokumentasi berbagai aktivitas komunitas: workshop, mentoring, networking, hingga showcase produk. Klik kartu untuk memperbesar.",
      latest: "Update terbaru",
      close: "Tutup",
      closeAria: "Tutup preview",
    },
    activities: {
      title: "Semua Kegiatan",
      empty: "Belum ada kegiatan yang dipublikasikan.",
      readMore: "Lihat detail",
      back: "Kembali",
    },
    admin: {
      title: "Admin",
      signIn: "Login dengan Google",
      signOut: "Logout",
      forbidden: "Akun ini tidak diizinkan.",
      form: {
        new: "Tambah kegiatan",
        edit: "Edit kegiatan",
        name: "Judul",
        date: "Tanggal",
        location: "Lokasi",
        summary: "Ringkasan",
        content: "Konten",
        coverImage: "Gambar",
        galleryImages: "Galeri gambar",
        publish: "Publikasikan",
        save: "Simpan",
        delete: "Hapus",
        uploading: "Mengunggah...",
      },
    },
  },
  en: {
    header: {
      joinCta: "Join Community",
      nav: {
        home: "Home",
        about: "About",
        activities: "Activities",
        umkm: "SMEs",
        gallery: "Gallery",
        contact: "Contact",
        allActivities: "All Activities",
        admin: "Admin",
      },
      languageLabel: "Language",
    },
    landing: {
      badge: "Tegal SME Community",
      titleLines: ["WMB", "Young", "Entrepreneurs"],
      intro:
        "WMB is a community that connects SMEs in Tegal to learn, network, and collaborate. We grow together through sharing, mentoring, and impactful community programs.",
      ctaPrimary: "Join Now",
      ctaSecondary: "About Us",
      stats: [
        { k: "Sharing", v: "Regular" },
        { k: "Collab", v: "Real" },
        { k: "SMEs", v: "Tegal" },
      ],
      aboutTitle: "About Us",
      aboutBody:
        "Company profile WMB Community\n\nBuilding an SME community is not merely gathering business owners in one place, but creating a living space rooted in strong silaturahmi (relationships). Through genuine connection, members can build trust and expand business networks naturally. These relationships often open doors to collaboration opportunities, new markets, and moral support when facing business challenges.\n\nA healthy SME community also relies on a culture of sharing and synergy. Sharing experience, knowledge, and strategies helps every member learn faster. Synergy creates collaborations that strengthen everyone - joint promotions, product bundles, or collective growth programs. When SMEs move together, growth becomes faster and more sustainable.",
      aboutCards: [
        {
          title: "Vision",
          desc: "Build an adaptive, creative, and collaborative SME ecosystem in Tegal.",
        },
        {
          title: "Mission",
          desc: "Deliver education, networks, and opportunities through community activities.",
        },
        {
          title: "Values",
          desc: "Positive communication, mutual support, and action oriented.",
        },
        {
          title: "Focus",
          desc: "Branding, marketing, operations, and product quality improvement.",
        },
      ],
      aboutPhotoTitle: "A moment with WMB members",
      aboutPhotoBody:
        "Replace this asset with a real photo in public/wmb-bersama.jpg (or .png), then adjust the src if needed.",
      activitiesTitle: "WMB Activities",
      activitiesBody:
        "Sharing sessions, SME visits, event collaborations, and mentoring programs.",
      latestActivitiesTitle: "Latest Activities",
      latestActivitiesBody: "A few of the latest activity posts from WMB.",
      founderTitle: "Founder",
      founderName: "WMB Founder",
      founderRole: "Wirausaha Muda Bregas",
      founderBody:
        "WMB was built on relationships, sharing, and collaboration among SMEs. Edit this section to show the founder profile (name, role, and a short story).",
      contactTitle: "Ready to grow with WMB?",
      contactBody: "Tap the button to join via WhatsApp, or check WMB social media below.",
      contactCta: "Contact Admin",
      footerOrg: "WMB - Tegal",
      footerCopyrightPrefix: "©",
    },
    gallery: {
      title: "WMB Activity Gallery",
      body:
        "A snapshot of our community: workshops, mentoring, networking, and product showcases. Click a card to preview.",
      latest: "Latest update",
      close: "Close",
      closeAria: "Close preview",
    },
    activities: {
      title: "All Activities",
      empty: "No published activities yet.",
      readMore: "View details",
      back: "Back",
    },
    admin: {
      title: "Admin",
      signIn: "Sign in with Google",
      signOut: "Sign out",
      forbidden: "This account is not allowed.",
      form: {
        new: "Add activity",
        edit: "Edit activity",
        name: "Title",
        date: "Date",
        location: "Location",
        summary: "Summary",
        content: "Content",
        coverImage: "Cover image",
        galleryImages: "Gallery images",
        publish: "Publish",
        save: "Save",
        delete: "Delete",
        uploading: "Uploading...",
      },
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return DICTS[locale];
}
