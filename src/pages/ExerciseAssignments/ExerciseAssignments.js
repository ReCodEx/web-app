import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import {
  FormattedMessage,
  defineMessages,
  intlShape,
  injectIntl
} from 'react-intl';
import { Row, Col, Alert } from 'react-bootstrap';
import { formValueSelector } from 'redux-form';
import { defaultMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import Box from '../../components/widgets/Box';
import { NeedFixingIcon } from '../../components/icons';
import ExerciseButtons from '../../components/Exercises/ExerciseButtons';
import EditAssignmentForm, {
  prepareInitialValues as prepareEditFormInitialValues
} from '../../components/forms/EditAssignmentForm';

import { fetchExerciseIfNeeded } from '../../redux/modules/exercises';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import {
  create as assignExercise,
  editAssignment
} from '../../redux/modules/assignments';
import { exerciseSelector } from '../../redux/selectors/exercises';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  groupDataAccessorSelector,
  groupsUserCanAssignToSelector
} from '../../redux/selectors/groups';

import { getLocalizedName } from '../../helpers/localizedData';
import withLinks from '../../helpers/withLinks';

const messages = defineMessages({
  groupsBox: {
    id: 'app.exercise.groupsBox',
    defaultMessage: 'Assign to Groups'
  },
  referenceSolutionsBox: {
    id: 'app.exercise.referenceSolutionsBox',
    defaultMessage: 'Reference Solutions'
  }
});

const SUBMIT_BUTTON_MESSAGES = {
  submit: (
    <FormattedMessage
      id="app.multiAssignForm.submit"
      defaultMessage="Assign Exercise"
    />
  ),
  submitting: (
    <FormattedMessage
      id="app.multiAssignForm.submitting"
      defaultMessage="Assigning Exercise..."
    />
  ),
  success: (
    <FormattedMessage
      id="app.multiAssignForm.success"
      defaultMessage="Exercise was assigned."
    />
  )
};

class ExerciseAssignments extends Component {
  state = { forkId: null };

  static loadAsync = ({ exerciseId }, dispatch, { userId }) =>
    Promise.all([
      dispatch(fetchExerciseIfNeeded(exerciseId)),
      dispatch(fetchRuntimeEnvironments())
    ]);

