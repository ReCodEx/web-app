import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { FailedIcon } from '../../../Icons';

const Failed = ({
  right
}) => (
  <span className={classNames({
    'direct-chat-timestamp': true,
    'pull-right': right,
    'pull-left': !right,
    'text-red': true
  })}>
    <FailedIcon /> Publikování selhalo.
  </span>
);

Failed.propTypes = {
  right: PropTypes.bool.isRequired
};

export default Failed;
