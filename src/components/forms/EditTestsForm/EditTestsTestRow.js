import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import { TextField, NumericTextField } from '../Fields';
import { RemoveIcon } from '../../icons';
import './EditTests.css';
import { WEIGHTED_ID, UNIVERSAL_ID } from '../../../helpers/exercise/score';

const EditTestsTestRow = ({ test, onRemove, calculator, percent, readOnly = false }) => (
  <tr>
    <td>
      <Field
        name={`${test}.name`}
        component={TextField}
        label=""
        maxLength={64}
        groupClassName="editTestFormTestRow"
        disabled={readOnly}
      />
    </td>
    {calculator === WEIGHTED_ID && (
      <td>
        <NumericTextField
          name={`${test}.weight`}
          label=""
          validateMin={0}
          validateMax={10000}
          maxLength={5}
          groupClassName="editTestFormTestRow"
          disabled={readOnly}
        />
      </td>
    )}
    {calculator !== UNIVERSAL_ID && <td className="text-center valign-middle">{percent}</td>}
    {!readOnly && (
      <td className="valign-middle">
        <Button onClick={onRemove} bsStyle="danger" bsSize="xs" className="btn-flat pull-right">
          <RemoveIcon gapRight />
          <FormattedMessage id="generic.remove" defaultMessage="Remove" />
        </Button>
      </td>
    )}
  </tr>
);

EditTestsTestRow.propTypes = {
  test: PropTypes.string.isRequired,
  onRemove: PropTypes.func.isRequired,
  calculator: PropTypes.string,
  percent: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
};

export default EditTestsTestRow;
