import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
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
} from '../../icons';

const getEditNoteFormInitialValues = defaultMemoize(note => ({ note }));

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
      assignment: { firstDeadline, allowSecondDeadline, secondDeadline },
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
                    {Boolean(editNote) && (
                      <span className="pull-right text-warning">
                        <EditIcon gapLeft gapRight onClick={this.openDialog} />
                      </span>
                    )}

                    {note.length > 0 ? (
                      note
                    ) : (
                      <em className="text-muted">
                        <FormattedMessage id="app.solution.emptyNote" defaultMessage="empty" />
                      </em>
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
                </td>
              </tr>

              <tr>
                <td className="text-center">
                  <Icon icon="check-circle" />
                </td>
                <th className="text-nowrap">
                  <FormattedMessage id="app.solution.acceptedAsFinal" defaultMessage="Accepted as final" />:
                </th>
                <td>
                  <SuccessOrFailureIcon success={accepted} />
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
                </td>
              </tr>
            </tbody>
          </Table>
        </Box>

        {Boolean(editNote) && (
          <Modal show={this.state.dialogOpen} backdrop="static" onHide={this.closeDialog} bsSize="large">
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
  assignment: PropTypes.shape({
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
