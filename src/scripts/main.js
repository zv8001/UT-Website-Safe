(function () {
  function currentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  function markActiveNavigation() {
    const page = currentPage();
    document.querySelectorAll('.navbar-links a').forEach(function (link) {
      const href = link.getAttribute('href');
      const target = href ? href.split('/').pop() : '';
      link.classList.toggle('active', target === page);
    });
  }

  function setupMobileNavigation() {
    const toggle = document.querySelector('.navbar-toggle');
    const menu = document.querySelector('.navbar-links.mobile-menu');
    if (!toggle || !menu) return;

    function closeMenu() {
      toggle.classList.remove('active');
      menu.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function () {
      const open = menu.classList.toggle('active');
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('click', function (event) {
      if (!toggle.contains(event.target) && !menu.contains(event.target)) {
        closeMenu();
      }
    });
  }

  markActiveNavigation();
  setupMobileNavigation();
})();
