import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import Icon from '../../icons';

const StatusIcon = ({ id, message, icon, accepted = false }) => (
  <span>
    {accepted ? (
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={id}>
            <span>
              {message}
              <FormattedMessage
                id="app.submissionStatus.accepted"
                defaultMessage="This solution was marked by one of the supervisors as accepted."
              />
            </span>
          </Tooltip>
        }>
        <Icon icon="check-circle" className="text-green" />
      </OverlayTrigger>
    ) : (
      <OverlayTrigger
        placement="bottom"
        overlay={<Tooltip id={id}>{message}</Tooltip>}>
        {icon}
      </OverlayTrigger>
    )}
  </span>
);

StatusIcon.propTypes = {
  id: PropTypes.string.isRequired,
  icon: PropTypes.any.isRequired,
  message: PropTypes.any.isRequired,
  accepted: PropTypes.bool,
};

export default StatusIcon;
