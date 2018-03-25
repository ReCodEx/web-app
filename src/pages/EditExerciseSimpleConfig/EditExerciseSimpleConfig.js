import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { defaultMemoize } from 'reselect';
import Icon from 'react-fontawesome';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { LocalizedExerciseName } from '../../components/helpers/LocalizedNames';
import SupplementaryFilesTableContainer from '../../containers/SupplementaryFilesTableContainer';
import EditTestsForm from '../../components/forms/EditTestsForm';
import EditExerciseSimpleConfigForm from '../../components/forms/EditExerciseSimpleConfigForm';
import EditEnvironmentSimpleForm from '../../components/forms/EditEnvironmentSimpleForm';
import ExerciseButtons from '../../components/Exercises/ExerciseButtons';

import {
  fetchExercise,
  fetchExerciseIfNeeded
} from '../../redux/modules/exercises';
import {
  fetchExerciseConfig,
  fetchExerciseConfigIfNeeded,
  setExerciseConfig
} from '../../redux/modules/exerciseConfigs';
import { getExercise } from '../../redux/selectors/exercises';
import { exerciseConfigSelector } from '../../redux/selectors/exerciseConfigs';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';

import withLinks from '../../helpers/withLinks';
import { getLocalizedName } from '../../helpers/getLocalizedData';
import { exerciseEnvironmentConfigSelector } from '../../redux/selectors/exerciseEnvironmentConfigs';
import {
  fetchExerciseEnvironmentConfig,
  fetchExerciseEnvironmentConfigIfNeeded,
  setExerciseEnvironmentConfig
} from '../../redux/modules/exerciseEnvironmentConfigs';
import { exerciseScoreConfigSelector } from '../../redux/selectors/exerciseScoreConfig';
import {
  fetchScoreConfigIfNeeded,
  setScoreConfig
} from '../../redux/modules/exerciseScoreConfig';
import {
  fetchExerciseTestsIfNeeded,
  setExerciseTests
} from '../../redux/modules/exerciseTests';
import { exerciseTestsSelector } from '../../redux/selectors/exerciseTests';
import { fetchPipelines } from '../../redux/modules/pipelines';
import {
  pipelinesSelector,
  getPipelinesEnvironmentsWhichHasEntryPoint
} from '../../redux/selectors/pipelines';

import {
  getEnvInitValues,
  transformEnvValues,
  getTestsInitValues,
  transformTestsValues,
  getSimpleConfigInitValues,
  transformConfigValues
} from '../../helpers/exerciseSimpleForm';

class EditExerciseSimpleConfig extends Component {
  componentWillMount = () => this.props.loadAsync();

  componentWillReceiveProps = nextProps => {
    if (this.props.params.exerciseId !== nextProps.params.exerciseId) {
      nextProps.loadAsync();
    }
  };

