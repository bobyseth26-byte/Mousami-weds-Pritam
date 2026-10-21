(function () {
  const invite = window.INVITE;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const opening = document.getElementById("opening");
  const openBtn = document.getElementById("openBtn");
  const site = document.getElementById("site");
  const musicBtn = document.getElementById("musicToggle");
  const musicLabel = document.getElementById("musicLabel");
  const KEY = "mp-music";

  const audio = new Audio();
  audio.preload = "none";
  audio.loop = true;
  audio.src = invite.music.src;
  audio.volume = invite.music.volume;

  let opened = false;
  let countdownTimer = 0;
  let playing = false;
  let musicFailed = false;
  let gallery = [];
  let galleryIndex = 0;
  let lastFocus = null;

  function renderGallery() {
    const grid = document.getElementById("galleryGrid");
    if (!grid) return;
    grid.innerHTML = invite.gallery.map((item, index) => {
      const wide = item.wide ? "g-wide" : "g-tall";
      const safeAlt = String(item.alt).replace(/"/g, "&quot;");
      const safeSrc = String(item.src).replace(/"/g, "&quot;");
      return `<figure class="g-item ${wide} reveal" style="--d:${index * 0.08}s">
        <button type="button" class="g-open" data-index="${index}" aria-label="View image ${index + 1} of ${invite.gallery.length}">
          <img src="${safeSrc}" alt="${safeAlt}" width="${item.wide ? 1200 : 800}" height="${item.wide ? 800 : 1100}" loading="lazy" decoding="async">
        </button>
      </figure>`;
    }).join("");
    gallery = Array.from(grid.querySelectorAll(".g-open"));
    gallery.forEach((button) => {
      button.addEventListener("click", () => openLightbox(Number(button.dataset.index), button));
    });
  }

  function applyMaps() {
    document.querySelectorAll("[data-map]").forEach((link) => {
      const url = invite.maps[link.dataset.map];
      if (url) link.href = url;
    });
    const credit = document.getElementById("musicCredit");
    if (credit) credit.hidden = !invite.music.showCredit;
  }

  function observeReveals() {
    const nodes = document.querySelectorAll(".reveal");
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-in"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    nodes.forEach((node) => observer.observe(node));
  }

  function updateMusicUI() {
    const paused = !playing;
    musicBtn.classList.toggle("is-playing", playing);
    musicBtn.setAttribute("aria-pressed", playing ? "true" : "false");
    if (musicFailed) {
      musicLabel.textContent = "Music unavailable";
      musicBtn.setAttribute("aria-label", "Wedding music could not be loaded");
      return;
    }
    musicLabel.textContent = "Play Wedding Music";
    musicBtn.setAttribute("aria-label", paused ? "Play wedding music" : "Pause wedding music");
  }

  function beginMusic() {
    if (musicFailed) return;
    try {
      sessionStorage.setItem(KEY, "on");
    } catch (err) { /* private mode */ }
    const pending = audio.play();
    if (pending && pending.then) {
      pending.then(() => {
        playing = true;
        updateMusicUI();
      }).catch(() => {
        playing = false;
        updateMusicUI();
      });
    }
  }

  function pauseMusic() {
    audio.pause();
    playing = false;
    try { sessionStorage.setItem(KEY, "off"); } catch (err) { /* ignore */ }
    updateMusicUI();
  }

  audio.addEventListener("error", () => {
    musicFailed = true;
    playing = false;
    updateMusicUI();
  });

  musicBtn.addEventListener("click", () => {
    if (musicFailed) {
      musicFailed = false;
      audio.load();
      beginMusic();
      return;
    }
    if (playing) pauseMusic();
    else beginMusic();
  });

  function finishOpen() {
    site.inert = false;
    site.removeAttribute("aria-hidden");
    opening.setAttribute("aria-hidden", "true");
    opening.classList.add("is-dismissed");
    observeReveals();
    const heroVideo = document.querySelector(".hero-video");
    if (heroVideo) heroVideo.play().catch(() => {});
    const hero = document.getElementById("hero");
    if (hero) hero.focus({ preventScroll: true });
  }

  function openInvitation() {
    if (opened) return;
    opened = true;
    openBtn.disabled = true;
    document.body.classList.add("is-awakened");
    beginMusic();
    if (reduce) {
      document.body.classList.add("is-open");
      finishOpen();
      return;
    }
    opening.classList.add("is-opening");
    window.setTimeout(() => opening.classList.add("is-rising"), 700);
    window.setTimeout(() => {
      document.body.classList.add("is-open");
      opening.classList.add("is-exit");
      window.setTimeout(finishOpen, 900);
    }, 2700);
  }

  openBtn.addEventListener("click", openInvitation);
  document.getElementById("envelope").addEventListener("click", openInvitation);

  document.querySelectorAll(".event-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".event-tab").forEach((item) => {
        const selected = item === tab;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-selected", selected ? "true" : "false");
      });
      const card = document.getElementById(tab.dataset.target);
      if (!card) return;
      card.classList.remove("is-in");
      void card.offsetWidth;
      card.classList.add("is-in");
      card.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      document.getElementById("navDrawer").removeAttribute("open");
    });
  });

  const units = {
    days: document.querySelector('[data-unit="days"]'),
    hours: document.querySelector('[data-unit="hours"]'),
    minutes: document.querySelector('[data-unit="minutes"]'),
    seconds: document.querySelector('[data-unit="seconds"]')
  };

  function setUnit(key, value) {
    const el = units[key];
    const text = String(value).padStart(2, "0");
    if (el.textContent === text) return;
    el.textContent = text;
    if (!reduce) {
      el.classList.remove("tick");
      void el.offsetWidth;
      el.classList.add("tick");
    }
  }

  function renderCountdown() {
    const target = new Date(invite.countdownISO).getTime();
    const grid = document.getElementById("countdownGrid");
    const done = document.getElementById("countdownDone");
    if (Number.isNaN(target)) return;
    const diff = target - Date.now();
    if (diff <= 0) {
      grid.hidden = true;
      done.hidden = false;
      window.clearInterval(countdownTimer);
      return;
    }
    const total = Math.floor(diff / 1000);
    setUnit("days", Math.floor(total / 86400));
    setUnit("hours", Math.floor((total % 86400) / 3600));
    setUnit("minutes", Math.floor((total % 3600) / 60));
    setUnit("seconds", total % 60);
  }

  renderCountdown();
  countdownTimer = window.setInterval(renderCountdown, 1000);

  const lightbox = document.getElementById("lightbox");
  const lbImage = document.getElementById("lbImage");
  const lbCount = document.getElementById("lbCount");

  function showSlide(index) {
    const total = invite.gallery.length;
    galleryIndex = (index + total) % total;
    const item = invite.gallery[galleryIndex];
    lbImage.src = item.src;
    lbImage.alt = item.alt;
    lbCount.textContent = `${galleryIndex + 1} / ${total}`;
  }

  function openLightbox(index, trigger) {
    lastFocus = trigger || document.activeElement;
    showSlide(index);
    lightbox.hidden = false;
    document.body.classList.add("lb-open");
    document.getElementById("lbClose").focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove("lb-open");
    lbImage.removeAttribute("src");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.getElementById("lbClose").addEventListener("click", closeLightbox);
  document.getElementById("lbPrev").addEventListener("click", () => showSlide(galleryIndex - 1));
  document.getElementById("lbNext").addEventListener("click", () => showSlide(galleryIndex + 1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  let touchX = null;
  lightbox.addEventListener("touchstart", (event) => {
    touchX = event.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener("touchend", (event) => {
    if (touchX == null) return;
    const delta = event.changedTouches[0].clientX - touchX;
    if (delta > 50) showSlide(galleryIndex - 1);
    if (delta < -50) showSlide(galleryIndex + 1);
    touchX = null;
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showSlide(galleryIndex - 1);
    if (event.key === "ArrowRight") showSlide(galleryIndex + 1);
  });

  if (!reduce) {
    const layers = document.querySelectorAll("[data-parallax]");
    let frame = 0;
    window.addEventListener("scroll", () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        layers.forEach((layer) => {
          layer.style.transform = `translate3d(0, ${y * Number(layer.dataset.parallax)}px, 0)`;
        });
        frame = 0;
      });
    }, { passive: true });
  }

  renderGallery();
  applyMaps();
  updateMusicUI();
})();
