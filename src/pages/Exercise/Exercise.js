import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import {
  FormattedMessage,
  defineMessages,
  intlShape,
  injectIntl
} from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { formValueSelector } from 'redux-form';
import moment from 'moment';
import { defaultMemoize } from 'reselect';

import SupplementaryFilesTableContainer from '../../containers/SupplementaryFilesTableContainer/SupplementaryFilesTableContainer';
import Button from '../../components/widgets/FlatButton';
import Page from '../../components/layout/Page';
import ExerciseDetail from '../../components/Exercises/ExerciseDetail';
import LocalizedTexts from '../../components/helpers/LocalizedTexts';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import ReferenceSolutionsList from '../../components/Exercises/ReferenceSolutionsList';
import SubmitSolutionContainer from '../../containers/SubmitSolutionContainer';
import Box from '../../components/widgets/Box';
import {
  EditIcon,
  SendIcon,
  DeleteIcon,
  AddIcon,
  NeedFixingIcon
} from '../../components/icons';
import Confirm from '../../components/forms/Confirm';
import PipelinesSimpleList from '../../components/Pipelines/PipelinesSimpleList';
import ExerciseButtons from '../../components/Exercises/ExerciseButtons';
import ForkExerciseForm from '../../components/forms/ForkExerciseForm';
import MultiAssignForm from '../../components/forms/MultiAssignForm';

import { isSubmitting } from '../../redux/selectors/submission';
import {
  fetchExerciseIfNeeded,
  forkExercise
} from '../../redux/modules/exercises';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';
import {
  fetchReferenceSolutions,
  deleteReferenceSolution
} from '../../redux/modules/referenceSolutions';
import {
  init,
  submitReferenceSolution,
  presubmitReferenceSolution
} from '../../redux/modules/submission';
import { fetchHardwareGroups } from '../../redux/modules/hwGroups';
import {
  create as assignExercise,
  editAssignment
} from '../../redux/modules/assignments';
import {
  exerciseSelector,
  exerciseForkedFromSelector
} from '../../redux/selectors/exercises';
import { referenceSolutionsSelector } from '../../redux/selectors/referenceSolutions';
import {
  canLoggedUserEditExercise,
  isLoggedAsSuperAdmin
} from '../../redux/selectors/users';
import {
  deletePipeline,
  fetchExercisePipelines,
  create as createPipeline
} from '../../redux/modules/pipelines';
import { exercisePipelinesSelector } from '../../redux/selectors/pipelines';
import {
  fetchUsersGroupsIfNeeded,
  fetchInstanceGroups
} from '../../redux/modules/groups';

import {
  loggedInUserIdSelector,
  selectedInstanceId
} from '../../redux/selectors/auth';
import {
  groupDataAccessorSelector,
  groupsUserCanEditSelector,
  groupsUserCanAssignToSelector
} from '../../redux/selectors/groups';

import withLinks from '../../helpers/withLinks';
import { getLocalizedName } from '../../helpers/getLocalizedData';

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

class Exercise extends Component {
  state = { forkId: null };

