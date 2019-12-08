import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { defaultMemoize } from 'reselect';
import { formValueSelector } from 'redux-form';

import Page from '../../components/layout/Page';
import HardwareGroupMetadata from '../../components/Exercises/HardwareGroupMetadata';
import EditHardwareGroupForm from '../../components/forms/EditHardwareGroupForm';
import EditLimitsForm from '../../components/forms/EditLimitsForm/EditLimitsForm';
import ExerciseButtons from '../../components/Exercises/ExerciseButtons';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import Icon, { NeedFixingIcon } from '../../components/icons';

import {
  fetchExercise,
  fetchExerciseIfNeeded,
  setExerciseHardwareGroups,
  invalidateExercise,
} from '../../redux/modules/exercises';
import {
  fetchExerciseLimits,
  fetchExerciseLimitsIfNeeded,
  setExerciseLimits,
  cloneHorizontally,
  cloneVertically,
  cloneAll,
} from '../../redux/modules/limits';
import { fetchHardwareGroups } from '../../redux/modules/hwGroups';
import { getExercise } from '../../redux/selectors/exercises';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { limitsSelector } from '../../redux/selectors/limits';
import { hardwareGroupsSelector } from '../../redux/selectors/hwGroups';
import { isLoggedAsSuperAdmin } from '../../redux/selectors/users';

import withLinks from '../../helpers/withLinks';
import { getLocalizedName } from '../../helpers/localizedData';
import { fetchExerciseTestsIfNeeded } from '../../redux/modules/exerciseTests';
import { exerciseTestsSelector } from '../../redux/selectors/exerciseTests';

import {
  getLimitsInitValues,
  transformLimitsValues,
  getLimitsConstraints,
  validateLimitsConstraints,
  saturateLimitsConstraints,
} from '../../helpers/exercise/limits';

