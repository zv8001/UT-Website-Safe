(function () {
  const DEFAULT_PROFILE_URL = "https://remoteadmin.unknown-technologies.net/public/staff-profiles.json";
  const PROFILE_URL = window.UT_PUBLIC_STAFF_PROFILES_URL || DEFAULT_PROFILE_URL;
  let nextBioId = 0;
  let resizeTimer;

  function applyText(card, selector, value) {
    if (!value) return;
    const element = card.querySelector(selector);
    if (element) element.textContent = value;
  }

  function applyAvatar(card, value, displayName) {
    if (!value) return;
    const image = card.querySelector(".staff-avatar, .ownership-avatar");
    if (!image) return;
    image.src = value;
    if (displayName) image.alt = displayName;
  }

  function setBioExpanded(card, bio, toggle, expanded) {
    card.classList.toggle("bio-expanded", expanded);
    bio.classList.toggle("is-expanded", expanded);
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.textContent = expanded ? "Read less" : "Read more";
  }

  function ensureBioControl(card) {
    const bio = card.querySelector(".staff-bio, .ownership-bio");
    if (!bio) return;

    let toggle = card.querySelector(".staff-bio-toggle");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "staff-bio-toggle";
      toggle.hidden = true;
      if (!bio.id) {
        nextBioId += 1;
        bio.id = "staff-bio-" + nextBioId;
      }
      toggle.setAttribute("aria-controls", bio.id);
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "Read more";
      bio.insertAdjacentElement("afterend", toggle);
      toggle.addEventListener("click", function () {
        setBioExpanded(card, bio, toggle, !bio.classList.contains("is-expanded"));
      });
    }

    window.requestAnimationFrame(function () {
      const expanded = bio.classList.contains("is-expanded");
      if (expanded) return;
      const overflows = bio.scrollHeight > bio.clientHeight + 1 || bio.textContent.trim().length > 150;
      toggle.hidden = !overflows;
      if (!overflows) setBioExpanded(card, bio, toggle, false);
    });
  }

  function refreshBioControls() {
    document.querySelectorAll(".staff-card, .ownership-card").forEach(ensureBioControl);
  }

  function profileMap(data) {
    const map = new Map();
    const profiles = Array.isArray(data && data.profiles) ? data.profiles : [];
    profiles.forEach(function (profile) {
      const publicId = String(profile && profile.publicId || "").trim();
      if (publicId) map.set(publicId, profile);
    });
    return map;
  }

  async function loadPublicStaffProfiles() {
    const cards = Array.from(document.querySelectorAll("[data-public-staff-id]"))
      .filter(function (card) {
        return String(card.dataset.publicStaffId || "").trim();
      });
    if (!cards.length) return;

    let response;
    try {
      response = await fetch(PROFILE_URL, {
        credentials: "omit",
        cache: "no-store",
        headers: { "Accept": "application/json" }
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
    cards.forEach(function (card) {
      const publicId = String(card.dataset.publicStaffId || "").trim();
      const profile = profiles.get(publicId);
      if (!profile) return;
      applyText(card, ".staff-name, .ownership-name", profile.displayName);
      applyText(card, ".staff-role, .ownership-role", profile.role);
      applyText(card, ".staff-bio, .ownership-bio", profile.bio);
      applyAvatar(card, profile.avatarUrl, profile.displayName);
      ensureBioControl(card);
    });
  }

  function initialize() {
    refreshBioControls();
    loadPublicStaffProfiles();
  }

  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(refreshBioControls, 120);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