  static loadAsync = ({ exerciseId }, dispatch, { userId, instanceId }) =>
    Promise.all([
      dispatch(fetchExerciseIfNeeded(exerciseId)).then(
        ({ value: data }) =>
          data &&
          data.forkedFrom &&
          dispatch(fetchExerciseIfNeeded(data.forkedFrom))
      ),
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchReferenceSolutions(exerciseId)),
      dispatch(fetchHardwareGroups()),
      dispatch(fetchExercisePipelines(exerciseId)),
      dispatch(fetchUsersGroupsIfNeeded(userId)),
      instanceId && dispatch(fetchInstanceGroups(instanceId))
    ]);

  componentWillMount() {
    this.props.loadAsync(this.props.userId, this.props.instanceId);
    this.reset();
  }

  componentWillReceiveProps(newProps) {
    if (
      this.props.params.exerciseId !== newProps.params.exerciseId ||
      this.props.instanceId !== newProps.instanceId
    ) {
      newProps.loadAsync(this.props.userId, newProps.instanceId);
      this.reset();
    }
  }

  reset() {
    this.setState({ forkId: Math.random().toString() });
  }

  multiAssignFormInitialValues = defaultMemoize(
    (visibleGroups, runtimeEnvironments) => {
      const groups = {};
      visibleGroups.forEach(g => {
        groups[`id${g.id}`] = false;
      });

      return {
        groups,
        submissionsCountLimit: '50',
        firstDeadline: moment().add(2, 'weeks').endOf('day'),
        secondDeadline: '',
        allowSecondDeadline: false,
        maxPointsBeforeFirstDeadline: '10',
        maxPointsBeforeSecondDeadline: '',
        canViewLimitRatios: true,
        pointsPercentualThreshold: '0',
        isBonus: false,
        runtimeEnvironments,
        sendNotification: true,
        enabledRuntime: runtimeEnvironments.reduce((enabled, { id }) => {
          enabled[id] = true;
          return enabled;
        }, {})
      };
    }
  );

  assignExercise = formData => {
    const { assignExercise, editAssignment } = this.props;

    const groups =
      formData && formData.groups
        ? Object.keys(formData.groups).filter(key => formData.groups[key])
        : [];

    const disabledRuntimeEnvironmentIds = formData.enabledRuntime
      ? Object.keys(formData.enabledRuntime).filter(
          key => formData.enabledRuntime[key] === false
        )
      : [];

    let actions = [];

    for (const groupIdMangled of groups) {
      const groupId = groupIdMangled.replace(/^id/, '');
      const groupPromise = assignExercise(
        groupId
      ).then(({ value: assigment }) => {
        let assignmentData = Object.assign({}, assigment, formData, {
          firstDeadline: moment(formData.firstDeadline).unix(),
          secondDeadline: moment(formData.secondDeadline).unix(),
          submissionsCountLimit: Number(formData.submissionsCountLimit),
          pointsPercentualThreshold: Number(formData.pointsPercentualThreshold),
          maxPointsBeforeFirstDeadline: Number(
            formData.maxPointsBeforeFirstDeadline
          ),
          maxPointsBeforeSecondDeadline: Number(
            formData.maxPointsBeforeSecondDeadline
          ),
          isPublic: true,
          sendNotification: formData.sendNotification,
          disabledRuntimeEnvironmentIds
        });
        if (!assignmentData.allowSecondDeadline) {
          delete assignmentData.secondDeadline;
          delete assignmentData.maxPointsBeforeSecondDeadline;
        }
        delete assignmentData.groups;
        delete assignmentData.enabledRuntime;

        return editAssignment(assigment.id, assignmentData);
      });
      actions.push(groupPromise);
    }

    return Promise.all(actions);
  };

  createExercisePipeline = () => {
    const {
      createExercisePipeline,
      push,
      links: { PIPELINE_EDIT_URI_FACTORY }
    } = this.props;
    createExercisePipeline().then(({ value: pipeline }) =>
      push(PIPELINE_EDIT_URI_FACTORY(pipeline.id))
    );
  };

  render() {
    const {
      userId,
      exercise,
      forkedFrom,
      runtimeEnvironments,
      submitting,
      canEditExercise,
      referenceSolutions,
      intl: { formatMessage, locale },
      initCreateReferenceSolution,
      exercisePipelines,
      deleteReferenceSolution,
      push,
      groups,
      assignableGroups,
      groupsAccessor,
      forkExercise,
      isSuperAdmin,
      firstDeadline,
      allowSecondDeadline,
      links: {
        EXERCISES_URI,
        EXERCISE_REFERENCE_SOLUTION_URI_FACTORY,
        PIPELINE_EDIT_URI_FACTORY
      }
    } = this.props;

    const { forkId } = this.state;

    return (
      <Page
        title={exercise => getLocalizedName(exercise, locale)}
        resource={exercise}
        description={
          <FormattedMessage
            id="app.exercise.overview"
            defaultMessage="Exercise overview"
          />
        }
        breadcrumbs={[
          {
            text: (
              <FormattedMessage
                id="app.exercises.title"
                defaultMessage="Exercises"
              />
            ),
            iconName: 'puzzle-piece',
            link: EXERCISES_URI
          },
          {
            text: (
              <FormattedMessage
                id="app.exercise.overview"
                defaultMessage="Exercise overview"
              />
            ),
            iconName: ['far', 'lightbulb']
          }
        ]}
      >
        {exercise =>
          <div>
            {exercise.isBroken &&
              <Row>
                <Col sm={12}>
                  <div className="alert alert-warning">
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
              {canEditExercise &&
                <Col sm={12}>
                  <ExerciseButtons exerciseId={exercise.id} />
                  <p />
                  {isSuperAdmin &&
                    <ForkExerciseForm
                      exerciseId={exercise.id}
                      groups={groups}
                      forkId={forkId}
                      onSubmit={formData => forkExercise(forkId, formData)}
                      groupsAccessor={groupsAccessor}
                    />}
                  <p />
                </Col>}
            </Row>
            <Row>
              <Col lg={6}>
                <div>
                  {exercise.localizedTexts.length > 0 &&
                    <LocalizedTexts locales={exercise.localizedTexts} />}
                </div>
                {!exercise.isBroken &&
                  !exercise.isLocked &&
                  <Box
                    title={formatMessage(messages.groupsBox)}
                    description={
                      <p>
                        <FormattedMessage
                          id="app.exercise.assignToGroup"
                          defaultMessage="You can assign this exercise to some of the groups you supervise."
                        />
                      </p>
                    }
                    unlimitedHeight
                  >
                    <ResourceRenderer
                      resource={assignableGroups.toArray()}
                      returnAsArray
                    >
                      {assignableGroups =>
                        <MultiAssignForm
                          initialValues={this.multiAssignFormInitialValues(
                            assignableGroups,
                            exercise.runtimeEnvironments
                          )}
                          groups={assignableGroups}
                          userId={userId}
                          runtimeEnvironments={exercise.runtimeEnvironments}
                          onSubmit={this.assignExercise}
                          firstDeadline={firstDeadline}
                          allowSecondDeadline={allowSecondDeadline}
                          groupsAccessor={groupsAccessor}
                          locale={locale}
                        />}
                    </ResourceRenderer>
                  </Box>}

                {exercise.configurationType !== 'simpleExerciseConfig' &&
                  <Box
                    title={
                      <FormattedMessage
                        id="app.exercise.exercisePipelines"
                        defaultMessage="Exercise Pipelines"
                      />
                    }
                    footer={
                      <p className="text-center">
                        <Button
                          bsStyle="success"
                          className="btn-flat"
                          bsSize="sm"
                          onClick={this.createExercisePipeline}
                        >
                          <AddIcon gapRight />
                          <FormattedMessage
                            id="app.exercise.createPipeline"
                            defaultMessage="Add exercise pipeline"
                          />
                        </Button>
                      </p>
                    }
                    isOpen
                  >
                    <ResourceRenderer
                      resource={exercisePipelines.toArray()}
                      returnAsArray={true}
                    >
                      {pipelines =>
                        <PipelinesSimpleList
                          pipelines={pipelines}
                          createActions={pipelineId =>
                            <div>
                              <LinkContainer
                                to={PIPELINE_EDIT_URI_FACTORY(pipelineId)}
                              >
                                <Button
                                  bsSize="xs"
                                  className="btn-flat"
                                  bsStyle="warning"
                                >
                                  <EditIcon gapRight />
                                  <FormattedMessage
                                    id="generic.edit"
                                    defaultMessage="Edit"
                                  />
                                </Button>
                              </LinkContainer>
                              <Confirm
                                id={pipelineId}
                                onConfirmed={() => deletePipeline(pipelineId)}
                                question={
                                  <FormattedMessage
                                    id="app.pipeline.deleteConfirm"
                                    defaultMessage="Are you sure you want to delete the pipeline? This cannot be undone."
                                  />
                                }
                              >
                                <Button
                                  bsSize="xs"
                                  className="btn-flat"
                                  bsStyle="danger"
                                >
                                  <DeleteIcon gapRight />
                                  <FormattedMessage
                                    id="generic.delete"
                                    defaultMessage="Delete"
                                  />
                                </Button>
                              </Confirm>
                            </div>}
                        />}
                    </ResourceRenderer>
                  </Box>}
              </Col>
              <Col lg={6}>
                <ExerciseDetail
                  {...exercise}
                  forkedFrom={forkedFrom}
                  locale={locale}
                />

                <ResourceRenderer
                  resource={runtimeEnvironments.toArray()}
                  returnAsArray={true}
                >
                  {runtimes =>
                    <Box
                      title={formatMessage(messages.referenceSolutionsBox)}
                      noPadding
                      footer={
                        <p className="text-center">
                          <Button
                            bsStyle={exercise.isBroken ? 'default' : 'success'}
                            onClick={() => initCreateReferenceSolution(userId)}
                            disabled={exercise.isBroken}
                          >
                            {exercise.isBroken
                              ? <FormattedMessage
                                  id="app.exercise.isBrokenShort"
                                  defaultMessage="Exercise is broken ..."
                                />
                              : <FormattedMessage
                                  id="app.exercise.submitReferenceSoution"
                                  defaultMessage="Submit New Reference Solution"
                                />}
                          </Button>
                        </p>
                      }
                    >
                      <div>
                        <ResourceRenderer
                          resource={referenceSolutions.toArray()}
                          returnAsArray
                        >
                          {referenceSolutions =>
                            referenceSolutions.length > 0
                              ? <ReferenceSolutionsList
                                  referenceSolutions={referenceSolutions}
                                  runtimeEnvironments={runtimes}
                                  renderButtons={(
                                    solutionId,
                                    permissionHints
                                  ) =>
                                    <div>
                                      <Button
                                        bsSize="xs"
                                        onClick={() =>
                                          push(
                                            EXERCISE_REFERENCE_SOLUTION_URI_FACTORY(
                                              exercise.id,
                                              solutionId
                                            )
                                          )}
                                      >
                                        <SendIcon gapRight />
                                        <FormattedMessage
                                          id="generic.detail"
                                          defaultMessage="Detail"
                                        />
                                      </Button>
                                      {permissionHints &&
                                        permissionHints.delete !== false &&
                                        <Confirm
                                          id={solutionId}
                                          onConfirmed={() =>
                                            deleteReferenceSolution(
                                              exercise.id,
                                              solutionId
                                            )}
                                          question={
                                            <FormattedMessage
                                              id="app.exercise.referenceSolution.deleteConfirm"
                                              defaultMessage="Are you sure you want to delete the reference solution? This cannot be undone."
                                            />
                                          }
                                        >
                                          <Button
                                            bsSize="xs"
                                            className="btn-flat"
                                            bsStyle="danger"
                                          >
                                            <DeleteIcon gapRight />
                                            <FormattedMessage
                                              id="generic.delete"
                                              defaultMessage="Delete"
                                            />
                                          </Button>
                                        </Confirm>}
                                    </div>}
                                />
                              : <p className="text-center">
                                  <FormattedMessage
                                    id="app.exercise.noReferenceSolutions"
                                    defaultMessage="There are no reference solutions for this exercise yet."
                                  />
                                </p>}
                        </ResourceRenderer>
                        <SubmitSolutionContainer
                          userId={userId}
                          id={exercise.id}
                          onSubmit={submitReferenceSolution}
                          presubmitValidation={presubmitReferenceSolution}
                          onReset={init}
                          isOpen={submitting}
                          isReferenceSolution={true}
                        />
                      </div>
                    </Box>}
                </ResourceRenderer>
                <SupplementaryFilesTableContainer
                  isOpen={false}
                  viewOnly={true}
                  exercise={exercise}
                />
              </Col>
            </Row>
          </div>}
      </Page>
    );
  }
}

