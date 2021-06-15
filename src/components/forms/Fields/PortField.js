import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Form, FormGroup, FormControl, FormLabel, Badge } from 'react-bootstrap';
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
}) => (
  <FormGroup controlId={input.name}>
    <FormLabel className={error ? 'text-danger' : warning ? 'text-warning' : undefined}>
      {label}{' '}
      <Badge style={{ fontFamily: 'monospace' }} variant={getLabelStyle(portType)}>
        {portType}
      </Badge>
    </FormLabel>
    <FormControl
      {...input}
      {...props}
      type="text"
      isInvalid={Boolean(error)}
      className={classnames({
        'form-control': true,
        [styles.dirty]: dirty && !ignoreDirty && !error && !warning,
        [styles.active]: active,
        'border-danger': error,
        'border-warning': !error && warning,
      })}
    />
    {error && <Form.Text className="text-danger"> {error} </Form.Text>}
    {!error && warning && <Form.Text className="text-warning"> {warning} </Form.Text>}
  </FormGroup>
);

PortField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
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
  ]).isRequired,
  portType: PropTypes.string.isRequired,
  ignoreDirty: PropTypes.bool,
};

export default PortField;
