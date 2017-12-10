import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { FormGroup, HelpBlock, Checkbox } from 'react-bootstrap';

import OnOffCheckbox from '../OnOffCheckbox';

import styles from './commonStyles.less';

const CheckboxField = ({
  input,
  onOff = false,
  meta: { dirty, error, warning },
  label,
  ...props
}) => {
  const Component = onOff ? OnOffCheckbox : Checkbox;
  /* eslint-disable no-unneeded-ternary */
  return (
    <FormGroup
      validationState={
        error ? 'error' : warning ? 'warning' : dirty ? 'success' : undefined
      }
      controlId={input.name}
    >
      <Component {...props} {...input} checked={input.value ? true : false}>
        {label}
      </Component>
      {error &&
        <HelpBlock>
          {' '}{error}{' '}
        </HelpBlock>}
      {!error &&
        warning &&
        <HelpBlock>
          {' '}{warning}{' '}
        </HelpBlock>}
    </FormGroup>
  );
};

CheckboxField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
  }).isRequired,
  meta: PropTypes.shape({
    dirty: PropTypes.bool,
    error: PropTypes.oneOfType([PropTypes.string, FormattedMessage]),
    warning: PropTypes.oneOfType([PropTypes.string, FormattedMessage])
  }).isRequired,
  type: PropTypes.string,
  onOff: PropTypes.bool,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired
};

export default CheckboxField;
