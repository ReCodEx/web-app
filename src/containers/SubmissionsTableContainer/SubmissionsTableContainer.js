import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { List } from 'immutable';

import { fetchUsersSubmissions } from '../../redux/modules/submissions';
import SubmissionsTable from '../../components/Assignments/SubmissionsTable';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { createGetUsersSubmissionsForAssignment } from '../../redux/selectors/assignments';

class SubmissionsTableContainer extends Component {

  componentWillMount() {
    SubmissionsTableContainer.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.assignmentId !== newProps.assignmentId ||
        this.props.userId !== newProps.userId) {
      SubmissionsTableContainer.loadData(newProps);
    }
  }

  static loadData = ({
    userId,
    assignmentId,
    loadSubmissionsForUser
  }) => {
    loadSubmissionsForUser(userId, assignmentId);
  };

  render() {
    const {
      assignmentId,
      submissions
    } = this.props;

    return (
      <SubmissionsTable
        submissions={submissions}
        assignmentId={assignmentId} />
    );
  }

}

SubmissionsTableContainer.propTypes = {
  userId: PropTypes.string.isRequired,
  assignmentId: PropTypes.string.isRequired,
  submissions: PropTypes.instanceOf(List)
};

export default connect(
  (state, props) => {
    const getSubmissions = createGetUsersSubmissionsForAssignment();
    const myUserId = !!props.userId ? props.userId : loggedInUserIdSelector(state);
    return {
      userId: myUserId,
      submissions: getSubmissions(state, myUserId, props.assignmentId)
    };
  },
  (dispatch, props) => ({
    loadSubmissionsForUser: (userId, assignmentId) => dispatch(fetchUsersSubmissions(userId, assignmentId))
  })
)(SubmissionsTableContainer);
