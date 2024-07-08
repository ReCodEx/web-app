import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { lruMemoize } from 'reselect';

import SubmitSolutionContainer from '../../containers/SubmitSolutionContainer';
import CommentThreadContainer from '../../containers/CommentThreadContainer';
import Page from '../../components/layout/Page';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import { ExerciseNavigation } from '../../components/layout/Navigation';
import ExerciseDetail from '../../components/Exercises/ExerciseDetail';
import LocalizedTexts from '../../components/helpers/LocalizedTexts';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import ReferenceSolutionsTable from '../../components/Exercises/ReferenceSolutionsTable';
import Box from '../../components/widgets/Box';
import { ExerciseIcon, SendIcon, LinkIcon } from '../../components/icons';
import ExerciseCallouts from '../../components/Exercises/ExerciseCallouts';
import ExerciseButtons from '../../components/Exercises/ExerciseButtons';
import ForkExerciseForm from '../../components/forms/ForkExerciseForm';
import Callout from '../../components/widgets/Callout';

import { isSubmitting } from '../../redux/selectors/submission.js';
import {
  fetchExerciseIfNeeded,
  reloadExercise,
  forkExercise,
  sendNotification,
} from '../../redux/modules/exercises.js';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments.js';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments.js';
import { fetchReferenceSolutions } from '../../redux/modules/referenceSolutions.js';
import { init, submitReferenceSolution, presubmitReferenceSolution } from '../../redux/modules/submission.js';
import { fetchHardwareGroups } from '../../redux/modules/hwGroups.js';
import { fetchAllGroups } from '../../redux/modules/groups.js';
import { fetchByIds } from '../../redux/modules/users.js';
import { exerciseSelector, exerciseForkedFromSelector } from '../../redux/selectors/exercises.js';
import { referenceSolutionsSelector } from '../../redux/selectors/referenceSolutions.js';

import { loggedInUserIdSelector } from '../../redux/selectors/auth.js';
import { notArchivedGroupsSelector, groupDataAccessorSelector, getGroupsAdmins } from '../../redux/selectors/groups.js';

import { hasPermissions } from '../../helpers/common.js';
import withLinks from '../../helpers/withLinks.js';
import withRouter, { withRouterProps } from '../../helpers/withRouter.js';

export const FORK_EXERCISE_FORM_INITIAL_VALUES = {
  groupId: '',
};

