import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import classnames from 'classnames';
import Confirm from '../../forms/Confirm';

const FlatButton = ({ className = '', onClick = null, confirm = null, confirmId = null, ...props }) =>
  confirm ? (
    <Confirm id={confirmId} onConfirmed={onClick} question={confirm}>
      <Button
        className={classnames({
          'btn-flat': true,
          [className]: className.length > 0,
        })}
        {...props}
      />
    </Confirm>
  ) : (
    <Button
      className={classnames({
        'btn-flat': true,
        [className]: className.length > 0,
      })}
      onClick={onClick}
      {...props}
    />
  );

FlatButton.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
  confirm: PropTypes.any,
  confirmId: PropTypes.string,
};

export default FlatButton;
