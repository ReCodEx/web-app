import React from 'react';
import PropTypes from 'prop-types';
import { Table, Button } from 'react-bootstrap';
import { formValues } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import EditTestsTestRow from './EditTestsTestRow';
import { prettyPrintPercent } from '../../helpers/stringFormatters';
import { AddIcon } from '../../icons';

const EditTestsTest = ({ fields, isUniform, testValues, readOnly = false }) => {
  const weightSum = isUniform
    ? fields.length
    : testValues.reduce((acc, val) => acc + Number(val.weight), 0);

  return (
    <div>
      <Table>
        <thead>
          <tr>
            <th>
              <FormattedMessage
                id="app.editTestsTest.name"
                defaultMessage="Test name:"
              />
            </th>
            {!isUniform &&
              <th>
                <FormattedMessage
                  id="app.editTestsTest.weight"
                  defaultMessage="Test weight:"
                />
              </th>}
            <th>
              <FormattedMessage
                id="app.editTestsTest.pointsPercentage"
                defaultMessage="Points Percentage:"
              />
            </th>
            {!readOnly && <th />}
          </tr>
        </thead>
        <tbody>
          {fields.map((test, index) =>
            <EditTestsTestRow
              key={index}
              test={test}
              isUniform={isUniform}
              readOnly={readOnly}
              percent={
                testValues[index] && testValues[index].weight
                  ? prettyPrintPercent(
                      (isUniform ? 1 : Number(testValues[index].weight)) /
                        weightSum
                    )
                  : '?'
              }
              onRemove={() => fields.remove(index)}
            />
          )}
        </tbody>
      </Table>
      {fields.length < 99 &&
        !readOnly &&
        <div style={{ textAlign: 'right' }}>
          <Button
            onClick={() =>
              fields.push({
                name: 'Test ' + (fields.length + 1).toString().padStart(2, '0'),
                weight: '100'
              })}
            bsStyle={'primary'}
            className="btn-flat"
          >
            <AddIcon gapRight />
            <FormattedMessage
              id="app.editTestsTest.add"
              defaultMessage="Add Test"
            />
          </Button>
        </div>}
    </div>
  );
};

EditTestsTest.propTypes = {
  readOnly: PropTypes.bool,
  fields: PropTypes.object.isRequired,
  isUniform: PropTypes.bool.isRequired,
  testValues: PropTypes.array.isRequired
};

export default formValues({
  testValues: 'tests'
})(EditTestsTest);
