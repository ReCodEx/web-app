import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import Page from '../../components/layout/Page';
import { ExerciseNavigation } from '../../components/layout/Navigation';
import ExerciseDetail from '../../components/Exercises/ExerciseDetail';
import ExerciseGroups from '../../components/Exercises/ExerciseGroups';
import LocalizedTexts from '../../components/helpers/LocalizedTexts';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import ReferenceSolutionsTable from '../../components/Exercises/ReferenceSolutionsTable';
import SubmitSolutionContainer from '../../containers/SubmitSolutionContainer';
import Box from '../../components/widgets/Box';
import { ExerciseIcon, DetailIcon, DeleteIcon, SendIcon, LinkIcon } from '../../components/icons';
import Confirm from '../../components/forms/Confirm';
import ExerciseCallouts from '../../components/Exercises/ExerciseCallouts';
import ForkExerciseForm from '../../components/forms/ForkExerciseForm';
import Callout from '../../components/widgets/Callout';

import { isSubmitting } from '../../redux/selectors/submission';
import {
  fetchExerciseIfNeeded,
  reloadExercise,
  forkExercise,
  attachExerciseToGroup,
  detachExerciseFromGroup,
} from '../../redux/modules/exercises';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';
import { fetchReferenceSolutions, deleteReferenceSolution } from '../../redux/modules/referenceSolutions';
import { init, submitReferenceSolution, presubmitReferenceSolution } from '../../redux/modules/submission';
import { fetchHardwareGroups } from '../../redux/modules/hwGroups';
import { fetchAllGroups } from '../../redux/modules/groups';
import { fetchByIds } from '../../redux/modules/users';
import {
  exerciseSelector,
  exerciseForkedFromSelector,
  getExerciseAttachingGroupId,
  getExerciseDetachingGroupId,
} from '../../redux/selectors/exercises';
import { referenceSolutionsSelector } from '../../redux/selectors/referenceSolutions';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { notArchivedGroupsSelector, groupDataAccessorSelector, getGroupsAdmins } from '../../redux/selectors/groups';

