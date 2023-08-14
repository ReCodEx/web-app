import React from 'react';
import PropTypes from 'prop-types';

import Button from '../../widgets/TheButton';
import OptionalTooltipWrapper from '../../widgets/OptionalTooltipWrapper';
import Icon, { LoadingIcon } from '../../icons';

const ActionButton = ({
  id,
  variant = 'success',
  icon,
  label,
  shortLabel = label,
  confirm,
  pending,
  captionAsTooltip,
  size,
  onClick,
}) =>
  confirm ? (
    <Button variant={variant} size={size} onClick={onClick} disabled={pending} confirm={confirm} confirmId={id}>
      {pending ? <LoadingIcon gapRight={!captionAsTooltip} /> : <Icon icon={icon} gapRight={!captionAsTooltip} />}
      {!captionAsTooltip && label}
    </Button>
  ) : (
    <OptionalTooltipWrapper tooltip={label} hide={!captionAsTooltip}>
      <Button variant={variant} size={size} onClick={onClick} disabled={pending}>
        {pending ? <LoadingIcon gapRight={!captionAsTooltip} /> : <Icon icon={icon} gapRight={!captionAsTooltip} />}
        {!captionAsTooltip && shortLabel}
      </Button>
    </OptionalTooltipWrapper>
  );

ActionButton.propTypes = {
  id: PropTypes.string.isRequired,
  variant: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  shortLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  confirm: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  pending: PropTypes.bool,
  captionAsTooltip: PropTypes.bool,
  size: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default ActionButton;
