import React, { PropTypes } from 'react';
import { Form } from 'react-bootstrap';
import Box from '../Box';

/**
 * A wrapper of Box adjusted for holding forms inside of the body.
 */
const FormBox = ({
  onSubmit,
  children,
  ...props
}) => (
  <Form onSubmit={onSubmit}>
    <Box {...props} unlimitedHeight>
      <div>{children}</div>
    </Box>
  </Form>
);

FormBox.propTypes = {
  onSubmit: PropTypes.func,
  children: PropTypes.any
};

export default FormBox;
