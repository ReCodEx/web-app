import React from 'react';
import PropTypes from 'prop-types';

import Button from '../../widgets/TheButton';
import OptionalTooltipWrapper from '../../widgets/OptionalTooltipWrapper';
import Icon, { LoadingIcon } from '../../icons';

const ActionButton = ({ id, variant = 'success', icon, label, confirm, pending, tooltip = null, size, onClick }) =>
  confirm ? (
    <Button variant={variant} size={size} onClick={onClick} disabled={pending} confirm={confirm} confirmId={id}>
      {pending ? (
        <LoadingIcon gapRight={Boolean(label)} />
      ) : icon && (typeof icon === 'string' || Array.isArray(icon)) ? (
        <Icon icon={icon} gapRight={Boolean(label)} />
      ) : (
        icon
      )}
      {label}
    </Button>
  ) : (
    <OptionalTooltipWrapper tooltip={tooltip} hide={!tooltip}>
      <Button variant={variant} size={size} onClick={onClick} disabled={pending}>
        {pending ? (
          <LoadingIcon gapRight={Boolean(label)} />
        ) : icon && (typeof icon === 'string' || Array.isArray(icon)) ? (
          <Icon icon={icon} gapRight={Boolean(label)} />
        ) : (
          icon
        )}
        {label}
      </Button>
    </OptionalTooltipWrapper>
  );

ActionButton.propTypes = {
  id: PropTypes.string.isRequired,
  variant: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  tooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.element]).isRequired,
  confirm: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  pending: PropTypes.bool,
  size: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default ActionButton;
