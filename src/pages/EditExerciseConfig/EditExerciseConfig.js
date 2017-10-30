import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

import EditExerciseConfigForm from '../../components/forms/EditExerciseConfigForm/EditExerciseConfigForm';
import EditEnvironmentConfigForm from '../../components/forms/EditEnvironmentConfigForm';
import EditScoreConfigForm from '../../components/forms/EditScoreConfigForm';
import EditSimpleLimitsBox from '../../components/Exercises/EditSimpleLimitsBox';

import SupplementaryFilesTableContainer from '../../containers/SupplementaryFilesTableContainer';

import { fetchExerciseIfNeeded } from '../../redux/modules/exercises';
import { fetchPipelines } from '../../redux/modules/pipelines';
import {
  fetchExerciseEnvironmentSimpleLimitsIfNeeded,
  editEnvironmentSimpleLimits,
  setHorizontally,
  setVertically,
  setAll
} from '../../redux/modules/simpleLimits';
import {
  fetchExerciseConfigIfNeeded,
  setExerciseConfig
} from '../../redux/modules/exerciseConfigs';
import {
  fetchScoreConfigIfNeeded,
  setScoreConfig
} from '../../redux/modules/exerciseScoreConfig';
import {
  fetchExerciseEnvironmentConfigIfNeeded,
  setExerciseEnvironmentConfig
} from '../../redux/modules/exerciseEnvironmentConfigs';
import { getExercise } from '../../redux/selectors/exercises';
import { pipelinesSelector } from '../../redux/selectors/pipelines';
import { exerciseConfigSelector } from '../../redux/selectors/exerciseConfigs';
import { exerciseEnvironmentConfigSelector } from '../../redux/selectors/exerciseEnvironmentConfigs';
import { exerciseScoreConfigSelector } from '../../redux/selectors/exerciseScoreConfig';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';
import { simpleLimitsSelector } from '../../redux/selectors/simpleLimits';

import withLinks from '../../hoc/withLinks';

class EditExerciseConfig extends Component {
  componentWillMount = () => this.props.loadAsync();
  componentWillReceiveProps = props => {
    if (this.props.params.exerciseId !== props.params.exerciseId) {
      props.loadAsync();
    }
  };

