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

(function configureDownloadLinks() {
  const primaryDownload = document.getElementById('download-action');
  const androidLink = document.getElementById('download-android-link');
  const windowsLink = document.getElementById('download-windows-link');
  const flatpakLink = document.getElementById('download-flatpak-link');

  if (!primaryDownload) {
    return;
  }

  const userAgent = String(navigator.userAgent || '').toLowerCase();
  const platform = userAgent.includes('android')
    ? 'android'
    : userAgent.includes('windows')
      ? 'windows'
      : userAgent.includes('linux') || userAgent.includes('x11')
        ? 'flatpak'
        : 'source';

  const labels = {
    android: 'Download Android APK',
    windows: 'Download Windows Installer',
    flatpak: 'Download Flatpak',
    source: 'View Downloads'
  };

  function applyDownloads(downloads = {}) {
    const fallback = {
      android: '/download/android',
      windows: '/download/windows',
      flatpak: '/download/flatpak',
      source: 'https://github.com/JelloDog-Applications/JelloChat-electron/releases/latest'
    };
    const urls = { ...fallback, ...downloads };
    primaryDownload.textContent = labels[platform] || labels.source;
    primaryDownload.href = urls[platform] || urls.source;
    if (androidLink) {
      androidLink.href = urls.android;
    }
    if (windowsLink) {
      windowsLink.href = urls.windows;
    }
    if (flatpakLink) {
      flatpakLink.href = urls.flatpak;
    }
  }

  applyDownloads();

  fetch('/api/public/downloads', { headers: { Accept: 'application/json' } })
    .then((response) => response.ok ? response.json() : null)
    .then((payload) => {
      if (payload?.ok) {
        applyDownloads(payload.downloads);
      }
    })
    .catch(() => {
    });
})();
