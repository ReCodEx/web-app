import decodeJwt from 'jwt-decode';

export const decode = token => {
  try {
    return decodeJwt(token);
  } catch (e) {
    return null;
  }
};

export const isTokenValid = (token, now = Date.now()) =>
  token && token.exp * 1000 > now;

export const willExpireSoon = (token, now = Date.now()) =>
  token && token.exp - now / 1000 < (token.exp - token.iat) / 3; // last third of the validity period

export const isInScope = (token, scope) =>
  token.scopes && token.scopes.indexOf(scope) >= 0;
