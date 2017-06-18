import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset, getFormValues } from 'redux-form';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

import EditExerciseForm from '../../components/forms/EditExerciseForm';
import EditExerciseConfigForm
  from '../../components/forms/EditExerciseConfigForm/EditExerciseConfigForm';
import EditExerciseRuntimeConfigsForm
  from '../../components/forms/EditExerciseRuntimeConfigsForm';
import SupplementaryFilesTableContainer
  from '../../containers/SupplementaryFilesTableContainer';
import AdditionalExerciseFilesTableContainer
  from '../../containers/AdditionalExerciseFilesTableContainer';
import DeleteExerciseButtonContainer
  from '../../containers/DeleteExerciseButtonContainer';

import {
  fetchExerciseIfNeeded,
  editExercise,
  editRuntimeConfigs
} from '../../redux/modules/exercises';
import {
  fetchExerciseConfigIfNeeded,
  setExerciseConfig
} from '../../redux/modules/exerciseConfigs';
import { getExercise } from '../../redux/selectors/exercises';
import { isSubmitting } from '../../redux/selectors/submission';
import { exerciseConfigSelector } from '../../redux/selectors/exerciseConfigs';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  fetchRuntimeEnvironments
} from '../../redux/modules/runtimeEnvironments';
import {
  runtimeEnvironmentsSelector
} from '../../redux/selectors/runtimeEnvironments';

import withLinks from '../../hoc/withLinks';

class EditExercise extends Component {
  componentWillMount = () => this.props.loadAsync();
  componentWillReceiveProps = props => {
    if (this.props.params.exerciseId !== props.params.exerciseId) {
      props.reset();
      props.loadAsync();
    }
  };

  static loadAsync = ({ exerciseId }, dispatch) =>
    Promise.all([
      dispatch(fetchExerciseIfNeeded(exerciseId)),
      dispatch(fetchExerciseConfigIfNeeded(exerciseId)),
      dispatch(fetchRuntimeEnvironments())
    ]);

  render() {
    const {
      links: { EXERCISES_URI, EXERCISE_URI_FACTORY },
      params: { exerciseId },
      exercise,
      editExercise,
      editRuntimeConfigs,
      setConfig,
      runtimeEnvironments,
      formValues,
      runtimesFormValues,
      // configFormValues,
      exerciseConfig,
      push
    } = this.props;

    return (
      <Page
        resource={exercise}
        title={exercise => exercise.name}
        description={
          <FormattedMessage
            id="app.editExercise.description"
            defaultMessage="Change exercise settings"
          />
        }
        breadcrumbs={[
          {
            text: (
              <FormattedMessage
                id="app.exercise.title"
                defaultMessage="Exercise"
              />
            ),
            iconName: 'puzzle-piece',
            link: EXERCISE_URI_FACTORY(exerciseId)
          },
          {
            text: (
              <FormattedMessage
                id="app.editExercise.title"
                defaultMessage="Edit exercise"
              />
            ),
            iconName: 'pencil'
          }
        ]}
      >
        {exercise => (
          <div>
            <Row>
              <Col lg={6}>
                <Row>
                  <Col lg={12}>
                    <EditExerciseForm
                      exercise={exercise}
                      initialValues={exercise}
                      onSubmit={formData =>
                        editExercise(exercise.version, formData)}
                      formValues={formValues}
                    />
                  </Col>
                  <Col lg={12}>
                    <AdditionalExerciseFilesTableContainer
                      exercise={exercise}
                    />
                  </Col>
                </Row>
              </Col>
              <Col lg={6}>
                <Row>
                  <Col lg={12}>
                    <SupplementaryFilesTableContainer exercise={exercise} />
                  </Col>
                </Row>
                <Row>
                  <Col lg={12}>
                    <Box
                      title={
                        <FormattedMessage
                          id="app.editExercise.editRuntimeConfig"
                          defaultMessage="Edit runtime configurations"
                        />
                      }
                      unlimitedHeight
                    >
                      <EditExerciseRuntimeConfigsForm
                        runtimeEnvironments={runtimeEnvironments}
                        runtimeConfigs={
                          runtimesFormValues
                            ? runtimesFormValues.runtimeConfigs
                            : [{}]
                        }
                        initialValues={{
                          runtimeConfigs: exercise.runtimeConfigs
                        }}
                        onSubmit={editRuntimeConfigs}
                      />
                    </Box>
                  </Col>
                </Row>
                <Row>
                  <Col lg={12}>
                    <Box
                      title={
                        <FormattedMessage
                          id="app.editExercise.editTestConfig"
                          defaultMessage="Edit configurations"
                        />
                      }
                      unlimitedHeight
                    >
                      <ResourceRenderer resource={exerciseConfig}>
                        {config => (
                          <EditExerciseConfigForm
                            runtimeEnvironments={runtimeEnvironments}
                            // testConfigs={
                            //   configFormValues ? configFormValues.testConfigs : [{}]
                            // }
                            initialValues={{ config: config }}
                            onSubmit={setConfig}
                          />
                        )}
                      </ResourceRenderer>
                    </Box>
                  </Col>
                </Row>
              </Col>
            </Row>
            <br />
            <Box
              type="danger"
              title={
                <FormattedMessage
                  id="app.editExercise.deleteExercise"
                  defaultMessage="Delete the exercise"
                />
              }
            >
              <div>
                <p>
                  <FormattedMessage
                    id="app.editExercise.deleteExerciseWarning"
                    defaultMessage="Deleting an exercise will remove all the students submissions and all assignments."
                  />
                </p>
                <p className="text-center">
                  <DeleteExerciseButtonContainer
                    id={exercise.id}
                    onDeleted={() => push(EXERCISES_URI)}
                  />
                </p>
              </div>
            </Box>
          </div>
        )}
      </Page>
    );
  }
}

EditExercise.propTypes = {
  exercise: ImmutablePropTypes.map,
  runtimeEnvironments: PropTypes.object.isRequired,
  loadAsync: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  editExercise: PropTypes.func.isRequired,
  setConfig: PropTypes.func.isRequired,
  editRuntimeConfigs: PropTypes.func.isRequired,
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired
  }).isRequired,
  formValues: PropTypes.object,
  runtimesFormValues: PropTypes.object,
  // configFormValues: PropTypes.object,
  exerciseConfig: PropTypes.object,
  links: PropTypes.object.isRequired,
  push: PropTypes.func.isRequired
};

export default withLinks(
  connect(
    (state, { params: { exerciseId } }) => {
      const exerciseSelector = getExercise(exerciseId);
      const userId = loggedInUserIdSelector(state);
      return {
        exercise: exerciseSelector(state),
        submitting: isSubmitting(state),
        userId,
        formValues: getFormValues('editExercise')(state),
        runtimesFormValues: getFormValues('editExerciseRuntimeConfigs')(state),
        // configFormValues: getFormValues('editExerciseConfig')(state),
        runtimeEnvironments: runtimeEnvironmentsSelector(state),
        exerciseConfig: exerciseConfigSelector(exerciseId)(state)
      };
    },
    (dispatch, { params: { exerciseId } }) => ({
      push: url => dispatch(push(url)),
      reset: () => dispatch(reset('editExercise')),
      loadAsync: () => EditExercise.loadAsync({ exerciseId }, dispatch),
      editExercise: (version, data) =>
        dispatch(editExercise(exerciseId, { ...data, version })),
      editRuntimeConfigs: data =>
        dispatch(editRuntimeConfigs(exerciseId, data)),
      setConfig: data => dispatch(setExerciseConfig(exerciseId, data))
    })
  )(EditExercise)
);
