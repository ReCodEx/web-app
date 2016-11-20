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

import { createGetUploadedFiles, createAllUploaded } from '../../redux/selectors/upload';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { cancel, changeNote, submitSolution } from '../../redux/modules/submission';

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
      cancel,
      reset,
      assignmentId,
      changeNote,
      canSubmit,
      hasFailed,
      isProcessing,
      isSending,
      submissionId,
      monitor
    } = this.props;

    const {
      links: { SUBMISSION_DETAIL_URI_FACTORY }
    } = this.context;

    return (
      <div>
        <SubmitSolution
          isOpen={isOpen}
          canSubmit={canSubmit}
          isSending={isSending}
          hasFailed={hasFailed}
          uploadId={assignmentId}
          reset={reset}
          saveNote={changeNote}
          onClose={cancel}
          submitSolution={this.submit} />

        <EvaluationProgressContainer
          isOpen={isProcessing}
          monitor={monitor}
          link={SUBMISSION_DETAIL_URI_FACTORY(assignmentId, submissionId)}
        />
      </div>
    );
  };

}

SubmitSolutionContainer.contextTypes = {
  links: PropTypes.object
};

SubmitSolutionContainer.propTypes = {
  reset: PropTypes.func.isRequired,
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
  attachedFiles: PropTypes.array
};

export default connect(
  (state, { assignmentId }) => {
    const getUploadedFiles = createGetUploadedFiles(assignmentId);
    const allUploaded = createAllUploaded(assignmentId);
    return {
      userId: loggedInUserIdSelector(state),
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
  (dispatch, props) => ({
    changeNote: (note) => dispatch(changeNote(note)),
    cancel: () => dispatch(cancel()),
    submitSolution: (note, files) => dispatch(submitSolution(props.assignmentId, note, files))
  })
)(SubmitSolutionContainer);