import withLinks from '../../helpers/withLinks';
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
  state = { forkId: Math.random().toString() };

  static customLoadGroups = true; // Marker for the App async load, that we will load groups ourselves.

  static loadAsync = ({ exerciseId }, dispatch, { userId }) =>
    Promise.all([
      dispatch(fetchExerciseIfNeeded(exerciseId)).then(
        ({ value: data }) => data && data.forkedFrom && dispatch(fetchExerciseIfNeeded(data.forkedFrom))
      ),
      dispatch(fetchAllGroups({ archived: true })).then(({ value: groups }) =>
        dispatch(fetchByIds(getGroupsAdmins(groups)))
      ),
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchReferenceSolutions(exerciseId)),
      dispatch(fetchHardwareGroups()),
    ]);

  componentDidMount() {
    this.props.loadAsync(this.props.userId);
    this.reset();
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.exerciseId !== prevProps.match.params.exerciseId) {
      this.props.loadAsync(this.props.userId);
      this.reset();
    }
  }

  reset = () => {
    this.setState({ forkId: Math.random().toString() });
  };

  createReferenceSolution = () => {
    const { userId, initCreateReferenceSolution, history, location } = this.props;

    const scrollPosition = window.scrollY;
    window.location.hash = '';
    history.replace(location.pathname + location.search);
    window.setTimeout(() => window.scrollTo(0, scrollPosition), 0);

    initCreateReferenceSolution(userId);
  };

  render() {
    const {
      userId,
      exercise,
      forkedFrom,
      runtimeEnvironments,
      submitting,
      referenceSolutions,
      intl: { formatMessage, locale },
      deleteReferenceSolution,
      groups,
      groupsAccessor,
      reload,
      forkExercise,
      attachingGroupId,
      detachingGroupId,
      attachExerciseToGroup,
      detachExerciseFromGroup,
      links: { EXERCISE_REFERENCE_SOLUTION_URI_FACTORY, EXERCISE_ASSIGNMENTS_URI_FACTORY },
    } = this.props;

    const { forkId } = this.state;

    return (
      <Page
        icon={<ExerciseIcon />}
        title={<FormattedMessage id="app.exercise.title" defaultMessage="Exercise Detail" />}
        resource={exercise}>
        {exercise => (
          <div>
            <ExerciseNavigation
              exerciseId={exercise.id}
              canEdit={hasPermissions(exercise, 'update')}
              canViewTests={hasPermissions(exercise, 'viewConfig', 'viewScoreConfig')}
              canViewLimits={hasPermissions(exercise, 'viewLimits')}
              canViewAssignments={hasPermissions(exercise, 'viewAssignments')}
            />

            <Row>
              <Col sm={12}>
                <ExerciseCallouts {...exercise} />

                {!exercise.isLocked && !exercise.isBroken && exercise.hasReferenceSolutions && (
                  <Callout variant="success" icon={<SendIcon />} className="text-muted">
                    <p>
                      <FormattedMessage
                        id="app.exercise.exerciseReadyToAssign"
                        defaultMessage="The exercise is ready to be assigned. You may do this directly on the assignments page of selected group, or assign it simultaneously to multiple groups using form on Assignments page."
                      />
                      <Link to={EXERCISE_ASSIGNMENTS_URI_FACTORY(exercise.id)}>
                        <LinkIcon gapLeft className="text-muted" />
                      </Link>
                    </p>
                  </Callout>
                )}
              </Col>
            </Row>

            <Row>
              <Col xl={6}>
                <ExerciseDetail {...exercise} forkedFrom={forkedFrom} locale={locale} className="d-flex d-xl-none" />
                <div>{exercise.localizedTexts.length > 0 && <LocalizedTexts locales={exercise.localizedTexts} />}</div>
              </Col>
              <Col xl={6}>
                <ExerciseDetail {...exercise} forkedFrom={forkedFrom} locale={locale} className="d-none d-xl-flex" />

                <ExerciseGroups
                  showButtons={hasPermissions(exercise, 'update')}
                  groupsIds={exercise.groupsIds}
                  attachingGroupId={attachingGroupId}
                  detachingGroupId={detachingGroupId}
                  attachExerciseToGroup={attachExerciseToGroup}
                  detachExerciseFromGroup={detachExerciseFromGroup}
                />

                <ResourceRenderer resource={runtimeEnvironments.toArray()} returnAsArray={true}>
                  {runtimes => (
                    <Box
                      id="reference-solutions"
                      title={formatMessage(messages.referenceSolutionsBox)}
                      noPadding
                      footer={
                        hasPermissions(exercise, 'addReferenceSolution') && (
                          <div className="text-center">
                            <Button
                              variant={exercise.isBroken ? 'secondary' : 'success'}
                              onClick={this.createReferenceSolution}
                              disabled={exercise.isBroken}>
                              {exercise.isBroken ? (
                                <FormattedMessage
                                  id="app.exercise.isBrokenShort"
                                  defaultMessage="Incomplete configuration..."
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
                        <ResourceRenderer resource={referenceSolutions.toArray()} returnAsArray>
                          {referenceSolutions =>
                            referenceSolutions.length > 0 ? (
                              <ReferenceSolutionsTable
                                referenceSolutions={referenceSolutions}
                                runtimeEnvironments={runtimes}
                                renderButtons={(solutionId, permissionHints) => (
                                  <div>
                                    <TheButtonGroup vertical>
                                      <Link to={EXERCISE_REFERENCE_SOLUTION_URI_FACTORY(exercise.id, solutionId)}>
                                        <Button size="xs" variant="secondary">
                                          <DetailIcon gapRight />
                                          <FormattedMessage id="generic.detail" defaultMessage="Detail" />
                                        </Button>
                                      </Link>
                                      {permissionHints && permissionHints.delete !== false && (
                                        <Confirm
                                          id={solutionId}
                                          onConfirmed={() => deleteReferenceSolution(solutionId)}
                                          question={
                                            <FormattedMessage
                                              id="app.exercise.referenceSolution.deleteConfirm"
                                              defaultMessage="Are you sure you want to delete the reference solution? This cannot be undone."
                                            />
                                          }>
                                          <Button size="xs" variant="danger">
                                            <DeleteIcon gapRight />
                                            <FormattedMessage id="generic.delete" defaultMessage="Delete" />
                                          </Button>
                                        </Confirm>
                                      )}
                                    </TheButtonGroup>
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
                          afterEvaluationStarts={reload}
                          onReset={init}
                          isOpen={submitting}
                          solutionFilesLimit={exercise.solutionFilesLimit}
                          solutionSizeLimit={exercise.solutionSizeLimit}
                          isReferenceSolution={true}
                        />
                      </div>
                    </Box>
                  )}
                </ResourceRenderer>
              </Col>
            </Row>

            {hasPermissions(exercise, 'fork') && (
              <>
                <hr />
                <Row>
                  <Col sm={12}>
                    <ForkExerciseForm
                      exerciseId={exercise.id}
                      groups={groups}
                      forkId={forkId}
                      onSubmit={formData => forkExercise(forkId, formData)}
                      resetId={this.reset}
                      groupsAccessor={groupsAccessor}
                      initialValues={FORK_EXERCISE_FORM_INITIAL_VALUES}
                    />
                  </Col>
                </Row>
              </>
            )}
          </div>
        )}
      </Page>
    );
  }
}

Exercise.propTypes = {
  userId: PropTypes.string.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      exerciseId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  exercise: ImmutablePropTypes.map,
  forkedFrom: ImmutablePropTypes.map,
  runtimeEnvironments: ImmutablePropTypes.map,
  referenceSolutions: ImmutablePropTypes.map,
  intl: PropTypes.object.isRequired,
  submitting: PropTypes.bool,
  links: PropTypes.object,
  groups: ImmutablePropTypes.map,
  groupsAccessor: PropTypes.func.isRequired,
  attachingGroupId: PropTypes.string,
  detachingGroupId: PropTypes.string,
  loadAsync: PropTypes.func.isRequired,
  reload: PropTypes.func.isRequired,
  initCreateReferenceSolution: PropTypes.func.isRequired,
  deleteReferenceSolution: PropTypes.func.isRequired,
  forkExercise: PropTypes.func.isRequired,
  attachExerciseToGroup: PropTypes.func.isRequired,
  detachExerciseFromGroup: PropTypes.func.isRequired,
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
    (
      dispatch,
      {
        match: {
          params: { exerciseId },
        },
      }
    ) => ({
      loadAsync: userId => Exercise.loadAsync({ exerciseId }, dispatch, { userId }),
      reload: () => dispatch(reloadExercise(exerciseId)),
      initCreateReferenceSolution: userId => dispatch(init(userId, exerciseId)),
      deleteReferenceSolution: solutionId =>
        dispatch(deleteReferenceSolution(solutionId)).then(() => dispatch(reloadExercise(exerciseId))),
      forkExercise: (forkId, data) => dispatch(forkExercise(exerciseId, forkId, data)),
      attachExerciseToGroup: groupId => dispatch(attachExerciseToGroup(exerciseId, groupId)),
      detachExerciseFromGroup: groupId => dispatch(detachExerciseFromGroup(exerciseId, groupId)),
    })
  )(injectIntl(withRouter(Exercise)))
);
