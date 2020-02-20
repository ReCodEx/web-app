import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import classnames from 'classnames';
import Confirm from '../../forms/Confirm';

const FlatButtonInternal = ({ className, onClick = null, ...props }) => (
  <Button
    className={classnames({
      'btn-flat': true,
      [className]: className.length > 0,
    })}
    onClick={onClick}
    {...props}
  />
);

const FlatButton = ({
  className = '',
  onClick = null,
  confirm = null,
  confirmId = null,
  staticContext /* avoid capturing static context in the rest of ...props */,
  ...props
}) =>
  confirm ? (
    <Confirm id={confirmId} onConfirmed={onClick} question={confirm}>
      <FlatButtonInternal className={className} {...props} />
    </Confirm>
  ) : (
    <FlatButtonInternal className={className} onClick={onClick} {...props} />
  );

FlatButtonInternal.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
};

FlatButton.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
  confirm: PropTypes.any,
  staticContext: PropTypes.any,
  confirmId: PropTypes.string,
};

export default FlatButton;