  static loadAsync = ({ exerciseId }, dispatch) =>
    Promise.all([
      dispatch(fetchExerciseIfNeeded(exerciseId)),
      dispatch(fetchExerciseConfigIfNeeded(exerciseId)),
      dispatch(fetchExerciseEnvironmentConfigIfNeeded(exerciseId)),
      dispatch(fetchScoreConfigIfNeeded(exerciseId)),
      dispatch(fetchExerciseTestsIfNeeded(exerciseId)),
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchPipelines())
    ]);

  transformAndSendTestsValues = data => {
    const { editTests, editScoreConfig, reloadConfig } = this.props;
    const { tests, scoreConfig } = transformTestsValues(data);
    return Promise.all([
      editTests({ tests }),
      editScoreConfig({ scoreConfig })
    ]).then(reloadConfig);
  };

  transformAndSendConfigValuesCreator = defaultMemoize(
    (pipelines, environmentConfigs, tests, config) => {
      const { setConfig, reloadExercise } = this.props;
      return data =>
        setConfig(
          transformConfigValues(
            data,
            pipelines,
            environmentConfigs,
            tests,
            config
          )
        ).then(reloadExercise);
    }
  );

  transformAndSendEnvValuesCreator = defaultMemoize(
    (pipelines, environments, tests, config, environmentConfigs) => {
      const { editEnvironmentConfigs, reloadConfig, setConfig } = this.props;

      return data => {
        const newEnvironments = transformEnvValues(
          data,
          environmentConfigs,
          environments
        );
        const configData = transformConfigValues(
          getSimpleConfigInitValues(config, tests, environmentConfigs),
          pipelines,
          newEnvironments,
          tests,
          config
        );
        return editEnvironmentConfigs({
          environmentConfigs: newEnvironments
        })
          .then(() => setConfig(configData))
          .then(reloadConfig);
      };
    }
  );

  render() {
    const {
      links: { EXERCISE_URI_FACTORY },
      params: { exerciseId },
      exercise,
      runtimeEnvironments,
      exerciseConfig,
      exerciseEnvironmentConfig,
      exerciseScoreConfig,
      exerciseTests,
      pipelines,
      environmetnsWithEntryPoints,
      intl: { locale }
    } = this.props;

    return (
      <Page
        resource={[exercise, exerciseTests]}
        title={exercise => <LocalizedExerciseName entity={exercise} />}
        description={
          <FormattedMessage
            id="app.editExerciseConfig.description"
            defaultMessage="Change exercise tests configuration"
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
                defaultMessage="Edit tests configuration"
              />
            ),
            iconName: 'pencil'
          }
        ]}
      >
        {(exercise, tests) =>
          <div>
            <ResourceRenderer
              resource={pipelines.toArray()}
              returnAsArray={true}
            >
              {(
                pipelines // pipelines are returned as a whole array (so they can be cached properly)
              ) =>
                <div>
                  {exercise.isBroken &&
                    <Row>
                      <Col sm={12}>
                        <div className="alert alert-warning">
                          <h4>
                            <Icon name="medkit" />&nbsp;&nbsp;
                            <FormattedMessage
                              id="app.exercise.isBroken"
                              defaultMessage="Exercise configuration is incorrect and needs fixing"
                            />
                          </h4>
                          {exercise.validationError}
                        </div>
                      </Col>
                    </Row>}
                  <Row>
                    <Col sm={12}>
                      <ExerciseButtons exerciseId={exercise.id} />
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={6}>
                      <Box
                        title={
                          <FormattedMessage
                            id="app.editExercise.editTests"
                            defaultMessage="Edit tests"
                          />
                        }
                        unlimitedHeight
                      >
                        <ResourceRenderer resource={exerciseScoreConfig}>
                          {scoreConfig =>
                            <EditTestsForm
                              initialValues={getTestsInitValues(
                                tests,
                                scoreConfig,
                                locale
                              )}
                              onSubmit={this.transformAndSendTestsValues}
                            />}
                        </ResourceRenderer>
                      </Box>
                      <Box
                        title={
                          <FormattedMessage
                            id="app.editExercise.editEnvironments"
                            defaultMessage="Edit runtime environments"
                          />
                        }
                        unlimitedHeight
                      >
                        <ResourceRenderer
                          resource={[exerciseConfig, exerciseEnvironmentConfig]}
                        >
                          {(config, environmentConfigs) =>
                            <ResourceRenderer
                              resource={runtimeEnvironments.toArray()}
                              returnAsArray={true}
                            >
                              {environments =>
                                <EditEnvironmentSimpleForm
                                  initialValues={getEnvInitValues(
                                    environmentConfigs,
                                    environments
                                  )}
                                  runtimeEnvironments={environments}
                                  onSubmit={this.transformAndSendEnvValuesCreator(
                                    pipelines,
                                    environments,
                                    tests,
                                    config,
                                    environmentConfigs
                                  )}
                                />}
                            </ResourceRenderer>}
                        </ResourceRenderer>
                      </Box>
                    </Col>
                    <Col lg={6}>
                      <SupplementaryFilesTableContainer exercise={exercise} />
                    </Col>
                  </Row>
                  <br />

                  <Row>
                    <Col sm={12}>
                      <ResourceRenderer
                        resource={[exerciseConfig, exerciseEnvironmentConfig]}
                      >
                        {(config, environments) =>
                          tests.length > 0
                            ? <EditExerciseSimpleConfigForm
                                initialValues={getSimpleConfigInitValues(
                                  config,
                                  tests,
                                  environments
                                )}
                                exercise={exercise}
                                exerciseTests={tests}
                                environmetnsWithEntryPoints={
                                  environmetnsWithEntryPoints
                                }
                                onSubmit={this.transformAndSendConfigValuesCreator(
                                  pipelines,
                                  environments,
                                  tests,
                                  config
                                )}
                              />
                            : <div className="alert alert-warning">
                                <h4>
                                  <i className="icon fa fa-warning" />{' '}
                                  <FormattedMessage
                                    id="app.editExercise.editConfig"
                                    defaultMessage="Edit exercise configuration"
                                  />
                                </h4>
                                <FormattedMessage
                                  id="app.editExerciseSimpleConfig.noTests"
                                  defaultMessage="There are no tests yet. The form cannot be displayed until at least one test is created."
                                />
                              </div>}
                      </ResourceRenderer>
                    </Col>
                  </Row>
                  <br />
                </div>}
            </ResourceRenderer>
          </div>}
      </Page>
    );
  }
}

