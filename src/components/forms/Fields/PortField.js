import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock,
  Label
} from 'react-bootstrap';
import classnames from 'classnames';

import { isArrayType } from '../../../helpers/boxes';

import styles from './commonStyles.less';

const getLabelStyle = portType => (isArrayType(portType) ? 'primary' : 'info');

const PortField = ({
  input,
  meta: { active, dirty, error, warning },
  label,
  portType,
  ignoreDirty = false,
  ...props
}) =>
  <FormGroup
    controlId={input.name}
    validationState={error ? 'error' : warning ? 'warning' : undefined}
  >
    <ControlLabel>
      {label}{' '}
      <Label
        style={{ fontFamily: 'monospace' }}
        bsStyle={getLabelStyle(portType)}
      >
        {portType}
      </Label>
    </ControlLabel>
    <FormControl
      {...input}
      {...props}
      type="text"
      bsClass={classnames({
        'form-control': true,
        [styles.dirty]: dirty && !ignoreDirty && !error && !warning,
        [styles.active]: active
      })}
    />
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

PortField.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }).isRequired,
  meta: PropTypes.shape({
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any
  }).isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  portType: PropTypes.string.isRequired,
  ignoreDirty: PropTypes.bool
};

export default PortField;
