import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FormattedRelative } from 'react-intl';

const Posted = ({ right, postedAt }) => (
  <span
    className={classnames({
      'direct-chat-timestamp': true,
      'float-right': right,
      'float-left': !right,
    })}>
    <FormattedRelative value={postedAt * 1000} />
  </span>
);

Posted.propTypes = {
  right: PropTypes.bool.isRequired,
  postedAt: PropTypes.number.isRequired,
};

export default Posted;
