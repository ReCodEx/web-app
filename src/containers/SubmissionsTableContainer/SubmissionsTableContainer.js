import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { List } from 'immutable';

import { fetchUsersSubmissions } from '../../redux/modules/submissions';
import SubmissionsTable from '../../components/Assignments/SubmissionsTable';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  createGetUsersSubmissionsForAssignment
} from '../../redux/selectors/assignments';

class SubmissionsTableContainer extends Component {
  componentWillMount() {
    SubmissionsTableContainer.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (
      this.props.assignmentId !== newProps.assignmentId ||
      this.props.userId !== newProps.userId
    ) {
      SubmissionsTableContainer.loadData(newProps);
    }
  }

  static loadData = ({ userId, assignmentId, loadSubmissionsForUser }) => {
    loadSubmissionsForUser(userId, assignmentId);
  };

  sortSubmissions(submissions) {
    return submissions.sort((a, b) => {
      var aTimestamp = a.get('data').get('submittedAt');
      var bTimestamp = b.get('data').get('submittedAt');
      return bTimestamp - aTimestamp;
    });
  }

  render() {
    const {
      userId,
      assignmentId,
      submissions,
      title = (
        <FormattedMessage
          id="app.submissionsTableContainer.title"
          defaultMessage="Submitted solutions"
        />
      )
    } = this.props;

    return (
      <SubmissionsTable
        title={title}
        userId={userId}
        submissions={this.sortSubmissions(submissions)}
        assignmentId={assignmentId}
      />
    );
  }
}

SubmissionsTableContainer.propTypes = {
  userId: PropTypes.string.isRequired,
  title: PropTypes.string,
  assignmentId: PropTypes.string.isRequired,
  submissions: PropTypes.instanceOf(List)
};

export default connect(
  (state, props) => {
    const getSubmissions = createGetUsersSubmissionsForAssignment();
    const userId = props.userId ? props.userId : loggedInUserIdSelector(state);
    return {
      userId,
      submissions: getSubmissions(state, userId, props.assignmentId)
    };
  },
  (dispatch, props) => ({
    loadSubmissionsForUser: (userId, assignmentId) =>
      dispatch(fetchUsersSubmissions(userId, assignmentId))
  })
)(SubmissionsTableContainer);