Exercise.contextTypes = {
  links: PropTypes.object
};

Exercise.propTypes = {
  userId: PropTypes.string.isRequired,
  instanceId: PropTypes.string,
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired
  }).isRequired,
  loadAsync: PropTypes.func.isRequired,
  assignExercise: PropTypes.func.isRequired,
  editAssignment: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  exercise: ImmutablePropTypes.map,
  forkedFrom: ImmutablePropTypes.map,
  runtimeEnvironments: ImmutablePropTypes.map,
  canEditExercise: PropTypes.bool.isRequired,
  referenceSolutions: ImmutablePropTypes.map,
  intl: intlShape.isRequired,
  submitting: PropTypes.bool,
  initCreateReferenceSolution: PropTypes.func.isRequired,
  exercisePipelines: ImmutablePropTypes.map,
  createExercisePipeline: PropTypes.func,
  links: PropTypes.object,
  deleteReferenceSolution: PropTypes.func.isRequired,
  forkExercise: PropTypes.func.isRequired,
  groups: ImmutablePropTypes.map,
  assignableGroups: ImmutablePropTypes.map,
  isSuperAdmin: PropTypes.bool,
  groupsAccessor: PropTypes.func.isRequired,
  firstDeadline: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.object
  ]),
  allowSecondDeadline: PropTypes.bool
};

