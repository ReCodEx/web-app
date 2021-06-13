import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { defaultMemoize } from 'reselect';

import EditSolutionNoteForm from '../../forms/EditSolutionNoteForm';
import Box from '../../widgets/Box';
import DateTime from '../../widgets/DateTime';
import AssignmentStatusIcon from '../../Assignments/Assignment/AssignmentStatusIcon';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import EnvironmentsListItem from '../../helpers/EnvironmentsList/EnvironmentsListItem';
import withLinks from '../../../helpers/withLinks';
import Icon, {
  EditIcon,
  NoteIcon,
  UserIcon,
  SupervisorIcon,
  ReviewedIcon,
  SuccessOrFailureIcon,
  CodeIcon,
  LinkIcon,
  WarningIcon,
} from '../../icons';

const getEditNoteFormInitialValues = defaultMemoize(note => ({ note }));

const getImportantSolutions = defaultMemoize((solutions, selectedSolutionId) => {
  solutions = solutions.toArray();
  const selectedIdx = solutions.findIndex(s => s.id === selectedSolutionId);
  const accepted = solutions.find(s => s.accepted && s.id !== selectedSolutionId) || null;
  const best = solutions.find(s => s.isBestSolution && s.id !== selectedSolutionId) || null;
  let lastReviewed = solutions.filter(s => s.reviewed).shift();
  lastReviewed = lastReviewed && lastReviewed.id !== selectedSolutionId ? lastReviewed : null;
  let last = solutions.shift();
  last = last && last.id !== selectedSolutionId ? last : null;
  return { selectedIdx, accepted, best, lastReviewed, last };
});

class SolutionStatus extends Component {
  state = { dialogOpen: false };

  openDialog = () => this.setState({ dialogOpen: true });
  closeDialog = () => {
    this.setState({ dialogOpen: false });
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
      assignment: { id: assignmentId, firstDeadline, allowSecondDeadline, secondDeadline },
      evaluationStatus,
      submittedAt,
      userId,
      submittedBy,
      note,
      accepted,
      reviewed,
      environment,
      maxPoints,
      bonusPoints,
      actualPoints,
      editNote = null,
      links: { SOLUTION_DETAIL_URI_FACTORY },
    } = this.props;

    const important = getImportantSolutions(otherSolutions, id);

