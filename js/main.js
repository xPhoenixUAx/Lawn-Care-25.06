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

  const updateFloatingAction = () => {
    floatingAction.classList.toggle("is-visible", window.scrollY > 180);
  };
  updateFloatingAction();
  window.addEventListener("scroll", updateFloatingAction, { passive: true });

  document.querySelectorAll("[data-website-href]").forEach((el) => {
    if (config.website) el.setAttribute("href", `https://${config.website}`);
  });

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

  document.querySelectorAll("form[data-contact-form]").forEach((form) => {
    const message = form.querySelector(".success-message");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (message) {
        message.textContent = config.formSuccess || `Thank you. ${config.companyName} will contact you soon.`;
        message.hidden = false;
      }
      form.reset();
    });
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
})();
