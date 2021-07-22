import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { formValueSelector } from 'redux-form';
import { defaultMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import Box from '../../components/widgets/Box';
import Callout from '../../components/widgets/Callout';
import { LockIcon, CheckRequiredIcon, SaveIcon } from '../../components/icons';
import ExerciseCallouts, { exerciseCalloutsAreVisible } from '../../components/Exercises/ExerciseCallouts';
import ExerciseButtons from '../../components/Exercises/ExerciseButtons';
import AssignmentsTable from '../../components/Assignments/Assignment/AssignmentsTable';
import EditAssignmentForm, {
  prepareInitialValues as prepareEditFormInitialValues,
} from '../../components/forms/EditAssignmentForm';

import { fetchExerciseIfNeeded } from '../../redux/modules/exercises';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { create as assignExercise, editAssignment, fetchExerciseAssignments } from '../../redux/modules/assignments';
import { exerciseSelector } from '../../redux/selectors/exercises';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { groupDataAccessorSelector } from '../../redux/selectors/groups';
import { groupsUserCanAssignToSelector } from '../../redux/selectors/usersGroups';
import { assignmentEnvironmentsSelector, getExerciseAssignments } from '../../redux/selectors/assignments';

import { getLocalizedName } from '../../helpers/localizedData';
import { hasPermissions } from '../../helpers/common';
import withLinks from '../../helpers/withLinks';

const messages = defineMessages({
  groupsBoxTitle: {
    id: 'app.exerciseAssignments.multiAssignBox',
    defaultMessage: 'Assign to Groups',
  },
});

const SUBMIT_BUTTON_MESSAGES = {
  submit: <FormattedMessage id="app.multiAssignForm.submit" defaultMessage="Assign Exercise" />,
  submitting: <FormattedMessage id="app.multiAssignForm.submitting" defaultMessage="Assigning Exercise..." />,
  success: <FormattedMessage id="app.multiAssignForm.success" defaultMessage="Exercise was assigned." />,
};

const getAssignmentsGroups = defaultMemoize(assignments => assignments.map(({ groupId }) => groupId));

class ExerciseAssignments extends Component {
  state = { forkId: null };

  static loadAsync = ({ exerciseId }, dispatch) =>
    Promise.all([
      dispatch(fetchExerciseIfNeeded(exerciseId)),
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchExerciseAssignments(exerciseId)),
    ]);

  componentDidMount() {
    this.props.loadAsync();
    this.reset();
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.exerciseId !== prevProps.match.params.exerciseId) {
      this.props.loadAsync();
      this.reset();
    }
  }

  reset() {
    this.setState({ forkId: Math.random().toString() });
  }

  multiAssignFormInitialValues = defaultMemoize(
    (visibleGroups, runtimeEnvironments, solutionFilesLimit, solutionSizeLimit) => {
      const groups = visibleGroups.reduce((acc, { id }) => {
        acc[`id${id}`] = false;
        return acc;
      }, {});

      const enabledRuntime = runtimeEnvironments.reduce((acc, { id }) => {
        acc[id] = true;
        return acc;
      }, {});

      return prepareEditFormInitialValues({
        solutionFilesLimit,
        solutionSizeLimit,
        groups,
        runtimeEnvironmentIds: Object.keys(enabledRuntime),
        enabledRuntime,
      });
    }
  );

  assignExercise = formData => {
    const { assignExercise, editAssignment } = this.props;

    return Promise.all(
      formData.groups.map(groupId => {
        return assignExercise(groupId).then(({ value: { id, localizedTexts, version } }) =>
          editAssignment(id, Object.assign({}, { localizedTexts, version }, formData))
        );
      })
    );
  };

  render() {
    const {
      userId,
      exercise,
      assignments,
      assignmentEnvironmentsSelector,
      assignableGroups,
      groupsAccessor,
      deadlines,
      visibility,
      links: { EXERCISE_URI_FACTORY },
      intl: { formatMessage, locale },
      match: {
        params: { exerciseId },
      },
    } = this.props;

    return (
      <Page
        title={exercise => getLocalizedName(exercise, locale)}
        resource={exercise}
        description={
          <FormattedMessage id="app.exerciseAssignments.description" defaultMessage="Exercise Assignments" />
        }
        breadcrumbs={[
          {
            resource: exercise,
            breadcrumb: exercise => ({
              text: (
                <FormattedMessage
                  id="app.exercise.breadcrumbTitle"
                  defaultMessage="Exercise {name}"
                  values={{
                    name: exercise ? getLocalizedName(exercise, locale) : '',
                  }}
                />
              ),
              iconName: 'puzzle-piece',
              link: EXERCISE_URI_FACTORY(exerciseId),
            }),
          },
          {
            text: <FormattedMessage id="app.exerciseAssignments.description" defaultMessage="Exercise Assignments" />,
            iconName: 'tasks',
          },
        ]}>
        {exercise => (
          <div>
            {exerciseCalloutsAreVisible(exercise) && (
              <Row>
                <Col sm={12}>
                  <ExerciseCallouts {...exercise} />
                </Col>
              </Row>
            )}

            <Row>
              <Col sm={12}>
                <ExerciseButtons {...exercise} />
              </Col>
            </Row>

            {hasPermissions(exercise, 'viewAssignments') && (
              <Row>
                <Col lg={12}>
                  <Box
                    title={
                      <FormattedMessage
                        id="app.exerciseAssignments.description"
                        defaultMessage="Exercise Assignments"
                      />
                    }
                    noPadding
                    unlimitedHeight>
                    <AssignmentsTable
                      assignments={assignments.toList()}
                      assignmentEnvironmentsSelector={assignmentEnvironmentsSelector}
                      userId={userId}
                      isAdmin={true}
                      showNames={false}
                      groupsAccessor={groupsAccessor}
                      showGroups={true}
                    />
                  </Box>
                </Col>
              </Row>
            )}

            {!exercise.isBroken && hasPermissions(exercise, 'viewDetail') && (
              <Row>
                <Col sm={12}>
                  {exercise.isLocked && (
                    <Callout variant="warning" icon={<LockIcon />}>
                      <FormattedMessage
                        id="app.ExercisePrefixIcons.isLocked"
                        defaultMessage="Exercise is locked by the author and cannot be assigned."
                      />
                    </Callout>
                  )}

                  {!exercise.hasReferenceSolutions && (
                    <Callout variant="warning" icon={<CheckRequiredIcon />}>
                      <FormattedMessage
                        id="app.exercise.noRefSolutions"
                        defaultMessage="Exercise has no proof of concept. Exercise must get at least one reference solution before it can be assigned."
                      />
                    </Callout>
                  )}

                  {!exercise.isLocked && exercise.hasReferenceSolutions && (
                    <Box title={formatMessage(messages.groupsBoxTitle)} unlimitedHeight>
                      <ResourceRenderer resource={assignableGroups.toArray()} returnAsArray>
                        {assignableGroups => (
                          <ResourceRenderer resource={assignments.toList()} returnAsArray>
                            {assignments => (
                              <>
                                <Callout variant="info">
                                  <FormattedMessage
                                    id="app.exercise.assignToGroup"
                                    defaultMessage="Here, you can assign this exercise simultaneously to multiple groups under your supervision. The exercise can also be assigned from within the groups individually. Please note that an exercise may be assigned multiple times in a group, so beware accidental repetitive assignment."
                                  />
                                </Callout>

                                <EditAssignmentForm
                                  form="multiAssign"
                                  userId={userId}
                                  initialValues={this.multiAssignFormInitialValues(
                                    assignableGroups,
                                    exercise.runtimeEnvironments,
                                    exercise.solutionFilesLimit,
                                    exercise.solutionSizeLimit
                                  )}
                                  onSubmit={this.assignExercise}
                                  groups={assignableGroups}
                                  groupsAccessor={groupsAccessor}
                                  alreadyAssignedGroups={getAssignmentsGroups(assignments)}
                                  runtimeEnvironments={exercise.runtimeEnvironments}
                                  deadlines={deadlines}
                                  visibility={visibility}
                                  assignmentIsPublic={false}
                                  submitButtonMessages={SUBMIT_BUTTON_MESSAGES}
                                  defaultIcon={<SaveIcon gapRight />}
                                  mergeJudgeLogs={exercise.mergeJudgeLogs}
                                />
                              </>
                            )}
                          </ResourceRenderer>
                        )}
                      </ResourceRenderer>
                    </Box>
                  )}
                </Col>
              </Row>
            )}
          </div>
        )}
      </Page>
    );
  }
}