    return (
      <React.Fragment>
        <Box
          title={<FormattedMessage id="app.solution.title" defaultMessage="The Solution" />}
          noPadding={true}
          collapsable={true}
          isOpen={true}>
          <Table>
            <tbody>
              {(note.length > 0 || Boolean(editNote)) && (
                <tr>
                  <td className="text-center">
                    <NoteIcon />
                  </td>
                  <th className="text-nowrap">
                    <FormattedMessage id="app.solution.note" defaultMessage="Note:" />
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
                      <span className="pull-right text-warning">
                        <EditIcon gapLeft gapRight onClick={this.openDialog} />
                      </span>
                    )}
                  </td>
                </tr>
              )}

              <tr>
                <td className="text-center">
                  <Icon icon={['far', 'clock']} />
                </td>
                <th className="text-nowrap">
                  <FormattedMessage id="app.solution.submittedAt" defaultMessage="Submitted at" />:
                </th>
                <td>
                  <DateTime unixts={submittedAt} showRelative />
                </td>
              </tr>

              <tr>
                <td className="text-center">
                  <Icon icon="hourglass-start" />
                </td>
                <th className="text-nowrap">
                  <FormattedMessage id="app.solution.beforeFirstDeadline" defaultMessage="Before the deadline" />:
                </th>
                <td>
                  <SuccessOrFailureIcon success={submittedAt < firstDeadline} />
                </td>
              </tr>

              {submittedAt >= firstDeadline && allowSecondDeadline === true && (
                <tr>
                  <td className="text-center">
                    <Icon icon="hourglass-end" />
                  </td>
                  <th className="text-nowrap">
                    <FormattedMessage
                      id="app.solution.beforeSecondDeadline"
                      defaultMessage="Before the second deadline"
                    />
                    :
                  </th>
                  <td>
                    <SuccessOrFailureIcon success={submittedAt < secondDeadline} />
                  </td>
                </tr>
              )}

              <tr>
                <td className="text-center">
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
                  <td className="text-center">
                    <SupervisorIcon />
                  </td>
                  <th className="text-nowrap">
                    <FormattedMessage id="generic.reevaluatedBy" defaultMessage="Re-evaluated by" />:
                  </th>
                  <td>
                    <UsersNameContainer userId={submittedBy} showEmail="icon" />
                  </td>
                </tr>
              )}

              {Boolean(environment) && Boolean(environment.name) && (
                <tr>
                  <td className="text-center">
                    <CodeIcon />
                  </td>
                  <th className="text-nowrap">
                    <FormattedMessage id="app.solution.environment" defaultMessage="Target language:" />
                  </th>
                  <td>
                    <EnvironmentsListItem runtimeEnvironment={environment} longNames={true} />
                  </td>
                </tr>
              )}

              <tr>
                <td className="text-center">
                  <AssignmentStatusIcon id={String(submittedAt)} status={evaluationStatus} accepted={accepted} />
                </td>
                <th className="text-nowrap">
                  <FormattedMessage id="app.solution.scoredPoints" defaultMessage="Final score" />:
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
                    <React.Fragment>
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

                      <span className="small pull-right">
                        <Link to={SOLUTION_DETAIL_URI_FACTORY(assignmentId, important.accepted.id)}>
                          <FormattedMessage id="app.solution.accepted" defaultMessage="accepted" />
                          <LinkIcon gapLeft />
                        </Link>
                      </span>
                    </React.Fragment>
                  )}
                  {!important.accepted && important.best && (
                    <React.Fragment>
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

                      <span className="small pull-right">
                        <Link to={SOLUTION_DETAIL_URI_FACTORY(assignmentId, important.best.id)}>
                          <FormattedMessage id="app.solution.best" defaultMessage="best" />
                          <LinkIcon gapLeft />
                        </Link>
                      </span>
                    </React.Fragment>
                  )}
                </td>
              </tr>

              <tr>
                <td className="text-center">
                  <ReviewedIcon />
                </td>
                <th className="text-nowrap">
                  <FormattedMessage id="app.solution.reviewed" defaultMessage="Reviewed" />:
                </th>
                <td>
                  <SuccessOrFailureIcon success={reviewed} />

                  {important.lastReviewed && (
                    <span className="small pull-right">
                      <Link to={SOLUTION_DETAIL_URI_FACTORY(assignmentId, important.lastReviewed.id)}>
                        <FormattedMessage id="app.solution.lastReviewed" defaultMessage="last reviewed" />
                        <LinkIcon gapLeft />
                      </Link>
                    </span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="text-center">
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

                  {important.last && (
                    <span className="small pull-right">
                      <Link to={SOLUTION_DETAIL_URI_FACTORY(assignmentId, important.last.id)}>
                        <FormattedMessage id="app.solution.lastSolution" defaultMessage="last" />
                        <LinkIcon gapLeft />
                      </Link>
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </Table>
        </Box>

        {Boolean(editNote) && (
          <Modal show={this.state.dialogOpen} backdrop="static" onHide={this.closeDialog} size="large">
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
      </React.Fragment>
    );
  }
}

SolutionStatus.propTypes = {
  id: PropTypes.string.isRequired,
  otherSolutions: ImmutablePropTypes.list.isRequired,
  assignment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    firstDeadline: PropTypes.number.isRequired,
    allowSecondDeadline: PropTypes.bool.isRequired,
    secondDeadline: PropTypes.number,
  }).isRequired,
  evaluationStatus: PropTypes.string.isRequired,
  submittedAt: PropTypes.number.isRequired,
  userId: PropTypes.string.isRequired,
  submittedBy: PropTypes.string,
  note: PropTypes.string,
  accepted: PropTypes.bool.isRequired,
  reviewed: PropTypes.bool.isRequired,
  environment: PropTypes.object,
  maxPoints: PropTypes.number.isRequired,
  bonusPoints: PropTypes.number.isRequired,
  actualPoints: PropTypes.number,
  editNote: PropTypes.func,
  links: PropTypes.object.isRequired,
};

export default withLinks(SolutionStatus);
