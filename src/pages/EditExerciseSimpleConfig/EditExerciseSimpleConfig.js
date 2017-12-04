import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { LocalizedExerciseName } from '../../components/helpers/LocalizedNames';
import EditSimpleLimitsForm from '../../components/forms/EditSimpleLimits/EditSimpleLimitsForm';
import SupplementaryFilesTableContainer from '../../containers/SupplementaryFilesTableContainer';
import EditTestsForm from '../../components/forms/EditTestsForm';
import EditExerciseSimpleConfigForm from '../../components/forms/EditExerciseSimpleConfigForm';
import EditEnvironmentSimpleForm from '../../components/forms/EditEnvironmentSimpleForm';

import { fetchExerciseIfNeeded } from '../../redux/modules/exercises';
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
import { getExercise } from '../../redux/selectors/exercises';
import { exerciseConfigSelector } from '../../redux/selectors/exerciseConfigs';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';
import { simpleLimitsAllSelector } from '../../redux/selectors/simpleLimits';

import withLinks from '../../hoc/withLinks';
import { getLocalizedName } from '../../helpers/getLocalizedData';
import { exerciseEnvironmentConfigSelector } from '../../redux/selectors/exerciseEnvironmentConfigs';
import {
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
import { pipelinesSelector } from '../../redux/selectors/pipelines';

import {
  getEnvInitValues,
  transformAndSendEnvValues,
  getTestsInitValues,
  transformAndSendTestsValues,
  getSimpleConfigInitValues,
  transformAndSendConfigValues
} from '../../helpers/exerciseSimpleForm';

const getLimitsInitValues = (limits, tests, environments) => {
  let res = {};

  tests.forEach(test => {
    const testId = 'test' + btoa(test.name); // the name can be anything, but it must be compatible with redux-form <Field>
    res[testId] = {};
    environments.forEach(environment => {
      const envId = 'env' + btoa(environment.id); // the name can be anything, but it must be compatible with redux-form <Field>
      res[testId][envId] =
        limits[environment.id] && limits[environment.id][test.name]
          ? limits[environment.id][test.name]
          : {
              memory: 0,
              'wall-time': 0
            };
    });
  });

  return { limits: res };
};

class EditExerciseSimpleConfig extends Component {
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
      dispatch(fetchExerciseEnvironmentConfigIfNeeded(exerciseId)),
      dispatch(fetchScoreConfigIfNeeded(exerciseId)),
      dispatch(fetchExerciseTestsIfNeeded(exerciseId)),
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchPipelines())
    ]);

  render() {
    const {
      links: { EXERCISE_URI_FACTORY },
      params: { exerciseId },
      exercise,
      runtimeEnvironments,
      exerciseConfig,
      editEnvironmentSimpleLimits,
      exerciseEnvironmentConfig,
      editEnvironmentConfigs,
      exerciseScoreConfig,
      exerciseTests,
      editScoreConfig,
      editTests,
      setConfig,
      limits,
      pipelines,
      setHorizontally,
      setVertically,
      setAll,
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
                <Box
                  title={
                    <FormattedMessage
                      id="app.editExercise.editTests"
                      defaultMessage="Edit tests"
                    />
                  }
                  unlimitedHeight
                >
                  <ResourceRenderer
                    resource={[exerciseScoreConfig, exerciseTests]}
                  >
                    {(scoreConfig, tests) =>
                      <EditTestsForm
                        initialValues={getTestsInitValues(
                          tests,
                          scoreConfig,
                          locale
                        )}
                        onSubmit={data =>
                          transformAndSendTestsValues(
                            data,
                            editTests,
                            editScoreConfig
                          )}
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
                    resource={[
                      exerciseEnvironmentConfig,
                      ...runtimeEnvironments.toArray()
                    ]}
                  >
                    {(environmentConfigs, ...environments) =>
                      <EditEnvironmentSimpleForm
                        initialValues={getEnvInitValues(environmentConfigs)}
                        runtimeEnvironments={environments}
                        onSubmit={data =>
                          transformAndSendEnvValues(
                            data,
                            environments,
                            editEnvironmentConfigs
                          )}
                      />}
                  </ResourceRenderer>
                </Box>
              </Col>
              <Col lg={6}>
                <SupplementaryFilesTableContainer exercise={exercise} />
              </Col>
            </Row>
            <br />

            <Row>
              <Col lg={12}>
                <Box
                  title={
                    <FormattedMessage
                      id="app.editExercise.editConfig"
                      defaultMessage="Edit exercise configuration"
                    />
                  }
                  unlimitedHeight
                >
                  <ResourceRenderer
                    resource={[
                      exerciseConfig,
                      exerciseTests,
                      exerciseEnvironmentConfig,
                      ...pipelines.toArray()
                    ]}
                  >
                    {(config, tests, environments, ...pipelines) => {
                      const sortedTests = tests.sort((a, b) =>
                        a.name.localeCompare(b.name, locale)
                      );
                      return (
                        <EditExerciseSimpleConfigForm
                          initialValues={getSimpleConfigInitValues(
                            config,
                            sortedTests,
                            locale
                          )}
                          exercise={exercise}
                          exerciseTests={sortedTests}
                          onSubmit={data =>
                            transformAndSendConfigValues(
                              data,
                              pipelines,
                              environments,
                              setConfig
                            )}
                        />
                      );
                    }}
                  </ResourceRenderer>
                </Box>
              </Col>
            </Row>
            <br />

            <Row>
              <Col lg={12}>
                <ResourceRenderer resource={exerciseTests}>
                  {(
                    tests // todo add limits here, so the form wait for them to load and update getLimitsInitValues
                  ) =>
                    <EditSimpleLimitsForm
                      editLimits={editEnvironmentSimpleLimits}
                      environments={exercise.runtimeEnvironments}
                      tests={tests.sort((a, b) =>
                        a.name.localeCompare(b.name, locale)
                      )}
                      initialValues={getLimitsInitValues(
                        limits,
                        tests,
                        exercise.runtimeEnvironments
                      )}
                      setVertically={setVertically}
                      setHorizontally={setHorizontally}
                      setAll={setAll}
                    />}
                </ResourceRenderer>
                {/*
                  <ResourceRenderer resource={exerciseConfig}>
                  {config =>
                    <div>
                      <EditSimpleLimitsBox
                        editLimits={editEnvironmentSimpleLimits}
                        environments={exercise.runtimeEnvironments}
                        limits={limits}
                        config={config}
                        setVertically={setVertically}
                        setHorizontally={setHorizontally}
                        setAll={setAll}
                      />
                    </div>
                                    </ResourceRenderer>
                                    */}
              </Col>
            </Row>
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
  editEnvironmentSimpleLimits: PropTypes.func.isRequired,
  exerciseScoreConfig: PropTypes.object,
  exerciseTests: PropTypes.object,
  editScoreConfig: PropTypes.func.isRequired,
  editTests: PropTypes.func.isRequired,
  setConfig: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  limits: PropTypes.object.isRequired,
  pipelines: ImmutablePropTypes.map,
  setHorizontally: PropTypes.func.isRequired,
  setVertically: PropTypes.func.isRequired,
  setAll: PropTypes.func.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(
  withLinks(
    connect(
      (state, { params: { exerciseId } }) => {
        return {
          exercise: getExercise(exerciseId)(state),
          userId: loggedInUserIdSelector(state),
          runtimeEnvironments: runtimeEnvironmentsSelector(state),
          exerciseConfig: exerciseConfigSelector(exerciseId)(state),
          limits: simpleLimitsAllSelector(exerciseId)(state),
          exerciseEnvironmentConfig: exerciseEnvironmentConfigSelector(
            exerciseId
          )(state),
          exerciseScoreConfig: exerciseScoreConfigSelector(exerciseId)(state),
          exerciseTests: exerciseTestsSelector(exerciseId)(state),
          pipelines: pipelinesSelector(state)
        };
      },
      (dispatch, { params: { exerciseId } }) => ({
        loadAsync: () =>
          EditExerciseSimpleConfig.loadAsync({ exerciseId }, dispatch),
        editEnvironmentSimpleLimits: runtimeEnvironmentId => data =>
          dispatch(
            editEnvironmentSimpleLimits(exerciseId, runtimeEnvironmentId, data)
          ),
        editEnvironmentConfigs: data =>
          dispatch(setExerciseEnvironmentConfig(exerciseId, data)),
        editScoreConfig: data => dispatch(setScoreConfig(exerciseId, data)),
        editTests: data => dispatch(setExerciseTests(exerciseId, data)),
        setConfig: data => dispatch(setExerciseConfig(exerciseId, data)),
        setHorizontally: (formName, runtimeEnvironmentId) => testName => () =>
          dispatch(
            setHorizontally(
              formName,
              exerciseId,
              runtimeEnvironmentId,
              testName
            )
          ),
        setVertically: (formName, runtimeEnvironmentId) => testName => () =>
          dispatch(
            setVertically(formName, exerciseId, runtimeEnvironmentId, testName)
          ),
        setAll: (formName, runtimeEnvironmentId) => testName => () =>
          dispatch(setAll(formName, exerciseId, runtimeEnvironmentId, testName))
      })
    )(EditExerciseSimpleConfig)
  )
);
