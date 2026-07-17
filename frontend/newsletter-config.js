/* Fairways & Friends newsletter configuration */
window.FNF_NEWSLETTER_CONFIG = {
  endpoint: "https://stick-golf-club.bonganimoyo95.workers.dev",
  formSelectors: [
  "#signup",
  "#newsletter-form",
  "[data-newsletter-form]",
  'form[action^="mailto:"]'
],
  emailSelector: 'input[type="email"]',
  firstNameSelector: 'input[name="first name"]',
  submitButtonSelector: 'button[type="submit"], input[type="submit"]',
  statusSelector: "#status",
  loadingMessage: "Adding you to the list...",
  successMessage: "Check your inbox to confirm your subscription.",
  errorMessage: "Something went wrong. Please try again."
};
