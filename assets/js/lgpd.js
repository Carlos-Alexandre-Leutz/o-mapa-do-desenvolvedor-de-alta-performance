document.addEventListener("DOMContentLoaded", () => {
  const cookieBanner = document.getElementById("cookie-banner");
  const preferencesModal = document.getElementById("preferences-modal");
  const managePreferences = document.getElementById("manage-preferences");

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
  if(managePreferences) {
    managePreferences.addEventListener("click", () => {
      preferencesModal.style.display = "block";
      cookieBanner.style.display = "none";
    });
  }
});
