import React, { Component, PropTypes } from 'react';
import { List } from 'immutable';
import { connect } from 'react-redux';
import SubmitSolution from '../../components/Submissions/SubmitSolution';
import EvaluationProgressContainer from '../EvaluationProgressContainer';

import {
  getNote,
  isProcessing,
  isSending,
  hasFailed,
  getSubmissionId,
  getMonitorParams
} from '../../redux/selectors/submission';

import {
  createGetUploadedFiles,
  createAllUploaded
} from '../../redux/selectors/upload';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  init as resetSubmission,
  cancel,
  changeNote,
  submitSolution
} from '../../redux/modules/submission';
import { reset as resetUpload } from '../../redux/modules/upload';

import withLinks from '../../hoc/withLinks';

class SubmitSolutionContainer extends Component {
  submit = () => {
    const {
      attachedFiles,
      onSubmit,
      note,
      submitSolution
    } = this.props;

    submitSolution(note, attachedFiles.map(item => item.file));
    !!onSubmit && onSubmit();
  };

  render = () => {
    const {
      isOpen = false,
      userId,
      note,
      cancel,
      assignmentId,
      changeNote,
      canSubmit,
      hasFailed,
      isProcessing,
      isSending,
      submissionId,
      monitor,
      reset,
      links: { SUBMISSION_DETAIL_URI_FACTORY }
    } = this.props;

    return (
      <div>
        <SubmitSolution
          userId={userId}
          isOpen={isOpen}
          canSubmit={canSubmit}
          isSending={isSending}
          hasFailed={hasFailed}
          uploadId={assignmentId}
          reset={reset}
          note={note}
          saveNote={changeNote}
          onClose={cancel}
          submitSolution={this.submit}
        />

        <EvaluationProgressContainer
          isOpen={isProcessing}
          monitor={monitor}
          link={SUBMISSION_DETAIL_URI_FACTORY(assignmentId, submissionId)}
        />
      </div>
    );
  };
}

SubmitSolutionContainer.propTypes = {
  userId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool,
  cancel: PropTypes.func.isRequired,
  note: PropTypes.string,
  assignmentId: PropTypes.string.isRequired,
  changeNote: PropTypes.func.isRequired,
  canSubmit: PropTypes.bool,
  hasFailed: PropTypes.bool,
  isProcessing: PropTypes.bool,
  isSending: PropTypes.bool,
  submissionId: PropTypes.string,
  monitor: PropTypes.object,
  onSubmit: PropTypes.func,
  submitSolution: PropTypes.func.isRequired,
  attachedFiles: PropTypes.array,
  reset: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired
};

export default withLinks(
  connect(
    (state, { assignmentId, userId }) => {
      const getUploadedFiles = createGetUploadedFiles(assignmentId);
      const allUploaded = createAllUploaded(assignmentId);
      return {
        userId: userId || loggedInUserIdSelector(state),
        note: getNote(state),
        attachedFiles: (getUploadedFiles(state) || List()).toJS(),
        isProcessing: isProcessing(state),
        isSending: isSending(state),
        hasFailed: hasFailed(state),
        canSubmit: allUploaded(state) || false,
        submissionId: getSubmissionId(state),
        monitor: getMonitorParams(state)
      };
    },
    (dispatch, { userId, assignmentId }) => ({
      changeNote: note => dispatch(changeNote(note)),
      cancel: () => dispatch(cancel()),
      submitSolution: (note, files) =>
        dispatch(submitSolution(userId, assignmentId, note, files)),
      reset: () =>
        dispatch(resetUpload(assignmentId)) &&
        dispatch(resetSubmission(userId, assignmentId))
    })
  )(SubmitSolutionContainer)
);
