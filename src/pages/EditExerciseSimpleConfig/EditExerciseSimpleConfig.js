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
import EditSimpleLimitsBox from '../../components/Exercises/EditSimpleLimitsBox';
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
import { fetchExerciseConfigIfNeeded } from '../../redux/modules/exerciseConfigs';
import { getExercise } from '../../redux/selectors/exercises';
import { exerciseConfigSelector } from '../../redux/selectors/exerciseConfigs';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';
import { simpleLimitsSelector } from '../../redux/selectors/simpleLimits';

import withLinks from '../../hoc/withLinks';
import { getLocalizedName } from '../../helpers/getLocalizedData';
import { exerciseEnvironmentConfigSelector } from '../../redux/selectors/exerciseEnvironmentConfigs';
import {
  fetchExerciseEnvironmentConfigIfNeeded,
  setExerciseEnvironmentConfig
} from '../../redux/modules/exerciseEnvironmentConfigs';

const getEnvInitValues = environmentConfigs => {
  let res = {};
  for (const env of environmentConfigs) {
    res[env.runtimeEnvironmentId] = true;
  }
  return res;
};

const transformAndSendEnvValues = (
  formData,
  environments,
  editEnvironmentConfigs
) => {
  let res = [];
  for (const env in formData) {
    if (formData[env] !== true && formData[env] !== 'true') {
      continue;
    }
    let envObj = { runtimeEnvironmentId: env };
    const currentFullEnv = environments.find(e => e.id === env);
    envObj.variablesTable = currentFullEnv.defaultVariables;
    res.push(envObj);
  }
  return editEnvironmentConfigs({ environmentConfigs: res });
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
      dispatch(fetchRuntimeEnvironments())
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
      limits,
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
                  <EditTestsForm
                    initialValues={{ isUniform: true }}
                    onSubmit={data => console.log(data)}
                  />
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
                    resource={[...runtimeEnvironments.toArray()]}
                  >
                    {(...environments) =>
                      <ResourceRenderer resource={exerciseEnvironmentConfig}>
                        {environmentConfigs =>
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
                  <EditExerciseSimpleConfigForm
                    exercise={exercise}
                    onSubmit={data => console.log(data)}
                  />
                </Box>
              </Col>
            </Row>
            <br />

            <Row>
              <Col lg={12}>
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
                    </div>}
                </ResourceRenderer>
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
  links: PropTypes.object.isRequired,
  limits: PropTypes.func.isRequired,
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
          limits: runtimeEnvironmentId =>
            simpleLimitsSelector(exerciseId, runtimeEnvironmentId)(state),
          exerciseEnvironmentConfig: exerciseEnvironmentConfigSelector(
            exerciseId
          )(state)
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
