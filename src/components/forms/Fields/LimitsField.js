import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';

import { KiloBytesTextField, SecondsTextField } from '../Fields';
import FlatButton from '../../widgets/FlatButton';
import Confirm from '../../forms/Confirm';

// !!! this component is no longer used in EditSimpleLimits, but it so may happen it will be recycled for the complex edit form...
const LimitsField = ({
  label,
  prefix,
  id,
  setHorizontally,
  setVertically,
  setAll,
  ...props
}) =>
  <div>
    <Field
      name={`${prefix}.memory`}
      component={KiloBytesTextField}
      label={
        <FormattedMessage
          id="app.fields.limits.memory"
          defaultMessage="Test memory limit:"
        />
      }
      {...props}
    />
    <Field
      name={`${prefix}.time`}
      component={SecondsTextField}
      label={
        <FormattedMessage
          id="app.fields.limits.time"
          defaultMessage="Test time limit:"
        />
      }
      {...props}
    />

    <p className="text-center">
      <FlatButton onClick={setHorizontally} bsSize="xs">
        <Icon name="arrows-h" />
      </FlatButton>
      <FlatButton onClick={setVertically} bsSize="xs">
        <Icon name="arrows-v" />
      </FlatButton>
      <Confirm
        id={id}
        onConfirmed={setAll}
        question={
          <FormattedMessage
            id="app.EditEnvironmentLimitsForm.cloneAll.yesNoQuestion"
            defaultMessage="Do you really want to use these limits for all the tests of all runtime environments?"
          />
        }
      >
        <FlatButton bsSize="xs">
          <Icon name="arrows" />
        </FlatButton>
      </Confirm>
    </p>
  </div>;

LimitsField.propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
    PropTypes.element
  ]).isRequired,
  id: PropTypes.string.isRequired,
  setHorizontally: PropTypes.func.isRequired,
  setVertically: PropTypes.func.isRequired,
  setAll: PropTypes.func.isRequired,
  prefix: PropTypes.string.isRequired,
  ports: PropTypes.array
};

export default LimitsField;
