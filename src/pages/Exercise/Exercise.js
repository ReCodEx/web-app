import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import {
  FormattedMessage,
  defineMessages,
  intlShape,
  injectIntl,
} from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import Button from '../../components/widgets/FlatButton';
import Page from '../../components/layout/Page';
import ExerciseDetail from '../../components/Exercises/ExerciseDetail';
import ExerciseGroups from '../../components/Exercises/ExerciseGroups';
import LocalizedTexts from '../../components/helpers/LocalizedTexts';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import ReferenceSolutionsTable from '../../components/Exercises/ReferenceSolutionsTable';
import SubmitSolutionContainer from '../../containers/SubmitSolutionContainer';
import Box from '../../components/widgets/Box';
import { SendIcon, DeleteIcon, NeedFixingIcon } from '../../components/icons';
import Confirm from '../../components/forms/Confirm';
import ExerciseButtons from '../../components/Exercises/ExerciseButtons';
import ForkExerciseForm from '../../components/forms/ForkExerciseForm';

import { isSubmitting } from '../../redux/selectors/submission';
import {
  fetchExerciseIfNeeded,
  forkExercise,
  attachExerciseToGroup,
  detachExerciseFromGroup,
} from '../../redux/modules/exercises';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';
import {
  fetchReferenceSolutions,
  deleteReferenceSolution,
} from '../../redux/modules/referenceSolutions';
import {
  init,
  submitReferenceSolution,
  presubmitReferenceSolution,
} from '../../redux/modules/submission';
import { fetchHardwareGroups } from '../../redux/modules/hwGroups';
import {
  exerciseSelector,
  exerciseForkedFromSelector,
  getExerciseAttachingGroupId,
  getExerciseDetachingGroupId,
} from '../../redux/selectors/exercises';
import { referenceSolutionsSelector } from '../../redux/selectors/referenceSolutions';

import {
  loggedInUserIdSelector,
  selectedInstanceId,
} from '../../redux/selectors/auth';
import { instanceSelector } from '../../redux/selectors/instances';
import {
  notArchivedGroupsSelector,
  groupDataAccessorSelector,
} from '../../redux/selectors/groups';

import withLinks from '../../helpers/withLinks';
import { getLocalizedName } from '../../helpers/localizedData';
import { hasPermissions } from '../../helpers/common';

const messages = defineMessages({
  referenceSolutionsBox: {
    id: 'app.exercise.referenceSolutionsBox',
    defaultMessage: 'Reference Solutions',
  },
});

export const FORK_EXERCISE_FORM_INITIAL_VALUES = {
  groupId: '',
};

class Exercise extends Component {
  state = { forkId: null };

  static loadAsync = ({ exerciseId }, dispatch, { userId }) =>
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
      //      dispatch(fetchExercisePipelines(exerciseId)), // TODO - awaiting modification (many-to-many relation with exercises)
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

