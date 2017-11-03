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
import { Row, Col, ButtonGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Button from '../../components/widgets/FlatButton';

import Page from '../../components/layout/Page';
import ExerciseDetail from '../../components/Exercises/ExerciseDetail';
import LocalizedTexts from '../../components/helpers/LocalizedTexts';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import GroupsList from '../../components/Groups/GroupsList';
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

import ForkExerciseButtonContainer from '../../containers/ForkExerciseButtonContainer';
import AssignExerciseButton from '../../components/buttons/AssignExerciseButton';

import { isSubmitting } from '../../redux/selectors/submission';
import { fetchExerciseIfNeeded } from '../../redux/modules/exercises';
import {
  fetchReferenceSolutionsIfNeeded,
  deleteReferenceSolution
} from '../../redux/modules/referenceSolutions';
import { createReferenceSolution, init } from '../../redux/modules/submission';
import { fetchHardwareGroups } from '../../redux/modules/hwGroups';
import { create as assignExercise } from '../../redux/modules/assignments';
import { exerciseSelector } from '../../redux/selectors/exercises';
import { referenceSolutionsSelector } from '../../redux/selectors/referenceSolutions';
import { canEditExercise } from '../../redux/selectors/users';
import {
  deletePipeline,
  fetchExercisePipelines,
  create as createPipeline
} from '../../redux/modules/pipelines';
import { exercisePipelinesSelector } from '../../redux/selectors/pipelines';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { supervisorOfSelector } from '../../redux/selectors/groups';

import withLinks from '../../hoc/withLinks';
import { getLocalizedName } from '../../helpers/getLocalizedData';

const messages = defineMessages({
  groupsBox: {
    id: 'app.exercise.groupsBox',
    defaultMessage: 'Groups'
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

  static loadAsync = (dispatch, exerciseId) =>
    Promise.all([
      dispatch(fetchExerciseIfNeeded(exerciseId)),
      dispatch(fetchReferenceSolutionsIfNeeded(exerciseId)),
      dispatch(fetchHardwareGroups()),
      dispatch(fetchExercisePipelines(exerciseId))
    ]);

  componentWillMount() {
    this.props.loadAsync();
    this.reset();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.exerciseId !== newProps.params.exerciseId) {
      newProps.loadAsync();
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
      supervisedGroups,
      canEditExercise,
      referenceSolutions,
      intl: { formatMessage, locale },
      initCreateReferenceSolution,
      exercisePipelines,
      deleteReferenceSolution,
      push
    } = this.props;

    const { forkId } = this.state;

    const {
      links: {
        EXERCISES_URI,
        EXERCISE_EDIT_URI_FACTORY,
        EXERCISE_EDIT_CONFIG_URI_FACTORY,
        EXERCISE_REFERENCE_SOLUTION_URI_FACTORY,
        PIPELINE_EDIT_URI_FACTORY
      }
    } = this.context;

    return (
      <Page
        title={exercise => getLocalizedName(exercise, locale)}
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
            <Row>
              <Col sm={12}>
                {canEditExercise(exercise.id) &&
                  <div>
                    <ButtonGroup>
                      <LinkContainer
                        to={EXERCISE_EDIT_URI_FACTORY(exercise.id)}
                      >
                        <Button bsStyle="warning" bsSize="sm">
                          <EditIcon />
                          &nbsp;
                          <FormattedMessage
                            id="app.exercise.editSettings"
                            defaultMessage="Edit exercise settings"
                          />
                        </Button>
                      </LinkContainer>
                      <LinkContainer
                        to={EXERCISE_EDIT_CONFIG_URI_FACTORY(exercise.id)}
                      >
                        <Button bsStyle="warning" bsSize="sm">
                          <EditIcon />
                          &nbsp;
                          <FormattedMessage
                            id="app.exercise.editConfig"
                            defaultMessage="Edit exercise config"
                          />
                        </Button>
                      </LinkContainer>
                    </ButtonGroup>
                    <ForkExerciseButtonContainer
                      exerciseId={exercise.id}
                      forkId={forkId}
                    />
                  </div>}
                <p />
              </Col>
            </Row>
            <Row>
              <Col lg={6}>
                <div>
                  {exercise.localizedTexts.length > 0 &&
                    <LocalizedTexts locales={exercise.localizedTexts} />}
                </div>
                <Box
                  title={formatMessage(messages.groupsBox)}
                  description={
                    <p>
                      <FormattedMessage
                        id="app.exercise.assignToGroup"
                        defaultMessage="You can assign this exercise to one of the groups you supervise."
                      />
                    </p>
                  }
                  noPadding
                >
                  <ResourceRenderer
                    forceLoading={supervisedGroups.length === 0}
                    resource={supervisedGroups}
                  >
                    {() =>
                      <GroupsList
                        groups={supervisedGroups}
                        renderButtons={groupId =>
                          <AssignExerciseButton
                            isLocked={exercise.isLocked}
                            assignExercise={() => this.assignExercise(groupId)}
                          />}
                      />}
                  </ResourceRenderer>
                </Box>
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
                  <ResourceRenderer resource={exercisePipelines.toArray()}>
                    {(...pipelines) =>
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
                                  id="app.exercise.deleteButton"
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
                                        id="app.exercise.referenceSolution.deleteButton"
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
  canEditExercise: PropTypes.func.isRequired,
  referenceSolutions: ImmutablePropTypes.map,
  intl: intlShape.isRequired,
  submitting: PropTypes.bool,
  initCreateReferenceSolution: PropTypes.func.isRequired,
  exercisePipelines: ImmutablePropTypes.map,
  createExercisePipeline: PropTypes.func,
  links: PropTypes.object,
  deleteReferenceSolution: PropTypes.func.isRequired
};

export default withLinks(
  injectIntl(
    connect(
      (state, { params: { exerciseId } }) => {
        const userId = loggedInUserIdSelector(state);

        return {
          userId,
          exercise: exerciseSelector(exerciseId)(state),
          submitting: isSubmitting(state),
          supervisedGroups: supervisorOfSelector(userId)(state),
          canEditExercise: exerciseId =>
            canEditExercise(userId, exerciseId)(state),
          referenceSolutions: referenceSolutionsSelector(exerciseId)(state),
          exercisePipelines: exercisePipelinesSelector(exerciseId)(state)
        };
      },
      (dispatch, { params: { exerciseId } }) => ({
        loadAsync: () => Exercise.loadAsync(dispatch, exerciseId),
        assignExercise: groupId =>
          dispatch(assignExercise(groupId, exerciseId)),
        push: url => dispatch(push(url)),
        initCreateReferenceSolution: userId =>
          dispatch(init(userId, exerciseId)),
        createExercisePipeline: () =>
          dispatch(createPipeline({ exerciseId: exerciseId })),
        deleteReferenceSolution: (exerciseId, solutionId) =>
          dispatch(deleteReferenceSolution(exerciseId, solutionId))
      })
    )(Exercise)
  )
);
