(function () {
  const config = window.siteConfig || {};

  const setText = (selector, value) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.textContent = value || "";
    });
  };

  const setHref = (selector, value) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (value) el.setAttribute("href", value);
    });
  };

  setText("[data-company]", config.companyName);
  setText("[data-brand]", config.brandShort || config.companyName);
  setText("[data-email]", config.email);
  setText("[data-website]", config.website);
  setText("[data-phone]", config.phone);
  setText("[data-phone-label]", config.phoneLabel);
  setText("[data-address]", config.address);
  setText("[data-service-area]", config.serviceArea);
  setText("[data-hours]", config.businessHours);
  setText("[data-footer-text]", config.footerText);
  setText("[data-disclaimer]", config.disclaimer);
  setText("[data-company-line]", `${config.companyName} - ${config.address} - ID ${config.companyId}`);
  setText("[data-copyright]", `Copyright (c) ${new Date().getFullYear()} ${config.companyName}. All rights reserved.`);
  setHref("a[data-email-href]", `mailto:${config.email}`);
  setHref("a[data-phone-href]", `tel:${config.phoneHref}`);

  const floatingAction = document.createElement("a");
  floatingAction.className = "floating-action";
  floatingAction.href = config.phoneHref ? `tel:${config.phoneHref}` : "contact.html";
  floatingAction.setAttribute("aria-label", config.phoneLabel || "Call");
  floatingAction.innerHTML = `
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.6a2 2 0 0 1-.45 2.11L8 9.71a16 16 0 0 0 6.29 6.29l1.28-1.28a2 2 0 0 1 2.11-.45c.83.29 1.7.5 2.6.62A2 2 0 0 1 22 16.92Z"></path>
    </svg>
    <span>Call</span>
  `;
  document.body.appendChild(floatingAction);

  const footer = document.querySelector(".site-footer");
  let isFooterVisible = false;
  const updateFloatingAction = () => {
    const footerTop = footer?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
    const isFooterNearViewport = isFooterVisible || footerTop < window.innerHeight - 24;
    floatingAction.classList.toggle("is-visible", window.scrollY > 180 && !isFooterNearViewport);
  };
  updateFloatingAction();
  window.addEventListener("scroll", updateFloatingAction, { passive: true });
  window.addEventListener("resize", updateFloatingAction);
  if (footer && "IntersectionObserver" in window) {
    const footerObserver = new IntersectionObserver(
      (entries) => {
        isFooterVisible = entries.some((entry) => entry.isIntersecting);
        updateFloatingAction();
      },
      { rootMargin: "0px 0px -24px 0px" }
    );
    footerObserver.observe(footer);
  }

  document.querySelectorAll("[data-website-href]").forEach((el) => {
    if (config.website) el.setAttribute("href", `https://${config.website}`);
  });

  const cookieStorageKey = "greenscape-cookie-preferences";
  const getCookiePreference = () => {
    try {
      return window.localStorage.getItem(cookieStorageKey);
    } catch (error) {
      return null;
    }
  };
  const setCookiePreference = (value) => {
    try {
      window.localStorage.setItem(cookieStorageKey, JSON.stringify(value));
    } catch (error) {
      // If storage is unavailable, closing the banner for this session is still useful.
    }
  };

  if (!getCookiePreference()) {
    const cookieBanner = document.createElement("section");
    cookieBanner.className = "cookie-banner";
    cookieBanner.setAttribute("aria-label", "Cookie notice");
    cookieBanner.innerHTML = `
      <div class="cookie-content">
        <span class="eyebrow">Privacy choices</span>
        <h2>Cookies on this connection website</h2>
        <p>We use necessary technologies to keep this site working. Optional tools may help us understand request activity and improve this free provider connection service.</p>
        <div class="cookie-preferences" hidden>
          <label><input type="checkbox" checked disabled> Necessary site functions</label>
          <label><input type="checkbox" data-cookie-option="analytics"> Analytics and performance</label>
          <label><input type="checkbox" data-cookie-option="marketing"> Advertising and lead attribution</label>
        </div>
        <div class="cookie-links">
          <a href="cookie-policy.html">Cookie Policy</a>
          <a href="privacy-policy.html">Privacy Policy</a>
        </div>
      </div>
      <div class="cookie-actions">
        <button class="btn" type="button" data-cookie-choice="accept">Accept all</button>
        <button class="btn btn-outline" type="button" data-cookie-choice="necessary">Necessary only</button>
        <button class="cookie-manage" type="button" data-cookie-manage aria-expanded="false">Manage</button>
      </div>
    `;
    document.body.appendChild(cookieBanner);
    document.body.classList.add("cookie-open");

    const preferences = cookieBanner.querySelector(".cookie-preferences");
    const manageButton = cookieBanner.querySelector("[data-cookie-manage]");
    const analyticsOption = cookieBanner.querySelector("[data-cookie-option='analytics']");
    const marketingOption = cookieBanner.querySelector("[data-cookie-option='marketing']");

    const closeCookieBanner = (choice) => {
      setCookiePreference({
        necessary: true,
        analytics: Boolean(choice.analytics),
        marketing: Boolean(choice.marketing),
        decision: choice.decision,
        updatedAt: new Date().toISOString()
      });
      cookieBanner.classList.add("is-hiding");
      document.body.classList.remove("cookie-open");
      window.setTimeout(() => cookieBanner.remove(), 220);
    };

    manageButton?.addEventListener("click", () => {
      const isOpen = !preferences.hidden;
      if (isOpen) {
        closeCookieBanner({
          decision: "custom",
          analytics: Boolean(analyticsOption?.checked),
          marketing: Boolean(marketingOption?.checked)
        });
        return;
      }

      preferences.hidden = false;
      manageButton.setAttribute("aria-expanded", "true");
      manageButton.textContent = "Save choices";
    });

    cookieBanner.querySelectorAll("[data-cookie-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const choice = button.getAttribute("data-cookie-choice");
        if (choice === "custom" && preferences.hidden) return;
        closeCookieBanner({
          decision: choice,
          analytics: choice === "accept" || (choice === "custom" && analyticsOption?.checked),
          marketing: choice === "accept" || (choice === "custom" && marketingOption?.checked)
        });
      });
    });
  }

  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  if (menuToggle && nav) {
    const setMenuOpen = (isOpen) => {
      nav.classList.toggle("is-open", isOpen);
      document.body.classList.toggle("nav-open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.textContent = isOpen ? "Close" : "Menu";
      if (!isOpen) {
        nav.querySelectorAll(".nav-dropdown.is-open").forEach((dropdown) => dropdown.classList.remove("is-open"));
      }
    };

    menuToggle.addEventListener("click", () => {
      setMenuOpen(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll(".nav-drop-trigger").forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        if (window.matchMedia("(max-width: 1120px)").matches) {
          event.preventDefault();
          trigger.closest(".nav-dropdown")?.classList.toggle("is-open");
        }
      });
    });

    nav.querySelectorAll("a").forEach((link) => {
      if (link.classList.contains("nav-drop-trigger")) return;
      link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track");
    const items = [...carousel.querySelectorAll(".carousel-item")];
    const prev = carousel.querySelector("[data-prev]");
    const next = carousel.querySelector("[data-next]");
    if (!track || items.length < 2) return;

    let index = 0;
    const show = (nextIndex) => {
      index = (nextIndex + items.length) % items.length;
      track.style.transform = `translateX(-${index * 100}%)`;
    };
    const advance = () => show(index + 1);
    let timer = window.setInterval(advance, 4200);
    const restart = () => {
      window.clearInterval(timer);
      timer = window.setInterval(advance, 4200);
    };

    prev?.addEventListener("click", () => {
      show(index - 1);
      restart();
    });
    next?.addEventListener("click", () => {
      show(index + 1);
      restart();
    });
  });

  document.querySelectorAll("[data-accordion]").forEach((accordion) => {
    accordion.querySelectorAll(".faq-question").forEach((button) => {
      const item = button.closest(".faq-item");
      const panelId = button.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!item || !panel) return;

      button.addEventListener("click", () => {
        const isOpen = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!isOpen));
        panel.hidden = isOpen;
        item.classList.toggle("is-open", !isOpen);
      });
    });
  });

  const confirmationModal = document.createElement("div");
  confirmationModal.className = "confirmation-modal";
  confirmationModal.hidden = true;
  confirmationModal.innerHTML = `
    <div class="confirmation-backdrop" data-modal-close></div>
    <section class="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-text" tabindex="-1">
      <button class="confirmation-close" type="button" aria-label="Close confirmation" data-modal-close>
        <span aria-hidden="true">&times;</span>
      </button>
      <div class="confirmation-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M20 6 9 17l-5-5"></path>
        </svg>
      </div>
      <span class="eyebrow">Request received</span>
      <h2 id="confirmation-title">Your request was sent.</h2>
      <p id="confirmation-text">${config.formSuccess || `Thank you. ${config.companyName || "Our team"} will contact you soon.`}</p>
      <p class="confirmation-note">This website helps connect homeowners with independent local providers. Please verify licensing, insurance, scope, and pricing directly before hiring.</p>
      <div class="confirmation-actions">
        <a class="btn" href="${config.phoneHref ? `tel:${config.phoneHref}` : "contact.html"}">Call Now</a>
        <button class="btn btn-outline" type="button" data-modal-close>Back to page</button>
      </div>
    </section>
  `;
  document.body.appendChild(confirmationModal);

  const confirmationDialog = confirmationModal.querySelector(".confirmation-dialog");
  let modalReturnFocus = null;

  const closeConfirmationModal = () => {
    confirmationModal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    window.setTimeout(() => {
      confirmationModal.hidden = true;
    }, 220);
    modalReturnFocus?.focus?.();
  };

  const openConfirmationModal = (returnFocus) => {
    modalReturnFocus = returnFocus || document.activeElement;
    confirmationModal.hidden = false;
    window.requestAnimationFrame(() => {
      confirmationModal.classList.add("is-open");
      document.body.classList.add("modal-open");
      confirmationDialog?.focus();
    });
  };

  confirmationModal.querySelectorAll("[data-modal-close]").forEach((control) => {
    control.addEventListener("click", closeConfirmationModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && confirmationModal.classList.contains("is-open")) {
      closeConfirmationModal();
    }
  });

  document.querySelectorAll("form[data-contact-form]").forEach((form) => {
    const message = form.querySelector(".success-message");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = form.querySelector("[type='submit']");
      if (message) {
        message.textContent = "";
        message.hidden = true;
      }
      submitButton?.setAttribute("disabled", "disabled");

      try {
        const response = await fetch(form.action || "handler.php", {
          method: form.method || "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.ok === false) {
          throw new Error(result.message || "Request could not be sent. Please call or email us directly.");
        }
        form.reset();
        openConfirmationModal(submitButton);
      } catch (error) {
        if (message) {
          message.textContent = error.message || "Request could not be sent. Please call or email us directly.";
          message.hidden = false;
        }
      } finally {
        submitButton?.removeAttribute("disabled");
      }
    });
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
})();
