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
import Icon from 'react-fontawesome';
import { formValueSelector } from 'redux-form';

import SupplementaryFilesTableContainer from '../../containers/SupplementaryFilesTableContainer/SupplementaryFilesTableContainer';
import Button from '../../components/widgets/FlatButton';
import Page from '../../components/layout/Page';
import ExerciseDetail from '../../components/Exercises/ExerciseDetail';
import LocalizedTexts from '../../components/helpers/LocalizedTexts';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { LocalizedExerciseName } from '../../components/helpers/LocalizedNames';
import ReferenceSolutionsList from '../../components/Exercises/ReferenceSolutionsList';
import SubmitSolutionContainer from '../../containers/SubmitSolutionContainer';
import Box from '../../components/widgets/Box';
import {
  EditIcon,
  SendIcon,
  DeleteIcon,
  AddIcon
} from '../../components/icons';
import Confirm from '../../components/forms/Confirm';
import PipelinesSimpleList from '../../components/Pipelines/PipelinesSimpleList';
import ExerciseButtons from '../../components/Exercises/ExerciseButtons';
import ForkExerciseForm from '../../components/forms/ForkExerciseForm';

import { isSubmitting } from '../../redux/selectors/submission';
import {
  fetchExerciseIfNeeded,
  forkExercise
} from '../../redux/modules/exercises';
import {
  fetchReferenceSolutionsIfNeeded,
  deleteReferenceSolution
} from '../../redux/modules/referenceSolutions';
import { createReferenceSolution, init } from '../../redux/modules/submission';
import { fetchHardwareGroups } from '../../redux/modules/hwGroups';
import { create as assignExercise } from '../../redux/modules/assignments';
import { exerciseSelector } from '../../redux/selectors/exercises';
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

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  supervisorOfSelector,
  groupsSelector,
  groupDataAccessorSelector
} from '../../redux/selectors/groups';

import withLinks from '../../helpers/withLinks';
import { fetchUser } from '../../redux/modules/users';
import MultiAssignForm from '../../components/forms/MultiAssignForm';

const messages = defineMessages({
  groupsBox: {
    id: 'app.exercise.groupsBox',
    defaultMessage: 'Assign to groups'
  },
  referenceSolutionsBox: {
    id: 'app.exercise.referenceSolutionsBox',
    defaultMessage: 'Reference solutions'
  },
  createReferenceSolutionBox: {
    id: 'app.exercise.uploadReferenceSolutionBox',
    defaultMessage: 'Create reference solution'
  }
});

class Exercise extends Component {
  state = { forkId: null };

