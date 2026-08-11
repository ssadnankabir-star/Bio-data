(() => {
  "use strict";

  const BN = {
    "Home": "হোম",
    "About": "আমার সম্পর্কে",
    "Personal": "ব্যক্তিগত তথ্য",
    "Education": "শিক্ষাজীবন",
    "Professional": "পেশাগত জীবন",
    "Family": "পরিবার",
    "Interests": "আগ্রহ",
    "Gallery": "গ্যালারি",
    "Contact": "যোগাযোগ",
    "Personal Profile": "ব্যক্তিগত প্রোফাইল",
    "Sadnan Kaabeer": "সাদনান কাবীর (স্নিগ্ধ)",
    "Design, technology, creativity, and continuous learning.": "ডিজাইন, প্রযুক্তি, সৃজনশীলতা এবং নিরন্তর শেখা।",
    "Natunpara, Jamalganj, Sunamganj · Bangladesh": "নতুনপাড়া, জামালগঞ্জ, সুনামগঞ্জ · বাংলাদেশ",
    "Email": "ইমেইল",

    "Personal Information": "ব্যক্তিগত তথ্য",
    "Full Name": "পূর্ণ নাম",
    "Date of Birth": "জন্মতারিখ",
    "21 April 1999": "২১ এপ্রিল ১৯৯৯",
    "Age": "বয়স",
    "27 years": "২৭ বছর",
    "Height": "উচ্চতা",
    "5'8\"": "৫'৮\"",
    "Weight": "ওজন",
    "95 kg": "৯৫ কেজি",
    "Blood Group": "রক্তের গ্রুপ",
    "Nationality": "জাতীয়তা",
    "Bangladeshi": "বাংলাদেশি",
    "Religion": "ধর্ম",
    "Islam": "ইসলাম",
    "Marital Status": "বৈবাহিক অবস্থা",
    "Unmarried": "অবিবাহিত",
    "Current Location": "বর্তমান অবস্থান",
    "Jamalganj, Sunamganj": "জামালগঞ্জ, সুনামগঞ্জ",

    "About Me": "আমার সম্পর্কে",
    "I’m a creative and curious person with a strong interest in design, technology, digital media, and continuous learning. I enjoy exploring new tools, improving my skills, and turning ideas into meaningful creative work.": "আমি একজন সৃজনশীল ও কৌতূহলী মানুষ। ডিজাইন, প্রযুক্তি, ডিজিটাল মিডিয়া এবং নতুন কিছু শেখার প্রতি আমার বিশেষ আগ্রহ রয়েছে। নতুন টুলস সম্পর্কে জানা, নিজের দক্ষতা উন্নত করা এবং ধারণাগুলোকে অর্থবহ সৃজনশীল কাজে রূপ দিতে আমি পছন্দ করি।",

    "SSC": "এসএসসি",
    "HSC": "এইচএসসি",
    "Honours": "অনার্স",
    "Masters": "মাস্টার্স",
    "Jamalganj Govt Model High School · 2015": "জামালগঞ্জ সরকারী মডেল হাইস্কুল · ২০১৫",
    "Jamalgonj Govt College · 2017": "জামালগঞ্জ সরকারী কলেজ · ২০১৭",
    "Dakshmin Surma Govt College, Sylhet.": "দক্ষিণ সুরমা সরকারী কলেজ, সিলেট।",
    "MC College, Sylhet.": "মুরারিচাঁদ কলেজ, সিলেট।",
    "Subject / Department": "বিষয় / বিভাগ",
    "English Literature": "ইংরেজি সাহিত্য",
    "Graduation Year": "পাশের বছর",
    "2021": "২০২১",
    "2023": "২০২৩",

    "Father": "পিতা",
    "Mother": "মাতা",
    "Brother": "ভাই",
    "Md Rezwan Kabir": "মোঃ রেজুয়ান কবির",
    "Hasna Yasmin Piara": "হাসনা ইয়াসমিন পিয়ারা",
    "Tanjim Redwan": "তানজিম রেদওয়ান",
    "Deceased · 2024": "মৃত্যুবরণ · ২০২৪",
    "Senior Teacher": "সিনিয়র শিক্ষক",
    "Jamalganj Girls' High School": "জামালগঞ্জ বালিকা উচ্চ বিদ্যালয়",
    "Retired": "অবসরপ্রাপ্ত",
    "Retired Senior Teacher": "অবসরপ্রাপ্ত সিনিয়র শিক্ষক",
    "Sachna Bazar High School": "সাচনা বাজার উচ্চ বিদ্যালয়",
    "Married": "বিবাহিত",
    "Employed and works with the same company/group": "চাকরিজীবী এবং একই কোম্পানি/গ্রুপের সঙ্গে কাজ করেন",
    "1 brother, no other siblings": "১ ভাই, অন্য কোনো ভাই-বোন নেই",

    "Professional Life": "পেশাগত জীবন",
    "Currently working across Hugeicons and Arowa Premium under the Halallab group.": "বর্তমানে Halallab গ্রুপের অধীনে Hugeicons এবং Arowa Premium-এ কাজ করছি।",
    "Designation": "পদবি",
    "Social Media Manager": "সোশ্যাল মিডিয়া ম্যানেজার",
    "Start Date": "যোগদানের তারিখ",
    "15 September 2025": "১৫ সেপ্টেম্বর ২০২৫",
    "Managing social media content and digital communication, planning and publishing engaging content, supporting brand visibility, interacting with audiences, and contributing to social media growth and marketing activities.": "সোশ্যাল মিডিয়া কনটেন্ট ও ডিজিটাল যোগাযোগ পরিচালনা, আকর্ষণীয় কনটেন্ট পরিকল্পনা ও প্রকাশ, ব্র্যান্ডের দৃশ্যমানতা বাড়াতে সহায়তা, দর্শকদের সঙ্গে যোগাযোগ এবং সোশ্যাল মিডিয়া গ্রোথ ও মার্কেটিং কার্যক্রমে অবদান রাখছি।",
    "Brand Model": "ব্র্যান্ড মডেল",
    "27 July 2026": "২৭ জুলাই ২০২৬",
    "Arowa Premium is an Attar & Perfume brand by Halallab, where I work as a Brand Model and contribute to the brand’s visual presentation and promotional content.": "Arowa Premium হলো Halallab-এর একটি Attar & Perfume ব্র্যান্ড। এখানে আমি ব্র্যান্ড মডেল হিসেবে কাজ করছি এবং ব্র্যান্ডের ভিজ্যুয়াল উপস্থাপন ও প্রচারণামূলক কনটেন্টে অবদান রাখছি।",

    "Skills & Tools": "দক্ষতা ও টুলস",
    "Vibe Coding": "ভাইব কোডিং",
    "Computer": "কম্পিউটার",
    "Social Media Management": "সোশ্যাল মিডিয়া ম্যানেজমেন্ট",
    "Digital Content": "ডিজিটাল কনটেন্ট",
    "Digital Marketing": "ডিজিটাল মার্কেটিং",
    "Interests & Lifestyle": "আগ্রহ ও জীবনধারা",
    "UI/UX & Visual Design": "UI/UX ও ভিজ্যুয়াল ডিজাইন",
    "Learning New Technology": "নতুন প্রযুক্তি শেখা",
    "Reading": "বই পড়া",
    "Exploring Creative Ideas": "সৃজনশীল ধারণা নিয়ে কাজ করা",
    "Digital Content Creation": "ডিজিটাল কনটেন্ট তৈরি",
    "Favourite Books": "প্রিয় বই",

    "View my photos on Facebook": "Facebook-এ আমার ছবিগুলো দেখুন",
    "Social Links": "সোশ্যাল লিংক",
    "Website / Portfolio": "ওয়েবসাইট / পোর্টফোলিও",
    "Address": "ঠিকানা",
    "Current Address": "বর্তমান ঠিকানা",
    "Permanent Address": "স্থায়ী ঠিকানা",
    "Website": "ওয়েবসাইট",
    "Sadnan Kaabeer. All rights reserved.": "সাদনান কাবীর (স্নিগ্ধ)। সর্বস্বত্ব সংরক্ষিত।",

    "Share": "শেয়ার",
    "Copy link": "লিংক কপি করুন",
    "Share Link": "লিংক শেয়ার করুন",
    "Share PDF": "PDF শেয়ার করুন",
    "Share Image": "ছবি শেয়ার করুন",
    "Export current profile": "বর্তমান প্রোফাইল শেয়ার করুন",
    "Share live link": "লাইভ লিংক শেয়ার করুন",
    "Professional PDF": "প্রফেশনাল PDF",
    "Share 3 Images": "৩টি ছবি একসাথে শেয়ার করুন",
    "Share 3 Images Together": "৩টি ছবি একসাথে শেয়ার করুন",
    "Share page image": "একটি পেজের ছবি শেয়ার করুন",
    "Choose one complete page. No section will be cut in the middle.": "একটি সম্পূর্ণ পেজ বেছে নিন। কোনো সেকশন মাঝখান থেকে কাটা হবে না।",
    "Page 1": "পেজ ১",
    "Page 2": "পেজ ২",
    "Page 3": "পেজ ৩",
    "Preparing from the current live profile...": "বর্তমান লাইভ প্রোফাইল থেকে প্রস্তুত করা হচ্ছে...",
    "On supported devices the system share sheet will open. If file sharing is unavailable, the PDF or image will download instead.": "সমর্থিত ডিভাইসে শেয়ার অপশন খুলবে। ফাইল শেয়ার সমর্থিত না হলে PDF বা ছবি ডাউনলোড হবে।",
    "Professional PDF is rendered from the live website view at high resolution, so Bangla text and the website styling are preserved. Links remain clickable. You can also share all 3 images together, or choose a single page.": "প্রফেশনাল PDF লাইভ ওয়েবসাইটের বর্তমান ভিউ থেকে উচ্চ রেজোলিউশনে তৈরি হবে, তাই বাংলা লেখা ও ডিজাইন ঠিক থাকবে। লিংকগুলো ক্লিকযোগ্য থাকবে। চাইলে ৩টি ছবি একসাথে অথবা আলাদা একটি পেজ শেয়ার করতে পারবেন।"
  };

  const META = {
    en: {
      title: "Sadnan Kaabeer — Personal Profile",
      description: "Personal Profile of Sadnan Kaabeer, including his background, education, professional life, interests, skills, family, and contact information."
    },
    bn: {
      title: "সাদনান কাবীর (স্নিগ্ধ) — ব্যক্তিগত প্রোফাইল",
      description: "সাদনান কাবীর (স্নিগ্ধ)-এর ব্যক্তিগত প্রোফাইল, যেখানে ব্যক্তিগত তথ্য, শিক্ষাজীবন, পেশাগত জীবন, পরিবার, আগ্রহ, দক্ষতা ও যোগাযোগের তথ্য রয়েছে।"
    }
  };

  let currentLang = localStorage.getItem("profile.language") === "bn" ? "bn" : "en";
  let observer = null;
  let applying = false;

  function toBanglaDigits(value) {
    return String(value).replace(/[0-9]/g, d => "০১২৩৪৫৬৭৮৯"[Number(d)]);
  }

  function rememberOriginalText(root = document.body) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (!parent || parent.closest("script,style,svg,[data-no-i18n]")) continue;
      if (node.__profileEnglish === undefined) node.__profileEnglish = node.nodeValue;
    }
  }

  function applyTextLanguage(root, lang) {
    rememberOriginalText(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (const node of nodes) {
      const parent = node.parentElement;
      if (!parent || parent.closest("script,style,svg,[data-no-i18n]")) continue;

      const englishRaw = node.__profileEnglish ?? node.nodeValue;
      const trimmed = englishRaw.trim();
      if (!trimmed) continue;

      if (lang === "en") {
        node.nodeValue = englishRaw;
        continue;
      }

      const translated = BN[trimmed];
      if (!translated) {
        node.nodeValue = englishRaw;
        continue;
      }

      const lead = englishRaw.match(/^\s*/)?.[0] || "";
      const trail = englishRaw.match(/\s*$/)?.[0] || "";
      node.nodeValue = lead + translated + trail;
    }
  }

  function updateMeta(lang) {
    const meta = META[lang];
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", meta.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", meta.description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", meta.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", meta.description);
  }

  function updateYear(lang) {
    const year = document.getElementById("year");
    if (!year) return;
    const value = String(new Date().getFullYear());
    year.textContent = lang === "bn" ? toBanglaDigits(value) : value;
  }

  function updateButtons(lang) {
    document.querySelectorAll("#languageSwitch [data-lang]").forEach(button => {
      const active = button.dataset.lang === lang;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function applyLanguage(lang, persist = true) {
    const nextLang = lang === "bn" ? "bn" : "en";
    if (applying) return;
    applying = true;

    if (observer) observer.disconnect();

    currentLang = nextLang;
    document.documentElement.lang = currentLang;

    applyTextLanguage(document.body, currentLang);
    updateMeta(currentLang);
    updateYear(currentLang);
    updateButtons(currentLang);

    if (persist) localStorage.setItem("profile.language", currentLang);

    applying = false;

    if (observer) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    document.dispatchEvent(new CustomEvent("profilelanguagechange", {
      detail: { lang: currentLang }
    }));
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("#languageSwitch [data-lang]");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    applyLanguage(button.dataset.lang, true);
  });

  observer = new MutationObserver(mutations => {
    if (applying) return;

    const addedRoots = [];
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
          addedRoots.push(node);
        }
      });
    }

    if (!addedRoots.length) return;

    requestAnimationFrame(() => {
      if (applying) return;
      applying = true;
      observer.disconnect();

      for (const node of addedRoots) {
        if (node.nodeType === Node.TEXT_NODE) {
          rememberOriginalText(node.parentElement || document.body);
          applyTextLanguage(node.parentElement || document.body, currentLang);
        } else {
          rememberOriginalText(node);
          applyTextLanguage(node, currentLang);
        }
      }

      updateButtons(currentLang);
      updateYear(currentLang);

      applying = false;
      observer.observe(document.body, { childList: true, subtree: true });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  window.profileI18n = {
    get lang() { return currentLang; },
    isBangla() { return currentLang === "bn"; },
    translate(english) { return currentLang === "bn" ? (BN[english] || english) : english; },
    setLanguage: applyLanguage,
    toBanglaDigits
  };

  // Capture the original English DOM once, then apply the saved language.
  rememberOriginalText(document.body);
  applyLanguage(currentLang, false);
})();