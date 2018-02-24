import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { defaultMemoize } from 'reselect';
import Icon from 'react-fontawesome';
import { formValueSelector } from 'redux-form';

import Page from '../../components/layout/Page';
import HardwareGroupMetadata from '../../components/Exercises/HardwareGroupMetadata';
import { LocalizedExerciseName } from '../../components/helpers/LocalizedNames';
import EditHardwareGroupForm from '../../components/forms/EditHardwareGroupForm';
import EditLimitsForm from '../../components/forms/EditLimitsForm/EditLimitsForm';
import ExerciseButtons from '../../components/Exercises/ExerciseButtons';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

import {
  fetchExercise,
  fetchExerciseIfNeeded,
  setExerciseHardwareGroups
} from '../../redux/modules/exercises';
import {
  fetchExerciseEnvironmentLimits,
  fetchExerciseEnvironmentLimitsIfNeeded,
  editEnvironmentLimits,
  cloneHorizontally,
  cloneVertically,
  cloneAll
} from '../../redux/modules/limits';
import { fetchHardwareGroups } from '../../redux/modules/hwGroups';
import { getExercise } from '../../redux/selectors/exercises';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { limitsSelector } from '../../redux/selectors/limits';
import { hardwareGroupsSelector } from '../../redux/selectors/hwGroups';
import { isLoggedAsSuperAdmin } from '../../redux/selectors/users';

import withLinks from '../../helpers/withLinks';
import { getLocalizedName } from '../../helpers/getLocalizedData';
import { fetchExerciseTestsIfNeeded } from '../../redux/modules/exerciseTests';
import { exerciseTestsSelector } from '../../redux/selectors/exerciseTests';

import {
  getLimitsInitValues,
  transformLimitsValues,
  getLimitsConstraints,
  validateLimitsSingleEnvironment
} from '../../helpers/exerciseLimits';

class EditExerciseLimits extends Component {
  componentWillMount = () => this.props.loadAsync();

  componentWillReceiveProps = nextProps => {
    if (this.props.params.exerciseId !== nextProps.params.exerciseId) {
      nextProps.loadAsync();
    }
  };

  static loadAsync = ({ exerciseId }, dispatch) =>
    Promise.all([
      dispatch(fetchHardwareGroups()),
      dispatch(fetchExerciseIfNeeded(exerciseId)).then(
        ({ value: exercise }) =>
          exercise.hardwareGroups && exercise.hardwareGroups.length === 1
            ? Promise.all(
                exercise.runtimeEnvironments.map(environment =>
                  dispatch(
                    fetchExerciseEnvironmentLimitsIfNeeded(
                      exerciseId,
                      environment.id,
                      exercise.hardwareGroups[0].id
                    )
                  )
                )
              )
            : Promise.resolve()
      ),
      dispatch(fetchExerciseTestsIfNeeded(exerciseId))
    ]);

  transformAndSendHardwareGroups = defaultMemoize(
    (exerciseId, hwGroupId, limits, tests, exerciseRuntimeEnvironments) => {
      const {
        setExerciseHardwareGroups,
        editEnvironmentLimits,
        fetchExerciseEnvironmentLimit
      } = this.props;
      const limitsData =
        hwGroupId &&
        getLimitsInitValues(
          limits,
          tests,
          exerciseRuntimeEnvironments,
          exerciseId,
          hwGroupId
        );

      return formData =>
        setExerciseHardwareGroups(
          formData.hardwareGroup ? [formData.hardwareGroup] : []
        ).then(
          ({ value: exercise }) =>
            limitsData
              ? Promise.all(
                  exercise.hardwareGroups.map(({ id: hwgId }, idx) => {
                    const constraints = getLimitsConstraints(
                      exercise.hardwareGroups,
                      limitsData.preciseTime
                    );
                    return Promise.all(
                      transformLimitsValues(
                        limitsData,
                        tests,
                        exerciseRuntimeEnvironments
                      ).map(
                        ({ id: envId, data }) =>
                          validateLimitsSingleEnvironment(
                            limitsData,
                            envId,
                            constraints
                          )
                            ? editEnvironmentLimits(hwgId, envId, data)
                            : idx === 0
                              ? fetchExerciseEnvironmentLimit(envId, hwgId)
                              : Promise.resolve()
                      )
                    );
                  })
                )
              : Promise.resolve()
        );
    }
  );

