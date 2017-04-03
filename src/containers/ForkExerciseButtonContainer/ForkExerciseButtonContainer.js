
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { forkStatuses, forkExercise } from '../../redux/modules/exercises';
import { getFork } from '../../redux/selectors/exercises';

import ForkExerciseButton, {
  PendingForkExerciseButton,
  FailedForkExerciseButton,
  SuccessfulForkExerciseButton
} from '../../components/Exercises/ForkExerciseButton';

class ForkExerciseButtonContainer extends Component {

  viewForkedExercise() {
    const {
      forkedExerciseId: id,
      push
    } = this.props;

    const { links: { EXERCISE_URI_FACTORY } } = this.context;
    const url = EXERCISE_URI_FACTORY(id);
    push(url);
  }

  fork() {
    const { fork } = this.props;
    fork();
  }

  render() {
    const { forkStatus, forkId } = this.props;

    switch (forkStatus) {
      case forkStatuses.PENDING:
        return <PendingForkExerciseButton />;
      case forkStatuses.REJECTED:
        return <FailedForkExerciseButton onClick={this.fork} />;
      case forkStatuses.FULFILLED:
        return <SuccessfulForkExerciseButton onClick={() => this.viewForkedExercise()} />;
      default:
        return <ForkExerciseButton onClick={() => this.fork()} forkId={forkId} />;
    }
  }
}

ForkExerciseButtonContainer.propTypes = {
  fork: PropTypes.func.isRequired,
  exerciseId: PropTypes.string.isRequired,
  forkId: PropTypes.string.isRequired,
  forkStatus: PropTypes.string,
  forkedExerciseId: PropTypes.string,
  push: PropTypes.func.isRequired
};

ForkExerciseButtonContainer.contextTypes = {
  links: PropTypes.object
};

const mapStateToProps = (state, { exerciseId, forkId }) => {
  const fork = getFork(exerciseId, forkId)(state);
  return {
    forkStatus: fork ? fork.status : null,
    forkedExerciseId: fork && fork.status === forkStatuses.FULFILLED ? fork.exerciseId : null
  };
};

const mapDispatchToProps = (dispatch, { exerciseId, forkId }) => ({
  push: (url) => dispatch(push(url)),
  fork: () => dispatch(forkExercise(exerciseId, forkId))
});

export default connect(mapStateToProps, mapDispatchToProps)(ForkExerciseButtonContainer);
