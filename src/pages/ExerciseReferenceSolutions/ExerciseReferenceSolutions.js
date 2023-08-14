import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, FormattedNumber, injectIntl } from 'react-intl';
import { Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { defaultMemoize } from 'reselect';
import classnames from 'classnames';

import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import Page from '../../components/layout/Page';
import { ExerciseNavigation } from '../../components/layout/Navigation';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import SubmitSolutionContainer from '../../containers/SubmitSolutionContainer';
import Box from '../../components/widgets/Box';
import SortableTable, { SortableTableColumnDescriptor } from '../../components/widgets/SortableTable';
import DateTime from '../../components/widgets/DateTime';
import Icon, {
  DetailIcon,
  DeleteIcon,
  LoadingIcon,
  ReferenceSolutionIcon,
  SendIcon,
  VisibleIcon,
} from '../../components/icons';
import Confirm from '../../components/forms/Confirm';
import ExerciseCallouts from '../../components/Exercises/ExerciseCallouts';
import UsersName from '../../components/Users/UsersName';
import EnvironmentsListItem from '../../components/helpers/EnvironmentsList/EnvironmentsListItem';
import { createUserNameComparator } from '../../components/helpers/users';
import ReferenceSolutionActionsContainer from '../../containers/ReferenceSolutionActionsContainer';

import { isSubmitting } from '../../redux/selectors/submission';
import { fetchExerciseIfNeeded, reloadExercise } from '../../redux/modules/exercises';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';
import { fetchReferenceSolutions, deleteReferenceSolution } from '../../redux/modules/referenceSolutions';
import { init, submitReferenceSolution, presubmitReferenceSolution } from '../../redux/modules/submission';
import { fetchHardwareGroups } from '../../redux/modules/hwGroups';
import { fetchByIds } from '../../redux/modules/users';
import { exerciseSelector } from '../../redux/selectors/exercises';
import { referenceSolutionsSelector } from '../../redux/selectors/referenceSolutions';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { getReadyUserSelector } from '../../redux/selectors/users';

import { hasPermissions, safeGet } from '../../helpers/common';
import withLinks from '../../helpers/withLinks';
import withRouter, { withRouterProps } from '../../helpers/withRouter';

const prepareTableColumnDescriptors = defaultMemoize((loggedUserId, locale, links, deleteReferenceSolution) => {
  const { REFERENCE_SOLUTION_URI_FACTORY } = links;
  const nameComparator = createUserNameComparator(locale);

  const columns = [
    new SortableTableColumnDescriptor('icon', '', {
      className: 'text-nowrap text-muted',
      cellRenderer: ({ visibility }) =>
        visibility > 1 ? (
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id="promotedIcon">
                <FormattedMessage
                  id="app.referenceSolution.visibility.promoted"
                  defaultMessage="The solution is promoted by the auhor of the exercise (recommended for reading to other supervisors)"
                />
              </Tooltip>
            }>
            <Icon icon="star" className="text-warning" />
          </OverlayTrigger>
        ) : (
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id="visibilityIcon">
                {visibility > 0 ? (
                  <FormattedMessage
                    id="app.referenceSolution.visibility.public"
                    defaultMessage="The solution is visible to all supervisors who can access this exercise."
                  />
                ) : (
                  <FormattedMessage
                    id="app.referenceSolution.visibility.private"
                    defaultMessage="The solution is visible only to you."
                  />
                )}
              </Tooltip>
            }>
            <VisibleIcon visible={visibility > 0} />
          </OverlayTrigger>
        ),
    }),

    new SortableTableColumnDescriptor(
      'createdAt',
      <FormattedMessage id="generic.createdAt" defaultMessage="Created at" />,
      {
        className: 'text-left',
        comparator: ({ createdAt: d1 }, { createdAt: d2 }) => d2 - d1, // dates are implicitly in reversed order
        cellRenderer: (createdAt, idx) =>
          createdAt && <DateTime unixts={createdAt} showOverlay overlayTooltipId={`datetime-${idx}`} />,
      }
    ),

    new SortableTableColumnDescriptor('user', <FormattedMessage id="generic.author" defaultMessage="Author" />, {
      className: 'text-left',
      comparator: ({ user: u1, createdAt: d1 }, { user: u2, createdAt: d2 }) => nameComparator(u1, u2) || d2 - d1, // dates are implicitly in reversed order
      cellRenderer: user =>
        user ? <UsersName {...user} currentUserId={loggedUserId} showEmail="icon" listItem /> : <LoadingIcon />,
    }),

    new SortableTableColumnDescriptor(
      'runtimeEnvironment',
      <FormattedMessage id="generic.runtimeShortest" defaultMessage="Runtime" />,
      {
        className: 'text-center',
        cellRenderer: runtimeEnvironment =>
          runtimeEnvironment ? <EnvironmentsListItem runtimeEnvironment={runtimeEnvironment} longNames /> : '-',
      }
    ),

    new SortableTableColumnDescriptor(
      'correctness',
      <FormattedMessage id="generic.correctness" defaultMessage="Correctness" />,
      {
        className: 'text-center',
        headerClassName: 'text-nowrap',
        comparator: ({ correctness: c1, createdAt: d1 }, { correctness: c2, createdAt: d2 }) =>
          safeGet(c2, ['evaluation', 'score'], -1) - safeGet(c1, ['evaluation', 'score'], -1) || d2 - d1,
        cellRenderer: lastSubmission => {
          const score = safeGet(lastSubmission, ['evaluation', 'score'], null);
          const isCorrect = safeGet(lastSubmission, ['isCorrect'], false);
          return score !== null ? (
            <strong
              className={classnames({
                'text-danger': !isCorrect,
                'text-success': isCorrect,
              })}>
              <FormattedNumber style="percent" maximumFractionDigits={3} value={score} />
            </strong>
          ) : (
            '-'
          );
        },
      }
    ),

    new SortableTableColumnDescriptor(
      'description',
      <FormattedMessage id="generic.description" defaultMessage="Description" />,
      {
        className: 'small full-width',
        headerClassName: 'text-left',
      }
    ),

    new SortableTableColumnDescriptor('actionButtons', '', {
      className: 'text-right valign-middle text-nowrap',
      cellRenderer: solution => (
        <TheButtonGroup>
          <Link to={REFERENCE_SOLUTION_URI_FACTORY(solution.exerciseId, solution.id)}>
            <Button size="xs" variant="secondary">
              <DetailIcon gapRight />
              <FormattedMessage id="generic.detail" defaultMessage="Detail" />
            </Button>
          </Link>

          {solution.permissionHints && solution.permissionHints.setVisibility && (
            <ReferenceSolutionActionsContainer id={solution.id} dropdown />
          )}

          {solution.permissionHints && solution.permissionHints.delete && (
            <Confirm
              id={solution.id}
              onConfirmed={() => deleteReferenceSolution(solution.id)}
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
      ),
    }),
  ];

  return columns.filter(c => c);
});

const prepareTableData = defaultMemoize((referenceSolutions, userSelector, runtimeEnvironments) =>
  referenceSolutions.map(
    ({
      id,
      authorId,
      exerciseId,
      createdAt,
      runtimeEnvironmentId,
      visibility,
      lastSubmission,
      description,
      permissionHints,
    }) => {
      return {
        icon: { id, visibility, lastSubmission, permissionHints },
        createdAt,
        user: userSelector(authorId),
        runtimeEnvironment: runtimeEnvironments.find(({ id }) => id === runtimeEnvironmentId),
        correctness: lastSubmission,
        description,
        actionButtons: { id, exerciseId, permissionHints },
      };
    }
  )
);

const getSolutionAuthors = referenceSolutions => {
  const res = {}; // object for deduplication
  (referenceSolutions || []).forEach(rs => rs.authorId && (res[rs.authorId] = true));
  return Object.keys(res);
};

class ExerciseReferenceSolutions extends Component {
  static loadAsync = ({ exerciseId }, dispatch) =>
    Promise.all([
      dispatch(fetchExerciseIfNeeded(exerciseId)).then(
        ({ value: data }) => data && data.forkedFrom && dispatch(fetchExerciseIfNeeded(data.forkedFrom))
      ),
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchReferenceSolutions(exerciseId)).then(({ value }) =>
        dispatch(fetchByIds(getSolutionAuthors(value)))
      ),
      dispatch(fetchHardwareGroups()),
    ]);

  componentDidMount() {
    this.props.loadAsync(this.props.userId);
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.exerciseId !== prevProps.params.exerciseId) {
      this.props.loadAsync(this.props.userId);
    }
  }

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
      runtimeEnvironments,
      userSelector,
      submitting,
      referenceSolutions,
      deleteReferenceSolution,
      reload,
      links,
      intl: { locale },
    } = this.props;

    return (
      <Page
        icon={<ReferenceSolutionIcon />}
        title={
          <FormattedMessage id="app.exerciseReferenceSolutions.title" defaultMessage="Exercise Reference Solutions" />
        }
        resource={exercise}>
        {exercise => (
          <>
            <ExerciseNavigation exercise={exercise} />
            <Row>
              <Col sm={12}>
                <ExerciseCallouts {...exercise} />
              </Col>
            </Row>

            {hasPermissions(exercise, 'addReferenceSolution') && (
              <Row>
                <Col sm={12}>
                  <TheButtonGroup className="mb-3 text-nowrap">
                    <Button
                      variant={exercise.isBroken ? 'secondary' : 'success'}
                      onClick={this.createReferenceSolution}
                      disabled={exercise.isBroken}>
                      <SendIcon gapRight />
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
                  </TheButtonGroup>
                </Col>
              </Row>
            )}

            <Row>
              <Col sm={12}>
                <ResourceRenderer resource={runtimeEnvironments.toArray()} returnAsArray={true}>
                  {runtimes => (
                    <ResourceRenderer resource={referenceSolutions.toArray()} returnAsArray>
                      {referenceSolutions => (
                        <Box
                          id="reference-solutions"
                          title={
                            <FormattedMessage
                              id="app.exercise.referenceSolutionsBox"
                              defaultMessage="Reference Solutions"
                            />
                          }
                          noPadding
                          unlimitedHeight>
                          <>
                            <SortableTable
                              hover
                              columns={prepareTableColumnDescriptors(userId, locale, links, deleteReferenceSolution)}
                              defaultOrder="createdAt"
                              data={prepareTableData(referenceSolutions, userSelector, runtimes)}
                              empty={
                                <div className="text-center text-muted">
                                  <FormattedMessage
                                    id="app.exerciseReferenceSolutions.noSolutions"
                                    defaultMessage="No reference solutions matching filter criteria."
                                  />
                                </div>
                              }
                              className="mb-0"
                            />

                            {/*
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
                                      <Link to={REFERENCE_SOLUTION_URI_FACTORY(exercise.id, solutionId)}>
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
                              <div className="text-center m-3 text-muted small">
                                <FormattedMessage
                                  id="app.exercise.noReferenceSolutions"
                                  defaultMessage="There are no reference solutions for this exercise yet."
                                />
                              </div>
                            )
                          }
                        </ResourceRenderer>
                        </div> */}
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
                          </>
                        </Box>
                      )}
                    </ResourceRenderer>
                  )}
                </ResourceRenderer>
              </Col>
            </Row>
          </>
        )}
      </Page>
    );
  }
}

