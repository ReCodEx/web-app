import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import classnames from 'classnames';
import Confirm from '../../forms/Confirm';

const TheButtonInternal = ({ className, onClick = null, variant, noShadow = false, ...props }) => (
  <Button
    className={classnames({
      'elevation-2': !noShadow,
      [`bg-gradient-${variant}`]: !variant.startsWith('outline-'),
      [className]: className.length > 0,
    })}
    onClick={onClick}
    variant={variant.startsWith('outline-') ? variant : null}
    {...props}
  />
);

const TheButton = ({
  variant = 'outline-secondary',
  className = '',
  onClick = null,
  confirm = null,
  confirmId = null,
  staticContext /* avoid capturing static context in the rest of ...props */,
  ...props
}) =>
  confirm ? (
    <Confirm id={confirmId} onConfirmed={onClick} question={confirm}>
      <TheButtonInternal className={className} variant={variant} {...props} />
    </Confirm>
  ) : (
    <TheButtonInternal className={className} variant={variant} onClick={onClick} {...props} />
  );

TheButtonInternal.propTypes = {
  variant: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  noShadow: PropTypes.bool,
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
