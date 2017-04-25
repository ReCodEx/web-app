import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { LoadingIcon } from '../../../../Icons';

const Posting = ({
  right
}) => (
  <span className={classNames({
    'direct-chat-timestamp': true,
    'pull-right': right,
    'pull-left': !right
  })}>
    <LoadingIcon /> Publikuji ...
  </span>
);

Posting.propTypes = {
  right: PropTypes.bool.isRequired
};

export default Posting;
