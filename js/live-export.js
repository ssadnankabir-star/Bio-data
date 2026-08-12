(() => {
  "use strict";

  const modal = document.getElementById("liveShareModal");
  const picker = document.getElementById("imagePagePicker");
  const working = document.getElementById("exportWorking");
  const shareBtn = document.getElementById("shareBtn");

  const PAGE_WIDTH = 1080;
  const PAGE_HEIGHT = 1527;
  const PDF_WIDTH_MM = 210;
  const PDF_HEIGHT_MM = 297;
  const RENDER_SCALE = 2;

  const isBangla = () => document.documentElement.lang === "bn";
  const L = (en, bn) => (isBangla() ? bn : en);
  const exportName = () => L("Sadnan Kaabeer", "সাদনান কাবীর (স্নিগ্ধ)");
  const exportProfileTitle = () => L("Personal Profile", "ব্যক্তিগত প্রোফাইল");
  const cleanUrl = () => `${location.origin}${location.pathname}`;

  const pageDefinitions = [
    ["#home", "#personal", "#about"],
    ["#education", "#professional", "#family"],
    ["#skills", "#interests", "#books", "#gallery", "#social", "#contact"]
  ];

  function setWorking(on, text = L("Preparing...", "প্রস্তুত করা হচ্ছে...")) {
    if (!working) return;
    working.textContent = text;
    working.classList.toggle("show", Boolean(on));
  }

  function openModal() {
    modal?.classList.add("show");
    modal?.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modal?.classList.remove("show");
    modal?.setAttribute("aria-hidden", "true");
    picker?.classList.remove("show");
  }

  shareBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    openModal();
  });

  document.getElementById("liveShareClose")?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });

  async function sharePayload(payload) {
    if (navigator.share) {
      try {
        await navigator.share(payload);
        return true;
      } catch (error) {
        if (error?.name === "AbortError") return true;
        console.warn("Share sheet failed", error);
      }
    }
    return false;
  }

  async function copyLink(url, successText) {
    try {
      await navigator.clipboard.writeText(url);
      alert(successText);
    } catch {
      prompt(L("Copy this link:", "এই লিংকটি কপি করুন:"), url);
    }
  }

  document.getElementById("liveShareLink")?.addEventListener("click", async () => {
    const url = location.href;
    closeModal();
    const shared = await sharePayload({
      title: `${exportName()} - ${exportProfileTitle()}`,
      text: `${exportName()} - ${exportProfileTitle()}`,
      url
    });
    if (!shared) await copyLink(url, L("Profile link copied.", "প্রোফাইলের লিংক কপি হয়েছে।"));
  });

  document.getElementById("liveShareApp")?.addEventListener("click", async () => {
    const url = cleanUrl();
    closeModal();
    const shared = await sharePayload({
      title: L("Sadnan Profile App", "সাদনান প্রোফাইল অ্যাপ"),
      text: L("Install or open Sadnan Kaabeer's Personal Profile app.", "সাদনান কাবীরের Personal Profile অ্যাপ ইনস্টল বা ওপেন করুন।"),
      url
    });
    if (!shared) await copyLink(url, L("App link copied.", "অ্যাপ লিংক কপি হয়েছে।"));
  });

  document.getElementById("liveInstallApp")?.addEventListener("click", async () => {
    const promptEvent = window.profileInstallPrompt;
    if (promptEvent) {
      closeModal();
      try {
        promptEvent.prompt();
        await promptEvent.userChoice;
        window.profileInstallPrompt = null;
        document.getElementById("installAppSection")?.style.setProperty("display", "none");
      } catch (error) {
        console.warn("Install prompt failed", error);
      }
      return;
    }

    closeModal();
    alert(L(
      "Chrome is not offering the install prompt yet. Open the Chrome menu and choose Install app / Add to Home screen.",
      "Chrome এখনো Install prompt দেখাচ্ছে না। Chrome menu থেকে Install app / Add to Home screen নির্বাচন করুন।"
    ));
  });

  function createExportStage(pageNumber) {
    const pageIndex = Math.max(0, Math.min(2, Number(pageNumber) - 1));
    const selectors = pageDefinitions[pageIndex];

    const stage = document.createElement("div");
    Object.assign(stage.style, {
      position: "fixed",
      left: "-100000px",
      top: "0",
      width: `${PAGE_WIDTH}px`,
      height: `${PAGE_HEIGHT}px`,
      overflow: "hidden",
      zIndex: "-1",
      background: "#FBF7EE"
    });

    const page = document.createElement("div");
    Object.assign(page.style, {
      width: `${PAGE_WIDTH}px`,
      height: `${PAGE_HEIGHT}px`,
      boxSizing: "border-box",
      padding: "42px",
      background: "#FBF7EE",
      border: "2px solid #B8860B",
      position: "relative",
      overflow: "hidden",
      color: "#221F1A"
    });

    const inner = document.createElement("div");
    inner.style.transformOrigin = "top left";

    const header = document.createElement("div");
    header.innerHTML = `
      <div style="text-align:center;margin:0 0 22px">
        <div style="font:700 12px Inter,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#B8860B;margin-bottom:7px">${exportProfileTitle()}</div>
        <div style="font:700 34px ${isBangla() ? "'Tiro Bangla','Noto Sans Bengali',serif" : "'Playfair Display',serif"};color:#0A2B20">${exportName()}</div>
        <div style="width:70px;height:1px;background:#D4AF37;margin:11px auto 0"></div>
      </div>`;
    inner.appendChild(header);

    selectors.forEach((selector) => {
      const source = document.querySelector(selector);
      if (!source) return;
      const clone = source.cloneNode(true);
      clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
      clone.querySelectorAll(".profile-nav,#portfolioTools,.live-share-modal,.share-modal,.header-admin-link,#appSplash,#installAppSection,#installAppBtn").forEach((el) => el.remove());
      if (clone.matches(".header")) {
        clone.style.paddingTop = "0";
        clone.style.marginTop = "0";
      } else {
        clone.style.marginTop = "18px";
      }
      clone.style.breakInside = "avoid";
      clone.style.pageBreakInside = "avoid";
      inner.appendChild(clone);
    });

    const footer = document.createElement("div");
    const pageLabel = isBangla() && window.profileI18n?.toBanglaDigits
      ? window.profileI18n.toBanglaDigits(pageIndex + 1)
      : pageIndex + 1;
    footer.textContent = `${L("Page", "পেজ")} ${pageLabel} · ${exportName()} · ${exportProfileTitle()}`;
    Object.assign(footer.style, {
      textAlign: "center",
      marginTop: "18px",
      paddingTop: "12px",
      borderTop: "1px solid #E9E0CB",
      font: "600 11px Inter,sans-serif",
      color: "#6A6358"
    });
    inner.appendChild(footer);

    page.appendChild(inner);
    stage.appendChild(page);
    document.body.appendChild(stage);

    const availableHeight = PAGE_HEIGHT - 84;
    const contentHeight = inner.scrollHeight;
    if (contentHeight > availableHeight) {
      const scale = Math.max(0.68, availableHeight / contentHeight);
      inner.style.transform = `scale(${scale})`;
      inner.style.width = `${100 / scale}%`;
    }

    return { stage, page };
  }

  async function renderExportPage(pageNumber) {
    if (!window.html2canvas) throw new Error("html2canvas did not load.");
    await document.fonts?.ready;

    const built = createExportStage(pageNumber);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const links = [];
    const pageRect = built.page.getBoundingClientRect();
    built.page.querySelectorAll("a[href]").forEach((anchor) => {
      const rect = anchor.getBoundingClientRect();
      if (!anchor.href || rect.width <= 0 || rect.height <= 0) return;
      links.push({
        href: anchor.href,
        x: rect.left - pageRect.left,
        y: rect.top - pageRect.top,
        width: rect.width,
        height: rect.height
      });
    });

    try {
      const canvas = await window.html2canvas(built.page, {
        scale: RENDER_SCALE,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#FBF7EE",
        logging: false,
        imageTimeout: 15000,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        windowWidth: PAGE_WIDTH,
        windowHeight: PAGE_HEIGHT
      });
      return { canvas, links };
    } finally {
      built.stage.remove();
    }
  }

  async function canvasToBlob(canvas, type = "image/jpeg", quality = 0.95) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("File creation failed.")), type, quality);
    });
  }

  async function createPageImageFile(pageNumber) {
    const { canvas } = await renderExportPage(pageNumber);
    const blob = await canvasToBlob(canvas);
    return new File([blob], `sadnan-kaabeer-profile-page-${pageNumber}.jpg`, { type: "image/jpeg" });
  }

  async function downloadFiles(files) {
    for (const [index, file] of files.entries()) {
      await new Promise((resolve) => setTimeout(resolve, index ? 250 : 0));
      const url = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
  }

  async function shareFiles(files, title, text) {
    if (navigator.canShare?.({ files })) {
      try {
        await navigator.share({ files, title, text });
        return true;
      } catch (error) {
        if (error?.name === "AbortError") return true;
        console.warn("File share failed", error);
      }
    }
    return false;
  }

  async function createPdf() {
    if (!window.jspdf?.jsPDF) throw new Error("jsPDF did not load.");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });

    for (let pageNumber = 1; pageNumber <= 3; pageNumber += 1) {
      setWorking(true, `${L("Creating PDF page", "PDF পেজ তৈরি হচ্ছে")} ${pageNumber} ${L("of", "এর")} 3...`);
      const { canvas, links } = await renderExportPage(pageNumber);
      const png = canvas.toDataURL("image/png");
      if (pageNumber > 1) pdf.addPage();
      pdf.addImage(png, "PNG", 0, 0, PDF_WIDTH_MM, PDF_HEIGHT_MM, undefined, "FAST");

      links.forEach((link) => {
        pdf.link(
          (link.x / PAGE_WIDTH) * PDF_WIDTH_MM,
          (link.y / PAGE_HEIGHT) * PDF_HEIGHT_MM,
          (link.width / PAGE_WIDTH) * PDF_WIDTH_MM,
          (link.height / PAGE_HEIGHT) * PDF_HEIGHT_MM,
          { url: link.href }
        );
      });
    }
    return pdf;
  }

  document.getElementById("liveSharePdf")?.addEventListener("click", async () => {
    setWorking(true, L("Preparing professional PDF...", "প্রফেশনাল PDF প্রস্তুত করা হচ্ছে..."));
    try {
      const pdf = await createPdf();
      const blob = pdf.output("blob");
      const file = new File([blob], "sadnan-kaabeer-personal-profile.pdf", { type: "application/pdf" });
      closeModal();
      const shared = await shareFiles([file], `${exportName()} - ${exportProfileTitle()}`, exportProfileTitle());
      if (!shared) pdf.save(file.name);
    } catch (error) {
      console.error(error);
      alert(L("Could not create the PDF. Please reload and try again.", "PDF তৈরি করা যায়নি। পেজটি রিলোড করে আবার চেষ্টা করুন।"));
    } finally {
      setWorking(false);
    }
  });

  document.getElementById("liveShareAllImages")?.addEventListener("click", async () => {
    setWorking(true, L("Creating all 3 profile images...", "প্রোফাইলের ৩টি ছবি তৈরি করা হচ্ছে..."));
    try {
      const files = [];
      for (let pageNumber = 1; pageNumber <= 3; pageNumber += 1) {
        setWorking(true, `${L("Creating image", "ছবি তৈরি হচ্ছে")} ${pageNumber} ${L("of", "এর")} 3...`);
        files.push(await createPageImageFile(pageNumber));
      }
      closeModal();
      const shared = await shareFiles(files, `${exportName()} - ${exportProfileTitle()}`, exportProfileTitle());
      if (!shared) {
        await downloadFiles(files);
        alert(L(
          "This browser cannot share 3 images together, so all 3 were downloaded.",
          "এই ব্রাউজার একসাথে ৩টি ছবি শেয়ার করতে পারে না, তাই ৩টি ছবিই ডাউনলোড করা হয়েছে।"
        ));
      }
    } catch (error) {
      console.error(error);
      alert(L("Could not create the images. Please reload and try again.", "ছবি তৈরি করা যায়নি। পেজটি রিলোড করে আবার চেষ্টা করুন।"));
    } finally {
      setWorking(false);
    }
  });

  document.getElementById("liveShareImage")?.addEventListener("click", () => {
    picker?.classList.toggle("show");
  });

  document.querySelectorAll("[data-export-page]").forEach((button) => {
    button.addEventListener("click", async () => {
      const pageNumber = Number(button.dataset.exportPage);
      setWorking(true, `${L("Creating page", "পেজ তৈরি হচ্ছে")} ${pageNumber}...`);
      try {
        const file = await createPageImageFile(pageNumber);
        closeModal();
        const shared = await shareFiles([file], `${exportName()} - ${exportProfileTitle()}`, `${L("Profile page", "প্রোফাইল পেজ")} ${pageNumber}`);
        if (!shared) await downloadFiles([file]);
      } catch (error) {
        console.error(error);
        alert(L("Could not create this image. Please reload and try again.", "এই ছবি তৈরি করা যায়নি। পেজটি রিলোড করে আবার চেষ্টা করুন।"));
      } finally {
        setWorking(false);
      }
    });
  });
})();
