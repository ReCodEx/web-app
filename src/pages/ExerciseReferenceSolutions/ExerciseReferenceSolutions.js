import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, FormattedNumber, injectIntl } from 'react-intl';
import { Row, Col, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { lruMemoize } from 'reselect';
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
  LockIcon,
  ReferenceSolutionIcon,
  RefreshIcon,
  SendIcon,
  VisibleIcon,
} from '../../components/icons';
import Confirm from '../../components/forms/Confirm';
import OnOffCheckbox from '../../components/forms/OnOffCheckbox';
import ExerciseCallouts from '../../components/Exercises/ExerciseCallouts';
import UsersName from '../../components/Users/UsersName';
import EnvironmentsListItem from '../../components/helpers/EnvironmentsList/EnvironmentsListItem.js';
import { createUserNameComparator } from '../../components/helpers/users.js';
import ReferenceSolutionActionsContainer from '../../containers/ReferenceSolutionActionsContainer';

import { isSubmitting } from '../../redux/selectors/submission.js';
import { fetchExerciseIfNeeded, reloadExercise } from '../../redux/modules/exercises.js';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments.js';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments.js';
import { fetchReferenceSolutions, deleteReferenceSolution } from '../../redux/modules/referenceSolutions.js';
import { init, submitReferenceSolution, presubmitReferenceSolution } from '../../redux/modules/submission.js';
import { fetchHardwareGroups } from '../../redux/modules/hwGroups.js';
import { fetchByIds } from '../../redux/modules/users.js';
import { exerciseSelector } from '../../redux/selectors/exercises.js';
import { referenceSolutionsSelector } from '../../redux/selectors/referenceSolutions.js';

import { loggedInUserIdSelector } from '../../redux/selectors/auth.js';
import { getReadyUserSelector } from '../../redux/selectors/users.js';

import { storageGetItem, storageSetItem, storageRemoveItem } from '../../helpers/localStorage.js';
import { hasPermissions, safeGet, objectFilter } from '../../helpers/common.js';
import withLinks from '../../helpers/withLinks.js';
import withRouter, { withRouterProps } from '../../helpers/withRouter.js';

