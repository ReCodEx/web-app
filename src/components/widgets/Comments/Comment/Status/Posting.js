import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { LoadingIcon } from '../../../../icons';

const Posting = ({ right }) =>
  <span
    className={classNames({
      'direct-chat-timestamp': true,
      'pull-right': right,
      'pull-left': !right
    })}
  >
    <LoadingIcon /> Publikuji ...
  </span>;

Posting.propTypes = {
  right: PropTypes.bool.isRequired
};

export default Posting;
