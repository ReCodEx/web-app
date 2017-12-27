import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { List } from 'immutable';

import { fetchUsersSubmissions } from '../../redux/modules/submissions';
import SubmissionsTable from '../../components/Assignments/SubmissionsTable';
import { getUserSubmissions } from '../../redux/selectors/assignments';

class SubmissionsTableContainer extends Component {
  componentWillMount = () => this.props.loadAsync();

  componentWillReceiveProps(newProps) {
    if (
      this.props.assignmentId !== newProps.assignmentId ||
      this.props.userId !== newProps.userId
    ) {
      newProps.loadAsync();
    }
  }

  sortSubmissions(submissions) {
    return submissions.sort((a, b) => {
      var aTimestamp = a.getIn(['data', 'solution', 'createdAt']);
      var bTimestamp = b.getIn(['data', 'solution', 'createdAt']);
      return bTimestamp - aTimestamp;
    });
  }

  render() {
    const {
      userId,
      assignmentId,
      submissions,
      runtimeEnvironments,
      title = (
        <FormattedMessage
          id="app.submissionsTableContainer.title"
          defaultMessage="Submitted solutions"
        />
      ),
      noteMaxlen = 32
    } = this.props;

    return (
      <SubmissionsTable
        title={title}
        userId={userId}
        submissions={this.sortSubmissions(submissions)}
        assignmentId={assignmentId}
        runtimeEnvironments={runtimeEnvironments}
        noteMaxlen={noteMaxlen}
      />
    );
  }
}

SubmissionsTableContainer.propTypes = {
  userId: PropTypes.string.isRequired,
  title: PropTypes.string,
  assignmentId: PropTypes.string.isRequired,
  submissions: PropTypes.instanceOf(List),
  runtimeEnvironments: PropTypes.array,
  noteMaxlen: PropTypes.number,
  loadAsync: PropTypes.func.isRequired
};

export default connect(
  (state, { userId, assignmentId }) => {
    return {
      userId,
      submissions: getUserSubmissions(userId, assignmentId)(state)
    };
  },
  (dispatch, { userId, assignmentId }) => ({
    loadAsync: () => dispatch(fetchUsersSubmissions(userId, assignmentId))
  })
)(SubmissionsTableContainer);
