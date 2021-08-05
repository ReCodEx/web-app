import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { defaultMemoize } from 'reselect';

import EditSolutionNoteForm from '../../forms/EditSolutionNoteForm';
import Box from '../../widgets/Box';
import DateTime from '../../widgets/DateTime';
import Explanation from '../../widgets/Explanation';
import AssignmentStatusIcon from '../../Assignments/Assignment/AssignmentStatusIcon';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import EnvironmentsListItem from '../../helpers/EnvironmentsList/EnvironmentsListItem';
import withLinks from '../../../helpers/withLinks';
import Icon, {
  DeadlineIcon,
  EditIcon,
  NoteIcon,
  UserIcon,
  SupervisorIcon,
  ReviewedIcon,
  SuccessOrFailureIcon,
  SuccessIcon,
  FailureIcon,
  CodeIcon,
  LinkIcon,
  WarningIcon,
} from '../../icons';
import AssignmentDeadlinesGraph from '../../Assignments/Assignment/AssignmentDeadlinesGraph';
import SolutionsTable from '../../Assignments/SolutionsTable';

const getEditNoteFormInitialValues = defaultMemoize(note => ({ note }));

const getImportantSolutions = defaultMemoize((solutions, selectedSolutionId) => {
  solutions = solutions.toArray();
  const selectedIdx = solutions.findIndex(s => s.id === selectedSolutionId);
  const accepted = solutions.find(s => s.accepted && s.id !== selectedSolutionId) || null;
  const best = solutions.find(s => s.isBestSolution && s.id !== selectedSolutionId) || null;
  let lastReviewed = solutions.filter(s => s.reviewed).shift();
  lastReviewed = lastReviewed && lastReviewed.id !== selectedSolutionId ? lastReviewed : null;
  return { selectedIdx, accepted, best, lastReviewed };
});

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
      id,
      otherSolutions,
      assignment: {
        id: assignmentId,
        groupId,
        firstDeadline,
        allowSecondDeadline,
        secondDeadline,
        maxPointsDeadlineInterpolation,
        maxPointsBeforeFirstDeadline,
        maxPointsBeforeSecondDeadline,
        pointsPercentualThreshold,
      },
      evaluation,
      evaluationStatus,
      submittedAt,
      userId,
      submittedBy,
      note,
      accepted,
      reviewed,
      runtimeEnvironmentId,
      runtimeEnvironments,
      maxPoints,
      bonusPoints,
      actualPoints,
      overriddenPoints = null,
      editNote = null,
      links: { SOLUTION_DETAIL_URI_FACTORY },
    } = this.props;

    const important = getImportantSolutions(otherSolutions, id);
    const environment =
      runtimeEnvironments && runtimeEnvironmentId && runtimeEnvironments.find(({ id }) => id === runtimeEnvironmentId);

    return (
      <>
        <Box
          title={<FormattedMessage id="app.solution.title" defaultMessage="The Solution" />}
          noPadding={true}
          collapsable={true}
          isOpen={true}>
          <Table responsive size="sm" className="mb-1">
            <tbody>
              <tr>
                <td className="text-center text-muted shrink-col px-2">
                  <UserIcon />
                </td>
                <th className="text-nowrap">
                  <FormattedMessage id="generic.author" defaultMessage="Author" />:
                </th>
                <td>
                  <UsersNameContainer userId={userId} showEmail="icon" />
                </td>
              </tr>

              {Boolean(submittedBy) && submittedBy !== userId && (
                <tr>
                  <td className="text-center text-muted shrink-col px-2">
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
                    <UsersNameContainer userId={submittedBy} showEmail="icon" />
                  </td>
                </tr>
              )}

              {(note.length > 0 || Boolean(editNote)) && (
                <tr>
                  <td className="text-center text-muted shrink-col px-2">
                    <NoteIcon />
                  </td>
                  <th className="text-nowrap">
                    <FormattedMessage id="app.solution.note" defaultMessage="Note:" />
                    <Explanation id="note">
                      <FormattedMessage
                        id="app.solution.explanations.note"
                        defaultMessage="Short note left by the author of the solution that can be used to distinguish between solutions of one assignment. The note is also visible by teachers, so it can be used to pass brief information to them (however, comments are more suitable for elaborate conversations)."
                      />
                    </Explanation>
                  </th>
                  <td>
                    {note.length > 0 ? (
                      note
                    ) : (
                      <em className="text-muted">
                        <FormattedMessage id="app.solution.emptyNote" defaultMessage="empty" />
                      </em>
                    )}

                    {Boolean(editNote) && (
                      <span className="float-right text-warning mx-2">
                        <EditIcon onClick={this.openEditDialog} />
                      </span>
                    )}
                  </td>
                </tr>
              )}

              <tr>
                <td className="text-center text-muted shrink-col px-2">
                  <Icon icon={['far', 'clock']} />
                </td>
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
                  <DateTime unixts={submittedAt} showRelative />

                  <span className="float-right mx-2">
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id="deadlineInfo">
                          {submittedAt < firstDeadline ? (
                            <FormattedMessage
                              id="app.solution.submittedBeforeFirstDeadline"
                              defaultMessage="The solution was submitted before the deadline"
                            />
                          ) : allowSecondDeadline && submittedAt < secondDeadline ? (
                            <FormattedMessage
                              id="app.solution.submittedBeforeSecondDeadline"
                              defaultMessage="The solution was submitted after the first but still before the second deadline"
                            />
                          ) : (
                            <FormattedMessage
                              id="app.solution.submittedAfterDeadlines"
                              defaultMessage="The solution was submitted after the deadline"
                            />
                          )}
                        </Tooltip>
                      }>
                      <span>
                        <DeadlineIcon className="text-muted" gapRight />
                        {submittedAt < firstDeadline ? (
                          <SuccessIcon />
                        ) : allowSecondDeadline && submittedAt < secondDeadline ? (
                          <Icon icon="yin-yang" className="text-warning" />
                        ) : (
                          <FailureIcon />
                        )}
                      </span>
                    </OverlayTrigger>
                  </span>
                </td>
              </tr>

              {Boolean(environment) && Boolean(environment.name) && (
                <tr>
                  <td className="text-center text-muted shrink-col px-2">
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

              <tr>
                <td className="text-center text-muted shrink-col px-2">
                  <AssignmentStatusIcon id={String(submittedAt)} status={evaluationStatus} accepted={accepted} />
                </td>
                <th className="text-nowrap">
                  <FormattedMessage id="app.solution.scoredPoints" defaultMessage="Final score" />:
                  <Explanation id="scoredPoints">
                    <FormattedMessage
                      id="app.solution.explanations.scoredPoints"
                      defaultMessage="Points awarded to this soluion and current points limit that was vaild at the time the solution was uploaded. Click the explanation link for more details about the scoring process."
                    />
                  </Explanation>
                </th>
                <td
                  className={classnames({
                    'text-danger': actualPoints + bonusPoints <= 0,
                    'text-success': actualPoints + bonusPoints > 0,
                  })}>
                  <b>
                    {actualPoints || 0}
                    {bonusPoints !== 0 ? (bonusPoints >= 0 ? '+' : '') + bonusPoints : ''} / {maxPoints}
                  </b>

                  {important.accepted && (
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id="accepted">
                          <FormattedMessage
                            id="app.solution.anotherAcceptedWarning"
                            defaultMessage="Another solution has been marked as accepted. Points of this solution are not taken into account."
                          />
                        </Tooltip>
                      }>
                      <WarningIcon largeGapLeft largeGapRight className="text-warning" />
                    </OverlayTrigger>
                  )}
                  {!important.accepted && important.best && (
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id="best">
                          <FormattedMessage
                            id="app.solution.anotherBestWarning"
                            defaultMessage="Another solution is considered as the best (i.e., it has gained more points or it has the same points but it was submitted later)."
                          />
                        </Tooltip>
                      }>
                      <WarningIcon largeGapLeft largeGapRight className="text-warning" />
                    </OverlayTrigger>
                  )}

                  {evaluation && (
                    <span className="float-right clickable text-primary mx-2" onClick={this.openExplainDialog}>
                      <small>
                        <FormattedMessage id="generic.explain" defaultMessage="explain" />
                      </small>
                      <Icon icon="calculator" gapLeft />
                    </span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="text-center text-muted shrink-col px-2">
                  <ReviewedIcon />
                </td>
                <th className="text-nowrap">
                  <FormattedMessage id="app.solution.reviewed" defaultMessage="Reviewed" />:
                  <Explanation id="reviewed">
                    <FormattedMessage
                      id="app.solution.explanations.reviewed"
                      defaultMessage="A marker that indicates whether the teacher has personally reviewed the solution. It may help navigate through the history of solutions, especially when the students are expected to make revisions."
                    />
                  </Explanation>
                </th>
                <td>
                  <SuccessOrFailureIcon success={reviewed} />

                  {important.lastReviewed && (
                    <span className="small float-right mx-2">
                      <Link to={SOLUTION_DETAIL_URI_FACTORY(assignmentId, important.lastReviewed.id)}>
                        <FormattedMessage id="app.solution.lastReviewed" defaultMessage="last reviewed" />
                        <LinkIcon gapLeft />
                      </Link>
                    </span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="text-center text-muted shrink-col px-2">
                  <Icon icon="list-ol" />
                </td>
                <th className="text-nowrap">
                  <FormattedMessage id="app.solution.solutionAttempt" defaultMessage="Solution Attempt" />:
                </th>
                <td>
                  <FormattedMessage
                    id="app.solution.solutionAttemptValue"
                    defaultMessage="{index} of {count}"
                    values={{
                      index: otherSolutions.size - important.selectedIdx,
                      count: otherSolutions.size,
                    }}
                  />

                  {otherSolutions && otherSolutions.size > 1 && (
                    <span
                      className="small float-right clickable text-primary mx-2"
                      onClick={this.openOtherSolutionsDialog}>
                      <FormattedMessage id="app.solution.allSolutions" defaultMessage="all solutions" />
                      <Icon icon="list-ul" gapLeft />
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </Table>
        </Box>

        {Boolean(editNote) && (
          <Modal show={this.state.editDialogOpen} backdrop="static" onHide={this.closeDialog} size="xl">
            <Modal.Header closeButton>
              <Modal.Title>
                <FormattedMessage id="app.solution.editNoteModalTitle" defaultMessage="Edit Solution Note" />
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

        {evaluation && (
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
                          <SuccessIcon largeGapRight fixedWidth />
                          <FormattedMessage
                            id="app.solution.pointsExplainDialog.correctnessAboveThreshold"
                            defaultMessage="The solution correctness is above threshold."
                          />
                        </p>
                      )}
                      <p className="larger">
                        <Icon icon="calculator" largeGapRight fixedWidth className="text-primary" />
                        <FormattedMessage
                          id="app.solution.pointsExplainDialog.calculationDescription"
                          defaultMessage="The actual points are computed from the points limit (depicted below) proportionally to the solution correctness:"
                        />
                      </p>
                      <p className="larger text-center">
                        <code>
                          floor({maxPoints} &times; <FormattedNumber style="percent" value={evaluation.score} />) ={' '}
                          <strong>{actualPoints}</strong>
                        </code>
                      </p>
                    </>
                  ) : (
                    <p className="larger">
                      <FailureIcon largeGapRight fixedWidth />
                      <FormattedMessage
                        id="app.solution.pointsExplainDialog.correctnessBelowThreshold"
                        defaultMessage="The solution correcntess is below threshold. No points are granted."
                      />
                    </p>
                  )}

                  {Boolean(bonusPoints) && (
                    <p className="larger">
                      <Icon icon="hand-holding-usd" largeGapRight fixedWidth className="text-success" />
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
                  <Icon icon={['far', 'hand-point-right']} largeGapRight fixedWidth className="text-danger" />
                  <FormattedMessage
                    id="app.solution.pointsExplainDialog.overriddenPoints"
                    defaultMessage="A supervisor has manually overridden the points to <strong>{overriddenPoints}</strong> (and {bonusPoints} {bonusPoints, plural, one {point} other {points}})."
                    values={{ overriddenPoints, bonusPoints, strong: contents => <strong>{contents}</strong> }}
                  />
                </p>
              )}

              <hr />

              <div className="text-muted mb-1">
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
                  markerTime={submittedAt}
                  markerPoints={maxPoints}
                  viewportAspectRatio={2 / 5}
                />
              </div>
            </Modal.Body>
          </Modal>
        )}

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
            />
          </Modal.Body>
        </Modal>
      </>
    );
  }
}

SolutionStatus.propTypes = {
  id: PropTypes.string.isRequired,
  otherSolutions: ImmutablePropTypes.list.isRequired,
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
  }).isRequired,
  evaluation: PropTypes.object,
  evaluationStatus: PropTypes.string.isRequired,
  submittedAt: PropTypes.number.isRequired,
  userId: PropTypes.string.isRequired,
  submittedBy: PropTypes.string,
  note: PropTypes.string,
  accepted: PropTypes.bool.isRequired,
  reviewed: PropTypes.bool.isRequired,
  runtimeEnvironmentId: PropTypes.string,
  runtimeEnvironments: PropTypes.array,
  maxPoints: PropTypes.number.isRequired,
  bonusPoints: PropTypes.number.isRequired,
  actualPoints: PropTypes.number,
  overriddenPoints: PropTypes.number,
  editNote: PropTypes.func,
  links: PropTypes.object.isRequired,
};

export default withLinks(SolutionStatus);
