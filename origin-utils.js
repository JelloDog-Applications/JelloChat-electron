function isLocalOrPrivateHost(hostname) {
  const host = String(hostname || '').toLowerCase();
  if (!host) {
    return false;
  }
  if (['localhost', '127.0.0.1', '::1', '[::1]', 'localhost.localdomain'].includes(host)) {
    return true;
  }
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
    return true;
  }
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) {
    return true;
  }
  const match = host.match(/^172\.(\d{1,2})\.\d{1,3}\.\d{1,3}$/);
  if (match) {
    const second = Number(match[1]);
    return second >= 16 && second <= 31;
  }
  return host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.lan') || host.endsWith('.home.arpa');
}

function isAllowedOrigin(origin) {
  if (!origin) {
    return false;
  }
  try {
    const parsed = new URL(origin);
    if (['http:', 'https:'].includes(parsed.protocol)) {
      return isLocalOrPrivateHost(parsed.hostname);
    }
    return false;
  } catch (_error) {
    return false;
  }
}

module.exports = {
  isLocalOrPrivateHost,
  isAllowedOrigin
};
