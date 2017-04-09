import React, { PropTypes } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const Status = ({ id, message, icon }) => (
  <OverlayTrigger
    placement="bottom"
    overlay={(
      <Tooltip id={id}>
        {message}
      </Tooltip>
    )}>
    {icon}
  </OverlayTrigger>
);

Status.propTypes = {
  id: PropTypes.string.isRequired,
  icon: PropTypes.any.isRequired,
  message: PropTypes.any.isRequired
};

export default Status;
