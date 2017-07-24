import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { reduxForm, FieldArray } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Alert, Button } from 'react-bootstrap';
import Icon from 'react-fontawesome';

import SubmitButton from '../SubmitButton';
import EditExerciseConfigEnvironment from './EditExerciseConfigEnvironment';
import { fetchSupplementaryFilesForExercise } from '../../../redux/modules/supplementaryFiles';
import { createGetSupplementaryFiles } from '../../../redux/selectors/supplementaryFiles';

class EditExerciseConfigForm extends Component {
  state = { testConfigs: [] };

  componentDidMount() {
    const { initialValues, fetchFiles } = this.props;
    this.setState({ testConfigs: initialValues.config });
    fetchFiles();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.exercise.id !== newProps.exercise.id) {
      newProps.fetchFiles();
    }
  }

  addTest() {
    this.setState((prevState, props) => {
      return {
        testConfigs: prevState.testConfigs.map(testConfig => {
          if (!testConfig.tests) {
            testConfig.tests = [];
          }
          testConfig.tests = testConfig.tests.concat([
            {
              name: 'Test ' + (testConfig.tests.length + 1)
            }
          ]);
          return testConfig;
        })
      };
    });
  }

  removeLastTest() {
    this.setState((prevState, props) => {
      return {
        testConfigs: prevState.testConfigs.map(testConfig => {
          if (!testConfig.tests || testConfig.tests === []) {
            return testConfig;
          }
          testConfig.tests = testConfig.tests.slice(0, -1);
          return testConfig;
        })
      };
    });
  }

  render() {
    const {
      runtimeEnvironments,
      supplementaryFiles,
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

        <FieldArray
          name="config"
          component={EditExerciseConfigEnvironment}
          testConfigs={this.state.testConfigs}
          runtimeEnvironments={runtimeEnvironments}
          supplementaryFiles={supplementaryFiles}
        />

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
            bsStyle={'primary'}
            className="btn-flat"
          >
            <Icon name="plus" />{' '}
            <FormattedMessage
              id="app.editExerciseConfigForm.addTest"
              defaultMessage="Add new test"
            />
          </Button>
          <Button
            onClick={() => this.removeLastTest()}
            bsStyle={'danger'}
            className="btn-flat"
          >
            <Icon name="minus" />{' '}
            <FormattedMessage
              id="app.editExerciseConfigForm.removeLastTest"
              defaultMessage="Remove last test"
            />
          </Button>
        </p>
      </div>
    );
  }
}

EditExerciseConfigForm.propTypes = {
  initialValues: PropTypes.object,
  values: PropTypes.array,
  handleSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  runtimeEnvironments: PropTypes.object.isRequired,
  supplementaryFiles: ImmutablePropTypes.map,
  fetchFiles: PropTypes.func.isRequired,
  exercise: PropTypes.shape({
    id: PropTypes.string.isRequired
  })
};

const validate = () => {};

const ConnectedEditExerciseConfigForm = connect(
  (state, { exercise }) => {
    const getSupplementaryFilesForExercise = createGetSupplementaryFiles(
      exercise.supplementaryFilesIds
    );
    return {
      supplementaryFiles: getSupplementaryFilesForExercise(state)
    };
  },
  (dispatch, { exercise }) => ({
    fetchFiles: () => dispatch(fetchSupplementaryFilesForExercise(exercise.id))
  })
)(EditExerciseConfigForm);

export default reduxForm({
  form: 'editExerciseConfig',
  validate
})(ConnectedEditExerciseConfigForm);
