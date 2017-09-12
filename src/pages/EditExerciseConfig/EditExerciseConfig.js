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
import EditLimitsBox from '../../components/Exercises/EditLimitsBox';

import SupplementaryFilesTableContainer from '../../containers/SupplementaryFilesTableContainer';

import { fetchExerciseIfNeeded } from '../../redux/modules/exercises';
import { fetchHardwareGroups } from '../../redux/modules/hwGroups';
import { fetchPipelines } from '../../redux/modules/pipelines';
import {
  fetchExerciseEnvironmentLimitsIfNeeded,
  editEnvironmentLimits
} from '../../redux/modules/limits';
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
import { exerciseConfigSelector } from '../../redux/selectors/exerciseConfigs';
import { exerciseEnvironmentConfigSelector } from '../../redux/selectors/exerciseEnvironmentConfigs';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';
import { hardwareGroupsSelector } from '../../redux/selectors/hwGroups';
import { limitsSelector } from '../../redux/selectors/limits';

import withLinks from '../../hoc/withLinks';

const needsLimits = box => box.type === 'elf-exec';

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
        dispatch(fetchHardwareGroups()).then(({ value: hardwareGroups }) =>
          Promise.all(
            exercise.runtimeEnvironments.map(environment =>
              Promise.all(
                hardwareGroups.map(group =>
                  dispatch(
                    fetchExerciseEnvironmentLimitsIfNeeded(
                      exerciseId,
                      environment.id,
                      group.id
                    )
                  )
                )
              )
            )
          )
        )
      ),
      dispatch(fetchExerciseConfigIfNeeded(exerciseId)),
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchExerciseEnvironmentConfigIfNeeded(exerciseId)),
      dispatch(fetchPipelines())
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
      editEnvironmentLimits,
      pipelines,
      limits,
      hardwareGroups
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
                      <ResourceRenderer resource={pipelines.toArray()}>
                        {(...pipelines) =>
                          <ResourceRenderer resource={hardwareGroups}>
                            {(...hardwareGroups) =>
                              <EditLimitsBox
                                hardwareGroups={hardwareGroups}
                                editLimits={editEnvironmentLimits}
                                environments={exercise.runtimeEnvironments}
                                limits={limits}
                                config={config}
                                getBoxesWithLimits={pipeline =>
                                  pipelines
                                    .find(p => p.id === pipeline)
                                    .pipeline.boxes.filter(needsLimits)}
                              />}
                          </ResourceRenderer>}
                      </ResourceRenderer>
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
  editEnvironmentLimits: PropTypes.func.isRequired,
  pipelines: ImmutablePropTypes.map,
  links: PropTypes.object.isRequired,
  limits: PropTypes.func.isRequired,
  hardwareGroups: PropTypes.array
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
        pipelines: pipelinesSelector(state),
        limits: hwGroup => runtimeEnvironmentId =>
          limitsSelector(exerciseId, runtimeEnvironmentId, hwGroup)(state),
        hardwareGroups: hardwareGroupsSelector(state).toArray()
      };
    },
    (dispatch, { params: { exerciseId } }) => ({
      loadAsync: () => EditExerciseConfig.loadAsync({ exerciseId }, dispatch),
      editEnvironmentConfigs: data =>
        dispatch(setExerciseEnvironmentConfig(exerciseId, data)),
      editEnvironmentLimits: hwGroup => runtimeEnvironmentId => data =>
        dispatch(
          editEnvironmentLimits(exerciseId, runtimeEnvironmentId, hwGroup, data)
        ),
      setConfig: data => dispatch(setExerciseConfig(exerciseId, data))
    })
  )(EditExerciseConfig)
);
