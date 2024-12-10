import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import { TextField, NumericTextField } from '../Fields';
import Button from '../../widgets/TheButton';
import Icon, { RemoveIcon } from '../../icons';
import { WEIGHTED_ID, UNIVERSAL_ID } from '../../../helpers/exercise/testsAndScore.js';

import * as style from './EditTests.less';

const EditTestsTestRow = ({ test, onRemove, calculator, percent, used = false, readOnly = false }) => (
  <tr>
    <td>
      <Field
        name={`${test}.name`}
        component={TextField}
        label=""
        maxLength={64}
        groupClassName={style.testRow}
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
          groupClassName={style.testRow}
          disabled={readOnly}
        />
      </td>
    )}
    {calculator !== UNIVERSAL_ID && <td className="text-center align-middle">{percent}</td>}
    {!readOnly && (
      <td className="align-middle text-end">
        {used ? (
          <em>
            <Icon icon="paperclip" gapRight={2} className="text-success" />
            <FormattedMessage id="app.editTestsTest.testUsedInExpression" defaultMessage="used in expression" />
          </em>
        ) : (
          <Button onClick={onRemove} variant="danger" size="xs">
            <RemoveIcon gapRight={2} />
            <FormattedMessage id="generic.remove" defaultMessage="Remove" />
          </Button>
        )}
      </td>
    )}
  </tr>
);

EditTestsTestRow.propTypes = {
  test: PropTypes.string.isRequired,
  onRemove: PropTypes.func.isRequired,
  calculator: PropTypes.string,
  percent: PropTypes.string.isRequired,
  used: PropTypes.bool,
  readOnly: PropTypes.bool,
};

export default EditTestsTestRow;