const editMultiAssignFormSelector = formValueSelector('multiAssign');

export default withLinks(
  connect(
    (state, { params: { exerciseId } }) => {
      const userId = loggedInUserIdSelector(state);

      return {
        userId,
        instanceId: selectedInstanceId(state),
        exercise: exerciseSelector(exerciseId)(state),
        forkedFrom: exerciseForkedFromSelector(exerciseId)(state),
        runtimeEnvironments: runtimeEnvironmentsSelector(state),
        submitting: isSubmitting(state),
        canEditExercise: canLoggedUserEditExercise(exerciseId)(state),
        referenceSolutions: referenceSolutionsSelector(exerciseId)(state),
        exercisePipelines: exercisePipelinesSelector(exerciseId)(state),
        groups: groupsUserCanEditSelector(state),
        assignableGroups: groupsUserCanAssignToSelector(state),
        groupsAccessor: groupDataAccessorSelector(state),
        isSuperAdmin: isLoggedAsSuperAdmin(state),
        firstDeadline: editMultiAssignFormSelector(state, 'firstDeadline'),
        allowSecondDeadline: editMultiAssignFormSelector(
          state,
          'allowSecondDeadline'
        )
      };
    },
    (dispatch, { params: { exerciseId } }) => ({
      loadAsync: (userId, instanceId) =>
        Exercise.loadAsync({ exerciseId }, dispatch, { userId, instanceId }),
      assignExercise: groupId => dispatch(assignExercise(groupId, exerciseId)),
      editAssignment: (id, body) => dispatch(editAssignment(id, body)),
      push: url => dispatch(push(url)),
      initCreateReferenceSolution: userId => dispatch(init(userId, exerciseId)),
      createExercisePipeline: () =>
        dispatch(createPipeline({ exerciseId: exerciseId })),
      deleteReferenceSolution: (exerciseId, solutionId) =>
        dispatch(deleteReferenceSolution(exerciseId, solutionId)),
      forkExercise: (forkId, data) =>
        dispatch(forkExercise(exerciseId, forkId, data))
    })
  )(injectIntl(Exercise))
);
