import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import classnames from 'classnames';

const FlatButton = ({ className = '', ...props }) =>
  <Button
    className={classnames({
      'btn-flat': true,
      [className]: className.length > 0
    })}
    {...props}
  />;

FlatButton.propTypes = {
  className: PropTypes.string
};

export default FlatButton;
