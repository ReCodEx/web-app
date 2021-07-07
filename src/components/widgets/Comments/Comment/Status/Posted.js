import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FormattedRelativeTime } from 'react-intl';

const Posted = ({ right, postedAt }) => (
  <span
    className={classnames({
      'direct-chat-timestamp': true,
      'float-right': right,
      'float-left': !right,
    })}>
    <FormattedRelativeTime value={postedAt - Date.now() / 1000} numeric="auto" updateIntervalInSeconds={1000000} />
  </span>
);

Posted.propTypes = {
  right: PropTypes.bool.isRequired,
  postedAt: PropTypes.number.isRequired,
};

export default Posted;
