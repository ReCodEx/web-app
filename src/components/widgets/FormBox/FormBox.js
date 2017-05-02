import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import Box from '../Box';

/**
 * A wrapper of Box adjusted for holding forms inside of the body.
 */
const FormBox = ({
  onSubmit,
  succeeded = false,
  dirty = false,
  children,
  ...props
}) => (
  <Form onSubmit={onSubmit}>
    <Box
      type={succeeded ? 'success' : (dirty ? 'warning' : 'default')}
      {...props}
      unlimitedHeight>
      <div>{children}</div>
    </Box>
  </Form>
);

FormBox.propTypes = {
  onSubmit: PropTypes.func,
  succeeded: PropTypes.bool,
  dirty: PropTypes.bool,
  children: PropTypes.any
};

export default FormBox;
