import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import Icon from '../../icons';

const StatusIcon = ({ id, message, icon, placement = 'bottom', accepted = false }) => (
  <span>
    {accepted ? (
      <Icon
        icon="circle-check"
        className="text-success"
        tooltipId={id}
        tooltipPlacement={placement}
        tooltip={
          <span>
            {message}
            <FormattedMessage
              id="app.submissionStatus.accepted"
              defaultMessage="This solution was marked by one of the supervisors as accepted."
            />
          </span>
        }
      />
    ) : message ? (
      <OverlayTrigger placement={placement} overlay={<Tooltip id={id}>{message}</Tooltip>}>
        <span>{icon}</span>
      </OverlayTrigger>
    ) : (
      icon
    )}
  </span>
);

StatusIcon.propTypes = {
  id: PropTypes.string.isRequired,
  icon: PropTypes.any.isRequired,
  message: PropTypes.any,
  placement: PropTypes.string,
  accepted: PropTypes.bool,
};

export default StatusIcon;