EditExerciseSimpleConfig.propTypes = {
  exercise: ImmutablePropTypes.map,
  runtimeEnvironments: PropTypes.object.isRequired,
  loadAsync: PropTypes.func.isRequired,
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired
  }).isRequired,
  exerciseConfig: PropTypes.object,
  exerciseEnvironmentConfig: PropTypes.object,
  editEnvironmentConfigs: PropTypes.func.isRequired,
  exerciseScoreConfig: PropTypes.object,
  exerciseTests: PropTypes.object,
  editScoreConfig: PropTypes.func.isRequired,
  editTests: PropTypes.func.isRequired,
  fetchConfig: PropTypes.func.isRequired,
  setConfig: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  pipelines: ImmutablePropTypes.map,
  environmetnsWithEntryPoints: PropTypes.array.isRequired,
  reloadExercise: PropTypes.func.isRequired,
  reloadConfig: PropTypes.func.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default withLinks(
  connect(
    (state, { params: { exerciseId } }) => {
      return {
        exercise: getExercise(exerciseId)(state),
        userId: loggedInUserIdSelector(state),
        runtimeEnvironments: runtimeEnvironmentsSelector(state),
        exerciseConfig: exerciseConfigSelector(exerciseId)(state),
        exerciseEnvironmentConfig: exerciseEnvironmentConfigSelector(
          exerciseId
        )(state),
        exerciseScoreConfig: exerciseScoreConfigSelector(exerciseId)(state),
        exerciseTests: exerciseTestsSelector(exerciseId)(state),
        pipelines: pipelinesSelector(state),
        environmetnsWithEntryPoints: getPipelinesEnvironmentsWhichHasEntryPoint(
          state
        )
      };
    },
    (dispatch, { params: { exerciseId } }) => ({
      loadAsync: () =>
        EditExerciseSimpleConfig.loadAsync({ exerciseId }, dispatch),
      editEnvironmentConfigs: data =>
        dispatch(setExerciseEnvironmentConfig(exerciseId, data)),
      editScoreConfig: data => dispatch(setScoreConfig(exerciseId, data)),
      editTests: data => dispatch(setExerciseTests(exerciseId, data)),
      fetchConfig: () => dispatch(fetchExerciseConfig(exerciseId)),
      setConfig: data => dispatch(setExerciseConfig(exerciseId, data)),
      reloadExercise: () => dispatch(fetchExercise(exerciseId)),
      reloadConfig: () =>
        dispatch(fetchExercise(exerciseId)).then(({ value: exercise }) =>
          Promise.all([
            dispatch(fetchExerciseConfig(exerciseId)),
            dispatch(fetchExerciseEnvironmentConfig(exerciseId))
          ])
        )
    })
  )(injectIntl(EditExerciseSimpleConfig))
);
