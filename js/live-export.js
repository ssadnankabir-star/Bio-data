
(() => {
  "use strict";

  const modal = document.getElementById("liveShareModal");
  const picker = document.getElementById("imagePagePicker");
  const working = document.getElementById("exportWorking");
  const shareBtn = document.getElementById("shareBtn");

  const openModal = () => {
    modal?.classList.add("show");
    modal?.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    modal?.classList.remove("show");
    modal?.setAttribute("aria-hidden", "true");
    picker?.classList.remove("show");
  };

  const setWorking = (on, text = "Preparing...") => {
    if (!working) return;
    working.textContent = text;
    working.classList.toggle("show", Boolean(on));
  };

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

  // Keep normal page printing separate from Professional PDF.
  document.getElementById("printBtn")?.addEventListener("click", () => window.print());

  const cleanText = (value) => String(value || "").replace(/\s+/g, " ").trim();

  document.getElementById("liveShareLink")?.addEventListener("click", async () => {
    const payload = {
      title: "Sadnan Kaabeer - Personal Profile",
      text: "Sadnan Kaabeer - Personal Profile",
      url: location.href
    };

    closeModal();

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(location.href);
      alert("Profile link copied.");
    } catch {
      prompt("Copy this link:", location.href);
    }
  });

  function getSectionText(selector) {
    return cleanText(document.querySelector(selector)?.textContent);
  }

  function addHeader(pdf, pageNo, totalPages) {
    pdf.setDrawColor(184, 134, 11);
    pdf.setLineWidth(0.35);
    pdf.rect(8, 8, 194, 281);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(184, 134, 11);
    pdf.text("SADNAN KAABEER · PERSONAL PROFILE", 14, 15);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 94, 82);
    pdf.text(`Page ${pageNo} of ${totalPages}`, 196, 15, { align: "right" });
  }

  function sectionTitle(pdf, title, y) {
    pdf.setFillColor(15, 61, 46);
    pdf.roundedRect(14, y - 4.6, 6, 6, 1.2, 1.2, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(10, 43, 32);
    pdf.text(title, 24, y);

    pdf.setDrawColor(224, 214, 189);
    pdf.line(24, y + 2, 196, y + 2);

    return y + 9;
  }

  function wrapped(pdf, text, x, y, width, opts = {}) {
    if (!text) return y;
    pdf.setFont("helvetica", opts.bold ? "bold" : "normal");
    pdf.setFontSize(opts.size || 9.5);
    pdf.setTextColor(...(opts.color || [34, 31, 26]));
    const lines = pdf.splitTextToSize(text, width);
    pdf.text(lines, x, y);
    return y + lines.length * (opts.line || 4.6);
  }

  function keyValue(pdf, key, value, y) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(91, 86, 76);
    pdf.text(key, 18, y);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(34, 31, 26);
    const lines = pdf.splitTextToSize(value, 130);
    pdf.text(lines, 62, y);

    return y + Math.max(6, lines.length * 4.4);
  }

  function ensureSpace(pdf, y, need = 30, pageNoRef) {
    if (y + need <= 278) return y;
    pdf.addPage();
    pageNoRef.value += 1;
    addHeader(pdf, pageNoRef.value, 3);
    return 24;
  }

  async function imageData(img) {
    if (!img) return null;
    const src = img.currentSrc || img.src;
    try {
      const response = await fetch(src, { mode: "cors" });
      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 480;
        canvas.height = img.naturalHeight || 480;
        canvas.getContext("2d").drawImage(img, 0, 0);
        return canvas.toDataURL("image/jpeg", 0.92);
      } catch {
        return null;
      }
    }
  }

  async function createProfilePdf() {
    if (!window.jspdf?.jsPDF) {
      throw new Error("jsPDF did not load.");
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const pageRef = { value: 1 };
    const totalPages = 3;

    pdf.setFillColor(251, 247, 238);
    pdf.rect(0, 0, 210, 297, "F");
    addHeader(pdf, 1, totalPages);

    let y = 26;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(26);
    pdf.setTextColor(15, 61, 46);
    pdf.text("Sadnan Kaabeer", 105, y, { align: "center" });

    y += 7;
    pdf.setFontSize(10);
    pdf.setTextColor(184, 134, 11);
    pdf.text("PERSONAL PROFILE", 105, y, { align: "center" });

    y += 7;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(91, 86, 76);
    pdf.text("Design, technology, creativity, and continuous learning.", 105, y, { align: "center" });

    const img = document.querySelector(".photo-ring img");
    const imgDataUrl = await imageData(img);
    if (imgDataUrl) {
      y += 7;
      pdf.addImage(imgDataUrl, "JPEG", 86, y, 38, 38, undefined, "FAST");
      const photoHref = document.querySelector(".photo-ring a")?.href;
      if (photoHref) {
        pdf.link(86, y, 38, 38, { url: photoHref });
      }
      y += 45;
    } else {
      y += 10;
    }

    const location = cleanText(document.querySelector(".location")?.textContent);
    if (location) {
      pdf.setFontSize(9);
      pdf.setTextColor(91, 86, 76);
      pdf.text(location, 105, y, { align: "center" });
      y += 10;
    }

    y = sectionTitle(pdf, "Personal Information", y);

    document.querySelectorAll("#personal .stat-card").forEach((card) => {
      const label = cleanText(card.querySelector(".label")?.textContent);
      const value = cleanText(card.querySelector(".value")?.textContent);
      if (label && value) y = keyValue(pdf, label, value, y);
    });

    y += 3;
    y = sectionTitle(pdf, "About Me", y);
    y = wrapped(pdf, getSectionText("#about .body-text"), 18, y, 174, { size: 9.2, line: 4.6 });

    // Page 2
    pdf.addPage();
    pageRef.value = 2;
    pdf.setFillColor(251, 247, 238);
    pdf.rect(0, 0, 210, 297, "F");
    addHeader(pdf, 2, totalPages);
    y = 25;

    y = sectionTitle(pdf, "Education", y);
    document.querySelectorAll("#education .education-item").forEach((item) => {
      const title = cleanText(item.querySelector(":scope > strong")?.textContent);
      const details = [...item.querySelectorAll(":scope > span")].map((el) => cleanText(el.textContent)).filter(Boolean);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(15, 61, 46);
      pdf.text(title, 18, y);
      y += 5;

      details.forEach((detail) => {
        y = wrapped(pdf, detail, 22, y, 168, { size: 8.7, color: [91, 86, 76], line: 4.3 });
      });
      y += 3;
    });

    y += 3;
    y = sectionTitle(pdf, "Professional Life", y);

    const halallab = document.querySelector(".halallab-heading");
    if (halallab) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(15, 61, 46);
      pdf.text(cleanText(halallab.querySelector(".halallab-title")?.textContent), 18, y);
      y += 5;
      y = wrapped(pdf, cleanText(halallab.querySelector(".halallab-copy")?.textContent), 18, y, 174, { size: 8.5, color: [91, 86, 76], line: 4.2 });
      y += 4;
    }

    document.querySelectorAll("#professional .professional-company-block").forEach((block) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(15, 61, 46);
      pdf.text(cleanText(block.querySelector(".professional-company-name")?.textContent), 18, y);
      y += 6;

      block.querySelectorAll(".kv-row").forEach((row) => {
        const k = cleanText(row.querySelector(".k")?.textContent);
        const v = cleanText(row.querySelector(".v")?.textContent);
        y = keyValue(pdf, k, v, y);
      });

      y = wrapped(pdf, cleanText(block.querySelector(".professional-description")?.textContent), 18, y + 1, 174, { size: 8.7, color: [91, 86, 76], line: 4.3 });
      y += 6;
    });

    y = sectionTitle(pdf, "Family", y);
    document.querySelectorAll("#family .family-clean-item").forEach((item) => {
      const relation = cleanText(item.querySelector(".family-clean-role")?.textContent);
      const name = cleanText(item.querySelector("h4")?.textContent);
      const main = cleanText(item.querySelector("p")?.textContent);
      const meta = cleanText(item.querySelector(".family-clean-meta")?.textContent);
      const status = cleanText(item.querySelector(".family-clean-status")?.textContent);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(15, 61, 46);
      pdf.text(`${relation}: ${name}`, 18, y);
      y += 5;

      y = wrapped(pdf, main, 22, y, 166, { size: 8.6, line: 4.2 });
      y = wrapped(pdf, meta, 22, y, 166, { size: 8.2, color: [91, 86, 76], line: 4.1 });
      if (status) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(184, 134, 11);
        pdf.text(status, 22, y);
        y += 5;
      }
      y += 2;
    });

    // Page 3
    pdf.addPage();
    pageRef.value = 3;
    pdf.setFillColor(251, 247, 238);
    pdf.rect(0, 0, 210, 297, "F");
    addHeader(pdf, 3, totalPages);
    y = 25;

    y = sectionTitle(pdf, "Skills & Tools", y);
    const skills = [...document.querySelectorAll("#skills .skill-chip")].map((el) => cleanText(el.textContent)).filter(Boolean);
    y = wrapped(pdf, skills.join(" · "), 18, y, 174, { size: 9.2, line: 4.6 });

    y += 6;
    y = sectionTitle(pdf, "Interests & Lifestyle", y);
    const interests = [...document.querySelectorAll("#interests .interest-chip")].map((el) => cleanText(el.textContent)).filter(Boolean);
    y = wrapped(pdf, interests.join(" · "), 18, y, 174, { size: 9.2, line: 4.6 });

    y += 6;
    y = sectionTitle(pdf, "Favourite Books", y);
    const books = [...document.querySelectorAll("#books .book strong")].map((el) => cleanText(el.textContent)).filter(Boolean);
    y = wrapped(pdf, books.join(" | "), 18, y, 174, { size: 9.2, line: 4.6 });

    y += 7;
    y = sectionTitle(pdf, "Social Links", y);
    document.querySelectorAll("#social .social-card").forEach((link) => {
      const label = cleanText(link.textContent.replace("↗", ""));
      if (!label || !link.href) return;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(15, 61, 46);
      pdf.textWithLink(label, 18, y, { url: link.href });
      y += 6;
    });

    y += 3;
    y = sectionTitle(pdf, "Contact", y);
    document.querySelectorAll("#contact .contact-card").forEach((card) => {
      const label = cleanText(card.querySelector("strong")?.textContent);
      const link = card.querySelector("a");
      const value = cleanText(link?.textContent || card.querySelector("span")?.textContent);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(91, 86, 76);
      pdf.text(label, 18, y);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(34, 31, 26);
      if (link?.href) {
        pdf.textWithLink(value, 62, y, { url: link.href });
      } else {
        pdf.text(value, 62, y);
      }
      y += 6;
    });

    y += 6;
    pdf.setDrawColor(233, 224, 203);
    pdf.line(18, y, 192, y);
    y += 7;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(15, 61, 46);
    pdf.textWithLink("Open live Personal Profile", 18, y, { url: location.href });

    return pdf;
  }

  async function shareOrDownloadPdf(pdf) {
    const blob = pdf.output("blob");
    const file = new File([blob], "sadnan-kaabeer-personal-profile.pdf", { type: "application/pdf" });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Sadnan Kaabeer - Personal Profile",
          text: "Personal Profile PDF"
        });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    pdf.save(file.name);
  }

  document.getElementById("liveSharePdf")?.addEventListener("click", async () => {
    setWorking(true, "Creating professional PDF...");
    try {
      await document.fonts?.ready;
      const pdf = await createProfilePdf();
      closeModal();
      await shareOrDownloadPdf(pdf);
    } catch (error) {
      console.error(error);
      alert("PDF could not be generated. Please reload the page and try again.");
    } finally {
      setWorking(false);
    }
  });

  document.getElementById("liveShareImage")?.addEventListener("click", () => {
    picker?.classList.toggle("show");
  });

  const pageDefinitions = [
    ["#home", "#personal", "#about"],
    ["#education", "#professional", "#family"],
    ["#skills", "#interests", "#books", "#gallery", "#social", "#contact"]
  ];

  function clonePage(pageNumber) {
    const index = Math.max(0, Math.min(2, Number(pageNumber) - 1));
    const selectors = pageDefinitions[index];

    const stage = document.createElement("div");
    Object.assign(stage.style, {
      position: "fixed",
      left: "-100000px",
      top: "0",
      width: "1080px",
      background: "#FBF7EE",
      padding: "34px",
      zIndex: "-1"
    });

    const shell = document.createElement("div");
    Object.assign(shell.style, {
      background: "#FBF7EE",
      border: "2px solid #B8860B",
      borderRadius: "18px",
      padding: "28px",
      boxShadow: "0 20px 50px rgba(15,61,46,.12)"
    });

    const title = document.createElement("div");
    title.innerHTML = `
      <div style="text-align:center;margin:0 0 22px">
        <div style="font:700 12px Inter,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#B8860B;margin-bottom:7px">Personal Profile</div>
        <div style="font:700 34px 'Playfair Display',serif;color:#0A2B20">Sadnan Kaabeer</div>
        <div style="width:70px;height:1px;background:#D4AF37;margin:11px auto 0"></div>
      </div>
    `;
    shell.appendChild(title);

    selectors.forEach((selector) => {
      const node = document.querySelector(selector);
      if (!node) return;
      const clone = node.cloneNode(true);
      clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
      clone.querySelectorAll(".profile-nav,#portfolioTools,.live-share-modal,.header-admin-link").forEach((el) => el.remove());
      clone.style.marginTop = "18px";
      clone.style.breakInside = "avoid";
      shell.appendChild(clone);
    });

    const footer = document.createElement("div");
    footer.textContent = `Page ${index + 1} · Sadnan Kaabeer · Personal Profile`;
    Object.assign(footer.style, {
      textAlign: "center",
      marginTop: "22px",
      paddingTop: "14px",
      borderTop: "1px solid #E9E0CB",
      font: "600 11px Inter,sans-serif",
      color: "#6A6358"
    });
    shell.appendChild(footer);

    stage.appendChild(shell);
    document.body.appendChild(stage);
    return stage;
  }

  async function shareBlob(blob, filename, type) {
    const file = new File([blob], filename, { type });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Sadnan Kaabeer - Personal Profile",
          text: "Personal Profile"
        });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  async function exportImage(pageNumber) {
    if (!window.html2canvas) {
      alert("Image export library did not load.");
      return;
    }

    setWorking(true, `Creating page ${pageNumber} image...`);
    let stage;

    try {
      await document.fonts?.ready;
      stage = clonePage(pageNumber);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const canvas = await window.html2canvas(stage.firstElementChild, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#FBF7EE",
        logging: false,
        imageTimeout: 12000
      });

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.94));
      if (!blob) throw new Error("Image creation failed.");

      closeModal();
      await shareBlob(blob, `sadnan-kaabeer-profile-page-${pageNumber}.jpg`, "image/jpeg");
    } catch (error) {
      console.error(error);
      alert("Could not create this image. Please try again after the page fully loads.");
    } finally {
      stage?.remove();
      setWorking(false);
    }
  }

  document.querySelectorAll("[data-export-page]").forEach((button) => {
    button.addEventListener("click", () => exportImage(button.dataset.exportPage));
  });
})();
