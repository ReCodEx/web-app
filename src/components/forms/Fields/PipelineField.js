import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';

import PipelineVisualEditor from '../../Pipelines/PipelineVisualEditor';

const PipelineField = ({
  input,
  meta: { touched, error },
  type = 'text',
  label,
  ...props
}) =>
  <FormGroup
    controlId={input.name}
    validationState={touched && error ? 'error' : undefined}
  >
    <ControlLabel>
      {label}
    </ControlLabel>
    <FormControl
      {...input}
      {...props}
      componentClass="textarea"
      rows={8}
      style={{ fontFamily: 'mono' }}
    />
    <PipelineVisualEditor source={input.value} onChange={input.onChange} />
    {touched &&
      error &&
      <HelpBlock>
        {error}
      </HelpBlock>}
  </FormGroup>;

PipelineField.propTypes = {
  type: PropTypes.string,
  input: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.oneOfType([PropTypes.string, FormattedMessage])
  })
};

export default PipelineField;
