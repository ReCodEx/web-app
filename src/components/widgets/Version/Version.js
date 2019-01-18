import React from 'react';
import PropTypes from 'prop-types';
import { FormattedNumber, FormattedMessage } from 'react-intl';
import DateTime from '../DateTime';

const Version = ({ version, createdAt, updatedAt }) =>
  <span>
    <span className="em-padding-right">
      v<FormattedNumber value={version} />
    </span>
    {updatedAt !== createdAt &&
      <small className="text-muted">
        <FormattedMessage
          id="generic.lastUpdatedAt"
          defaultMessage="updated"
        />{' '}
        <DateTime unixts={updatedAt} showRelative />
      </small>}
  </span>;

Version.propTypes = {
  version: PropTypes.number.isRequired,
  createdAt: PropTypes.number.isRequired,
  updatedAt: PropTypes.number.isRequired
};

export default Version;
