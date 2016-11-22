import React, { PropTypes } from 'react';
import { Form } from 'react-bootstrap';
import Box from '../Box';

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
