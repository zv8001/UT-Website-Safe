(function () {
  document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.domain-warning-banner')) return;

    const Banner = document.createElement('div');
    Banner.className = 'domain-warning-banner';
    Banner.setAttribute('role', 'alert');
    Banner.setAttribute('aria-live', 'polite');

    const Marker = document.createElement('span');
    Marker.className = 'domain-warning-marker';
    Marker.setAttribute('aria-hidden', 'true');
    Marker.textContent = '!';

    const Message = document.createElement('span');

    const WarningLead = document.createElement('strong');
    WarningLead.textContent = 'Important domain notice: ';

    const OldDomain = document.createElement('span');
    OldDomain.textContent = 'http://unknown-technologies.us/';

    const MiddleText = document.createTextNode(' is no longer owned or maintained by Unknown Technologies. All official routes use ');

    const OfficialLink = document.createElement('a');
    OfficialLink.href = 'https://unknown-technologies.net/';
    OfficialLink.textContent = 'https://unknown-technologies.net/';
    OfficialLink.rel = 'noopener noreferrer';

    Message.append(WarningLead, OldDomain, MiddleText, OfficialLink);
    Banner.append(Marker, Message);
    document.body.prepend(Banner);
  });
})();

(function () {
  const links = document.querySelectorAll('.navbar-links a');
  const current = location.pathname.split('/').pop() || 'index.html';
  links.forEach(function (a) {
    const href = a.getAttribute('href').split('/').pop();
    if (href === current) a.classList.add('active');
    else a.classList.remove('active');
  });
  
})();


(function () {
  document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.navbar-links a, a[href^="./"]');

    navLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        const href = link.getAttribute('href');
        if (href && (href.startsWith('./') || href.startsWith('/') || !href.includes('://'))) {
          e.preventDefault();


          const mobileMenu = document.querySelector('.navbar-links.mobile-menu');
          const toggleButton = document.querySelector('.navbar-toggle');
          if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            toggleButton.classList.remove('active');
          }



          document.body.classList.add('fade-out');

          setTimeout(function() {
            window.location.href = href;
          }, 300);
        }
      });
    });
    const toggleButton = document.querySelector('.navbar-toggle');
    const mobileMenu = document.querySelector('.navbar-links.mobile-menu');
    if (toggleButton && mobileMenu) {
      toggleButton.addEventListener('click', function() {
        toggleButton.classList.toggle('active');
        mobileMenu.classList.toggle('active');
      });
      document.addEventListener('click', function(e) {
        if (!toggleButton.contains(e.target) && !mobileMenu.contains(e.target)) {
          toggleButton.classList.remove('active');
          mobileMenu.classList.remove('active');
        }
      });
    }
  });
})();