  static loadAsync = ({ exerciseId }, dispatch) =>
    Promise.all([
      dispatch(fetchExerciseIfNeeded(exerciseId)).then(({ value: exercise }) =>
        Promise.all(
          exercise.runtimeEnvironments.map(environment =>
            dispatch(
              fetchExerciseEnvironmentSimpleLimitsIfNeeded(
                exerciseId,
                environment.id
              )
            )
          )
        )
      ),
      dispatch(fetchExerciseConfigIfNeeded(exerciseId)),
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchExerciseEnvironmentConfigIfNeeded(exerciseId)),
      dispatch(fetchPipelines()),
      dispatch(fetchScoreConfigIfNeeded(exerciseId))
    ]);

  render() {
    const {
      links: { EXERCISE_URI_FACTORY },
      params: { exerciseId },
      exercise,
      editEnvironmentConfigs,
      setConfig,
      runtimeEnvironments,
      environmentFormValues,
      exerciseConfig,
      exerciseEnvironmentConfig,
      exerciseScoreConfig,
      editEnvironmentSimpleLimits,
      pipelines,
      limits,
      setHorizontally,
      setVertically,
      setAll,
      editScoreConfig
    } = this.props;

    return (
      <Page
        resource={exercise}
        title={exercise => exercise.name}
        description={
          <FormattedMessage
            id="app.editExerciseConfig.description"
            defaultMessage="Change exercise configuration"
          />
        }
        breadcrumbs={[
          {
            resource: exercise,
            breadcrumb: ({ name }) => ({
              text: (
                <FormattedMessage
                  id="app.exercise.breadcrumbTitle"
                  defaultMessage="Exercise {name}"
                  values={{ name }}
                />
              ),
              iconName: 'puzzle-piece',
              link: EXERCISE_URI_FACTORY(exerciseId)
            })
          },
          {
            text: (
              <FormattedMessage
                id="app.editExerciseConfig.title"
                defaultMessage="Edit exercise config"
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
                <SupplementaryFilesTableContainer exercise={exercise} />
              </Col>
              <Col lg={6}>
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
            <Row>
              <Col lg={6}>
                <Box
                  title={
                    <FormattedMessage
                      id="app.editExercise.editScoreConfig"
                      defaultMessage="Edit score configurations"
                    />
                  }
                  unlimitedHeight
                >
                  <ResourceRenderer resource={exerciseScoreConfig}>
                    {config =>
                      <EditScoreConfigForm
                        onSubmit={editScoreConfig}
                        initialValues={{ scoreConfig: config }}
                      />}
                  </ResourceRenderer>
                </Box>
              </Col>
            </Row>
            <br />
            <Row>
              <Col lg={12}>
                <ResourceRenderer
                  resource={[exerciseConfig, ...runtimeEnvironments.toArray()]}
                >
                  {(config, ...runtimeEnvironments) =>
                    <div>
                      <EditExerciseConfigForm
                        runtimeEnvironments={runtimeEnvironments}
                        initialValues={{ config: config }}
                        onSubmit={setConfig}
                        exercise={exercise}
                        pipelines={pipelines}
                      />
                      <EditSimpleLimitsBox
                        editLimits={editEnvironmentSimpleLimits}
                        environments={exercise.runtimeEnvironments}
                        limits={limits}
                        config={config}
                        setVertically={setVertically}
                        setHorizontally={setHorizontally}
                        setAll={setAll}
                      />
                    </div>}
                </ResourceRenderer>
              </Col>
            </Row>
          </div>}
      </Page>
    );
  }
}

EditExerciseConfig.propTypes = {
  exercise: ImmutablePropTypes.map,
  runtimeEnvironments: PropTypes.object.isRequired,
  loadAsync: PropTypes.func.isRequired,
  setConfig: PropTypes.func.isRequired,
  editEnvironmentConfigs: PropTypes.func.isRequired,
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired
  }).isRequired,
  environmentFormValues: PropTypes.object,
  exerciseConfig: PropTypes.object,
  exerciseEnvironmentConfig: PropTypes.object,
  exerciseScoreConfig: PropTypes.object,
  editEnvironmentSimpleLimits: PropTypes.func.isRequired,
  pipelines: ImmutablePropTypes.map,
  links: PropTypes.object.isRequired,
  limits: PropTypes.func.isRequired,
  setHorizontally: PropTypes.func.isRequired,
  setVertically: PropTypes.func.isRequired,
  setAll: PropTypes.func.isRequired,
  editScoreConfig: PropTypes.func.isRequired
};

export default withLinks(
  connect(
    (state, { params: { exerciseId } }) => {
      return {
        exercise: getExercise(exerciseId)(state),
        userId: loggedInUserIdSelector(state),
        environmentFormValues: getFormValues('editEnvironmentConfig')(state),
        runtimeEnvironments: runtimeEnvironmentsSelector(state),
        exerciseConfig: exerciseConfigSelector(exerciseId)(state),
        exerciseEnvironmentConfig: exerciseEnvironmentConfigSelector(
          exerciseId
        )(state),
        exerciseScoreConfig: exerciseScoreConfigSelector(exerciseId)(state),
        pipelines: pipelinesSelector(state),
        limits: runtimeEnvironmentId =>
          simpleLimitsSelector(exerciseId, runtimeEnvironmentId)(state)
      };
    },
    (dispatch, { params: { exerciseId } }) => ({
      loadAsync: () => EditExerciseConfig.loadAsync({ exerciseId }, dispatch),
      editEnvironmentConfigs: data =>
        dispatch(setExerciseEnvironmentConfig(exerciseId, data)),
      editEnvironmentSimpleLimits: runtimeEnvironmentId => data =>
        dispatch(
          editEnvironmentSimpleLimits(exerciseId, runtimeEnvironmentId, data)
        ),
      setConfig: data => dispatch(setExerciseConfig(exerciseId, data)),
      setHorizontally: (formName, runtimeEnvironmentId) => testName => () =>
        dispatch(
          setHorizontally(formName, exerciseId, runtimeEnvironmentId, testName)
        ),
      setVertically: (formName, runtimeEnvironmentId) => testName => () =>
        dispatch(
          setVertically(formName, exerciseId, runtimeEnvironmentId, testName)
        ),
      setAll: (formName, runtimeEnvironmentId) => testName => () =>
        dispatch(setAll(formName, exerciseId, runtimeEnvironmentId, testName)),
      editScoreConfig: data => dispatch(setScoreConfig(exerciseId, data))
    })
  )(EditExerciseConfig)
);
