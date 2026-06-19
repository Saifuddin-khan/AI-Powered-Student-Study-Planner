export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password) {
  return password && password.length >= 6;
}

export function validateRequired(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}
