import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import classnames from 'classnames';
import Confirm from '../../forms/Confirm';

const TheButtonInternal = React.forwardRef(
  ({ className, onClick = null, variant, noShadow = false, size, ...props }, ref) => (
    <Button
      className={classnames({
        'text-nowrap': true,
        'shadow-sm': !noShadow,
        'bg-gradient': !variant.startsWith('outline-'),
        'btn-xs': size === 'xs', // manual override for smaller button type
        [className]: className.length > 0,
      })}
      onClick={onClick}
      variant={variant}
      size={size === 'xs' ? null : size}
      {...props}
      ref={ref}
    />
  )
);

const TheButton = React.forwardRef(
  (
    {
      variant = 'outline-secondary',
      className = '',
      onClick = null,
      confirm = null,
      confirmId = null,
      staticContext /* avoid capturing static context in the rest of ...props */,
      ...props
    },
    ref
  ) =>
    confirm && onClick ? (
      <Confirm id={confirmId} onConfirmed={onClick} question={confirm}>
        <TheButtonInternal className={className} variant={variant} {...props} ref={ref} />
      </Confirm>
    ) : (
      <TheButtonInternal className={className} variant={variant} onClick={onClick} {...props} ref={ref} />
    )
);

TheButtonInternal.propTypes = {
  variant: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  noShadow: PropTypes.bool,
  size: PropTypes.string,
};

TheButton.propTypes = {
  variant: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  confirm: PropTypes.any,
  staticContext: PropTypes.any,
  confirmId: PropTypes.string,
  noShadow: PropTypes.bool,
};

export default TheButton;
