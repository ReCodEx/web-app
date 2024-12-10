import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { BonusIcon } from './index.js';

const MaybeBonusAssignmentIcon = ({ id, isBonus, ...props }) =>
  isBonus && (
    <span>
      <BonusIcon
        {...props}
        className="text-body-secondary"
        tooltipId={id}
        tooltip={<FormattedMessage id="app.maybeBonusAssignmentIcon.isBonus" defaultMessage="Is Bonus" />}
      />
    </span>
  );

MaybeBonusAssignmentIcon.propTypes = {
  id: PropTypes.any.isRequired,
  isBonus: PropTypes.bool.isRequired,
};

export default MaybeBonusAssignmentIcon;
