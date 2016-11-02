import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { AddIcon, WarningIcon } from '../../Icons';
import {
  TextField,
  CheckboxField,
  SelectField,
  TabbedArrayField
} from '../Fields';

const HardwareGroupFields = ({ prefix, i, limits }) => {
  const {
    hardwareGroup,
    tests
  } = limits[i];

  return (
    <div>
      <Field
        name={`${prefix}.hardwareGroup`}
        component={TextField}
        label={<FormattedMessage id='app.editHardwareGroupLimits.localized.name' defaultMessage='Hardware group name:' />} />

      {Object.keys(tests).map((testName, j) => (
        <div key={j}>
          <h3>{testName}</h3>
          {Object.keys(tests[testName]).map((taskId, k) => (
            <h4>{taskId}</h4>
          ))}
        </div>
      ))}
    </div>
  );
};

HardwareGroupFields.propTypes = {
  prefix: PropTypes.string.isRequired,
  i: PropTypes.number,
  limits: PropTypes.array.isRequired
};

export default HardwareGroupFields;
