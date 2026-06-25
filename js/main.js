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
  setText("[data-company-line]", `${config.companyName} - ${config.address} - ID ${config.companyId}`);
  setText("[data-copyright]", `Copyright (c) ${new Date().getFullYear()} ${config.companyName}. All rights reserved.`);
  setHref("a[data-email-href]", `mailto:${config.email}`);
  setHref("a[data-phone-href]", `tel:${config.phoneHref}`);

  document.querySelectorAll("[data-website-href]").forEach((el) => {
    if (config.website) el.setAttribute("href", `https://${config.website}`);
  });

  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
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
})();
