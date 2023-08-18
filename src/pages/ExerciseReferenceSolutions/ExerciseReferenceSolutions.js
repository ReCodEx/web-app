import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, FormattedNumber, injectIntl } from 'react-intl';
import { Row, Col, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
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
  CloseIcon,
  DetailIcon,
  DeleteIcon,
  LoadingIcon,
  ReferenceSolutionIcon,
  SendIcon,
  VisibleIcon,
} from '../../components/icons';
import Confirm from '../../components/forms/Confirm';
import OnOffCheckbox from '../../components/forms/OnOffCheckbox';
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

const getDataFilter =
  (userId, { showMine, showOthers, showCorrect, showImperfect, showPromoted, showPublic, showPrivate }) =>
  ({ visibility, authorId, lastSubmission }) =>
    (showMine || authorId !== userId) &&
    (showOthers || authorId === userId) &&
    (showCorrect || safeGet(lastSubmission, ['evaluation', 'score'], 0) < 1) &&
    (showImperfect || safeGet(lastSubmission, ['evaluation', 'score'], 0) >= 1) &&
    (showPromoted || visibility <= 1) &&
    (showPublic || visibility !== 1) &&
    (showPrivate || visibility > 0);

const prepareTableData = defaultMemoize((referenceSolutions, userSelector, runtimeEnvironments, userId, filters) =>
  referenceSolutions
    .filter(getDataFilter(userId, filters))
    .map(
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

const isLastOneOn = (...flags) => flags.filter(flag => flag).length === 1;

class ExerciseReferenceSolutions extends Component {
  state = {
    filtersOpen: false,
    showMine: true,
    showOthers: true,
    showCorrect: true,
    showImperfect: true,
    showPromoted: true,
    showPublic: true,
    showPrivate: true,
  };

  openFilters = () => this.setState({ filtersOpen: true });
  closeFilters = () => this.setState({ filtersOpen: false });

  toggleShowMine = () => this.setState({ showMine: !this.state.showMine || !this.state.showOthers });
  toggleShowOthers = () => this.setState({ showOthers: !this.state.showMine || !this.state.showOthers });

  toggleShowCorrect = () => this.setState({ showCorrect: !this.state.showCorrect || !this.state.showImperfect });
  toggleShowImperfect = () => this.setState({ showImperfect: !this.state.showCorrect || !this.state.showImperfect });

  toggleShowPromoted = () =>
    this.setState({
      showPromoted:
        !this.state.showPromoted || isLastOneOn(this.state.showPromoted, this.state.showPublic, this.state.showPrivate),
    });

  toggleShowPublic = () =>
    this.setState({
      showPublic:
        !this.state.showPublic || isLastOneOn(this.state.showPromoted, this.state.showPublic, this.state.showPrivate),
    });

  toggleShowPrivate = () =>
    this.setState({
      showPrivate:
        !this.state.showPrivate || isLastOneOn(this.state.showPromoted, this.state.showPublic, this.state.showPrivate),
    });

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

            <Row>
              <Col xs={12} sm={true}>
                {hasPermissions(exercise, 'addReferenceSolution') && (
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
                )}
              </Col>
              <Col xs={12} sm="auto" className="mb-3">
                <Button variant="primary" onClick={this.openFilters}>
                  <Icon icon="sliders" gapRight />
                  <FormattedMessage id="app.exerciseReferenceSolutions.filtersButton" defaultMessage="Change Filters" />
                </Button>
              </Col>
            </Row>

            <Row>
              <Col sm={12}>
                <ResourceRenderer resource={runtimeEnvironments.toArray()} returnAsArray={true}>
                  {runtimes => (
                    <ResourceRenderer resource={referenceSolutions.toArray()} returnAsArray>
                      {referenceSolutions => (
                        <Box
                          id="reference-solutions"
                          title={
                            <>
                              <FormattedMessage
                                id="app.exerciseReferenceSolutions.referenceSolutionsBox"
                                defaultMessage="Reference Solutions"
                              />{' '}
                              <small className="text-muted ml-3">
                                (
                                <FormattedMessage
                                  id="app.exerciseReferenceSolutions.referenceSolutionsCount"
                                  defaultMessage="total {count}"
                                  values={{ count: referenceSolutions.length }}
                                />
                                )
                              </small>
                            </>
                          }
                          noPadding
                          unlimitedHeight>
                          <>
                            <SortableTable
                              hover
                              columns={prepareTableColumnDescriptors(userId, locale, links, deleteReferenceSolution)}
                              defaultOrder="createdAt"
                              data={prepareTableData(referenceSolutions, userSelector, runtimes, userId, this.state)}
                              empty={
                                <div className="text-center text-muted small m-3">
                                  <FormattedMessage
                                    id="app.exerciseReferenceSolutions.noSolutions"
                                    defaultMessage="No reference solutions matching filter criteria."
                                  />
                                </div>
                              }
                              className="mb-0"
                            />

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

            <Modal show={this.state.filtersOpen} onHide={this.closeFilters} size="lg">
              <Modal.Header closeButton>
                <Modal.Title>
                  <FormattedMessage
                    id="app.exerciseReferenceSolutions.filters.title"
                    defaultMessage="Select reference solutions for display"
                  />
                </Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <Row>
                  <Col xs={12} sm={6} lg={3}>
                    <strong>
                      <FormattedMessage id="app.exerciseReferenceSolutions.filters.author" defaultMessage="Author" />:
                    </strong>
                  </Col>
                  <Col xs={12} sm={6} lg={3}>
                    <OnOffCheckbox name="toggleShowMine" checked={this.state.showMine} onChange={this.toggleShowMine}>
                      <FormattedMessage id="app.exerciseReferenceSolutions.filters.showMine" defaultMessage="Mine" />
                    </OnOffCheckbox>
                  </Col>
                  <Col xs={12} sm={{ span: 6, offset: 6 }} lg={{ span: 6, offset: 0 }}>
                    <OnOffCheckbox
                      name="toggleShowOthers"
                      checked={this.state.showOthers}
                      onChange={this.toggleShowOthers}>
                      <FormattedMessage
                        id="app.exerciseReferenceSolutions.filters.showOthers"
                        defaultMessage="Others"
                      />
                    </OnOffCheckbox>
                  </Col>
                </Row>

                <hr />

                <Row>
                  <Col xs={12} sm={6} lg={3}>
                    <strong>
                      <FormattedMessage
                        id="app.exerciseReferenceSolutions.filters.correctness"
                        defaultMessage="Correctness"
                      />
                      :
                    </strong>
                  </Col>
                  <Col xs={12} sm={6} lg={3}>
                    <OnOffCheckbox
                      name="toggleShowCorrect"
                      checked={this.state.showCorrect}
                      onChange={this.toggleShowCorrect}>
                      <FormattedMessage
                        id="app.exerciseReferenceSolutions.filters.showCorrect"
                        defaultMessage="100% correct"
                      />
                    </OnOffCheckbox>
                  </Col>
                  <Col xs={12} sm={{ span: 6, offset: 6 }} lg={{ span: 6, offset: 0 }}>
                    <OnOffCheckbox
                      name="toggleShowImperfect"
                      checked={this.state.showImperfect}
                      onChange={this.toggleShowImperfect}>
                      <FormattedMessage
                        id="app.exerciseReferenceSolutions.filters.showImperfect"
                        defaultMessage="Imperfect (less than 100% correct)"
                      />
                    </OnOffCheckbox>
                  </Col>
                </Row>

                <hr />

                <Row>
                  <Col xs={12} sm={6} lg={3}>
                    <strong>
                      <FormattedMessage
                        id="app.exerciseReferenceSolutions.filters.visibility"
                        defaultMessage="Visibility"
                      />
                      :
                    </strong>
                  </Col>
                  <Col xs={12} sm={6} lg={3}>
                    <OnOffCheckbox
                      name="toggleShowPromoted"
                      checked={this.state.showPromoted}
                      onChange={this.toggleShowPromoted}>
                      <FormattedMessage
                        id="app.exerciseReferenceSolutions.filters.showPromoted"
                        defaultMessage="Promoted"
                      />
                    </OnOffCheckbox>
                  </Col>
                  <Col xs={12} sm={{ span: 6, offset: 6 }} lg={{ span: 3, offset: 0 }}>
                    <OnOffCheckbox
                      name="toggleShowPublic"
                      checked={this.state.showPublic}
                      onChange={this.toggleShowPublic}>
                      <FormattedMessage
                        id="app.exerciseReferenceSolutions.filters.showPublic"
                        defaultMessage="Public"
                      />
                    </OnOffCheckbox>
                  </Col>
                  <Col xs={12} sm={{ span: 6, offset: 6 }} lg={{ span: 3, offset: 0 }}>
                    <OnOffCheckbox
                      name="toggleShowPrivate"
                      checked={this.state.showPrivate}
                      onChange={this.toggleShowPrivate}>
                      <FormattedMessage
                        id="app.exerciseReferenceSolutions.filters.showPrivate"
                        defaultMessage="Private"
                      />
                    </OnOffCheckbox>
                  </Col>
                </Row>
              </Modal.Body>

              <Modal.Footer className="d-block text-center">
                <Button variant="secondary" onClick={this.closeFilters}>
                  <CloseIcon gapRight />
                  <FormattedMessage id="generic.close" defaultMessage="Close" />
                </Button>
              </Modal.Footer>
            </Modal>
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
