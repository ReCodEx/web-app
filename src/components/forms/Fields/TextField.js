import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import classnames from 'classnames';

import styles from './commonStyles.less';

const TextField = ({
  input: { value, ...input },
  meta: { active, dirty, error, warning },
  type = 'text',
  label = null,
  groupClassName = '',
  ignoreDirty = false,
  ...props
}) => (
  <FormGroup
    controlId={input.name}
    validationState={error ? 'error' : warning ? 'warning' : undefined}
    className={groupClassName}>
    {Boolean(label) && <ControlLabel>{label}</ControlLabel>}
    <FormControl
      {...input}
      {...props}
      type={type}
      value={Array.isArray(value) ? value[0] : value}
      bsClass={classnames({
        'form-control': true,
        [styles.dirty]: dirty && !ignoreDirty && !error && !warning,
        [styles.active]: active,
      })}
    />
    {error && <HelpBlock> {error} </HelpBlock>}
    {!error && warning && <HelpBlock> {warning} </HelpBlock>}
  </FormGroup>
);

TextField.propTypes = {
  type: PropTypes.string,
  input: PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.array, PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  meta: PropTypes.shape({
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any,
  }).isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
  ]),
  groupClassName: PropTypes.string,
  ignoreDirty: PropTypes.bool,
};

export default TextField;
