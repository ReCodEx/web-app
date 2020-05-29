import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import Box from '../Box';

/**
 * A wrapper of Box adjusted for holding forms inside of the body.
 */
const FormBox = ({ id = null, onSubmit, succeeded = false, dirty = false, children, ...props }) => (
  <Form method="POST" onSubmit={onSubmit}>
    <Box id={id} type={succeeded ? 'success' : dirty ? 'warning' : 'default'} {...props} unlimitedHeight>
      <div>{children}</div>
    </Box>
  </Form>
);

FormBox.propTypes = {
  id: PropTypes.string,
  onSubmit: PropTypes.func,
  succeeded: PropTypes.bool,
  dirty: PropTypes.bool,
  children: PropTypes.any,
};

export default FormBox;
