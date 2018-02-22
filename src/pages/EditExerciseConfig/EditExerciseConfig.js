import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { LocalizedExerciseName } from '../../components/helpers/LocalizedNames';

import EditExerciseConfigForm from '../../components/forms/EditExerciseConfigForm/EditExerciseConfigForm';
import EditEnvironmentConfigForm from '../../components/forms/EditEnvironmentConfigForm';
import EditScoreConfigForm from '../../components/forms/EditScoreConfigForm';

import SupplementaryFilesTableContainer from '../../containers/SupplementaryFilesTableContainer';

import { fetchExerciseIfNeeded } from '../../redux/modules/exercises';
import { fetchPipelines } from '../../redux/modules/pipelines';
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

import withLinks from '../../helpers/withLinks';
import { getLocalizedName } from '../../helpers/getLocalizedData';
import { isLoggedAsSuperAdmin } from '../../redux/selectors/users';

class EditExerciseConfig extends Component {
  componentWillMount = () => this.props.loadAsync();
  componentWillReceiveProps = props => {
    if (this.props.params.exerciseId !== props.params.exerciseId) {
      props.loadAsync();
    }
  };

  static loadAsync = ({ exerciseId }, dispatch) =>
    Promise.all([
      dispatch(fetchExerciseIfNeeded(exerciseId)),
      /*
      .then(({ value: exercise }) =>
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
      */
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
      // editEnvironmentSimpleLimits,
      pipelines,
      // limits,
      editScoreConfig,
      superadmin,
      intl: { locale }
    } = this.props;

    return (
      <Page
        resource={exercise}
        title={exercise => <LocalizedExerciseName entity={exercise} />}
        description={
          <FormattedMessage
            id="app.editExerciseConfig.description"
            defaultMessage="Change exercise configuration"
          />
        }
        breadcrumbs={[
          {
            resource: exercise,
            breadcrumb: ({ name, localizedTexts }) => ({
              text: (
                <FormattedMessage
                  id="app.exercise.breadcrumbTitle"
                  defaultMessage="Exercise {name}"
                  values={{
                    name: getLocalizedName({ name, localizedTexts }, locale)
                  }}
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
                      {superadmin &&
                        <EditExerciseConfigForm
                          runtimeEnvironments={runtimeEnvironments}
                          initialValues={{ config: config }}
                          onSubmit={setConfig}
                          exercise={exercise}
                          pipelines={pipelines}
                        />}
                      {/* Limit editation was completely redefined in simple form.
                      <EditSimpleLimitsBox
                        editLimits={editEnvironmentSimpleLimits}
                        environments={exercise.runtimeEnvironments}
                        limits={limits}
                        config={config}
                        setVertically={setVertically}
                        setHorizontally={setHorizontally}
                        setAll={setAll}
                      /> */}
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
  //  limits: PropTypes.func.isRequired,
  editScoreConfig: PropTypes.func.isRequired,
  superadmin: PropTypes.bool.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(
  withLinks(
    connect(
      (state, { params: { exerciseId } }) => {
        return {
          exercise: getExercise(exerciseId)(state),
          userId: loggedInUserIdSelector(state),
          environmentFormValues: getFormValues('editEnvironmentConfig')(state),
          runtimeEnvironments: runtimeEnvironmentsSelector(state),
          exerciseConfig: exerciseConfigSelector(exerciseId)(state),
          exerciseScoreConfig: exerciseScoreConfigSelector(exerciseId)(state),
          exerciseEnvironmentConfig: exerciseEnvironmentConfigSelector(
            exerciseId
          )(state),
          pipelines: pipelinesSelector(state),
          //          limits: runtimeEnvironmentId =>
          //            simpleLimitsSelector(exerciseId, runtimeEnvironmentId)(state),
          superadmin: isLoggedAsSuperAdmin(state)
        };
      },
      (dispatch, { params: { exerciseId } }) => ({
        loadAsync: () => EditExerciseConfig.loadAsync({ exerciseId }, dispatch),
        editEnvironmentConfigs: data =>
          dispatch(setExerciseEnvironmentConfig(exerciseId, data)),
        /*
          editEnvironmentSimpleLimits: runtimeEnvironmentId => data =>
          dispatch(
            editEnvironmentSimpleLimits(exerciseId, runtimeEnvironmentId, data)
          ),
*/
        setConfig: data => dispatch(setExerciseConfig(exerciseId, data)),
        editScoreConfig: data => dispatch(setScoreConfig(exerciseId, data))
      })
    )(EditExerciseConfig)
  )
);
