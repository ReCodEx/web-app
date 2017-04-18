import React, { Component, PropTypes } from 'react';
import { List } from 'immutable';
import { connect } from 'react-redux';
import CreateReferenceSolution
  from '../../components/Exercises/CreateReferenceSolution';

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
  createReferenceSolution
} from '../../redux/modules/referenceSolution';

class CreateReferenceSolutionContainer extends Component {
  submit = () => {
    const {
      attachedFiles,
      onSubmit,
      note,
      runtime,
      createReferenceSolution
    } = this.props;

    createReferenceSolution(
      note,
      attachedFiles.map(item => item.file),
      runtime
    );
    !!onSubmit && onSubmit();
  };

  render = () => {
    const {
      userId,
      exercise,
      canSubmit,
      hasFailed,
      isSending,
      reset
    } = this.props;

    return (
      <div>
        <CreateReferenceSolution
          userId={userId}
          exercise={exercise}
          canSubmit={canSubmit}
          isSending={isSending}
          hasFailed={hasFailed}
          reset={reset}
          createReferenceSolution={this.submit}
        />
      </div>
    );
  };
}

CreateReferenceSolutionContainer.propTypes = {
  userId: PropTypes.string.isRequired,
  exercise: PropTypes.object.isRequired,
  canSubmit: PropTypes.bool,
  hasFailed: PropTypes.bool,
  note: PropTypes.string,
  runtime: PropTypes.string,
  isProcessing: PropTypes.bool,
  isSending: PropTypes.bool,
  onSubmit: PropTypes.func,
  createReferenceSolution: PropTypes.func.isRequired,
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
    createReferenceSolution: (note, files, runtime) =>
      dispatch(
        createReferenceSolution(userId, exercise.id, note, files, runtime)
      ),
    reset: () =>
      dispatch(resetUpload(exercise.id)) &&
      dispatch(resetSubmit(userId, exercise.id))
  })
)(CreateReferenceSolutionContainer);
