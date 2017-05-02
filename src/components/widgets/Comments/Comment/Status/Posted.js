import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedRelative } from 'react-intl';

const Posted = ({
  right,
  postedAt
}) => (
  <span className={classNames({
    'direct-chat-timestamp': true,
    'pull-right': right,
    'pull-left': !right
  })}>
    <FormattedRelative value={postedAt * 1000} />
  </span>
);

Posted.propTypes = {
  right: PropTypes.bool.isRequired,
  postedAt: PropTypes.number.isRequired
};

export default Posted;
