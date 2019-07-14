import React from 'react';
import PropTypes from 'prop-types';
import { Table, Alert } from 'react-bootstrap';
import { formValues } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import EditTestsTestRow from './EditTestsTestRow';
import { prettyPrintPercent } from '../../helpers/stringFormatters';
import { safeGet } from '../../../helpers/common';

const EditTestsTest = ({ fields, isUniform, testValues, readOnly = false }) => {
  const weightSum = isUniform ? fields.length : (testValues || []).reduce((acc, val) => acc + Number(val.weight), 0);

  return (
    <div>
      {fields.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <th>
                <FormattedMessage id="app.editTestsTest.name" defaultMessage="Test name:" />
              </th>
              {!isUniform && (
                <th>
                  <FormattedMessage id="app.editTestsTest.weight" defaultMessage="Test weight:" />
                </th>
              )}
              <th>
                <FormattedMessage id="app.editTestsTest.pointsPercentage" defaultMessage="Points Percentage:" />
              </th>
              {!readOnly && <th />}
            </tr>
          </thead>
          <tbody>
            {fields.map((test, index) => (
              <EditTestsTestRow
                key={index}
                test={test}
                isUniform={isUniform}
                readOnly={readOnly}
                percent={
                  safeGet(testValues, [index, 'weight'])
                    ? prettyPrintPercent((isUniform ? 1 : Number(testValues[index].weight)) / weightSum)
                    : '?'
                }
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
  isUniform: PropTypes.bool.isRequired,
  testValues: PropTypes.array,
};

export default formValues({
  testValues: 'tests',
})(EditTestsTest);
