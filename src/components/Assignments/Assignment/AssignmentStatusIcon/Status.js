import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { FormattedMessage } from 'react-intl';

const Status = ({ id, message, icon, accepted = false }) =>
  <span>
    {!accepted &&
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={id}>
            {message}
          </Tooltip>
        }
      >
        {icon}
      </OverlayTrigger>}
    {accepted &&
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
        }
      >
        <FontAwesomeIcon icon="check-circle" className="text-green" />
      </OverlayTrigger>}
  </span>;

Status.propTypes = {
  id: PropTypes.string.isRequired,
  icon: PropTypes.any.isRequired,
  message: PropTypes.any.isRequired,
  accepted: PropTypes.bool
};

export default Status;