  static loadAsync = ({ exerciseId }, dispatch, userId) =>
    Promise.all([
      dispatch(fetchExerciseIfNeeded(exerciseId)),
      dispatch(fetchReferenceSolutionsIfNeeded(exerciseId)),
      dispatch(fetchHardwareGroups()),
      dispatch(fetchExercisePipelines(exerciseId)),
      dispatch(fetchUsersGroupsIfNeeded(userId)),
      dispatch(fetchUser(userId))
        .then(res => res.value)
        .then(
          data =>
            data.privateData.role === 'superadmin'
              ? dispatch(fetchInstanceGroups(data.privateData.instanceId))
              : Promise.resolve()
        )
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

  assignExercise = groupId => {
    const { assignExercise, push } = this.props;
    const { links: { ASSIGNMENT_EDIT_URI_FACTORY } } = this.context;

    assignExercise(groupId).then(({ value: assigment }) =>
      push(ASSIGNMENT_EDIT_URI_FACTORY(assigment.id))
    );
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
      submitting,
      canEditExercise,
      referenceSolutions,
      intl: { formatMessage, locale },
      initCreateReferenceSolution,
      exercisePipelines,
      deleteReferenceSolution,
      push,
      groups,
      groupsAccessor,
      forkExercise,
      isSuperAdmin,
      firstDeadline,
      allowSecondDeadline
    } = this.props;

    const { forkId } = this.state;

    const {
      links: {
        EXERCISES_URI,
        EXERCISE_REFERENCE_SOLUTION_URI_FACTORY,
        PIPELINE_EDIT_URI_FACTORY
      }
    } = this.context;

    return (
      <Page
        title={exercise => <LocalizedExerciseName entity={exercise} />}
        resource={exercise}
        description={
          <FormattedMessage
            id="app.exercise.description"
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
                id="app.exercise.description"
                defaultMessage="Exercise overview"
              />
            ),
            iconName: 'lightbulb-o'
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
                    <ResourceRenderer resource={groups.toArray()} returnAsArray>
                      {visibleGroups =>
                        <MultiAssignForm
                          groups={visibleGroups}
                          onSubmit={this.assignExercise}
                          firstDeadline={firstDeadline}
                          allowSecondDeadline={allowSecondDeadline}
                          groupsAccessor={groupsAccessor}
                          locale={locale}
                        />}
                    </ResourceRenderer>
                  </Box>}
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
                        <AddIcon />{' '}
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
                                <EditIcon />{' '}
                                <FormattedMessage
                                  id="app.pipeline.editButton"
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
                                <DeleteIcon />{' '}
                                <FormattedMessage
                                  id="generic.delete"
                                  defaultMessage="Delete"
                                />
                              </Button>
                            </Confirm>
                          </div>}
                      />}
                  </ResourceRenderer>
                </Box>
              </Col>
              <Col lg={6}>
                <ExerciseDetail {...exercise} locale={locale} />
                <Box
                  title={formatMessage(messages.referenceSolutionsBox)}
                  noPadding
                  footer={
                    <p className="text-center">
                      <Button
                        bsStyle="success"
                        onClick={() => initCreateReferenceSolution(userId)}
                      >
                        <FormattedMessage
                          id="app.exercise.createReferenceSoution"
                          defaultMessage="Create reference solution"
                        />
                      </Button>
                    </p>
                  }
                >
                  <ResourceRenderer resource={referenceSolutions}>
                    {referenceSolutions =>
                      referenceSolutions.length > 0
                        ? <ReferenceSolutionsList
                            referenceSolutions={referenceSolutions}
                            renderButtons={(solutionId, permissionHints) =>
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
                                  <SendIcon />{' '}
                                  <FormattedMessage
                                    id="app.exercise.referenceSolutionDetail"
                                    defaultMessage="View detail"
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
                                      <DeleteIcon />{' '}
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
                </Box>
                <SupplementaryFilesTableContainer
                  isOpen={false}
                  viewOnly={true}
                  exercise={exercise}
                />
              </Col>
            </Row>
            <SubmitSolutionContainer
              userId={userId}
              id={exercise.id}
              onSubmit={createReferenceSolution}
              onReset={init}
              isOpen={submitting}
              runtimeEnvironments={exercise.runtimeEnvironments}
              showProgress={false}
              autodetection={false}
              isReferenceSolution={true}
            />
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
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired
  }).isRequired,
  loadAsync: PropTypes.func.isRequired,
  assignExercise: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  exercise: ImmutablePropTypes.map,
  supervisedGroups: PropTypes.object,
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
  isSuperAdmin: PropTypes.bool,
  groupsAccessor: PropTypes.func.isRequired,
  firstDeadline: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  allowSecondDeadline: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};

const editMultiAssignFormSelector = formValueSelector('multiAssign');

export default withLinks(
  connect(
    (state, { params: { exerciseId } }) => {
      const userId = loggedInUserIdSelector(state);

      return {
        userId,
        exercise: exerciseSelector(exerciseId)(state),
        submitting: isSubmitting(state),
        supervisedGroups: supervisorOfSelector(userId)(state),
        canEditExercise: canLoggedUserEditExercise(exerciseId)(state),
        referenceSolutions: referenceSolutionsSelector(exerciseId)(state),
        exercisePipelines: exercisePipelinesSelector(exerciseId)(state),
        groups: groupsSelector(state),
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
      loadAsync: userId => Exercise.loadAsync({ exerciseId }, dispatch, userId),
      assignExercise: groupId => dispatch(assignExercise(groupId, exerciseId)),
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
