import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import { TextField, NumericTextField } from '../Fields';
import { RemoveIcon } from '../../icons';
import './EditTests.css';

const EditTestsTestRow = ({ test, onRemove, isUniform, percent, readOnly = false }) => (
  <tr>
    <td>
      <Field
        name={`${test}.name`}
        component={TextField}
        label={''}
        maxLength={64}
        groupClassName="testRow"
        disabled={readOnly}
      />
    </td>
    {!isUniform && (
      <td>
        <NumericTextField
          name={`${test}.weight`}
          label={''}
          validateMin={0}
          validateMax={10000}
          maxLength={5}
          groupClassName="testRow"
          disabled={readOnly}
        />
      </td>
    )}
    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{percent}</td>
    {!readOnly && (
      <td style={{ verticalAlign: 'middle' }}>
        <Button onClick={onRemove} bsStyle={'danger'} bsSize="xs" className="btn-flat pull-right">
          <RemoveIcon gapRight />
          <FormattedMessage id="app.editTestsTest.remove" defaultMessage="Remove" />
        </Button>
      </td>
    )}
  </tr>
);

EditTestsTestRow.propTypes = {
  test: PropTypes.string.isRequired,
  onRemove: PropTypes.func.isRequired,
  isUniform: PropTypes.bool.isRequired,
  percent: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
};

export default EditTestsTestRow;