  transformAndSendLimitsValues = defaultMemoize(
    (tests, exerciseRuntimeEnvironments) => {
      const { exercise, editEnvironmentLimits, reloadExercise } = this.props;
      return formData =>
        Promise.all(
          transformLimitsValues(
            formData,
            tests,
            exerciseRuntimeEnvironments
          ).map(({ id, data }) =>
            editEnvironmentLimits(
              exercise.getIn(['data', 'hardwareGroups', 0, 'id']),
              id,
              data
            )
          )
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
      hardwareGroups,
      preciseTime,
      targetHardwareGroup,
      isSuperAdmin,
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

            {Boolean(
              exercise.hardwareGroups && exercise.hardwareGroups.length > 1
            ) &&
              <Row>
                <Col sm={12}>
                  <div className="alert alert-danger">
                    <h4>
                      <i className="icon fa fa-ban" />{' '}
                      <FormattedMessage
                        id="app.editExerciseLimits.multiHwGroupsTitle"
                        defaultMessage="Multiple hardware groups detected"
                      />
                    </h4>
                    <p>
                      <FormattedMessage
                        id="app.editExerciseLimits.multiHwGroups"
                        defaultMessage="The exercise uses complex configuration of multiple hardware groups. Editting the limits using this form may simplify this configuration. Proceed at your own risk."
                      />
                    </p>
                  </div>
                </Col>
              </Row>}

            <ResourceRenderer
              resource={hardwareGroups.toArray()}
              returnAsArray={true}
            >
              {hwgs =>
                <Row>
                  <Col sm={12} md={6}>
                    <EditHardwareGroupForm
                      initialValues={{
                        hardwareGroup:
                          exercise.hardwareGroups &&
                          exercise.hardwareGroups.length === 1
                            ? exercise.hardwareGroups[0].id
                            : ''
                      }}
                      hardwareGroups={hwgs}
                      addEmptyOption={
                        !exercise.hardwareGroups ||
                        exercise.hardwareGroups.length !== 1
                      }
                      onSubmit={this.transformAndSendHardwareGroups(
                        exercise.id,
                        exercise.hardwareGroups &&
                          exercise.hardwareGroups[0].id,
                        limits,
                        tests,
                        exercise.runtimeEnvironments
                      )}
                    />
                  </Col>
                  <Col sm={12} md={6}>
                    {exercise.hardwareGroups.map(h =>
                      <HardwareGroupMetadata
                        key={h.id}
                        hardwareGroup={h}
                        isSuperAdmin={isSuperAdmin}
                      />
                    )}
                    {Boolean(
                      targetHardwareGroup &&
                        (exercise.hardwareGroups.length !== 1 ||
                          targetHardwareGroup !== exercise.hardwareGroups[0].id)
                    ) &&
                      <div>
                        <div
                          className="text-center text-muted"
                          style={{ marginBottom: '15px' }}
                        >
                          &nbsp;<Icon name="arrow-down" />&nbsp;
                        </div>
                        <HardwareGroupMetadata
                          key={targetHardwareGroup}
                          hardwareGroup={hwgs.find(
                            h => h.id === targetHardwareGroup
                          )}
                          isSuperAdmin={isSuperAdmin}
                        />
                      </div>}
                  </Col>
                </Row>}
            </ResourceRenderer>

            <Row>
              <Col sm={12}>
                {tests.length > 0 &&
                exercise.runtimeEnvironments.length > 0 &&
                exercise.hardwareGroups.length > 0
                  ? <EditLimitsForm
                      onSubmit={this.transformAndSendLimitsValues(
                        tests,
                        exercise.runtimeEnvironments
                      )}
                      environments={exercise.runtimeEnvironments}
                      tests={tests}
                      constraints={getLimitsConstraints(
                        exercise.hardwareGroups,
                        preciseTime
                      )}
                      initialValues={getLimitsInitValues(
                        limits,
                        tests,
                        exercise.runtimeEnvironments,
                        exercise.id,
                        exercise.hardwareGroups[0].id
                      )}
                      cloneVertically={cloneVertically}
                      cloneHorizontally={cloneHorizontally}
                      cloneAll={cloneAll}
                    />
                  : <div className="alert alert-warning">
                      <h4>
                        <i className="icon fa fa-warning" />{' '}
                        <FormattedMessage
                          id="app.editExerciseLimits.missingSomethingTitle"
                          defaultMessage="Exercise configuration is incomplete"
                        />
                      </h4>
                      <FormattedMessage
                        id="app.editExerciseLimits.missingSomething"
                        defaultMessage="The limits can be set only when the exercise configuration is complete. The tests, runtime environments, and a hardware group must be properly set aprior to setting limits."
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
  editEnvironmentLimits: PropTypes.func.isRequired,
  setExerciseHardwareGroups: PropTypes.func.isRequired,
  fetchExerciseEnvironmentLimit: PropTypes.func.isRequired,
  exerciseTests: PropTypes.object,
  limits: PropTypes.object.isRequired,
  hardwareGroups: ImmutablePropTypes.map,
  preciseTime: PropTypes.bool,
  targetHardwareGroup: PropTypes.string,
  isSuperAdmin: PropTypes.bool.isRequired,
  cloneHorizontally: PropTypes.func.isRequired,
  cloneVertically: PropTypes.func.isRequired,
  cloneAll: PropTypes.func.isRequired,
  reloadExercise: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
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

const editLimitsFormSelector = formValueSelector('editLimits');
const editHardwareGroupFormSelector = formValueSelector('editHardwareGroup');

export default withLinks(
  connect(
    (state, { params: { exerciseId } }) => {
      return {
        exercise: getExercise(exerciseId)(state),
        userId: loggedInUserIdSelector(state),
        limits: limitsSelector(state),
        exerciseTests: exerciseTestsSelector(exerciseId)(state),
        hardwareGroups: hardwareGroupsSelector(state),
        preciseTime: editLimitsFormSelector(state, 'preciseTime'),
        targetHardwareGroup: editHardwareGroupFormSelector(
          state,
          'hardwareGroup'
        ),
        isSuperAdmin: isLoggedAsSuperAdmin(state)
      };
    },
    (dispatch, { params: { exerciseId } }) => ({
      loadAsync: () => EditExerciseLimits.loadAsync({ exerciseId }, dispatch),
      setExerciseHardwareGroups: hwGroups =>
        dispatch(setExerciseHardwareGroups(exerciseId, hwGroups)),
      editEnvironmentLimits: (hwGroupId, runtimeEnvironmentId, data) =>
        dispatch(
          editEnvironmentLimits(
            exerciseId,
            runtimeEnvironmentId,
            hwGroupId,
            data
          )
        ),
      cloneVertically: cloneVerticallyWrapper(dispatch),
      cloneHorizontally: cloneHorizontallyWrapper(dispatch),
      cloneAll: cloneAllWrapper(dispatch),
      fetchExerciseEnvironmentLimit: (envId, hwgId) =>
        dispatch(fetchExerciseEnvironmentLimits(exerciseId, envId, hwgId)),
      reloadExercise: () => dispatch(fetchExercise(exerciseId))
    })
  )(injectIntl(EditExerciseLimits))
);
