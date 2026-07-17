/* Fairways & Friends to Beehiiv bridge */
(() => {
  "use strict";
  const config = window.FNF_NEWSLETTER_CONFIG;
  if (!config || !config.endpoint) {
    console.error("Newsletter integration: missing configuration.");
    return;
  }
  const selectors = Array.isArray(config.formSelectors)
    ? config.formSelectors
    : [config.formSelector].filter(Boolean);
  const form = selectors.map((selector) => document.querySelector(selector)).find(Boolean);
  if (!form) {
    console.error("Newsletter integration: no matching form found.", selectors);
    return;
  }
  const emailInput = form.querySelector(config.emailSelector || 'input[type="email"]');
  if (!emailInput) {
    console.error("Newsletter integration: no email input found.");
    return;
  }
  const firstNameInput = config.firstNameSelector ? form.querySelector(config.firstNameSelector) : null;
  const submitButton = form.querySelector(config.submitButtonSelector || 'button[type="submit"], input[type="submit"]');
  let statusElement = config.statusSelector ? document.querySelector(config.statusSelector) : null;
  if (!statusElement) {
    statusElement = document.createElement("p");
    statusElement.id = "newsletter-status";
    statusElement.setAttribute("aria-live", "polite");
    statusElement.setAttribute("role", "status");
    statusElement.style.marginTop = "0.75rem";
    form.insertAdjacentElement("afterend", statusElement);
  }
  const startedAt = Date.now();
  let busy = false;
  const setStatus = (message, state) => {
    statusElement.textContent = message;
    statusElement.dataset.state = state || "";
  };
  const setBusy = (isBusy) => {
    busy = isBusy;
    form.setAttribute("aria-busy", String(isBusy));
    if (submitButton) submitButton.disabled = isBusy;
  };
  async function subscribe() {
    if (busy) return;
    const email = emailInput.value.trim();
    const firstName = firstNameInput ? firstNameInput.value.trim() : "";
    if (!email || !emailInput.checkValidity()) {
      emailInput.reportValidity();
      return;
    }
    setBusy(true);
    setStatus(config.loadingMessage || "Adding you to the list...", "loading");
    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          pageUrl: window.location.href,
          startedAt,
          company: ""
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Subscription failed.");
      form.reset();
      setStatus(data.message || config.successMessage || "Check your inbox to confirm your subscription.", "success");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setStatus(config.errorMessage || "Something went wrong. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }
  form.addEventListener("click", (event) => {
    const submitter = event.target.closest('button[type="submit"], input[type="submit"]');
    if (!submitter || !form.contains(submitter)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    subscribe();
  }, true);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    subscribe();
  }, true);
})();
