import { safeGet } from './common';

export const createCASLoginUrl = serviceUrl =>
  `https://idp.cuni.cz/cas/login?service=${encodeURIComponent(serviceUrl)}&renew=true`;

export const createCASValidationUrl = (ticket, serviceUrl, backendUrl) =>
  `https://idp.cuni.cz/cas/p3/serviceValidate?ticket=${encodeURIComponent(ticket)}&service=${encodeURIComponent(
    serviceUrl
  )}&format=json`;

export const getTicketFromUrl = url => {
  const match = url.match(/[?&]ticket=([^&\b]+)/);
  return match === null ? null : match[1];
};

export const getProxyTicket = ({ serviceResponse }) => {
  return serviceResponse.authenticationSuccess ? serviceResponse.authenticationSuccess.proxyGrantingTicket : null;
};

export const openCASWindow = serviceUrl =>
  typeof window !== 'undefined'
    ? window.open(createCASLoginUrl(serviceUrl), 'CAS', 'modal=true,width=1024,height=850,centerscreen=yes')
    : null;

export const validateServiceTicket = (serviceTicket, serviceUrl, backendUrl, onTicketObtained, onFailed) =>
  fetch(createCASValidationUrl(serviceTicket, serviceUrl, backendUrl), {
    mode: 'no-cors',
  })
    .then(res => res.json())
    .then(res => {
      const proxyTicket = getProxyTicket(res);
      if (proxyTicket !== null) {
        onTicketObtained(proxyTicket);
      } else {
        onFailed();
      }
    })
    .catch(onFailed);

export const getExternalIdForCAS = user => safeGet(user, ['privateData', 'externalIds', 'cas-uk']);
