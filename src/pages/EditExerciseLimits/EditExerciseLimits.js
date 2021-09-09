import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { defaultMemoize } from 'reselect';
import { formValueSelector } from 'redux-form';

import Page from '../../components/layout/Page';
import { ExerciseNavigation } from '../../components/layout/Navigation';
import HardwareGroupMetadata from '../../components/Exercises/HardwareGroupMetadata';
import EditHardwareGroupForm from '../../components/forms/EditHardwareGroupForm';
import EditLimitsForm from '../../components/forms/EditLimitsForm/EditLimitsForm';
import ExerciseCallouts, { exerciseCalloutsAreVisible } from '../../components/Exercises/ExerciseCallouts';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import Icon, { LimitsIcon } from '../../components/icons';
import Callout from '../../components/widgets/Callout';

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

import { fetchExerciseTestsIfNeeded } from '../../redux/modules/exerciseTests';
import { exerciseTestsSelector } from '../../redux/selectors/exerciseTests';

import {
  getLimitsInitValues,
  transformLimitsValues,
  getLimitsConstraints,
  validateLimitsConstraints,
  saturateLimitsConstraints,
} from '../../helpers/exercise/limits';
import { hasPermissions } from '../../helpers/common';

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
    const {
      setExerciseHardwareGroups,
      setExerciseLimits,
      reloadExercise,
      invalidateExercise,
      history: { replace },
      location: { pathname, search, hash },
    } = this.props;

    if (hash) {
      replace(pathname + search);
    }

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
    const {
      setExerciseLimits,
      reloadExercise,
      history: { replace },
      location: { pathname, search, hash },
    } = this.props;
    if (hash) {
      replace(pathname + search);
    }
    return formData =>
      setExerciseLimits(transformLimitsValues(formData, hwGroupId, exerciseRuntimeEnvironments, tests)).then(
        reloadExercise
      );
  });

  render() {
    const {
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
    } = this.props;

    return (
      <Page
        resource={[exercise, exerciseTests, limits]}
        icon={<LimitsIcon />}
        title={
          <FormattedMessage id="app.editExerciseLimits.title" defaultMessage="Change Exercise Tests Execution Limits" />
        }>
        {(exercise, tests, limits) => (
          <div>
            <ExerciseNavigation
              exerciseId={exercise.id}
              canEdit={hasPermissions(exercise, 'update')}
              canViewTests={hasPermissions(exercise, 'viewPipelines', 'viewScoreConfig')}
              canViewLimits={hasPermissions(exercise, 'viewLimits')}
              canViewAssignments={hasPermissions(exercise, 'viewAssignments')}
            />

            {exerciseCalloutsAreVisible(exercise) && (
              <Row>
                <Col sm={12}>
                  <ExerciseCallouts {...exercise} />
                </Col>
              </Row>
            )}

            {Boolean(exercise.hardwareGroups && exercise.hardwareGroups.length > 1) && (
              <Row>
                <Col sm={12}>
                  <Callout variant="danger">
                    <h4>
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
                  </Callout>
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
                        {exercise.hardwareGroups.length > 0 && (
                          <div className="text-center text-muted em-margin-bottom">
                            &nbsp;
                            <Icon icon="arrow-down" />
                            &nbsp;
                          </div>
                        )}
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
                  <Callout variant="warning">
                    <h4>
                      <FormattedMessage
                        id="app.editExerciseLimits.missingSomethingTitle"
                        defaultMessage="Exercise configuration is incomplete"
                      />
                    </h4>
                    <FormattedMessage
                      id="app.editExerciseLimits.missingSomething"
                      defaultMessage="The limits can be set only when the exercise configuration is complete. The tests, runtime environments, and a hardware group must be properly set aprior to setting limits."
                    />
                  </Callout>
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
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
    hash: PropTypes.string.isRequired,
  }).isRequired,
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

export default connect(
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
)(withRouter(EditExerciseLimits));