class EditExerciseLimits extends Component {
  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.match.params.exerciseId !== prevProps.match.params.exerciseId) {
      this.props.loadAsync();
    }
  }

  static loadAsync = ({ exerciseId }, dispatch) =>
    Promise.all([
      dispatch(fetchHardwareGroups()),
      dispatch(fetchExerciseIfNeeded(exerciseId)),
      dispatch(fetchExerciseLimitsIfNeeded(exerciseId)),
      dispatch(fetchExerciseTestsIfNeeded(exerciseId)),
    ]);

  doesHardwareGroupChangeDropLimits = defaultMemoize(
    (currentHwGroupId, limits, tests, exerciseRuntimeEnvironments, hardwareGroups) => {
      const limitsData =
        currentHwGroupId && getLimitsInitValues(limits, tests, exerciseRuntimeEnvironments, currentHwGroupId);

      return targetHwGroupId => {
        if (!targetHwGroupId || !currentHwGroupId || targetHwGroupId === currentHwGroupId) {
          return false;
        }
        const constraints = getLimitsConstraints(
          hardwareGroups.filter(h => h.id === targetHwGroupId),
          limitsData.preciseTime
        );

        return !validateLimitsConstraints(limitsData, constraints);
      };
    }
  );

  transformAndSendHardwareGroups = defaultMemoize((hwGroupId, limits) => {
    const { setExerciseHardwareGroups, setExerciseLimits, reloadExercise, invalidateExercise } = this.props;
    const limitsData = limits && limits[hwGroupId];
    return formData =>
      setExerciseHardwareGroups(formData.hardwareGroup ? [formData.hardwareGroup] : [])
        .then(({ value: exercise }) => {
          invalidateExercise(); // prevent UI from showing intermediate state of the transaction
          return limitsData
            ? setExerciseLimits({
                [formData.hardwareGroup]: saturateLimitsConstraints(limitsData, exercise.hardwareGroups),
              })
            : Promise.resolve();
        })
        .then(reloadExercise);
  });

  transformAndSendLimitsValues = defaultMemoize((hwGroupId, tests, exerciseRuntimeEnvironments) => {
    const { setExerciseLimits, reloadExercise } = this.props;
    return formData =>
      setExerciseLimits(transformLimitsValues(formData, hwGroupId, exerciseRuntimeEnvironments, tests)).then(
        reloadExercise
      );
  });

  render() {
    const {
      links: { EXERCISE_URI_FACTORY },
      match: {
        params: { exerciseId },
      },
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
      intl: { locale },
    } = this.props;

    return (
      <Page
        resource={[exercise, exerciseTests, limits]}
        title={exercise => getLocalizedName(exercise, locale)}
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
                    name: getLocalizedName({ name, localizedTexts }, locale),
                  }}
                />
              ),
              iconName: 'puzzle-piece',
              link: EXERCISE_URI_FACTORY(exerciseId),
            }),
          },
          {
            text: <FormattedMessage id="app.editExerciseLimits.title" defaultMessage="Edit tests limits" />,
            iconName: ['far', 'edit'],
          },
        ]}>
        {(exercise, tests, limits) => (
          <div>
            {exercise.isBroken && (
              <Row>
                <Col sm={12}>
                  <div className="callout callout-warning">
                    <h4>
                      <NeedFixingIcon gapRight />
                      <FormattedMessage
                        id="app.exercise.isBroken"
                        defaultMessage="Exercise configuration is incorrect and needs fixing."
                      />
                    </h4>
                    {exercise.validationError}
                  </div>
                </Col>
              </Row>
            )}
            <Row>
              <Col sm={12}>
                <ExerciseButtons {...exercise} />
              </Col>
            </Row>

            {Boolean(exercise.hardwareGroups && exercise.hardwareGroups.length > 1) && (
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
              </Row>
            )}

            <ResourceRenderer resource={hardwareGroups.toArray()} returnAsArray={true}>
              {hwgs => (
                <Row>
                  {exercise.permissionHints.setLimits && (
                    <Col sm={12} md={6}>
                      <EditHardwareGroupForm
                        initialValues={{
                          hardwareGroup:
                            exercise.hardwareGroups && exercise.hardwareGroups.length === 1
                              ? exercise.hardwareGroups[0].id
                              : '',
                        }}
                        hardwareGroups={hwgs}
                        addEmptyOption={!exercise.hardwareGroups || exercise.hardwareGroups.length !== 1}
                        warnDropLimits={this.doesHardwareGroupChangeDropLimits(
                          exercise.hardwareGroups.length > 0 && exercise.hardwareGroups[0].id,
                          limits,
                          tests,
                          exercise.runtimeEnvironments,
                          hwgs
                        )}
                        onSubmit={this.transformAndSendHardwareGroups(
                          exercise.hardwareGroups.length > 0 && exercise.hardwareGroups[0].id,
                          limits,
                          tests,
                          exercise.runtimeEnvironments
                        )}
                      />
                    </Col>
                  )}
                  <Col sm={12} md={6}>
                    {exercise.hardwareGroups.map(h => (
                      <HardwareGroupMetadata key={h.id} hardwareGroup={h} isSuperAdmin={isSuperAdmin} />
                    ))}
                    {Boolean(
                      targetHardwareGroup &&
                        (exercise.hardwareGroups.length !== 1 || targetHardwareGroup !== exercise.hardwareGroups[0].id)
                    ) && (
                      <div>
                        <div className="text-center text-muted em-margin-bottom">
                          &nbsp;
                          <Icon icon="arrow-down" />
                          &nbsp;
                        </div>
                        <HardwareGroupMetadata
                          key={targetHardwareGroup}
                          hardwareGroup={hwgs.find(h => h.id === targetHardwareGroup)}
                          isSuperAdmin={isSuperAdmin}
                        />
                      </div>
                    )}
                  </Col>
                </Row>
              )}
            </ResourceRenderer>

            <Row>
              <Col sm={12}>
                {tests.length > 0 && exercise.runtimeEnvironments.length > 0 && exercise.hardwareGroups.length > 0 ? (
                  <EditLimitsForm
                    onSubmit={this.transformAndSendLimitsValues(
                      exercise.hardwareGroups[0].id,
                      tests,
                      exercise.runtimeEnvironments
                    )}
                    environments={exercise.runtimeEnvironments}
                    tests={tests}
                    constraints={getLimitsConstraints(exercise.hardwareGroups, preciseTime)}
                    initialValues={getLimitsInitValues(
                      limits,
                      tests,
                      exercise.runtimeEnvironments,
                      exercise.hardwareGroups[0].id
                    )}
                    cloneVertically={cloneVertically}
                    cloneHorizontally={cloneHorizontally}
                    cloneAll={cloneAll}
                    readOnly={!exercise.permissionHints.setLimits}
                  />
                ) : (
                  <div className="callout callout-warning">
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
                  </div>
                )}
              </Col>
            </Row>
          </div>
        )}
      </Page>
    );
  }
}

