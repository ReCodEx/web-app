import React from 'react';
import { FormattedMessage } from 'react-intl';

const apiErrorCodes = {
  '400-101': <FormattedMessage id="app.apiErrorCodes.400-101" defaultMessage="The credentials are not valid." />,
  '403-001': <FormattedMessage id="app.apiErrorCodes.403-001" defaultMessage="The user account does not exist." />,
  '403-002': <FormattedMessage id="app.apiErrorCodes.403-002" defaultMessage="The user account has been disabled." />,
};

export const getErrorMessage = error => {
  const code = error && error.code;
  if (code && apiErrorCodes[code]) {
    return apiErrorCodes[code];
  } else {
    return (
      (error && error.message) || (
        <FormattedMessage id="app.apiErrorCodes.unknown" defaultMessage="Unknown API error." />
      )
    );
  }
};
