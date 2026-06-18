(function () {
  var form = document.getElementById('aff-form');
  var btn = form.querySelector('[type="submit"]');
  var status = document.getElementById('aff-status');

  fetch('https://api.unknown-technologies.net/', { method: 'GET', cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(); })
    .catch(function () {
      btn.disabled = true;
      btn.style.opacity = '0.45';
      btn.style.cursor = 'not-allowed';
      status.textContent = 'the UT proxy server is not responding contact management immediately';
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
    btn.textContent = 'Submitting\u2026';
    fetch('https://api.unknown-technologies.net/web/affiliate_request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: form.elements.company.value,
        group: form.elements.group.value,
        discord: form.elements.discord.value,
        email: form.elements.email.value,
        interested: form.elements.interested.value,
        TypeOfProj: form.elements.TypeOfProj.value,
        OwnProj: form.elements.OwnProj.value,
        notes: form.elements.notes.value,
        turnstile_token: token
      })
    })
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      status.textContent = 'Request submitted! We will reach out if we decide to move forward.';
      status.style.color = '#86efac';
      form.reset();
      if (window.turnstile) turnstile.reset('#aff-turnstile');
    })
    .catch(function () {
      status.textContent = 'Something went wrong. Please try again later.';
      status.style.color = '#fca5a5';
      if (window.turnstile) turnstile.reset('#aff-turnstile');
    })
    .finally(function () {
      btn.disabled = false;
      btn.innerHTML = origHTML;
    });
  });
})();