ExerciseReferenceSolutions.propTypes = {
  userId: PropTypes.string.isRequired,
  exercise: ImmutablePropTypes.map,
  forkedFrom: ImmutablePropTypes.map,
  runtimeEnvironments: ImmutablePropTypes.map,
  referenceSolutions: ImmutablePropTypes.map,
  userSelector: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  submitting: PropTypes.bool,
  links: PropTypes.object,
  loadAsync: PropTypes.func.isRequired,
  reload: PropTypes.func.isRequired,
  initCreateReferenceSolution: PropTypes.func.isRequired,
  deleteReferenceSolution: PropTypes.func.isRequired,
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
          runtimeEnvironments: runtimeEnvironmentsSelector(state),
          submitting: isSubmitting(state),
          referenceSolutions: referenceSolutionsSelector(exerciseId)(state),
          userSelector: getReadyUserSelector(state),
        };
      },
      (dispatch, { params: { exerciseId } }) => ({
        loadAsync: userId => ExerciseReferenceSolutions.loadAsync({ exerciseId }, dispatch, { userId }),
        reload: () => dispatch(reloadExercise(exerciseId)),
        initCreateReferenceSolution: userId => dispatch(init(userId, exerciseId)),
        deleteReferenceSolution: solutionId =>
          dispatch(deleteReferenceSolution(solutionId)).then(() => dispatch(reloadExercise(exerciseId))),
      })
    )(injectIntl(ExerciseReferenceSolutions))
  )
);