EditExerciseLimits.propTypes = {
  exercise: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      exerciseId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  setExerciseLimits: PropTypes.func.isRequired,
  setExerciseHardwareGroups: PropTypes.func.isRequired,
  fetchExerciseLimits: PropTypes.func.isRequired,
  exerciseTests: PropTypes.object,
  limits: ImmutablePropTypes.map,
  hardwareGroups: ImmutablePropTypes.map,
  preciseTime: PropTypes.bool,
  targetHardwareGroup: PropTypes.string,
  isSuperAdmin: PropTypes.bool.isRequired,
  cloneHorizontally: PropTypes.func.isRequired,
  cloneVertically: PropTypes.func.isRequired,
  cloneAll: PropTypes.func.isRequired,
  reloadExercise: PropTypes.func.isRequired,
  invalidateExercise: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

const cloneVerticallyWrapper = defaultMemoize(dispatch => (formName, testName, runtimeEnvironmentId) => field => () =>
  dispatch(cloneVertically(formName, testName, runtimeEnvironmentId, field))
);

const cloneHorizontallyWrapper = defaultMemoize(dispatch => (formName, testName, runtimeEnvironmentId) => field => () =>
  dispatch(cloneHorizontally(formName, testName, runtimeEnvironmentId, field))
);

const cloneAllWrapper = defaultMemoize(dispatch => (formName, testName, runtimeEnvironmentId) => field => () =>
  dispatch(cloneAll(formName, testName, runtimeEnvironmentId, field))
);

const editLimitsFormSelector = formValueSelector('editLimits');
const editHardwareGroupFormSelector = formValueSelector('editHardwareGroup');

export default withLinks(
  connect(
    (
      state,
      {
        match: {
          params: { exerciseId },
        },
      }
    ) => {
      return {
        exercise: getExercise(exerciseId)(state),
        userId: loggedInUserIdSelector(state),
        limits: limitsSelector(state, exerciseId),
        exerciseTests: exerciseTestsSelector(exerciseId)(state),
        hardwareGroups: hardwareGroupsSelector(state),
        preciseTime: editLimitsFormSelector(state, 'preciseTime'),
        targetHardwareGroup: editHardwareGroupFormSelector(state, 'hardwareGroup'),
        isSuperAdmin: isLoggedAsSuperAdmin(state),
      };
    },
    (
      dispatch,
      {
        match: {
          params: { exerciseId },
        },
      }
    ) => ({
      loadAsync: () => EditExerciseLimits.loadAsync({ exerciseId }, dispatch),
      setExerciseHardwareGroups: hwGroups => dispatch(setExerciseHardwareGroups(exerciseId, hwGroups)),
      setExerciseLimits: limits => dispatch(setExerciseLimits(exerciseId, { limits })),
      cloneVertically: cloneVerticallyWrapper(dispatch),
      cloneHorizontally: cloneHorizontallyWrapper(dispatch),
      cloneAll: cloneAllWrapper(dispatch),
      fetchExerciseLimits: envId => dispatch(fetchExerciseLimits(exerciseId, envId)),
      reloadExercise: () => dispatch(fetchExercise(exerciseId)),
      invalidateExercise: () => dispatch(invalidateExercise(exerciseId)),
    })
  )(injectIntl(EditExerciseLimits))
);
