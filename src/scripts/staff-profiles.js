(function () {
  const DEFAULT_PROFILE_URL = "https://remoteadmin.unknown-technologies.net/public/staff-profiles.json";
  const PROFILE_URL = window.UT_PUBLIC_STAFF_PROFILES_URL || DEFAULT_PROFILE_URL;

  function applyText(card, selector, value) {
    if (!value) return;
    const el = card.querySelector(selector);
    if (el) el.textContent = value;
  }

  function applyAvatar(card, value, displayName) {
    if (!value) return;
    const img = card.querySelector(".staff-avatar, .ownership-avatar");
    if (!img) return;
    img.src = value;
    if (displayName) img.alt = displayName;
  }

  function profileMap(data) {
    const map = new Map();
    const profiles = Array.isArray(data && data.profiles) ? data.profiles : [];
    profiles.forEach(profile => {
      const publicId = String(profile && profile.publicId || "").trim();
      if (publicId) map.set(publicId, profile);
    });
    return map;
  }

  async function loadPublicStaffProfiles() {
    const cards = Array.from(document.querySelectorAll("[data-public-staff-id]"))
      .filter(card => String(card.dataset.publicStaffId || "").trim());
    if (!cards.length) return;

    let response;
    try {
      response = await fetch(PROFILE_URL, {
        credentials: "omit",
        cache: "no-store",
        headers: { "Accept": "application/json" },
      });
    } catch (_) {
      return;
    }
    if (!response || !response.ok) return;

    let data;
    try {
      data = await response.json();
    } catch (_) {
      return;
    }

    const profiles = profileMap(data);
    cards.forEach(card => {
      const publicId = String(card.dataset.publicStaffId || "").trim();
      const profile = profiles.get(publicId);
      if (!profile) return;
      applyText(card, ".staff-name, .ownership-name", profile.displayName);
      applyText(card, ".staff-role, .ownership-role", profile.role);
      applyText(card, ".staff-bio, .ownership-bio", profile.bio);
      applyAvatar(card, profile.avatarUrl, profile.displayName);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadPublicStaffProfiles, { once: true });
  } else {
    loadPublicStaffProfiles();
  }
})();
