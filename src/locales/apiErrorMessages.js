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
  '400-106': { id: 'app.apiErrorCodes.400-106', defaultMessage: 'The user is already registered.' },
  '403-001': { id: 'app.apiErrorCodes.403-001', defaultMessage: 'The user account does not exist.' },
  '403-002': { id: 'app.apiErrorCodes.403-002', defaultMessage: 'The user account has been disabled.' },
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

export const hasErrorMessage = error => Boolean(error && error.code && apiErrorCodes[error.code]);

export const getErrorMessage =
  formatMessage =>
  (
    error,
    fallbackMessage = <FormattedMessage id="app.apiErrorCodes.unknown" defaultMessage="Unknown API error." />
  ) => {
    const code = error && error.code;
    const parameters = (error && error.parameters) || {};
    if (code && apiErrorCodes[code]) {
      return formatMessage(apiErrorCodes[code], parameters);
    } else {
      return (error && error.message) || fallbackMessage;
    }
  };
