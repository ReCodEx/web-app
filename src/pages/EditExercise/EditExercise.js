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
import EditExerciseConfigForm from '../../components/forms/EditExerciseConfigForm/EditExerciseConfigForm';
import EditEnvironmentConfigForm from '../../components/forms/EditEnvironmentConfigForm';
import SupplementaryFilesTableContainer from '../../containers/SupplementaryFilesTableContainer';
import AdditionalExerciseFilesTableContainer from '../../containers/AdditionalExerciseFilesTableContainer';
import DeleteExerciseButtonContainer from '../../containers/DeleteExerciseButtonContainer';

import {
  fetchExerciseIfNeeded,
  editExercise
} from '../../redux/modules/exercises';
import { fetchPipelines } from '../../redux/modules/pipelines';
import {
  fetchExerciseConfigIfNeeded,
  setExerciseConfig
} from '../../redux/modules/exerciseConfigs';
import {
  fetchExerciseEnvironmentConfigIfNeeded,
  setExerciseEnvironmentConfig
} from '../../redux/modules/exerciseEnvironmentConfigs';
import { getExercise } from '../../redux/selectors/exercises';
import { pipelinesSelector } from '../../redux/selectors/pipelines';
import { isSubmitting } from '../../redux/selectors/submission';
import { exerciseConfigSelector } from '../../redux/selectors/exerciseConfigs';
import { exerciseEnvironmentConfigSelector } from '../../redux/selectors/exerciseEnvironmentConfigs';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';

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
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchExerciseEnvironmentConfigIfNeeded(exerciseId)),
      dispatch(fetchPipelines())
    ]);

  render() {
    const {
      links: { EXERCISES_URI, EXERCISE_URI_FACTORY },
      params: { exerciseId },
      exercise,
      editExercise,
      editEnvironmentConfigs,
      setConfig,
      runtimeEnvironments,
      formValues,
      environmentFormValues,
      exerciseConfig,
      exerciseEnvironmentConfig,
      pipelines,
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
        {exercise =>
          <div>
            <Row>
              <Col lg={6}>
                <Row>
                  <Col lg={12}>
                    <EditExerciseForm
                      initialValues={exercise}
                      onSubmit={formData =>
                        editExercise(exercise.version, formData)}
                      formValues={formValues}
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
                    <AdditionalExerciseFilesTableContainer
                      exercise={exercise}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col lg={12}>
                    <Box
                      title={
                        <FormattedMessage
                          id="app.editExercise.editEnvironmentConfig"
                          defaultMessage="Edit environment configurations"
                        />
                      }
                      unlimitedHeight
                    >
                      <ResourceRenderer resource={exerciseEnvironmentConfig}>
                        {configs =>
                          <EditEnvironmentConfigForm
                            environmentFormValues={environmentFormValues}
                            initialValues={{
                              environmentConfigs: configs
                            }}
                            onSubmit={editEnvironmentConfigs}
                            runtimeEnvironments={runtimeEnvironments}
                          />}
                      </ResourceRenderer>
                    </Box>
                  </Col>
                </Row>
              </Col>
            </Row>
            <br />
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
                    {config =>
                      <EditExerciseConfigForm
                        runtimeEnvironments={runtimeEnvironments}
                        initialValues={{ config: config }}
                        onSubmit={setConfig}
                        exercise={exercise}
                        pipelines={pipelines}
                      />}
                  </ResourceRenderer>
                </Box>
              </Col>
              <Col lg={12}>
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
              </Col>
            </Row>
          </div>}
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
  editEnvironmentConfigs: PropTypes.func.isRequired,
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired
  }).isRequired,
  formValues: PropTypes.object,
  environmentFormValues: PropTypes.object,
  exerciseConfig: PropTypes.object,
  exerciseEnvironmentConfig: PropTypes.object,
  pipelines: ImmutablePropTypes.map,
  links: PropTypes.object.isRequired,
  push: PropTypes.func.isRequired
};

export default withLinks(
  connect(
    (state, { params: { exerciseId } }) => {
      return {
        exercise: getExercise(exerciseId)(state),
        submitting: isSubmitting(state),
        userId: loggedInUserIdSelector(state),
        formValues: getFormValues('editExercise')(state),
        environmentFormValues: getFormValues('editEnvironmentConfig')(state),
        runtimeEnvironments: runtimeEnvironmentsSelector(state),
        exerciseConfig: exerciseConfigSelector(exerciseId)(state),
        exerciseEnvironmentConfig: exerciseEnvironmentConfigSelector(
          exerciseId
        )(state),
        pipelines: pipelinesSelector(state)
      };
    },
    (dispatch, { params: { exerciseId } }) => ({
      push: url => dispatch(push(url)),
      reset: () => dispatch(reset('editExercise')),
      loadAsync: () => EditExercise.loadAsync({ exerciseId }, dispatch),
      editExercise: (version, data) =>
        dispatch(editExercise(exerciseId, { ...data, version })),
      editEnvironmentConfigs: data =>
        dispatch(setExerciseEnvironmentConfig(exerciseId, data)),
      setConfig: data => dispatch(setExerciseConfig(exerciseId, data))
    })
  )(EditExercise)
);
