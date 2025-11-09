import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import DateTime from '../../../DateTime';

const OVERLAY_PROPS = {
  showRelative: false,
};

const Posted = ({ id, right, postedAt }) => (
  <span
    className={classnames({
      'direct-chat-timestamp': true,
      'float-end': right,
      'float-start': !right,
    })}>
    <DateTime
      unixTs={postedAt}
      showRelative
      showDate={false}
      showTime={false}
      showOverlay={true}
      overlayTooltipId={`postedAt-${id}`}
      overlayProps={OVERLAY_PROPS}
    />
  </span>
);

Posted.propTypes = {
  id: PropTypes.string.isRequired,
  right: PropTypes.bool.isRequired,
  postedAt: PropTypes.number.isRequired,
};

export default Posted;
