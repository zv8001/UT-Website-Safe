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
          }, 150);
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
