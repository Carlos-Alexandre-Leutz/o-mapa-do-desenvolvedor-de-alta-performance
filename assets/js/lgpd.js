document.addEventListener("DOMContentLoaded", () => {
  const cookieBanner = document.getElementById("cookie-banner");
  const preferencesModal = document.getElementById("preferences-modal");

  // Show the banner if no consent is saved
  if (!localStorage.getItem("cookieConsent")) {
    cookieBanner.style.display = "block";
  }

  // Event: Accept All
  document.getElementById("accept-all").addEventListener("click", () => {
    localStorage.setItem("cookieConsent", JSON.stringify({
      essential: true,
      analytics: true,
      marketing: true
    }));
    cookieBanner.style.display = "none";
  });

  // Event: Manage Preferences
  document.getElementById("manage-preferences").addEventListener("click", () => {
    preferencesModal.style.display = "block";
    cookieBanner.style.display = "none";
  });

  // Event: Save Preferences
});
