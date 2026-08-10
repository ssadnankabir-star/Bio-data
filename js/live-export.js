(() => {
  "use strict";

  const modal = document.getElementById("liveShareModal");
  const picker = document.getElementById("imagePagePicker");
  const working = document.getElementById("exportWorking");
  const shareBtn = document.getElementById("shareBtn");

  const PAGE_WIDTH = 1080;
  const PAGE_HEIGHT = 1527; // A4 ratio, 210 x 297
  const PDF_WIDTH_MM = 210;
  const PDF_HEIGHT_MM = 297;
  const RENDER_SCALE = 2;

  const pageDefinitions = [
    ["#home", "#personal", "#about"],
    ["#education", "#professional", "#family"],
    ["#skills", "#interests", "#books", "#gallery", "#social", "#contact"]
  ];

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

  function createExportStage(pageNumber) {
    const pageIndex = Math.max(0, Math.min(2, Number(pageNumber) - 1));
    const selectors = pageDefinitions[pageIndex];

    const stage = document.createElement("div");
    stage.className = "profile-export-stage";
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
    page.className = "profile-export-page";
    Object.assign(page.style, {
      width: `${PAGE_WIDTH}px`,
      height: `${PAGE_HEIGHT}px`,
      boxSizing: "border-box",
      padding: "42px",
      background: "#FBF7EE",
      border: "2px solid #B8860B",
      position: "relative",
      overflow: "hidden",
      fontFamily: "Inter, 'Noto Sans Bengali', 'Hind Siliguri', sans-serif",
      color: "#221F1A"
    });

    const inner = document.createElement("div");
    inner.className = "profile-export-inner";
    Object.assign(inner.style, {
      width: "100%",
      transformOrigin: "top left"
    });

    const exportHeader = document.createElement("div");
    exportHeader.innerHTML = `
      <div style="text-align:center;margin:0 0 22px">
        <div style="font:700 12px Inter,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#B8860B;margin-bottom:7px">Personal Profile</div>
        <div style="font:700 34px 'Playfair Display',serif;color:#0A2B20">Sadnan Kaabeer</div>
        <div style="width:70px;height:1px;background:#D4AF37;margin:11px auto 0"></div>
      </div>
    `;
    inner.appendChild(exportHeader);

    selectors.forEach((selector) => {
      const source = document.querySelector(selector);
      if (!source) return;
      const clone = source.cloneNode(true);

      clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
      clone.querySelectorAll(".profile-nav,#portfolioTools,.live-share-modal,.header-admin-link").forEach((el) => el.remove());

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
    footer.textContent = `Page ${pageIndex + 1} · Sadnan Kaabeer · Personal Profile`;
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

    // Fit the complete page without cutting a section in the middle.
    const availableHeight = PAGE_HEIGHT - 84;
    const contentHeight = inner.scrollHeight;
    if (contentHeight > availableHeight) {
      const scale = Math.max(0.78, availableHeight / contentHeight);
      inner.style.transform = `scale(${scale})`;
      inner.style.width = `${100 / scale}%`;
    }

    return { stage, page, pageIndex };
  }

  async function renderExportPage(pageNumber) {
    if (!window.html2canvas) throw new Error("html2canvas did not load.");
    await document.fonts?.ready;

    const built = createExportStage(pageNumber);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const links = [];
    const pageRect = built.page.getBoundingClientRect();
    built.page.querySelectorAll("a[href]").forEach((anchor) => {
      const href = anchor.href;
      if (!href) return;
      const rect = anchor.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      links.push({
        href,
        x: rect.left - pageRect.left,
        y: rect.top - pageRect.top,
        width: rect.width,
        height: rect.height
      });
    });

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

    built.stage.remove();
    return { canvas, links };
  }

  async function createHighQualityPdf() {
    if (!window.jspdf?.jsPDF) throw new Error("jsPDF did not load.");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });

    for (let pageNumber = 1; pageNumber <= 3; pageNumber += 1) {
      setWorking(true, `Creating PDF page ${pageNumber} of 3...`);
      const { canvas, links } = await renderExportPage(pageNumber);
      const png = canvas.toDataURL("image/png");

      if (pageNumber > 1) pdf.addPage();
      pdf.addImage(png, "PNG", 0, 0, PDF_WIDTH_MM, PDF_HEIGHT_MM, undefined, "FAST");

      links.forEach((link) => {
        const x = (link.x / PAGE_WIDTH) * PDF_WIDTH_MM;
        const y = (link.y / PAGE_HEIGHT) * PDF_HEIGHT_MM;
        const width = (link.width / PAGE_WIDTH) * PDF_WIDTH_MM;
        const height = (link.height / PAGE_HEIGHT) * PDF_HEIGHT_MM;
        if (width > 0 && height > 0) {
          pdf.link(x, y, width, height, { url: link.href });
        }
      });
    }

    return pdf;
  }

  async function sharePdf(pdf) {
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
    setWorking(true, "Preparing high quality PDF...");
    try {
      const pdf = await createHighQualityPdf();
      closeModal();
      await sharePdf(pdf);
    } catch (error) {
      console.error(error);
      alert("Could not create the PDF. Please reload the page and try again.");
    } finally {
      setWorking(false);
    }
  });

  async function canvasToBlob(canvas) {
    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("Image creation failed.")),
        "image/jpeg",
        0.95
      );
    });
  }

  async function shareFiles(files, title, text) {
    if (navigator.canShare?.({ files })) {
      try {
        await navigator.share({ files, title, text });
        return true;
      } catch (error) {
        if (error?.name === "AbortError") return true;
      }
    }
    return false;
  }

  async function downloadFiles(files) {
    files.forEach((file, index) => {
      setTimeout(() => {
        const url = URL.createObjectURL(file);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = file.name;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      }, index * 350);
    });
  }

  async function createPageImageFile(pageNumber) {
    const { canvas } = await renderExportPage(pageNumber);
    const blob = await canvasToBlob(canvas);
    return new File([blob], `sadnan-kaabeer-profile-page-${pageNumber}.jpg`, { type: "image/jpeg" });
  }

  async function shareThreeImages() {
    setWorking(true, "Creating all 3 profile images...");
    try {
      const files = [];
      for (let pageNumber = 1; pageNumber <= 3; pageNumber += 1) {
        setWorking(true, `Creating image ${pageNumber} of 3...`);
        files.push(await createPageImageFile(pageNumber));
      }

      closeModal();
      const shared = await shareFiles(files, "Sadnan Kaabeer - Personal Profile", "Personal Profile");
      if (!shared) {
        await downloadFiles(files);
        alert("This browser cannot share 3 files together, so all 3 images were downloaded.");
      }
    } catch (error) {
      console.error(error);
      alert("Could not create all 3 images. Please reload the page and try again.");
    } finally {
      setWorking(false);
    }
  }

  document.getElementById("liveShareAllImages")?.addEventListener("click", shareThreeImages);
  async function buildImageBlobForPage(pageNumber) {
    if (!window.html2canvas) throw new Error("Image export library did not load.");
    let stage;
    try {
      await document.fonts?.ready;
      stage = typeof clonePage === "function" ? clonePage(pageNumber) : cloneForImagePage(pageNumber);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const target = stage.firstElementChild || stage;
      const canvas = await window.html2canvas(target, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#FBF7EE",
        logging: false,
        imageTimeout: 15000
      });
      return await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error("Image creation failed.")),
          "image/jpeg",
          0.94
        );
      });
    } finally {
      stage?.remove();
    }
  }

  async function shareThreeImagesTogether() {
    setWorking(true, "Creating all 3 profile images...");
    try {
      const blobs = [];
      for (let page = 1; page <= 3; page += 1) {
        setWorking(true, `Creating image ${page} of 3...`);
        blobs.push(await buildImageBlobForPage(page));
      }

      const files = blobs.map((blob, index) => new File(
        [blob],
        `sadnan-kaabeer-profile-page-${index + 1}.jpg`,
        { type: "image/jpeg" }
      ));

      closeModal();

      // Web Share API supports sending multiple files together on compatible mobile browsers/apps.
      if (navigator.canShare?.({ files })) {
        try {
          await navigator.share({
            files,
            title: "Sadnan Kaabeer - Personal Profile",
            text: "Personal Profile"
          });
          return;
        } catch (error) {
          if (error?.name === "AbortError") return;
          console.warn("Multi-image sharing was not accepted by this browser/app.", error);
        }
      }

      // Fallback: download the three images together from one click.
      files.forEach((file, index) => {
        setTimeout(() => {
          const url = URL.createObjectURL(file);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 2000);
        }, index * 300);
      });

      alert("This browser cannot send multiple images in one share sheet. All 3 images have been downloaded instead.");
    } catch (error) {
      console.error(error);
      alert("Could not prepare all 3 images. Please wait until the page fully loads and try again.");
    } finally {
      setWorking(false);
    }
  }

  document.getElementById("liveShareAllImages")?.addEventListener("click", shareThreeImagesTogether);



  document.getElementById("liveShareImage")?.addEventListener("click", () => {
    picker?.classList.toggle("show");
  });

  document.querySelectorAll("[data-export-page]").forEach((button) => {
    button.addEventListener("click", async () => {
      const pageNumber = Number(button.dataset.exportPage);
      setWorking(true, `Creating page ${pageNumber} image...`);
      try {
        const file = await createPageImageFile(pageNumber);
        closeModal();
        const shared = await shareFiles([file], "Sadnan Kaabeer - Personal Profile", `Profile page ${pageNumber}`);
        if (!shared) await downloadFiles([file]);
      } catch (error) {
        console.error(error);
        alert("Could not create this image. Please reload the page and try again.");
      } finally {
        setWorking(false);
      }
    });
  });
})();
