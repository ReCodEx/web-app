import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchUsersSubmissions } from '../../redux/modules/submissions';
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
    const userId = state.auth.userId;
    const submissionIds = state.assignments.getIn(['submissions', props.assignmentId, userId]);
    return {
      userId,
      submissions: submissionIds ? submissionIds.map(id => state.submissions.getIn(['resources', id])) : null
    };
  },
  (dispatch, props) => ({
    loadSubmissionsForUser: (userId, assignmentId) => dispatch(fetchUsersSubmissions(userId, assignmentId))
  })
)(SubmissionsTableContainer);
