import React, { Component, PropTypes } from 'react';
import { List } from 'immutable';
import { connect } from 'react-redux';
import UploadReferenceSolution
  from '../../components/Exercises/UploadReferenceSolution';

import {
  createGetUploadedFiles,
  createAllUploaded
} from '../../redux/selectors/upload';
import { reset as resetUpload } from '../../redux/modules/upload';

import {
  isProcessing,
  isSending,
  hasFailed
} from '../../redux/selectors/referenceSolution';
import {
  init as resetSubmit,
  submitReferenceSolution
} from '../../redux/modules/referenceSolution';

class UploadReferenceSolutionContainer extends Component {
  submit = () => {
    const {
      attachedFiles,
      onSubmit,
      note,
      submitReferenceSolution
    } = this.props;

    submitReferenceSolution(note, attachedFiles.map(item => item.file));
    !!onSubmit && onSubmit();
  };

  render = () => {
    const {
      userId,
      exercise,
      note,
      canSubmit,
      hasFailed,
      isProcessing,
      isSending,
      reset
    } = this.props;

    return (
      <div>
        <UploadReferenceSolution
          userId={userId}
          exercise={exercise}
          canSubmit={canSubmit}
          isSending={isSending}
          hasFailed={hasFailed}
          reset={reset}
          note={note}
          submitReferenceSolution={this.submit}
        />
      </div>
    );
  };
}

UploadReferenceSolutionContainer.propTypes = {
  userId: PropTypes.string.isRequired,
  exercise: PropTypes.object.isRequired,
  note: PropTypes.string,
  canSubmit: PropTypes.bool,
  hasFailed: PropTypes.bool,
  isProcessing: PropTypes.bool,
  isSending: PropTypes.bool,
  onSubmit: PropTypes.func,
  submitReferenceSolution: PropTypes.func.isRequired,
  attachedFiles: PropTypes.array.isRequired,
  reset: PropTypes.func.isRequired
};

export default connect(
  (state, { userId, exercise }) => {
    const getUploadedFiles = createGetUploadedFiles(exercise.id);
    const allUploaded = createAllUploaded(exercise.id);
    return {
      userId,
      exercise: exercise,
      attachedFiles: (getUploadedFiles(state) || List()).toJS(),
      isProcessing: isProcessing(state),
      isSending: isSending(state),
      hasFailed: hasFailed(state),
      canSubmit: allUploaded(state) || false
    };
  },
  (dispatch, { userId, exercise }) => ({
    submitReferenceSolution: (note, files) =>
      dispatch(submitReferenceSolution(userId, exercise.id, note, files)),
    reset: () =>
      dispatch(resetUpload(exercise.id)) &&
      dispatch(resetSubmit(userId, exercise.id))
  })
)(UploadReferenceSolutionContainer);
