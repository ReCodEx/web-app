import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const MaybeBonusAssignmentIcon = ({ id, isBonus, ...props }) =>
  isBonus &&
  <span>
    <OverlayTrigger
      placement="right"
      overlay={
        <Tooltip id={id}>
          <FormattedMessage
            id="app.maybeBonusAssignmentIcon.isBonus"
            defaultMessage="Is Bonus"
          />
        </Tooltip>
      }
    >
      <FontAwesomeIcon {...props} icon="plus-circle" className="text-gray" />
    </OverlayTrigger>{' '}
  </span>;

MaybeBonusAssignmentIcon.propTypes = {
  id: PropTypes.any.isRequired,
  isBonus: PropTypes.bool.isRequired
};

export default MaybeBonusAssignmentIcon;
