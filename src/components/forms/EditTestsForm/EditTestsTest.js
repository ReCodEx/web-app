import React from 'react';
import PropTypes from 'prop-types';
import { Table, Button } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import { FormattedMessage } from 'react-intl';
import EditTestsTestRow from './EditTestsTestRow';

const EditTestsTest = ({ fields, isUniform }) =>
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
          <th />
        </tr>
      </thead>
      <tbody>
        {fields.map((test, index) =>
          <EditTestsTestRow
            key={index}
            test={test}
            isUniform={isUniform}
            onRemove={() => fields.remove(index)}
          />
        )}
      </tbody>
    </Table>
    <Button
      onClick={() =>
        fields.push({ name: `Test ${fields.length}`, weight: 100 })}
      bsStyle={'primary'}
      className="btn-flat"
    >
      <Icon name="plus" />{' '}
      <FormattedMessage id="app.editTestsTest.add" defaultMessage="Add test" />
    </Button>
  </div>;

EditTestsTest.propTypes = {
  fields: PropTypes.object.isRequired,
  isUniform: PropTypes.bool.isRequired
};

export default EditTestsTest;
