import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { LoadingIcon } from '../../../../icons';

const Posting = ({ right }) => (
  <span
    className={classnames({
      'direct-chat-timestamp': true,
      'float-right': right,
      'float-left': !right,
    })}>
    <LoadingIcon gapRight />
    <FormattedMessage id="app.comments.publishing" defaultMessage="Publishing..." />
  </span>
);

Posting.propTypes = {
  right: PropTypes.bool.isRequired,
};

export default Posting;