const getPromotedReferenceSolutions = lruMemoize(referenceSolutions =>
  referenceSolutions.filter(rs => rs.visibility > 1)
);

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
    if (this.props.params.exerciseId !== prevProps.params.exerciseId) {
      this.props.loadAsync(this.props.userId);
      this.reset();
    }
  }

  reset = () => {
    this.setState({ forkId: Math.random().toString() });
  };

  createReferenceSolution = () => {
    const {
      userId,
      initCreateReferenceSolution,
      navigate,
      location: { pathname, search },
    } = this.props;

    const scrollPosition = window.scrollY;
    window.location.hash = '';
    navigate(pathname + search, { replace: true });
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
      intl: { locale },
      groups,
      groupsAccessor,
      reload,
      forkExercise,
      sendNotification,
      links: { EXERCISE_ASSIGNMENTS_URI_FACTORY, EXERCISE_REFERENCE_SOLUTIONS_URI_FACTORY },
    } = this.props;

    const { forkId } = this.state;

    return (
      <Page
        icon={<ExerciseIcon />}
        title={<FormattedMessage id="app.exercise.title" defaultMessage="Exercise Detail" />}
        resource={exercise}>
        {exercise => (
          <div>
            <ExerciseNavigation exercise={exercise} />

            <Row>
              <Col sm={12}>
                <ExerciseCallouts {...exercise} />

                {hasPermissions(exercise, 'assign') &&
                  !exercise.isLocked &&
                  !exercise.isBroken &&
                  exercise.hasReferenceSolutions && (
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

            <ExerciseButtons {...exercise} sendNotification={sendNotification} />

            <Row>
              <Col xl={6}>
                <ExerciseDetail {...exercise} forkedFrom={forkedFrom} locale={locale} className="d-flex d-xl-none" />
                <div>{exercise.localizedTexts.length > 0 && <LocalizedTexts locales={exercise.localizedTexts} />}</div>
              </Col>
              <Col xl={6}>
                <ExerciseDetail {...exercise} forkedFrom={forkedFrom} locale={locale} className="d-none d-xl-flex" />

                <ResourceRenderer resourceArray={runtimeEnvironments}>
                  {runtimes => (
                    <Box
                      id="reference-solutions"
                      title={
                        <FormattedMessage
                          id="app.exercise.referenceSolutionsBox"
                          defaultMessage="Promoted Reference Solutions"
                        />
                      }
                      noPadding
                      footer={
                        <div className="text-center">
                          <TheButtonGroup>
                            {hasPermissions(exercise, 'addReferenceSolution') && (
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
                                    defaultMessage="New Reference Solution"
                                  />
                                )}
                              </Button>
                            )}
                            {referenceSolutions && referenceSolutions.size > 0 && (
                              <Link to={EXERCISE_REFERENCE_SOLUTIONS_URI_FACTORY(exercise.id)}>
                                <Button variant="primary">
                                  <FormattedMessage
                                    id="app.exercise.allRefSolutions"
                                    defaultMessage="All Reference Solutions"
                                  />
                                </Button>
                              </Link>
                            )}
                          </TheButtonGroup>
                        </div>
                      }>
                      <div>
                        <ResourceRenderer resourceArray={referenceSolutions}>
                          {referenceSolutions =>
                            getPromotedReferenceSolutions(referenceSolutions).length > 0 ? (
                              <ReferenceSolutionsTable
                                referenceSolutions={getPromotedReferenceSolutions(referenceSolutions)}
                                runtimeEnvironments={runtimes}
                              />
                            ) : (
                              <div className="text-center m-3 text-muted small">
                                {referenceSolutions.length === 0 ? (
                                  <FormattedMessage
                                    id="app.exercise.noReferenceSolutions"
                                    defaultMessage="There are no reference solutions for this exercise yet."
                                  />
                                ) : (
                                  <FormattedMessage
                                    id="app.exercise.noPromotedReferenceSolutions"
                                    defaultMessage="There are no promoted reference solutions for this exercise yet."
                                  />
                                )}
                              </div>
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

                <CommentThreadContainer
                  threadId={exercise.id}
                  additionalPublicSwitchNote={
                    <FormattedMessage
                      id="app.exercise.comments.additionalSwitchNote"
                      defaultMessage="(teachers who can see this exercise)"
                    />
                  }
                />
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
  exercise: ImmutablePropTypes.map,
  forkedFrom: ImmutablePropTypes.map,
  runtimeEnvironments: ImmutablePropTypes.map,
  referenceSolutions: ImmutablePropTypes.map,
  intl: PropTypes.object.isRequired,
  submitting: PropTypes.bool,
  links: PropTypes.object,
  groups: ImmutablePropTypes.map,
  groupsAccessor: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired,
  reload: PropTypes.func.isRequired,
  initCreateReferenceSolution: PropTypes.func.isRequired,
  forkExercise: PropTypes.func.isRequired,
  sendNotification: PropTypes.func.isRequired,
  navigate: withRouterProps.navigate,
  location: withRouterProps.location,
  params: PropTypes.shape({ exerciseId: PropTypes.string }).isRequired,
};

export default withRouter(
  withLinks(
    connect(
      (state, { params: { exerciseId } }) => {
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
        };
      },
      (dispatch, { params: { exerciseId } }) => ({
        loadAsync: userId => Exercise.loadAsync({ exerciseId }, dispatch, { userId }),
        reload: () => dispatch(reloadExercise(exerciseId)),
        initCreateReferenceSolution: userId => dispatch(init(userId, exerciseId)),
        forkExercise: (forkId, data) => dispatch(forkExercise(exerciseId, forkId, data)),
        sendNotification: message => dispatch(sendNotification(exerciseId, message)),
      })
    )(injectIntl(Exercise))
  )
);
