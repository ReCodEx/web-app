import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Form, FormGroup, FormControl, FormLabel } from 'react-bootstrap';

import PipelineVisualEditor from '../../Pipelines/PipelineVisualEditor';

const PipelineField = ({ input, meta: { touched, error }, label, ...props }) => (
  <FormGroup controlId={input.name}>
    <FormLabel className={error ? 'text-danger' : undefined}>{label}</FormLabel>
    <div className="hidden">
      <FormControl
        {...input}
        {...props}
        isInvalid={Boolean(error)}
        as="textarea"
        rows={8}
        style={{ fontFamily: 'mono' }}
      />
    </div>
    <PipelineVisualEditor source={input.value} onChange={input.onChange} />{' '}
    {error && (
      <Form.Text className="text-danger">
        {' '}
        {touched ? error : <FormattedMessage defaultMessage="This field is required." id="app.field.isRequired" />}{' '}
      </Form.Text>
    )}
  </FormGroup>
);

PipelineField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
    onChange: PropTypes.func.isRequired,
  }).isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
  ]).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.oneOfType([PropTypes.string, FormattedMessage]),
  }),
};

export default PipelineField;
