
(() => {
  "use strict";

  const modal = document.getElementById("liveShareModal");
  const picker = document.getElementById("imagePagePicker");
  const working = document.getElementById("exportWorking");
  const shareBtn = document.getElementById("shareBtn");

  const openModal = () => {
    if (!modal) return;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  };
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    picker?.classList.remove("show");
  };
  const setWorking = (value) => working?.classList.toggle("show", Boolean(value));

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

  // PDF: browser's print engine gives vector text and preserves <a> links.
  document.getElementById("liveSharePdf")?.addEventListener("click", () => {
    closeModal();
    setTimeout(() => window.print(), 120);
  });

  document.getElementById("liveShareImage")?.addEventListener("click", () => {
    picker?.classList.toggle("show");
  });

  const pageDefinitions = [
    ["#home", "#personal", "#about"],
    ["#education", "#family", "#professional"],
    ["#skills", "#interests", "#books", "#gallery", "#social", "#contact"]
  ];

  function cloneForImagePage(pageNumber) {
    const pageIndex = Math.max(0, Math.min(2, Number(pageNumber) - 1));
    const selectors = pageDefinitions[pageIndex];
    const sourceWrap = document.querySelector(".wrap");
    if (!sourceWrap) throw new Error("Profile container not found.");

    const stage = document.createElement("div");
    stage.className = "export-image-stage";
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
      const cloned = node.cloneNode(true);
      cloned.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
      cloned.querySelectorAll(".profile-nav,#portfolioTools,.live-share-modal").forEach((el) => el.remove());
      cloned.style.marginTop = "18px";
      cloned.style.breakInside = "avoid";
      shell.appendChild(cloned);
    });

    const footer = document.createElement("div");
    footer.textContent = `Page ${pageIndex + 1} · Sadnan Kaabeer · Personal Profile`;
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

  async function exportImagePage(pageNumber) {
    if (!window.html2canvas) {
      alert("Image export library did not load. Check internet access and try again.");
      return;
    }
    setWorking(true);
    let stage;
    try {
      await document.fonts?.ready;
      stage = cloneForImagePage(pageNumber);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const canvas = await window.html2canvas(stage.firstElementChild, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#FBF7EE",
        logging: false,
        imageTimeout: 12000
      });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.94));
      if (!blob) throw new Error("Could not create image.");
      closeModal();
      await shareBlob(
        blob,
        `sadnan-kaabeer-profile-page-${pageNumber}.jpg`,
        "image/jpeg"
      );
    } catch (error) {
      console.error(error);
      alert("Could not create this page image. Please try again after the page fully loads.");
    } finally {
      stage?.remove();
      setWorking(false);
    }
  }

  document.querySelectorAll("[data-export-page]").forEach((button) => {
    button.addEventListener("click", () => exportImagePage(button.dataset.exportPage));
  });
})();
