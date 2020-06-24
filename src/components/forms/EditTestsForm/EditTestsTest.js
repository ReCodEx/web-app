import React from 'react';
import PropTypes from 'prop-types';
import { Table, Alert } from 'react-bootstrap';
import { formValues } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import EditTestsTestRow from './EditTestsTestRow';
import { prettyPrintPercent } from '../../helpers/stringFormatters';
import { safeGet } from '../../../helpers/common';
import { WEIGHTED_ID, UNIVERSAL_ID } from '../../../helpers/exercise/score';

const EditTestsTest = ({ fields, calculator, testValues, readOnly = false }) => {
  const weightSum = Math.max(
    1, // make sure the sum is not zero (it is used in division)
    calculator === WEIGHTED_ID
      ? (testValues || []).reduce((acc, val) => acc + Number(val.weight), 0)
      : fields.length * 100
  );

  return (
    <div>
      {fields.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <th>
                <FormattedMessage id="app.editTestsTest.name" defaultMessage="Test name:" />
              </th>
              {calculator === WEIGHTED_ID && (
                <th>
                  <FormattedMessage id="app.editTestsTest.weight" defaultMessage="Test weight:" />
                </th>
              )}
              {calculator !== UNIVERSAL_ID && (
                <th>
                  <FormattedMessage id="app.editTestsTest.pointsPercentage" defaultMessage="Points Percentage:" />
                </th>
              )}
              {!readOnly && <th />}
            </tr>
          </thead>
          <tbody>
            {fields.map((test, index) => (
              <EditTestsTestRow
                key={index}
                test={test}
                calculator={calculator}
                readOnly={readOnly}
                percent={prettyPrintPercent(Number(safeGet(testValues, [index, 'weight'], 100)) / weightSum)}
                onRemove={() => fields.remove(index)}
              />
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert bsStyle="warning">
          <FormattedMessage
            id="app.editTestsTest.noTests"
            defaultMessage="There are no tests yet. It is highly recommended to set up the tests first since most of the remaining configurations depends on them."
          />
        </Alert>
      )}
    </div>
  );
};

EditTestsTest.propTypes = {
  readOnly: PropTypes.bool,
  fields: PropTypes.object.isRequired,
  calculator: PropTypes.string,
  testValues: PropTypes.array,
};

export default formValues({
  testValues: 'tests',
})(EditTestsTest);
