import React from 'react';
import PropTypes from 'prop-types';
import { Table, Button } from 'react-bootstrap';
import { formValues } from 'redux-form';
import Icon from 'react-fontawesome';
import { FormattedMessage } from 'react-intl';
import EditTestsTestRow from './EditTestsTestRow';
import { prettyPrintPercent } from '../../helpers/stringFormatters';

const EditTestsTest = ({ fields, isUniform, testValues }) => {
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
            <th />
          </tr>
        </thead>
        <tbody>
          {fields.map((test, index) =>
            <EditTestsTestRow
              key={index}
              test={test}
              isUniform={isUniform}
              percent={prettyPrintPercent(
                (isUniform ? 1 : Number(testValues[index].weight)) / weightSum
              )}
              onRemove={() => fields.remove(index)}
            />
          )}
        </tbody>
      </Table>
      <div style={{ textAlign: 'right' }}>
        <Button
          onClick={() =>
            fields.push({ name: `Test ${fields.length}`, weight: 100 })}
          bsStyle={'primary'}
          className="btn-flat"
        >
          <Icon name="plus" />{' '}
          <FormattedMessage
            id="app.editTestsTest.add"
            defaultMessage="Add test"
          />
        </Button>
      </div>
    </div>
  );
};

EditTestsTest.propTypes = {
  fields: PropTypes.object.isRequired,
  isUniform: PropTypes.bool.isRequired,
  testValues: PropTypes.array.isRequired
};

export default formValues({
  testValues: 'tests'
})(EditTestsTest);
