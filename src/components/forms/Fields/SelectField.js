import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';
import classNames from 'classnames';

import styles from './commonStyles.less';

const SelectField = ({
  input,
  meta: { active, dirty, warning, error },
  label,
  options,
  addEmptyOption = false,
  emptyOptionCaption = '...',
  ignoreDirty = false,
  ...props
}) =>
  <FormGroup
    controlId={input.name}
    validationState={error ? 'error' : warning ? 'warning' : undefined}
  >
    <ControlLabel>
      {label}
    </ControlLabel>
    <FormControl
      {...input}
      {...props}
      componentClass="select"
      bsClass={classNames({
        'form-control': true,
        [styles.dirty]: dirty && !ignoreDirty && !error && !warning,
        [styles.active]: active
      })}
    >
      {addEmptyOption &&
        <option value={''} key={'-1'}>
          {emptyOptionCaption}
        </option>}
      {options.map(({ key, name }, i) =>
        <option value={key} key={i}>
          {name}
        </option>
      )}
    </FormControl>
    {error &&
      <HelpBlock>
        {' '}{error}{' '}
      </HelpBlock>}
    {!error &&
      warning &&
      <HelpBlock>
        {' '}{warning}{' '}
      </HelpBlock>}
  </FormGroup>;

SelectField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  meta: PropTypes.shape({
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any
  }).isRequired,
  type: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  options: PropTypes.array.isRequired,
  addEmptyOption: PropTypes.bool,
  emptyOptionCaption: PropTypes.string,
  ignoreDirty: PropTypes.bool
};

export default SelectField;
