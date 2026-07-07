/**
 * Site-wide configuration.
 * Change these values here — they are the single source of truth
 * for product name and contact email across the site.
 */
window.SITE_CONFIG = {
  productName: "Anthony AI Factory",
  contactEmail: "Paghubasanantonio7@gmail.com",
  privacyLastUpdated: "2026-07-07",
  termsLastUpdated: "2026-07-07",
};

(function applyConfig() {
  var cfg = window.SITE_CONFIG;
  document.querySelectorAll("[data-config]").forEach(function (el) {
    var key = el.getAttribute("data-config");
    if (Object.prototype.hasOwnProperty.call(cfg, key)) {
      el.textContent = cfg[key];
    }
  });
  document.querySelectorAll("[data-config-href]").forEach(function (el) {
    var key = el.getAttribute("data-config-href");
    if (key === "contactEmail") {
      el.setAttribute("href", "mailto:" + cfg.contactEmail);
    }
  });
})();