ExerciseAssignments.propTypes = {
  userId: PropTypes.string.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      exerciseId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  exercise: ImmutablePropTypes.map,
  assignments: ImmutablePropTypes.map,
  assignmentEnvironmentsSelector: PropTypes.func,
  assignableGroups: ImmutablePropTypes.map,
  groupsAccessor: PropTypes.func.isRequired,
  deadlines: PropTypes.string,
  visibility: PropTypes.string,
  links: PropTypes.object,
  intl: PropTypes.object.isRequired,
  loadAsync: PropTypes.func.isRequired,
  assignExercise: PropTypes.func.isRequired,
  editAssignment: PropTypes.func.isRequired,
};

const multiAssignFormSelector = formValueSelector('multiAssign');

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
      const userId = loggedInUserIdSelector(state);
      return {
        userId,
        exercise: exerciseSelector(exerciseId)(state),
        assignments: getExerciseAssignments(state, exerciseId),
        assignmentEnvironmentsSelector: assignmentEnvironmentsSelector(state),
        assignableGroups: groupsUserCanAssignToSelector(state),
        groupsAccessor: groupDataAccessorSelector(state),
        deadlines: multiAssignFormSelector(state, 'deadlines'),
        visibility: multiAssignFormSelector(state, 'visibility'),
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
      loadAsync: () => ExerciseAssignments.loadAsync({ exerciseId }, dispatch),
      assignExercise: groupId => dispatch(assignExercise(groupId, exerciseId)),
      editAssignment: (id, body) => dispatch(editAssignment(id, body)),
    })
  )(injectIntl(ExerciseAssignments))
);
