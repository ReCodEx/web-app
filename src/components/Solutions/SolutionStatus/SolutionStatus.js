import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Link } from 'react-router-dom';
import { lruMemoize } from 'reselect';
import moment from 'moment';

import Points from '../../Assignments/SolutionsTable/Points.js';
import EditSolutionNoteForm from '../../forms/EditSolutionNoteForm';
import Box from '../../widgets/Box';
import DateTime from '../../widgets/DateTime';
import Explanation from '../../widgets/Explanation';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import EnvironmentsListItem from '../../helpers/EnvironmentsList/EnvironmentsListItem.js';
import withLinks from '../../../helpers/withLinks.js';
import Icon, {
  AcceptedIcon,
  CodeIcon,
  EditIcon,
  FailureIcon,
  InvertIcon,
  LinkIcon,
  LoadingIcon,
  NoteIcon,
  PastDeadlineIcon,
  PointsIcon,
  ReviewIcon,
  SuccessIcon,
  SupervisorIcon,
  UserIcon,
  VisibleIcon,
  WarningIcon,
} from '../../icons';
import AssignmentDeadlinesGraph from '../../Assignments/Assignment/AssignmentDeadlinesGraph';
import SolutionsTable from '../../Assignments/SolutionsTable';

const getEditNoteFormInitialValues = lruMemoize(note => ({ note }));

const getImportantSolutions = lruMemoize((solutions, selectedSolutionId) => {
  solutions = solutions.toArray();
  const selectedIdx = solutions.findIndex(s => s && s.id === selectedSolutionId);
  const accepted = solutions.find(s => s && s.accepted && s.id !== selectedSolutionId) || null;
  const best = solutions.find(s => s && s.isBestSolution && s.id !== selectedSolutionId) || null;
  let lastReviewed = solutions.filter(s => s && s.review && s.review.closedAt).shift();
  lastReviewed = lastReviewed && lastReviewed.id !== selectedSolutionId ? lastReviewed : null;
  return { selectedIdx, accepted, best, lastReviewed };
});

const createDeadlineIcon = (createdAt, firstDeadline, secondDeadline, props) =>
  createdAt < firstDeadline ? (
    <Icon icon={['far', 'circle-check']} className="text-success" {...props} />
  ) : secondDeadline && createdAt < secondDeadline ? (
    <InvertIcon className="text-warning" {...props} />
  ) : (
    <PastDeadlineIcon className="text-body-secondary" {...props} />
  );

class SolutionStatus extends Component {
  state = { editDialogOpen: false, explainDialogOpen: false, otherSolutionsDialogOpen: false };

  openEditDialog = () =>
    this.setState({ editDialogOpen: true, explainDialogOpen: false, otherSolutionsDialogOpen: false });

  openExplainDialog = () =>
    this.setState({ editDialogOpen: false, explainDialogOpen: true, otherSolutionsDialogOpen: false });

  openOtherSolutionsDialog = () =>
    this.setState({ editDialogOpen: false, explainDialogOpen: false, otherSolutionsDialogOpen: true });

  closeDialog = () => {
    this.setState({ editDialogOpen: false, explainDialogOpen: false, otherSolutionsDialogOpen: false });
    return Promise.resolve();
  };

  editNoteSubmitHandler = formData => {
    const { editNote = null } = this.props;
    return editNote ? editNote(formData.note.trim()).then(this.closeDialog) : this.closeDialog();
  };

