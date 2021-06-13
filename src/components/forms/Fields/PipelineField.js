import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';

import PipelineVisualEditor from '../../Pipelines/PipelineVisualEditor';

const PipelineField = ({ input, meta: { touched, error }, label, ...props }) => (
  <FormGroup controlId={input.name} validationState={error ? (touched ? 'error' : 'warning') : undefined}>
    <ControlLabel>{label}</ControlLabel>
    <div className="hidden">
      <FormControl {...input} {...props} as="textarea" rows={8} style={{ fontFamily: 'mono' }} />
    </div>
    <PipelineVisualEditor source={input.value} onChange={input.onChange} />{' '}
    {error && (
      <HelpBlock>
        {' '}
        {touched ? error : <FormattedMessage defaultMessage="This field is required." id="app.field.isRequired" />}{' '}
      </HelpBlock>
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