const prepareTableColumnDescriptors = lruMemoize((loggedUserId, locale, links, deleteReferenceSolution) => {
  const { REFERENCE_SOLUTION_URI_FACTORY } = links;
  const nameComparator = createUserNameComparator(locale);

  const columns = [
    new SortableTableColumnDescriptor('icon', '', {
      className: 'text-nowrap text-body-secondary',
      cellRenderer: ({ visibility }) =>
        visibility > 1 ? (
          <Icon
            icon="star"
            className="text-warning"
            tooltipId="promotedIcon"
            tooltipPlacement="bottom"
            tooltip={
              <FormattedMessage
                id="app.referenceSolution.visibility.promoted"
                defaultMessage="The solution is promoted by the author of the exercise (recommended for reading to other supervisors)"
              />
            }
          />
        ) : (
          <VisibleIcon
            visible={visibility > 0}
            tooltipId="visibilityIcon"
            tooltipPlacement="bottom"
            tooltip={
              visibility > 0 ? (
                <FormattedMessage
                  id="app.referenceSolution.visibility.public"
                  defaultMessage="The solution is visible to all supervisors who can access this exercise."
                />
              ) : (
                <FormattedMessage
                  id="app.referenceSolution.visibility.private"
                  defaultMessage="The solution is visible only to you."
                />
              )
            }
          />
        ),
    }),

    new SortableTableColumnDescriptor(
      'createdAt',
      <FormattedMessage id="generic.createdAt" defaultMessage="Created at" />,
      {
        className: 'text-start',
        comparator: ({ createdAt: d1 }, { createdAt: d2 }) => d2 - d1, // dates are implicitly in reversed order
        cellRenderer: (createdAt, idx) =>
          createdAt && <DateTime unixTs={createdAt} showOverlay overlayTooltipId={`datetime-${idx}`} />,
      }
    ),

    new SortableTableColumnDescriptor('user', <FormattedMessage id="generic.author" defaultMessage="Author" />, {
      className: 'text-start',
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
          return score !== null ? (
            <strong
              className={classnames({
                'text-danger': score < 1.0,
                'text-success': score >= 1.0,
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
        className: 'small w-100',
        headerClassName: 'text-start',
      }
    ),

    new SortableTableColumnDescriptor('actionButtons', '', {
      className: 'text-end align-middle text-nowrap',
      cellRenderer: solution => (
        <TheButtonGroup>
          <Link to={REFERENCE_SOLUTION_URI_FACTORY(solution.exerciseId, solution.id)}>
            <Button size="xs" variant="secondary">
              <DetailIcon gapRight={2} />
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
                <DeleteIcon gapRight={2} />
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

const prepareTableData = lruMemoize((referenceSolutions, userSelector, runtimeEnvironments, userId, filters) =>
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

const LOCAL_STORAGE_STATE_KEY = 'ExerciseReferenceSolutions.state';
const INITIAL_FILTER_STATE = {
  showMine: true,
  showOthers: true,
  showCorrect: true,
  showImperfect: true,
  showPromoted: true,
  showPublic: true,
  showPrivate: true,
};

const isLastOneOn = (...flags) => flags.filter(flag => flag).length === 1;
const someFiltersOff = state => Object.keys(INITIAL_FILTER_STATE).some(key => !state[key]);

class ExerciseReferenceSolutions extends Component {
  state = {
    filtersOpen: false,
    ...INITIAL_FILTER_STATE,
  };

  openFilters = () => this.setState({ filtersOpen: true });
  closeFilters = () => this.setState({ filtersOpen: false });
  resetFilters = () => {
    storageRemoveItem(LOCAL_STORAGE_STATE_KEY);
    this.setState(INITIAL_FILTER_STATE);
  };

  _setFilterState = newState => {
    const toSave = objectFilter({ ...this.state, ...newState }, (_, key) => INITIAL_FILTER_STATE[key]);
    storageSetItem(LOCAL_STORAGE_STATE_KEY, toSave);
    this.setState(newState);
  };

  toggleShowMine = () => this._setFilterState({ showMine: !this.state.showMine || !this.state.showOthers });
  toggleShowOthers = () => this._setFilterState({ showOthers: !this.state.showMine || !this.state.showOthers });

  toggleShowCorrect = () => this._setFilterState({ showCorrect: !this.state.showCorrect || !this.state.showImperfect });
  toggleShowImperfect = () =>
    this._setFilterState({ showImperfect: !this.state.showCorrect || !this.state.showImperfect });

  toggleShowPromoted = () =>
    this._setFilterState({
      showPromoted:
        !this.state.showPromoted || isLastOneOn(this.state.showPromoted, this.state.showPublic, this.state.showPrivate),
    });

  toggleShowPublic = () =>
    this._setFilterState({
      showPublic:
        !this.state.showPublic || isLastOneOn(this.state.showPromoted, this.state.showPublic, this.state.showPrivate),
    });

  toggleShowPrivate = () =>
    this._setFilterState({
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
    const newState = storageGetItem(LOCAL_STORAGE_STATE_KEY, null);
    if (newState) {
      this.setState(newState);
    }
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
                      <SendIcon gapRight={2} />
                      {exercise.isBroken ? (
                        <FormattedMessage
                          id="app.exercise.isBrokenShort"
                          defaultMessage="Incomplete configuration..."
                        />
                      ) : (
                        <FormattedMessage
                          id="app.exercise.submitReferenceSolution"
                          defaultMessage="New Reference Solution"
                        />
                      )}
                    </Button>
                  </TheButtonGroup>
                )}
              </Col>
              <Col xs={12} sm="auto">
                <TheButtonGroup className="mb-3 text-nowrap">
                  {someFiltersOff(this.state) && (
                    <Button variant="success" onClick={this.resetFilters}>
                      <Icon icon="list-ul" gapRight={2} />
                      <FormattedMessage id="generic.showAll" defaultMessage="Show All" />
                    </Button>
                  )}

                  <Button variant="primary" onClick={this.openFilters}>
                    <Icon icon="sliders" gapRight={2} />
                    <FormattedMessage
                      id="app.exerciseReferenceSolutions.filtersButton"
                      defaultMessage="Change Filters"
                    />
                  </Button>
                </TheButtonGroup>
              </Col>
            </Row>

            <Row>
              <Col sm={12}>
                <ResourceRenderer resourceArray={runtimeEnvironments}>
                  {runtimes => (
                    <ResourceRenderer resourceArray={referenceSolutions}>
                      {referenceSolutions => (
                        <Box
                          id="reference-solutions"
                          title={
                            <>
                              <FormattedMessage
                                id="app.exerciseReferenceSolutions.referenceSolutionsBox"
                                defaultMessage="Reference Solutions"
                              />{' '}
                              <small className="text-body-secondary ms-3">
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
                              id="ReferenceSolutions"
                              hover
                              columns={prepareTableColumnDescriptors(userId, locale, links, deleteReferenceSolution)}
                              defaultOrder="createdAt"
                              data={prepareTableData(referenceSolutions, userSelector, runtimes, userId, this.state)}
                              empty={
                                <div className="text-center text-body-secondary small m-3">
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

            <Modal
              show={this.state.filtersOpen}
              onHide={this.closeFilters}
              onEscapeKeyDown={this.closeFilters}
              size="lg">
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
                    <OnOffCheckbox
                      name="toggleShowMine"
                      checked={this.state.showMine}
                      onChange={this.toggleShowMine}
                      disabled={!this.state.showOthers}>
                      <FormattedMessage id="app.exerciseReferenceSolutions.filters.showMine" defaultMessage="Mine" />
                      {!this.state.showOthers && (
                        <LockIcon
                          gapLeft={2}
                          className="opacity-50"
                          tooltipId="toggleShowMine"
                          tooltipPlacement="bottom"
                          tooltip={
                            <FormattedMessage
                              id="app.exerciseReferenceSolutions.filters.lastOneOfGroup"
                              defaultMessage="At least one option from each group must be selected."
                            />
                          }
                        />
                      )}
                    </OnOffCheckbox>
                  </Col>

                  <Col xs={12} sm={{ span: 6, offset: 6 }} lg={{ span: 6, offset: 0 }}>
                    <OnOffCheckbox
                      name="toggleShowOthers"
                      checked={this.state.showOthers}
                      onChange={this.toggleShowOthers}
                      disabled={!this.state.showMine}>
                      <FormattedMessage
                        id="app.exerciseReferenceSolutions.filters.showOthers"
                        defaultMessage="Others"
                      />
                      {!this.state.showMine && (
                        <LockIcon
                          gapLeft={2}
                          className="opacity-50"
                          tooltipId="toggleShowOthers"
                          tooltipPlacement="bottom"
                          tooltip={
                            <FormattedMessage
                              id="app.exerciseReferenceSolutions.filters.lastOneOfGroup"
                              defaultMessage="At least one option from each group must be selected."
                            />
                          }
                        />
                      )}
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
                      onChange={this.toggleShowCorrect}
                      disabled={!this.state.showImperfect}>
                      <FormattedMessage
                        id="app.exerciseReferenceSolutions.filters.showCorrect"
                        defaultMessage="100% correct"
                      />
                      {!this.state.showImperfect && (
                        <LockIcon
                          gapLeft={2}
                          className="opacity-50"
                          tooltipId="toggleShowCorrect"
                          tooltipPlacement="bottom"
                          tooltip={
                            <FormattedMessage
                              id="app.exerciseReferenceSolutions.filters.lastOneOfGroup"
                              defaultMessage="At least one option from each group must be selected."
                            />
                          }
                        />
                      )}
                    </OnOffCheckbox>
                  </Col>

                  <Col xs={12} sm={{ span: 6, offset: 6 }} lg={{ span: 6, offset: 0 }}>
                    <OnOffCheckbox
                      name="toggleShowImperfect"
                      checked={this.state.showImperfect}
                      onChange={this.toggleShowImperfect}
                      disabled={!this.state.showCorrect}>
                      <FormattedMessage
                        id="app.exerciseReferenceSolutions.filters.showImperfect"
                        defaultMessage="Imperfect (less than 100% correct)"
                      />
                      {!this.state.showCorrect && (
                        <LockIcon
                          gapLeft={2}
                          className="opacity-50"
                          tooltipId="toggleShowImperfect"
                          tooltipPlacement="bottom"
                          tooltip={
                            <FormattedMessage
                              id="app.exerciseReferenceSolutions.filters.lastOneOfGroup"
                              defaultMessage="At least one option from each group must be selected."
                            />
                          }
                        />
                      )}
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
                      onChange={this.toggleShowPromoted}
                      disabled={!this.state.showPublic && !this.state.showPrivate}>
                      <FormattedMessage
                        id="app.exerciseReferenceSolutions.filters.showPromoted"
                        defaultMessage="Promoted"
                      />
                      {!this.state.showPublic && !this.state.showPrivate && (
                        <LockIcon
                          gapLeft={2}
                          className="opacity-50"
                          tooltipId="toggleShowPromoted"
                          tooltipPlacement="bottom"
                          tooltip={
                            <FormattedMessage
                              id="app.exerciseReferenceSolutions.filters.lastOneOfGroup"
                              defaultMessage="At least one option from each group must be selected."
                            />
                          }
                        />
                      )}
                    </OnOffCheckbox>
                  </Col>

                  <Col xs={12} sm={{ span: 6, offset: 6 }} lg={{ span: 3, offset: 0 }}>
                    <OnOffCheckbox
                      name="toggleShowPublic"
                      checked={this.state.showPublic}
                      onChange={this.toggleShowPublic}
                      disabled={!this.state.showPromoted && !this.state.showPrivate}>
                      <FormattedMessage
                        id="app.exerciseReferenceSolutions.filters.showPublic"
                        defaultMessage="Public"
                      />
                      {!this.state.showPromoted && !this.state.showPrivate && (
                        <LockIcon
                          gapLeft={2}
                          className="opacity-50"
                          tooltipId="toggleShowPublic"
                          tooltipPlacement="bottom"
                          tooltip={
                            <FormattedMessage
                              id="app.exerciseReferenceSolutions.filters.lastOneOfGroup"
                              defaultMessage="At least one option from each group must be selected."
                            />
                          }
                        />
                      )}
                    </OnOffCheckbox>
                  </Col>

                  <Col xs={12} sm={{ span: 6, offset: 6 }} lg={{ span: 3, offset: 0 }}>
                    <OnOffCheckbox
                      name="toggleShowPrivate"
                      checked={this.state.showPrivate}
                      onChange={this.toggleShowPrivate}
                      disabled={!this.state.showPublic && !this.state.showPromoted}>
                      <FormattedMessage
                        id="app.exerciseReferenceSolutions.filters.showPrivate"
                        defaultMessage="Private"
                      />
                      {!this.state.showPublic && !this.state.showPromoted && (
                        <LockIcon
                          gapLeft={2}
                          className="opacity-50"
                          tooltipId="toggleShowPrivate"
                          tooltipPlacement="bottom"
                          tooltip={
                            <FormattedMessage
                              id="app.exerciseReferenceSolutions.filters.lastOneOfGroup"
                              defaultMessage="At least one option from each group must be selected."
                            />
                          }
                        />
                      )}
                    </OnOffCheckbox>
                  </Col>
                </Row>
              </Modal.Body>

              <Modal.Footer className="d-block text-center">
                <TheButtonGroup>
                  {someFiltersOff(this.state) && (
                    <Button variant="success" onClick={this.resetFilters}>
                      <RefreshIcon gapRight={2} />
                      <FormattedMessage id="generic.reset" defaultMessage="Reset" />
                    </Button>
                  )}
                  <Button variant="secondary" onClick={this.closeFilters}>
                    <CloseIcon gapRight={2} />
                    <FormattedMessage id="generic.close" defaultMessage="Close" />
                  </Button>
                </TheButtonGroup>
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