  render() {
    const {
      userId,
      instance,
      exercise,
      forkedFrom,
      runtimeEnvironments,
      submitting,
      referenceSolutions,
      intl: { formatMessage, locale },
      initCreateReferenceSolution,
      deleteReferenceSolution,
      push,
      groups,
      groupsAccessor,
      forkExercise,
      attachingGroupId,
      detachingGroupId,
      attachExerciseToGroup,
      detachExerciseFromGroup,
      links: { EXERCISES_URI, EXERCISE_REFERENCE_SOLUTION_URI_FACTORY },
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
                defaultMessage="Exercises List"
              />
            ),
            iconName: 'puzzle-piece',
            link: EXERCISES_URI,
          },
          {
            text: (
              <FormattedMessage
                id="app.exercise.overview"
                defaultMessage="Exercise overview"
              />
            ),
            iconName: ['far', 'lightbulb'],
          },
        ]}>
        {exercise => (
          <div>
            {exercise.isBroken && (
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
              </Row>
            )}
            <Row>
              <Col sm={12}>
                <ExerciseButtons {...exercise} />
              </Col>
            </Row>
            {hasPermissions(exercise, 'fork') && (
              <Row>
                <Col sm={12} className="em-margin-bottom">
                  <ForkExerciseForm
                    exerciseId={exercise.id}
                    groups={groups}
                    forkId={forkId}
                    onSubmit={formData => forkExercise(forkId, formData)}
                    groupsAccessor={groupsAccessor}
                    initialValues={FORK_EXERCISE_FORM_INITIAL_VALUES}
                  />
                </Col>
              </Row>
            )}
            <Row>
              <Col lg={6}>
                <div>
                  {exercise.localizedTexts.length > 0 && (
                    <LocalizedTexts locales={exercise.localizedTexts} />
                  )}
                </div>
              </Col>
              <Col lg={6}>
                <ExerciseDetail
                  {...exercise}
                  forkedFrom={forkedFrom}
                  locale={locale}
                />

                <ResourceRenderer resource={instance}>
                  {instance => (
                    <ExerciseGroups
                      showButtons={hasPermissions(exercise, 'update')}
                      groupsIds={exercise.groupsIds}
                      rootGroupId={instance.rootGroupId}
                      attachingGroupId={attachingGroupId}
                      detachingGroupId={detachingGroupId}
                      attachExerciseToGroup={attachExerciseToGroup}
                      detachExerciseFromGroup={detachExerciseFromGroup}
                      groups={groups}
                    />
                  )}
                </ResourceRenderer>

                <ResourceRenderer
                  resource={runtimeEnvironments.toArray()}
                  returnAsArray={true}>
                  {runtimes => (
                    <Box
                      title={formatMessage(messages.referenceSolutionsBox)}
                      noPadding
                      footer={
                        hasPermissions(exercise, 'addReferenceSolution') && (
                          <div className="text-center">
                            <Button
                              bsStyle={
                                exercise.isBroken ? 'default' : 'success'
                              }
                              onClick={() =>
                                initCreateReferenceSolution(userId)
                              }
                              disabled={exercise.isBroken}>
                              {exercise.isBroken ? (
                                <FormattedMessage
                                  id="app.exercise.isBrokenShort"
                                  defaultMessage="Exercise is broken..."
                                />
                              ) : (
                                <FormattedMessage
                                  id="app.exercise.submitReferenceSoution"
                                  defaultMessage="Submit New Reference Solution"
                                />
                              )}
                            </Button>
                          </div>
                        )
                      }>
                      <div>
                        <ResourceRenderer
                          resource={referenceSolutions.toArray()}
                          returnAsArray>
                          {referenceSolutions =>
                            referenceSolutions.length > 0 ? (
                              <ReferenceSolutionsTable
                                referenceSolutions={referenceSolutions}
                                runtimeEnvironments={runtimes}
                                renderButtons={(
                                  solutionId,
                                  permissionHints
                                ) => (
                                  <div>
                                    <Button
                                      bsSize="xs"
                                      onClick={() =>
                                        push(
                                          EXERCISE_REFERENCE_SOLUTION_URI_FACTORY(
                                            exercise.id,
                                            solutionId
                                          )
                                        )
                                      }>
                                      <SendIcon gapRight />
                                      <FormattedMessage
                                        id="generic.detail"
                                        defaultMessage="Detail"
                                      />
                                    </Button>
                                    {permissionHints &&
                                      permissionHints.delete !== false && (
                                        <Confirm
                                          id={solutionId}
                                          onConfirmed={() =>
                                            deleteReferenceSolution(solutionId)
                                          }
                                          question={
                                            <FormattedMessage
                                              id="app.exercise.referenceSolution.deleteConfirm"
                                              defaultMessage="Are you sure you want to delete the reference solution? This cannot be undone."
                                            />
                                          }>
                                          <Button
                                            bsSize="xs"
                                            className="btn-flat"
                                            bsStyle="danger">
                                            <DeleteIcon gapRight />
                                            <FormattedMessage
                                              id="generic.delete"
                                              defaultMessage="Delete"
                                            />
                                          </Button>
                                        </Confirm>
                                      )}
                                  </div>
                                )}
                              />
                            ) : (
                              <p className="text-center em-padding text-muted">
                                <FormattedMessage
                                  id="app.exercise.noReferenceSolutions"
                                  defaultMessage="There are no reference solutions for this exercise yet."
                                />
                              </p>
                            )
                          }
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
                    </Box>
                  )}
                </ResourceRenderer>
              </Col>
            </Row>
          </div>
        )}
      </Page>
    );
  }
}

Exercise.contextTypes = {
  links: PropTypes.object,
};

Exercise.propTypes = {
  userId: PropTypes.string.isRequired,
  instance: ImmutablePropTypes.map,
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired,
  }).isRequired,
  loadAsync: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  exercise: ImmutablePropTypes.map,
  forkedFrom: ImmutablePropTypes.map,
  runtimeEnvironments: ImmutablePropTypes.map,
  referenceSolutions: ImmutablePropTypes.map,
  intl: intlShape.isRequired,
  submitting: PropTypes.bool,
  initCreateReferenceSolution: PropTypes.func.isRequired,
  links: PropTypes.object,
  deleteReferenceSolution: PropTypes.func.isRequired,
  forkExercise: PropTypes.func.isRequired,
  groups: ImmutablePropTypes.map,
  groupsAccessor: PropTypes.func.isRequired,
  attachingGroupId: PropTypes.string,
  detachingGroupId: PropTypes.string,
  attachExerciseToGroup: PropTypes.func.isRequired,
  detachExerciseFromGroup: PropTypes.func.isRequired,
};

export default withLinks(
  connect(
    (state, { params: { exerciseId } }) => {
      const userId = loggedInUserIdSelector(state);
      const instanceId = selectedInstanceId(state);
      return {
        userId,
        instance: instanceSelector(state, instanceId),
        exercise: exerciseSelector(exerciseId)(state),
        forkedFrom: exerciseForkedFromSelector(exerciseId)(state),
        runtimeEnvironments: runtimeEnvironmentsSelector(state),
        submitting: isSubmitting(state),
        referenceSolutions: referenceSolutionsSelector(exerciseId)(state),
        groups: notArchivedGroupsSelector(state),
        groupsAccessor: groupDataAccessorSelector(state),
        attachingGroupId: getExerciseAttachingGroupId(exerciseId)(state),
        detachingGroupId: getExerciseDetachingGroupId(exerciseId)(state),
      };
    },
    (dispatch, { params: { exerciseId } }) => ({
      loadAsync: userId =>
        Exercise.loadAsync({ exerciseId }, dispatch, { userId }),
      push: url => dispatch(push(url)),
      initCreateReferenceSolution: userId => dispatch(init(userId, exerciseId)),
      deleteReferenceSolution: solutionId =>
        dispatch(deleteReferenceSolution(solutionId)),
      forkExercise: (forkId, data) =>
        dispatch(forkExercise(exerciseId, forkId, data)),
      attachExerciseToGroup: groupId =>
        dispatch(attachExerciseToGroup(exerciseId, groupId)),
      detachExerciseFromGroup: groupId =>
        dispatch(detachExerciseFromGroup(exerciseId, groupId)),
    })
  )(injectIntl(Exercise))
);
