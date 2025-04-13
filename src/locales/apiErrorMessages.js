import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';

const apiErrorCodes = defineMessages({
  '400-001': {
    id: 'app.apiErrorCodes.400-001',
    defaultMessage:
      'The user has multiple e-mail addresses and multiple matching accounts already exist. Accounts cannot be associated due to ambiguity.',
  },
  '400-003': {
    id: 'app.apiErrorCodes.400-003',
    defaultMessage: 'Uploaded file name contains invalid characters.',
  },
  '400-004': {
    id: 'app.apiErrorCodes.400-004',
    defaultMessage: 'Uploaded file size does not meet server limitations.',
  },
  '400-010': {
    id: 'app.apiErrorCodes.400-010',
    defaultMessage:
      'The data were modified by someone else while you were editing them (a newer version exist). The update was aborted to prevent accidental overwrite of recent modifications.',
  },
  '400-101': { id: 'app.apiErrorCodes.400-101', defaultMessage: 'The credentials are not valid.' },
  '400-104': {
    id: 'app.apiErrorCodes.400-104',
    defaultMessage: 'User was correctly authenticated, but there is no corresponding account in ReCodEx.',
  },
  '400-105': {
    id: 'app.apiErrorCodes.400-105',
    defaultMessage:
      'Attempt to register a new user failed since external authenticator did not provide a role. The external user identity may not have required attributes.',
  },
  '400-110': {
    id: 'app.apiErrorCodes.400-110',
    defaultMessage: 'A user with the same email address already exists.',
  },
  '400-501': {
    id: 'app.apiErrorCodes.400-501',
    defaultMessage: 'The group is archived, it cannot be modified.',
  },
  '403-000': {
    id: 'app.apiErrorCodes.403-000',
    defaultMessage: 'Insufficient privileges to access requested resource or to perform requested operation.',
  },
  '403-001': { id: 'app.apiErrorCodes.403-001', defaultMessage: 'The user account does not exist.' },
  '403-002': { id: 'app.apiErrorCodes.403-002', defaultMessage: 'The user account has been disabled.' },
  '403-003': {
    id: 'app.apiErrorCodes.403-003',
    defaultMessage:
      'Your user account is currently locked in a secure mode. Requests are accepted only from IP address {lockedAddress}.',
  },
  '404-000': { id: 'app.apiErrorCodes.404-000', defaultMessage: 'Resource not found.' },
  '409_100': {
    id: 'app.apiErrorCodes.409_100',
    defaultMessage:
      'The user data received from the CAS contain no affiliation attributes that would match current registration policies.',
  },
  '409_101': {
    id: 'app.apiErrorCodes.409_101',
    defaultMessage: 'The user attributes received from the CAS do not contain an email address, which is required.',
  },
  '409_102': {
    id: 'app.apiErrorCodes.409_102',
    defaultMessage: 'The user attributes received from the CAS are incomplete.',
  },
  '500-000': { id: 'app.apiErrorCodes.500-000', defaultMessage: 'Unexpected internal error.' },
});

const apiBaseErrorCodes = defineMessages({
  400: {
    id: 'app.apiErrorCodes.400',
    defaultMessage: 'Bad request',
  },
  401: {
    id: 'app.apiErrorCodes.401',
    defaultMessage: 'User not authenticated',
  },
  403: {
    id: 'app.apiErrorCodes.403',
    defaultMessage: 'Insufficient privileges',
  },
  404: { id: 'app.apiErrorCodes.404', defaultMessage: 'Resource not found' },
  409: { id: 'app.apiErrorCodes.409', defaultMessage: 'Unresolvable conflict' },
  500: { id: 'app.apiErrorCodes.500', defaultMessage: 'Internal server error' },
  501: { id: 'app.apiErrorCodes.501', defaultMessage: 'Feature not implemented' },
});

/*
 * Public methods
 */

/**
 * Is given structure an error report with a known code?
 * @param {Object} error structure
 * @returns {Boolean}
 */
export const hasErrorMessage = error =>
  Boolean(error && typeof error === 'object' && error.code && apiErrorCodes[error.code]);

/**
 * Get error code in its raw form xxx-yyy
 * @param {Object} error structure
 * @returns {String} error code
 */
export const getErrorCode = error => (error && error.code) || null;

/**
 * Get error code parsed as an array of two ints
 * @param {Object} error structure
 * @returns {Integer[]} [major,minor]
 */
export const getErrorCodeStructured = error => {
  const code = getErrorCode(error);
  const tokens = (code && code.split('-')) || [];
  return [null, null].map((_, idx) => parseInt(tokens[idx])).map(x => (isNaN(x) ? null : x));
};

export const getErrorMessage =
  formatMessage =>
  (
    error,
    fallbackMessage = <FormattedMessage id="app.apiErrorCodes.unknown" defaultMessage="Unknown API error." />
  ) => {
    const code = getErrorCode(error);
    const parameters = (error && error.parameters) || {};
    if (code && apiErrorCodes[code]) {
      return formatMessage(apiErrorCodes[code], parameters);
    } else {
      return (error && error.message) || fallbackMessage;
    }
  };

export const getBaseErrorMessage =
  formatMessage =>
  (
    error,
    fallbackMessage = <FormattedMessage id="app.apiErrorCodes.unknown" defaultMessage="Unknown API error." />
  ) => {
    const codePrefix = getErrorCodeStructured(error)[0];
    if (codePrefix && apiBaseErrorCodes[codePrefix]) {
      return formatMessage(apiBaseErrorCodes[codePrefix]);
    } else {
      return fallbackMessage;
    }
  };