  render() {
    const {
      solution: {
        id,
        attemptIndex,
        createdAt,
        authorId,
        accepted,
        reviewRequest = false,
        review = null,
        maxPoints,
        bonusPoints,
        actualPoints,
        overriddenPoints = null,
        visibility = null,
        runtimeEnvironmentId,
      },
      referenceSolution = false,
      otherSolutions,
      assignment,
      evaluation,
      submittedBy,
      note,
      runtimeEnvironments,
      editNote = null,
      assignmentSolversLoading,
      assignmentSolverSelector = null,
      links: { SOLUTION_DETAIL_URI_FACTORY, SOLUTION_SOURCE_CODES_URI_FACTORY },
    } = this.props;

    const {
      id: assignmentId,
      groupId,
      firstDeadline,
      allowSecondDeadline,
      secondDeadline,
      maxPointsDeadlineInterpolation,
      maxPointsBeforeFirstDeadline,
      maxPointsBeforeSecondDeadline,
      pointsPercentualThreshold,
    } = assignment || {};

    const important = otherSolutions && getImportantSolutions(otherSolutions, id);
    const environment =
      runtimeEnvironments && runtimeEnvironmentId && runtimeEnvironments.find(({ id }) => id === runtimeEnvironmentId);

    const assignmentSolver =
      assignmentSolverSelector && assignmentId && assignmentSolverSelector(assignmentId, authorId);
    const lastAttemptIndex = assignmentSolver && assignmentSolver.get('lastAttemptIndex');

    return (
      <>
        <Box
          title={
            referenceSolution ? (
              <FormattedMessage
                id="app.referenceSolutionDetail.title.details"
                defaultMessage="Reference Solution Detail"
              />
            ) : (
              <FormattedMessage id="app.solution.title" defaultMessage="The Solution" />
            )
          }
          noPadding={true}
          collapsable={true}
          isOpen={true}>
          <Table size="sm" className="card-table">
            <tbody>
              <tr>
                <td className="icon-col">
                  <UserIcon />
                </td>
                <th className="text-nowrap">
                  <FormattedMessage id="generic.author" defaultMessage="Author" />:
                </th>
                <td>
                  <UsersNameContainer
                    userId={authorId}
                    showEmail="icon"
                    showExternalIdentifiers={!referenceSolution}
                    link={referenceSolution}
                  />
                </td>
              </tr>

              {Boolean(submittedBy) && submittedBy !== authorId && (
                <tr>
                  <td className="icon-col">
                    <SupervisorIcon />
                  </td>
                  <th className="text-nowrap">
                    <FormattedMessage id="generic.reevaluatedBy" defaultMessage="Re-evaluated by" />:
                    <Explanation id="reevaluatedBy">
                      <FormattedMessage
                        id="app.solution.explanations.reevaluatedBy"
                        defaultMessage="If present, the solution was re-evaluated so its evaluation results may be different than you remember. Re-evaluation is typically used in case of failures or if the parameters of the exercise needs to be changed (e.g., to fix problems). The field holds the name of person responsible for initiating the re-evaluation."
                      />
                    </Explanation>
                  </th>
                  <td>
                    <UsersNameContainer userId={submittedBy} showEmail="icon" link={referenceSolution} />
                  </td>
                </tr>
              )}

              {(referenceSolution || note.length > 0 || Boolean(editNote)) && (
                <tr>
                  <td className="icon-col">
                    <NoteIcon />
                  </td>
                  <th className="text-nowrap">
                    {referenceSolution ? (
                      <>
                        <FormattedMessage id="generic.description" defaultMessage="Description" />:
                      </>
                    ) : (
                      <>
                        <FormattedMessage id="app.solution.note" defaultMessage="Note:" />
                        <Explanation id="note">
                          <FormattedMessage
                            id="app.solution.explanations.note"
                            defaultMessage="Short note left by the author of the solution that can be used to distinguish between solutions of one assignment. The note is also visible by teachers, so it can be used to pass brief information to them (however, comments are more suitable for elaborate conversations)."
                          />
                        </Explanation>
                      </>
                    )}
                  </th>
                  <td>
                    {referenceSolution || note.length > 0 ? (
                      note
                    ) : (
                      <em className="text-body-secondary small">
                        <FormattedMessage id="generic.empty" defaultMessage="empty" />
                      </em>
                    )}

                    {Boolean(editNote) && (
                      <span className="float-end text-warning mx-2">
                        <EditIcon onClick={this.openEditDialog} />
                      </span>
                    )}
                  </td>
                </tr>
              )}

              <tr>
                <td className="icon-col">
                  <Icon icon={['far', 'clock']} />
                </td>

                {referenceSolution ? (
                  <>
                    <th>
                      <FormattedMessage id="generic.uploadedAt" defaultMessage="Uploaded at" />:
                    </th>
                    <td>
                      <DateTime unixts={createdAt} showRelative />
                    </td>
                  </>
                ) : (
                  <>
                    <th className="text-nowrap">
                      <FormattedMessage id="app.solution.submittedAt" defaultMessage="Submitted at" />:
                      <Explanation id="submittedAt">
                        <FormattedMessage
                          id="app.solution.explanations.submittedAt"
                          defaultMessage="Time when the solution was uploaded to ReCodEx. The time is important for the scoring since it determines whether the solution is on time or late with respect to the deadline(s)."
                        />
                      </Explanation>
                    </th>
                    <td>
                      <span className="me-2">
                        {createDeadlineIcon(createdAt, firstDeadline, allowSecondDeadline ? secondDeadline : null, {
                          tooltipId: 'deadlineInfo',
                          tooltipPlacement: 'bottom',
                          tooltip:
                            createdAt < firstDeadline ? (
                              <FormattedMessage
                                id="app.solution.submittedBeforeFirstDeadline"
                                defaultMessage="The solution was submitted before the deadline"
                              />
                            ) : allowSecondDeadline && createdAt < secondDeadline ? (
                              <FormattedMessage
                                id="app.solution.submittedBeforeSecondDeadline"
                                defaultMessage="The solution was submitted after the first but still before the second deadline"
                              />
                            ) : (
                              <FormattedMessage
                                id="app.solution.submittedAfterDeadlines"
                                defaultMessage="The solution was submitted after the deadline"
                              />
                            ),
                        })}
                      </span>

                      <DateTime unixts={createdAt} />

                      {createdAt > firstDeadline && (
                        <>
                          <span className="px-1"> </span>
                          <small className="text-body-secondary">
                            ({moment.duration(firstDeadline - createdAt, 'seconds').humanize()}{' '}
                            <FormattedMessage id="app.solution.afterDeadline" defaultMessage="after the deadline" />)
                          </small>
                        </>
                      )}
                    </td>
                  </>
                )}
              </tr>

              {Boolean(environment) && Boolean(environment.name) && (
                <tr>
                  <td className="icon-col">
                    <CodeIcon />
                  </td>
                  <th className="text-nowrap">
                    <FormattedMessage id="app.solution.environment" defaultMessage="Used language:" />
                    <Explanation id="environment">
                      <FormattedMessage
                        id="app.solution.explanations.environment"
                        defaultMessage="The name of runtime environment (i.e., programming language, compilation settings, runtime setup, etc.) selected for the solution."
                      />
                    </Explanation>
                  </th>
                  <td>
                    <EnvironmentsListItem runtimeEnvironment={environment} longNames={true} />
                  </td>
                </tr>
              )}

              {visibility !== null && (
                <tr>
                  <td className="icon-col">
                    <VisibleIcon visible={visibility > 0} />
                  </td>
                  <th>
                    <FormattedMessage id="generic.visibility" defaultMessage="Visibility" />:
                  </th>
                  <td>
                    {visibility <= 0 && (
                      <FormattedMessage id="app.referenceSolutionDetail.visibility.private" defaultMessage="Private" />
                    )}
                    {visibility === 1 && (
                      <FormattedMessage id="app.referenceSolutionDetail.visibility.public" defaultMessage="Public" />
                    )}
                    {visibility > 1 && (
                      <FormattedMessage
                        id="app.referenceSolutionDetail.visibility.promoted"
                        defaultMessage="Promoted"
                      />
                    )}
                    <Explanation id="assigned-at">
                      {visibility <= 0 && (
                        <FormattedMessage
                          id="app.referenceSolutionDetail.visibility.privateExplanation"
                          defaultMessage="Private solutions are visible only to their author. Experimental and temporary submissions should be kept private so other supervisors are not overwhelmed with abundance of irrelevant source codes."
                        />
                      )}
                      {visibility === 1 && (
                        <FormattedMessage
                          id="app.referenceSolutionDetail.visibility.publicExplanation"
                          defaultMessage="Public solutions are visible to all supervisors who can see the exercise."
                        />
                      )}
                      {visibility > 1 && (
                        <FormattedMessage
                          id="app.referenceSolutionDetail.visibility.promotedExplanation"
                          defaultMessage="Promoted solutions are public solutions explicitly recommended by the author of the exercise as the ones that are worth checking out by supervisors who consider to assign the exercise."
                        />
                      )}
                    </Explanation>
                  </td>
                </tr>
              )}

              {!referenceSolution && (
                <>
                  <tr>
                    <td className="icon-col">
                      <PointsIcon />
                    </td>
                    <th className="text-nowrap">
                      <FormattedMessage id="app.solution.scoredPoints" defaultMessage="Final score" />:
                      <Explanation id="scoredPoints">
                        <FormattedMessage
                          id="app.solution.explanations.scoredPoints"
                          defaultMessage="Points awarded to this solution and current points limit that was valid at the time the solution was uploaded. Click the explanation link for more details about the scoring process."
                        />
                      </Explanation>
                    </th>
                    <td>
                      <Points points={actualPoints} bonusPoints={bonusPoints} maxPoints={maxPoints} wideFormat />

                      {accepted && (
                        <AcceptedIcon
                          gapLeft={3}
                          gapRight={3}
                          className="text-success"
                          tooltipId="accepted"
                          tooltipPlacement="bottom"
                          tooltip={
                            <FormattedMessage
                              id="app.solutionStatusIcon.accepted"
                              defaultMessage="The solution was marked as accepted."
                            />
                          }
                        />
                      )}
                      {important.accepted && (
                        <WarningIcon
                          gapLeft={3}
                          gapRight={3}
                          className="text-warning"
                          tooltipId="another-accepted"
                          tooltipPlacement="bottom"
                          tooltip={
                            <FormattedMessage
                              id="app.solution.anotherAcceptedWarning"
                              defaultMessage="Another solution has been marked as accepted. Points of this solution are not taken into account."
                            />
                          }
                        />
                      )}
                      {!important.accepted && important.best && (
                        <WarningIcon
                          gapLeft={3}
                          gapRight={3}
                          className="text-warning"
                          tooltipId="best"
                          tooltipPlacement="bottom"
                          tooltip={
                            <FormattedMessage
                              id="app.solution.anotherBestWarning"
                              defaultMessage="Another solution is considered as the best (i.e., it has gained more points or it has the same points but it was submitted later)."
                            />
                          }
                        />
                      )}

                      {evaluation && (
                        <span className="float-end clickable text-primary mx-2" onClick={this.openExplainDialog}>
                          <small>
                            <FormattedMessage id="generic.explain" defaultMessage="explain" />
                          </small>
                          <Icon icon="calculator" gapLeft={2} />
                        </span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="icon-col">
                      <ReviewIcon review={review} reviewRequest={reviewRequest} />
                    </td>
                    <th className="text-nowrap">
                      {review && review.closedAt ? (
                        <>
                          <FormattedMessage id="app.solution.reviewClosedAt" defaultMessage="Reviewed at" />:
                        </>
                      ) : (
                        <>
                          <FormattedMessage id="app.solution.reviewStartedAt" defaultMessage="Review started at" />:
                        </>
                      )}
                      <Explanation id="reviews">
                        <FormattedMessage
                          id="app.solution.explanations.reviews"
                          defaultMessage="Indicates last change in the review state. The review is started before the teacher can make any comments. When the review is closed, all comments become visible to the author. Review comments are visible at the submitted files page."
                        />
                      </Explanation>
                    </th>
                    <td>
                      {review && review.startedAt ? (
                        <DateTime unixts={review.closedAt || review.startedAt} />
                      ) : (
                        <i className="text-body-secondary">
                          {reviewRequest && (
                            <strong className="text-success">
                              <FormattedMessage id="app.solution.reviewRequested" defaultMessage="requested" />,{' '}
                            </strong>
                          )}
                          <FormattedMessage id="app.solution.reviewNotStartedYet" defaultMessage="not started yet" />
                        </i>
                      )}

                      {review && review.issues > 0 && (
                        <small className="text-body-secondary ms-3">
                          (
                          <FormattedMessage
                            id="app.solution.reviewIssuesCount"
                            defaultMessage="{issues} {issues, plural, one {issue} other {issues}} to resolve"
                            values={{ issues: review.issues }}
                          />
                          )
                        </small>
                      )}

                      {review && review.closedAt && (
                        <span className="small float-end mx-2">
                          <Link to={SOLUTION_SOURCE_CODES_URI_FACTORY(assignmentId, id)}>
                            <ReviewIcon
                              review={review}
                              gapLeft={2}
                              className={review.issues > 0 ? 'text-warning' : 'text-success'}
                            />
                          </Link>
                        </span>
                      )}

                      {important.lastReviewed && (
                        <span className="small float-end mx-2">
                          <Link to={SOLUTION_DETAIL_URI_FACTORY(assignmentId, important.lastReviewed.id)}>
                            <FormattedMessage id="app.solution.lastReviewed" defaultMessage="last reviewed" />
                            <LinkIcon gapLeft={2} />
                          </Link>
                        </span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="icon-col">
                      <Icon icon="list-ol" />
                    </td>
                    <th className="text-nowrap">
                      <FormattedMessage id="app.solution.solutionAttempt" defaultMessage="Solution Attempt" />:
                    </th>
                    <td>
                      {!lastAttemptIndex ? (
                        <LoadingIcon />
                      ) : (
                        <FormattedMessage
                          id="app.solution.solutionAttemptValue"
                          defaultMessage="{index} of {count}"
                          values={{
                            index: attemptIndex,
                            count: lastAttemptIndex,
                          }}
                        />
                      )}

                      {otherSolutions && otherSolutions.size > 1 && (
                        <span
                          className="small float-end clickable text-primary mx-2"
                          onClick={this.openOtherSolutionsDialog}>
                          <FormattedMessage id="app.solution.allSolutions" defaultMessage="all solutions" />
                          <Icon icon="list-ul" gapLeft={2} />
                        </span>
                      )}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </Table>
        </Box>

        {Boolean(editNote) && (
          <Modal show={this.state.editDialogOpen} backdrop="static" onHide={this.closeDialog} size="xl">
            <Modal.Header closeButton>
              <Modal.Title>
                {referenceSolution ? (
                  <FormattedMessage
                    id="app.referenceSolution.editDescriptionModalTitle"
                    defaultMessage="Edit Solution Description"
                  />
                ) : (
                  <FormattedMessage id="app.solution.editNoteModalTitle" defaultMessage="Edit Solution Note" />
                )}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <EditSolutionNoteForm
                onSubmit={this.editNoteSubmitHandler}
                initialValues={getEditNoteFormInitialValues(note)}
              />
            </Modal.Body>
          </Modal>
        )}

        {!referenceSolution && evaluation && (
          <Modal show={this.state.explainDialogOpen} backdrop="static" onHide={this.closeDialog} size="xl">
            <Modal.Header closeButton>
              <Modal.Title>
                <FormattedMessage
                  id="app.solution.pointsExplainDialog.title"
                  defaultMessage="Explanation of the scoring process"
                />
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              {overriddenPoints === null ? (
                <>
                  {evaluation.score * 100 >= pointsPercentualThreshold ? (
                    <>
                      {pointsPercentualThreshold > 0 && (
                        <p className="larger">
                          <SuccessIcon className="text-success" gapRight={3} fixedWidth />
                          <FormattedMessage
                            id="app.solution.pointsExplainDialog.correctnessAboveThreshold"
                            defaultMessage="The solution correctness is above threshold."
                          />
                        </p>
                      )}
                      <p className="larger">
                        <Icon icon="calculator" gapRight={3} fixedWidth className="text-primary" />
                        <FormattedMessage
                          id="app.solution.pointsExplainDialog.calculationDescription"
                          defaultMessage="The actual points are computed from the points limit (depicted below) proportionally to the solution correctness:"
                        />
                      </p>
                      <p className="larger text-center">
                        <code>
                          floor({maxPoints} &times;{' '}
                          <FormattedNumber style="percent" maximumFractionDigits={3} value={evaluation.score} />
                          <OverlayTrigger
                            placement="bottom"
                            overlay={
                              <Tooltip id="pointsComputationEpsilon">
                                <FormattedMessage
                                  id="app.solution.pointsExplainDialog.epsilonExplain"
                                  defaultMessage="The epsilon (1e-6) is added to compensate for rounding errors."
                                />
                              </Tooltip>
                            }>
                            <span>{' + '}&epsilon;</span>
                          </OverlayTrigger>
                          ) = <strong>{actualPoints}</strong>
                        </code>
                      </p>
                    </>
                  ) : (
                    <p className="larger">
                      <FailureIcon gapRight={3} fixedWidth />
                      <FormattedMessage
                        id="app.solution.pointsExplainDialog.correctnessBelowThreshold"
                        defaultMessage="The solution correctness is below threshold. No points are granted."
                      />
                    </p>
                  )}

                  {Boolean(bonusPoints) && (
                    <p className="larger">
                      <Icon icon="hand-holding-usd" gapRight={3} fixedWidth className="text-success" />
                      <FormattedMessage
                        id="app.solution.pointsExplainDialog.bonusPoints"
                        defaultMessage="A supervisor has granted additional <strong>{bonusPoints}</strong> bonus {bonusPoints, plural, one {point} other {points}}."
                        values={{ bonusPoints, strong: contents => <strong>{contents}</strong> }}
                      />
                    </p>
                  )}
                </>
              ) : (
                <p className="larger">
                  <Icon icon={['far', 'hand-point-right']} gapRight={3} fixedWidth className="text-danger" />
                  <FormattedMessage
                    id="app.solution.pointsExplainDialog.overriddenPoints"
                    defaultMessage="A supervisor has manually overridden the points to <strong>{overriddenPoints}</strong> (and {bonusPoints} {bonusPoints, plural, one {point} other {points}})."
                    values={{ overriddenPoints, bonusPoints, strong: contents => <strong>{contents}</strong> }}
                  />
                </p>
              )}

              {(maxPointsBeforeFirstDeadline !== 0 || (allowSecondDeadline && maxPointsBeforeSecondDeadline !== 0)) && (
                <>
                  <hr />

                  <div className="text-body-secondary mb-1">
                    <FormattedMessage
                      id="app.assignment.deadlinesGraphDialog.title"
                      defaultMessage="Visualization of points limits and corresponding deadlines"
                    />
                    {(overriddenPoints !== null || evaluation.score * 100 < pointsPercentualThreshold) && (
                      <>
                        {' '}
                        <FormattedMessage
                          id="app.solution.pointsExplainDialog.deadlinesGraphNotUsedSuffix"
                          defaultMessage="(but it was not used in the scoring process of this solution)"
                        />
                      </>
                    )}
                    :
                  </div>

                  <div className={allowSecondDeadline ? 'mt-1' : 'two-third-width my-5 mx-auto'}>
                    <AssignmentDeadlinesGraph
                      firstDeadline={firstDeadline}
                      secondDeadline={secondDeadline}
                      maxPointsBeforeFirstDeadline={maxPointsBeforeFirstDeadline}
                      maxPointsBeforeSecondDeadline={maxPointsBeforeSecondDeadline}
                      allowSecondDeadline={allowSecondDeadline}
                      maxPointsDeadlineInterpolation={maxPointsDeadlineInterpolation}
                      markerTime={createdAt}
                      markerPoints={maxPoints}
                      viewportAspectRatio={2 / 5}
                    />
                  </div>
                </>
              )}
            </Modal.Body>
          </Modal>
        )}

        {assignmentSolverSelector && (
          <Modal show={this.state.otherSolutionsDialogOpen} backdrop="static" onHide={this.closeDialog} size="xl">
            <Modal.Header closeButton>
              <Modal.Title>
                <FormattedMessage
                  id="app.solution.otherSolutionsTitle"
                  defaultMessage="All Solutions of The Assignment"
                />
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <SolutionsTable
                solutions={otherSolutions}
                assignmentId={assignmentId}
                groupId={groupId}
                runtimeEnvironments={runtimeEnvironments}
                noteMaxlen={32}
                selected={id}
                assignmentSolversLoading={assignmentSolversLoading}
                assignmentSolver={assignmentSolver}
                compact
              />
            </Modal.Body>
          </Modal>
        )}
      </>
    );
  }
}

SolutionStatus.propTypes = {
  solution: PropTypes.shape({
    id: PropTypes.string.isRequired,
    attemptIndex: PropTypes.number,
    createdAt: PropTypes.number.isRequired,
    authorId: PropTypes.string.isRequired,
    accepted: PropTypes.bool,
    reviewRequest: PropTypes.bool,
    review: PropTypes.shape({
      startedAt: PropTypes.number,
      closedAt: PropTypes.number,
      issues: PropTypes.number,
    }),
    maxPoints: PropTypes.number,
    bonusPoints: PropTypes.number,
    actualPoints: PropTypes.number,
    overriddenPoints: PropTypes.number,
    runtimeEnvironmentId: PropTypes.string,
    visibility: PropTypes.number,
  }),
  referenceSolution: PropTypes.bool,
  submittedBy: PropTypes.string,
  id: PropTypes.string,
  otherSolutions: ImmutablePropTypes.list,
  assignment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    groupId: PropTypes.string.isRequired,
    firstDeadline: PropTypes.number.isRequired,
    allowSecondDeadline: PropTypes.bool.isRequired,
    secondDeadline: PropTypes.number,
    maxPointsDeadlineInterpolation: PropTypes.bool,
    maxPointsBeforeFirstDeadline: PropTypes.number.isRequired,
    maxPointsBeforeSecondDeadline: PropTypes.number,
    pointsPercentualThreshold: PropTypes.number,
  }),
  evaluation: PropTypes.object,
  note: PropTypes.string,
  runtimeEnvironments: PropTypes.array,
  editNote: PropTypes.func,
  assignmentSolversLoading: PropTypes.bool,
  assignmentSolverSelector: PropTypes.func,
  links: PropTypes.object.isRequired,
};

export default withLinks(SolutionStatus);
