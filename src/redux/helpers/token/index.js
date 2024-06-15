import { jwtDecode } from 'jwt-decode';

export const decode = token => {
  try {
    return jwtDecode(token);
  } catch (e) {
    return null;
  }
};

export const isTokenValid = (token, now = Date.now()) => token && token.exp * 1000 > now;

export const isInScope = (token, scope) => token.scopes && token.scopes.includes(scope);

export const isTokenInNeedOfRefreshment = (token, now = Date.now()) =>
  token && isInScope(token, 'refresh') && now / 1000 - token.iat > (token.exp - token.iat) / 10; // once the first tenth of the expiration time actually expires
