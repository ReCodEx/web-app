import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Button } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import { FormattedMessage } from 'react-intl';

import { TextField } from '../Fields';
import './EditTests.css';

const EditTestsTestRow = ({ test, onRemove, isUniform }) =>
  <tr>
    <td>
      <Field
        name={`${test}.name`}
        component={TextField}
        label={''}
        groupClassName="testRow"
      />
    </td>
    {!isUniform &&
      <td>
        <Field
          name={`${test}.weight`}
          component={TextField}
          label={''}
          groupClassName="testRow"
        />
      </td>}
    <td style={{ verticalAlign: 'middle' }}>
      <Button
        onClick={onRemove}
        bsStyle={'danger'}
        bsSize="xs"
        className="btn-flat pull-right"
      >
        <Icon name="minus" />{' '}
        <FormattedMessage
          id="app.editTestsTest.remove"
          defaultMessage="Remove"
        />
      </Button>
    </td>
  </tr>;

EditTestsTestRow.propTypes = {
  test: PropTypes.string.isRequired,
  onRemove: PropTypes.func.isRequired,
  isUniform: PropTypes.bool.isRequired
};

export default EditTestsTestRow;
