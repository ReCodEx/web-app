import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { List } from 'immutable';

import { fetchUsersSubmissions } from '../../redux/modules/submissions';
import SubmissionsTable from '../../components/Assignments/SubmissionsTable';
import { getUserSubmissions } from '../../redux/selectors/assignments';
import {
  isLoggedAsSuperAdmin,
  isLoggedAsSupervisor
} from '../../redux/selectors/users';

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
      noteMaxlen = 32,
      superadmin,
      supervisor
    } = this.props;

    return (
      <SubmissionsTable
        title={title}
        userId={userId}
        submissions={this.sortSubmissions(submissions)}
        assignmentId={assignmentId}
        runtimeEnvironments={runtimeEnvironments}
        noteMaxlen={noteMaxlen}
        canDelete={superadmin || supervisor}
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
  loadAsync: PropTypes.func.isRequired,
  superadmin: PropTypes.bool,
  supervisor: PropTypes.bool
};

export default connect(
  (state, { userId, assignmentId }) => {
    return {
      userId,
      submissions: getUserSubmissions(userId, assignmentId)(state),
      superadmin: isLoggedAsSuperAdmin(state),
      supervisor: isLoggedAsSupervisor(state)
    };
  },
  (dispatch, { userId, assignmentId }) => ({
    loadAsync: () => dispatch(fetchUsersSubmissions(userId, assignmentId))
  })
)(SubmissionsTableContainer);
