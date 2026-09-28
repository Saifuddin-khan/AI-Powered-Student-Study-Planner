const ACCESS_TOKEN_KEY  = 'ssp_access_token';
const REFRESH_TOKEN_KEY = 'ssp_refresh_token';
const USER_KEY          = 'ssp_user';
const ADMIN_STASH_KEY   = 'ssp_admin_stash';

export function getAccessToken()  { return localStorage.getItem(ACCESS_TOKEN_KEY); }
export function getRefreshToken() { return localStorage.getItem(REFRESH_TOKEN_KEY); }
export function getStoredUser()   {
  const raw = localStorage.getItem(USER_KEY);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem(ACCESS_TOKEN_KEY,  accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function setStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/* ── Impersonation ───────────────────────────────────────────────
   While impersonating, the admin's real session (tokens + user) is
   stashed here, and the normal auth keys above are overwritten with
   the impersonated user's session. No refresh token is issued for an
   impersonation session by design, so it naturally expires with the
   access token if "Return to Admin" is never clicked. */

export function stashAdminSession() {
  const stash = {
    accessToken:  getAccessToken(),
    refreshToken: getRefreshToken(),
    user:         getStoredUser(),
  };
  localStorage.setItem(ADMIN_STASH_KEY, JSON.stringify(stash));
}

export function getAdminStash() {
  const raw = localStorage.getItem(ADMIN_STASH_KEY);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function clearAdminStash() {
  localStorage.removeItem(ADMIN_STASH_KEY);
}

export function isImpersonating() {
  return !!getAdminStash();
}

export function setImpersonationSession(accessToken, user) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  setStoredUser(user);
}
