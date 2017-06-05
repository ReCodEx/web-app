import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Alert, Table, Button } from 'react-bootstrap';
import Icon from 'react-fontawesome';

import SubmitButton from '../SubmitButton';
import EditExerciseConfigTests from './EditExerciseConfigTests';

class EditExerciseConfigForm extends Component {
  state = { additionalColumnNames: [], tests: [] };

  addTest() {
    this.setState((prevState, props) => {
      return {
        tests: prevState.tests.concat([
          {
            name: 'Test ' + (prevState.tests.length + 1)
          }
        ])
      };
    });
  }

  render() {
    const {
      exercise,
      initialValues,
      anyTouched,
      submitting,
      handleSubmit,
      hasFailed = false,
      hasSucceeded = false,
      invalid
    } = this.props;
    return (
      <div>
        {hasFailed &&
          <Alert bsStyle="danger">
            <FormattedMessage
              id="app.editExerciseConfigForm.failed"
              defaultMessage="Saving failed. Please try again later."
            />
          </Alert>}

        <Table>
          <thead>
            <tr>
              <th />
              <th>
                <FormattedMessage
                  id="app.editExerciseConfigForm.compilation"
                  defaultMessage="Compilation"
                />
              </th>
              <th>
                <FormattedMessage
                  id="app.editExerciseConfigForm.execution"
                  defaultMessage="Execution"
                />
              </th>
            </tr>
          </thead>
          <FieldArray
            name={'tests'}
            component={EditExerciseConfigTests}
            tests={this.state.tests}
          />
        </Table>

        <p className="text-center">
          <SubmitButton
            id="editExerciseConfig"
            invalid={invalid}
            submitting={submitting}
            hasSucceeded={hasSucceeded}
            dirty={anyTouched}
            hasFailed={hasFailed}
            handleSubmit={handleSubmit}
            messages={{
              submit: (
                <FormattedMessage
                  id="app.editExerciseConfigForm.submit"
                  defaultMessage="Change configuration"
                />
              ),
              submitting: (
                <FormattedMessage
                  id="app.editExerciseConfigForm.submitting"
                  defaultMessage="Saving configuration ..."
                />
              ),
              success: (
                <FormattedMessage
                  id="app.editExerciseConfigForm.success"
                  defaultMessage="Configuration was changed."
                />
              )
            }}
          />
          <Button
            onClick={() => this.addTest()}
            bsStyle={'info'}
            className="btn-flat"
          >
            <Icon name="plus" />
            {' '}
            <FormattedMessage
              id="app.editExerciseConfigForm.addTest"
              defaultMessage="Add new test"
            />
          </Button>
        </p>
      </div>
    );
  }
}

EditExerciseConfigForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.array,
  handleSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  exercise: PropTypes.object,
  submitting: PropTypes.bool,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  invalid: PropTypes.bool
};

const validate = () => {};

export default reduxForm({
  form: 'editExerciseConfig',
  validate
})(EditExerciseConfigForm);
