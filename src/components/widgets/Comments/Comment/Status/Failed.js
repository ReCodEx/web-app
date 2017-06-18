import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { WarningIcon } from '../../../../icons';

const Failed = ({ right, repost }) => (
  <span
    className={classNames({
      'direct-chat-timestamp': true,
      'pull-right': right,
      'pull-left': !right
    })}
    onClick={repost}
  >
    <WarningIcon /> Publikování selhalo.
  </span>
);

Failed.propTypes = {
  right: PropTypes.bool.isRequired,
  repost: PropTypes.func
};

export default Failed;
