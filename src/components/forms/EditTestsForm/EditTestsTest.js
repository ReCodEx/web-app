import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { formValues } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import EditTestsTestRow from './EditTestsTestRow';
import Callout from '../../widgets/Callout';
import Button from '../../widgets/TheButton';
import { AddIcon } from '../../icons';
import { prettyPrintPercent } from '../../helpers/stringFormatters';
import { safeGet } from '../../../helpers/common';
import { WEIGHTED_ID, UNIVERSAL_ID } from '../../../helpers/exercise/testsAndScore';

const EditTestsTest = ({ fields, calculator, testValues, usedTests, addNewTest, readOnly = false }) => {
  const weightSum = Math.max(
    1, // make sure the sum is not zero (it is used in division)
    calculator === WEIGHTED_ID
      ? (testValues || []).reduce((acc, val) => acc + Number(val.weight), 0)
      : fields.length * 100
  );

  return (
    <div>
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
            {!readOnly && addNewTest && (
              <th className="valign-middle text-right">
                {fields.length < 99 && (
                  <Button onClick={addNewTest} variant="primary" size="xs">
                    <AddIcon gapRight />
                    <FormattedMessage id="app.editTestsTest.add" defaultMessage="Add Test" />
                  </Button>
                )}
              </th>
            )}
          </tr>
        </thead>
        {fields.length > 0 ? (
          <tbody>
            {fields.map((test, index) => (
              <EditTestsTestRow
                key={index}
                test={test}
                calculator={calculator}
                readOnly={readOnly}
                percent={prettyPrintPercent(Number(safeGet(testValues, [index, 'weight'], 100)) / weightSum)}
                onRemove={() => fields.remove(index)}
                used={Boolean(testValues && usedTests && usedTests[testValues[index].id])}
              />
            ))}
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td colSpan={4} className="px-0 pb-0">
                <Callout variant="warning">
                  <FormattedMessage
                    id="app.editTestsTest.noTests"
                    defaultMessage="There are no tests yet. It is highly recommended to set up the tests first since most of the remaining configurations depends on them."
                  />
                </Callout>
              </td>
            </tr>
          </tbody>
        )}
      </Table>
    </div>
  );
};

EditTestsTest.propTypes = {
  readOnly: PropTypes.bool,
  fields: PropTypes.object.isRequired,
  calculator: PropTypes.string,
  testValues: PropTypes.array,
  usedTests: PropTypes.object,
  addNewTest: PropTypes.func,
};

export default formValues({
  testValues: 'tests',
})(EditTestsTest);
