import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';

const FlatButton = ({ className, ...props }) => (
  <Button className={`btn-flat ${className}`} {...props} />
);

FlatButton.propTypes = {
  className: PropTypes.string
};

export default FlatButton;