  componentWillMount() {
    this.props.loadAsync(this.props.userId);
    this.reset();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.exerciseId !== newProps.params.exerciseId) {
      newProps.loadAsync(this.props.userId);
      this.reset();
    }
  }

  reset() {
    this.setState({ forkId: Math.random().toString() });
  }

  multiAssignFormInitialValues = defaultMemoize(
    (visibleGroups, runtimeEnvironments) => {
      const groups = visibleGroups.reduce((acc, { id }) => {
        acc[`id${id}`] = false;
        return acc;
      }, {});

      const enabledRuntime = runtimeEnvironments.reduce((acc, { id }) => {
        acc[id] = true;
        return acc;
      }, {});

      return prepareEditFormInitialValues({
        groups,
        runtimeEnvironmentIds: Object.keys(enabledRuntime),
        enabledRuntime
      });
    }
  );

  assignExercise = formData => {
    const { assignExercise, editAssignment } = this.props;

    return Promise.all(
      formData.groups.map(groupId => {
        return assignExercise(
          groupId
        ).then(({ value: { id, localizedTexts, version } }) =>
          editAssignment(
            id,
            Object.assign({}, { localizedTexts, version }, formData)
          )
        );
      })
    );
  };

  render() {
    const {
      userId,
      exercise,
      assignableGroups,
      groupsAccessor,
      firstDeadline,
      allowSecondDeadline,
      visibility,
      links: { EXERCISE_URI_FACTORY },
      intl: { formatMessage, locale },
      params: { exerciseId }
    } = this.props;

    return (
      <Page
        title={exercise => getLocalizedName(exercise, locale)}
        resource={exercise}
        description={
          <FormattedMessage
            id="app.exerciseAssignments.description"
            defaultMessage="Exercise Assignments"
          />
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
                    name: exercise ? getLocalizedName(exercise, locale) : ''
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
                id="app.exerciseAssignments.description"
                defaultMessage="Exercise Assignments"
              />
            ),
            iconName: 'tasks'
          }
        ]}
      >
        {exercise =>
          <div>
            {exercise.isBroken &&
              <Row>
                <Col sm={12}>
                  <div className="callout callout-warning">
                    <h4>
                      <NeedFixingIcon gapRight />
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
                <ExerciseButtons {...exercise} />
              </Col>
            </Row>

            <Row>
              <Col sm={12}>
                {!exercise.isBroken &&
                  !exercise.isLocked &&
                  <Box
                    title={formatMessage(messages.groupsBox)}
                    description={
                      <Alert bsStyle="info">
                        <FormattedMessage
                          id="app.exercise.assignToGroup"
                          defaultMessage="You can assign this exercise to multiple groups you supervise. The exercise can also be assigned from within the groups individually. Please note that an exercise may be assigned multiple times and this form does not track existing assignments."
                        />
                      </Alert>
                    }
                    unlimitedHeight
                  >
                    <ResourceRenderer
                      resource={assignableGroups.toArray()}
                      returnAsArray
                    >
                      {assignableGroups =>
                        <EditAssignmentForm
                          form="multiAssign"
                          userId={userId}
                          initialValues={this.multiAssignFormInitialValues(
                            assignableGroups,
                            exercise.runtimeEnvironments
                          )}
                          onSubmit={this.assignExercise}
                          groups={assignableGroups}
                          groupsAccessor={groupsAccessor}
                          runtimeEnvironments={exercise.runtimeEnvironments}
                          firstDeadline={firstDeadline}
                          allowSecondDeadline={allowSecondDeadline}
                          visibility={visibility}
                          assignmentIsPublic={false}
                          submitButtonMessages={SUBMIT_BUTTON_MESSAGES}
                        />}
                    </ResourceRenderer>
                  </Box>}
              </Col>
            </Row>
          </div>}
      </Page>
    );
  }
}

ExerciseAssignments.contextTypes = {
  links: PropTypes.object
};

ExerciseAssignments.propTypes = {
  userId: PropTypes.string.isRequired,
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired
  }).isRequired,
  exercise: ImmutablePropTypes.map,
  assignableGroups: ImmutablePropTypes.map,
  groupsAccessor: PropTypes.func.isRequired,
  firstDeadline: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.object
  ]),
  allowSecondDeadline: PropTypes.bool,
  visibility: PropTypes.string,
  links: PropTypes.object,
  intl: intlShape.isRequired,
  loadAsync: PropTypes.func.isRequired,
  assignExercise: PropTypes.func.isRequired,
  editAssignment: PropTypes.func.isRequired
};

const multiAssignFormSelector = formValueSelector('multiAssign');

export default withLinks(
  connect(
    (state, { params: { exerciseId } }) => {
      const userId = loggedInUserIdSelector(state);
      return {
        userId,
        exercise: exerciseSelector(exerciseId)(state),
        assignableGroups: groupsUserCanAssignToSelector(state),
        groupsAccessor: groupDataAccessorSelector(state),
        firstDeadline: multiAssignFormSelector(state, 'firstDeadline'),
        allowSecondDeadline: multiAssignFormSelector(
          state,
          'allowSecondDeadline'
        ),
        visibility: multiAssignFormSelector(state, 'visibility')
      };
    },
    (dispatch, { params: { exerciseId } }) => ({
      loadAsync: userId =>
        ExerciseAssignments.loadAsync({ exerciseId }, dispatch, { userId }),
      assignExercise: groupId => dispatch(assignExercise(groupId, exerciseId)),
      editAssignment: (id, body) => dispatch(editAssignment(id, body))
    })
  )(injectIntl(ExerciseAssignments))
);
