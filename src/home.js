(function loadPublicStats() {
  const countEl = document.getElementById('registered-users-count');
  if (!countEl) {
    return;
  }

  const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

  function setCount(value) {
    const count = Number(value || 0);
    countEl.textContent = formatter.format(count);
  }

  fetch('/api/public/stats', { headers: { Accept: 'application/json' } })
    .then((response) => response.ok ? response.json() : null)
    .then((payload) => {
      if (!payload?.ok) {
        countEl.textContent = 'Live';
        return;
      }
      setCount(payload.registeredUsers);
    })
    .catch(() => {
      countEl.textContent = 'Live';
    });
})();
