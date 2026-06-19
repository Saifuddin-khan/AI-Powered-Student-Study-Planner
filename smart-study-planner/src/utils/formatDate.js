export function formatDate(dateStr, options = {}) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
    ...options,
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now  = new Date();
  const then = new Date(dateStr);
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60)        return 'just now';
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000)   return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
}

export function getDayName(date = new Date()) {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
}

export function toISODate(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
