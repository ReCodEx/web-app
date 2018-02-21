import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { defaultMemoize } from 'reselect';
import Icon from 'react-fontawesome';

import Page from '../../components/layout/Page';
import { LocalizedExerciseName } from '../../components/helpers/LocalizedNames';
import EditSimpleLimitsForm from '../../components/forms/EditSimpleLimitsForm/EditSimpleLimitsForm';
import ExerciseButtons from '../../components/Exercises/ExerciseButtons';

import {
  fetchExercise,
  fetchExerciseIfNeeded
} from '../../redux/modules/exercises';
import {
  fetchExerciseEnvironmentSimpleLimitsIfNeeded,
  editEnvironmentSimpleLimits,
  cloneHorizontally,
  cloneVertically,
  cloneAll
} from '../../redux/modules/simpleLimits';
import { getExercise } from '../../redux/selectors/exercises';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { simpleLimitsSelector } from '../../redux/selectors/simpleLimits';

import withLinks from '../../helpers/withLinks';
import { getLocalizedName } from '../../helpers/getLocalizedData';
import { fetchExerciseTestsIfNeeded } from '../../redux/modules/exerciseTests';
import { exerciseTestsSelector } from '../../redux/selectors/exerciseTests';

import {
  getLimitsInitValues,
  transformLimitsValues
} from '../../helpers/exerciseSimpleForm'; // TODO presun

class EditExerciseLimits extends Component {
  componentWillMount = () => this.props.loadAsync();

  componentWillReceiveProps = nextProps => {
    if (this.props.params.exerciseId !== nextProps.params.exerciseId) {
      nextProps.loadAsync();
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
      dispatch(fetchExerciseTestsIfNeeded(exerciseId))
    ]);

  transformAndSendLimitsValues = defaultMemoize(
    (tests, exerciseRuntimeEnvironments) => {
      const { editEnvironmentSimpleLimits, reloadExercise } = this.props;
      return formData =>
        Promise.all(
          transformLimitsValues(
            formData,
            tests,
            exerciseRuntimeEnvironments
          ).map(({ id, data }) => editEnvironmentSimpleLimits(id, data))
        ).then(reloadExercise);
    }
  );

  render() {
    const {
      links: { EXERCISE_URI_FACTORY },
      params: { exerciseId },
      exercise,
      exerciseTests,
      limits,
      cloneHorizontally,
      cloneVertically,
      cloneAll,
      intl: { locale }
    } = this.props;

    return (
      <Page
        resource={[exercise, exerciseTests, ...limits.toArray()]}
        title={exercise => <LocalizedExerciseName entity={exercise} />}
        description={
          <FormattedMessage
            id="app.editExerciseLimits.description"
            defaultMessage="Change exercise tests execution limits"
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
                id="app.editExerciseLimits.title"
                defaultMessage="Edit tests limits"
              />
            ),
            iconName: 'pencil'
          }
        ]}
      >
        {(exercise, tests) =>
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
            <br />

            <Row>
              <Col sm={12}>
                {tests.length > 0 && exercise.runtimeEnvironments.length > 0
                  ? <EditSimpleLimitsForm
                      onSubmit={this.transformAndSendLimitsValues(
                        tests,
                        exercise.runtimeEnvironments
                      )}
                      environments={exercise.runtimeEnvironments}
                      tests={tests}
                      initialValues={getLimitsInitValues(
                        limits,
                        tests,
                        exercise.runtimeEnvironments,
                        exercise.id
                      )}
                      cloneVertically={cloneVertically}
                      cloneHorizontally={cloneHorizontally}
                      cloneAll={cloneAll}
                    />
                  : <div className="alert alert-warning">
                      <h4>
                        <i className="icon fa fa-warning" />{' '}
                        <FormattedMessage
                          id="app.editLimitsBox.title"
                          defaultMessage="Edit limits"
                        />
                      </h4>
                      <FormattedMessage
                        id="app.editExerciseSimpleConfig.noTestsOrEnvironments"
                        defaultMessage="There are no tests or no enabled environments yet. The form cannot be displayed until at least one test is created and one environment is enabled."
                      />
                    </div>}
              </Col>
            </Row>
          </div>}
      </Page>
    );
  }
}

EditExerciseLimits.propTypes = {
  exercise: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired
  }).isRequired,
  editEnvironmentSimpleLimits: PropTypes.func.isRequired,
  exerciseTests: PropTypes.object,
  links: PropTypes.object.isRequired,
  limits: PropTypes.object.isRequired,
  cloneHorizontally: PropTypes.func.isRequired,
  cloneVertically: PropTypes.func.isRequired,
  cloneAll: PropTypes.func.isRequired,
  reloadExercise: PropTypes.func.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

const cloneVerticallyWrapper = defaultMemoize(
  dispatch => (formName, testName, runtimeEnvironmentId) => field => () =>
    dispatch(cloneVertically(formName, testName, runtimeEnvironmentId, field))
);

const cloneHorizontallyWrapper = defaultMemoize(
  dispatch => (formName, testName, runtimeEnvironmentId) => field => () =>
    dispatch(cloneHorizontally(formName, testName, runtimeEnvironmentId, field))
);

const cloneAllWrapper = defaultMemoize(
  dispatch => (formName, testName, runtimeEnvironmentId) => field => () =>
    dispatch(cloneAll(formName, testName, runtimeEnvironmentId, field))
);

export default withLinks(
  connect(
    (state, { params: { exerciseId } }) => {
      return {
        exercise: getExercise(exerciseId)(state),
        userId: loggedInUserIdSelector(state),
        limits: simpleLimitsSelector(state),
        exerciseTests: exerciseTestsSelector(exerciseId)(state)
      };
    },
    (dispatch, { params: { exerciseId } }) => ({
      loadAsync: () => EditExerciseLimits.loadAsync({ exerciseId }, dispatch),
      editEnvironmentSimpleLimits: (runtimeEnvironmentId, data) =>
        dispatch(
          editEnvironmentSimpleLimits(exerciseId, runtimeEnvironmentId, data)
        ),
      cloneVertically: cloneVerticallyWrapper(dispatch),
      cloneHorizontally: cloneHorizontallyWrapper(dispatch),
      cloneAll: cloneAllWrapper(dispatch),
      reloadExercise: () => dispatch(fetchExercise(exerciseId))
    })
  )(injectIntl(EditExerciseLimits))
);
