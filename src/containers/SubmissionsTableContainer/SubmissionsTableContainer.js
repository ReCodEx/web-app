import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchUsersSubmissions } from '../../redux/modules/submissions';
import { getLoggedInUserId } from '../../redux/selectors/auth';
import { createGetUsersSubmissionsForAssignment } from '../../redux/selectors/assignments';
import SubmissionsTable from '../../components/SubmissionsTable';

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
  submissions: PropTypes.array
};

export default connect(
  (state, props) => {
    const getSubmissions = createGetUsersSubmissionsForAssignment();
    return {
      userId: getLoggedInUserId(state),
      submissions: getSubmissions(state, getLoggedInUserId(state), props.params.assignmentId)
    };
  },
  (dispatch, props) => ({
    loadSubmissionsForUser: (userId, assignmentId) => dispatch(fetchUsersSubmissions(userId, assignmentId))
  })
)(SubmissionsTableContainer);
