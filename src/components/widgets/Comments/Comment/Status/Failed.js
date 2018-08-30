import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { WarningIcon } from '../../../../icons';

const Failed = ({ right, repost }) =>
  <span
    className={classnames({
      'direct-chat-timestamp': true,
      'pull-right': right,
      'pull-left': !right
    })}
    onClick={repost}
  >
    <WarningIcon gapRight />
    <FormattedMessage
      id="app.comments.publishingFailed"
      defaultMessage="Publishing Failed"
    />
  </span>;

Failed.propTypes = {
  right: PropTypes.bool.isRequired,
  repost: PropTypes.func
};

export default Failed;
