export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

export function truncate(str, length = 80) {
  if (!str || str.length <= length) return str;
  return str.slice(0, length) + '…';
}

export function capitalize(str = '') {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong'
  );
}

export function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
