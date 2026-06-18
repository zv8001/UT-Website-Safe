(function () {
  var form = document.getElementById('ct-form');
  var btn = form.querySelector('[type="submit"]');
  var status = document.getElementById('ct-status');

  fetch('https://api.unknown-technologies.net/', { method: 'GET', cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(); })
    .catch(function () {
      btn.disabled = true;
      btn.style.opacity = '0.45';
      btn.style.cursor = 'not-allowed';
      status.textContent = 'The UT proxy server is not responding contact management immediately!';
      status.style.color = '#fca5a5';
    });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var token = (form.elements['cf-turnstile-response'] || {}).value || '';
    if (!token) {
      status.textContent = 'Please complete the CAPTCHA.';
      status.style.color = '#fca5a5';
      return;
    }
    var origHTML = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'Sending\u2026';
    fetch('https://api.unknown-technologies.net/web/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.elements.name.value,
        email: form.elements.email.value,
        title: form.elements.title.value,
        reason: form.elements.reason.value,
        turnstile_token: token
      })
    })
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      status.textContent = "Message sent! We'll be in touch within 3\u20135 business days.";
      status.style.color = '#86efac';
      form.reset();
      if (window.turnstile) turnstile.reset('#ct-turnstile');
    })
    .catch(function () {
      status.textContent = 'Something went wrong. Please try again or reach us on Discord.';
      status.style.color = '#fca5a5';
      if (window.turnstile) turnstile.reset('#ct-turnstile');
    })
    .finally(function () {
      btn.disabled = false;
      btn.innerHTML = origHTML;
    });
  });
})();
