import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { List } from 'immutable';

import { fetchUsersSolutions } from '../../redux/modules/solutions';
import SolutionsTable from '../../components/Assignments/SolutionsTable';
import { getUserSolutions } from '../../redux/selectors/assignments';

class SolutionsTableContainer extends Component {
  componentWillMount = () => this.props.loadAsync();

  componentWillReceiveProps(newProps) {
    if (
      this.props.assignmentId !== newProps.assignmentId ||
      this.props.userId !== newProps.userId
    ) {
      newProps.loadAsync();
    }
  }

  sortSolutions(solutions) {
    return solutions.sort((a, b) => {
      var aTimestamp = a.getIn(['data', 'solution', 'createdAt']);
      var bTimestamp = b.getIn(['data', 'solution', 'createdAt']);
      return bTimestamp - aTimestamp;
    });
  }

  render() {
    const {
      userId,
      assignmentId,
      solutions,
      runtimeEnvironments,
      title = (
        <FormattedMessage
          id="app.solutionsTableContainer.title"
          defaultMessage="Submitted Solutions"
        />
      ),
      noteMaxlen = 32
    } = this.props;

    return (
      <SolutionsTable
        title={title}
        userId={userId}
        solutions={this.sortSolutions(solutions)}
        assignmentId={assignmentId}
        runtimeEnvironments={runtimeEnvironments}
        noteMaxlen={noteMaxlen}
      />
    );
  }
}

SolutionsTableContainer.propTypes = {
  userId: PropTypes.string.isRequired,
  title: PropTypes.string,
  assignmentId: PropTypes.string.isRequired,
  solutions: PropTypes.instanceOf(List),
  runtimeEnvironments: PropTypes.array,
  noteMaxlen: PropTypes.number,
  loadAsync: PropTypes.func.isRequired
};

export default connect(
  (state, { userId, assignmentId }) => {
    return {
      userId,
      solutions: getUserSolutions(userId, assignmentId)(state)
    };
  },
  (dispatch, { userId, assignmentId }) => ({
    loadAsync: () => dispatch(fetchUsersSolutions(userId, assignmentId))
  })
)(SolutionsTableContainer);
