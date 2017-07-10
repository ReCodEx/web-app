import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ResultsTable from '../../components/Groups/ResultsTable';
import { fetchBestSubmission } from '../../redux/modules/groupResults';
import { getBestSubmission } from '../../redux/selectors/groupResults';

class ResultsTableContainer extends Component {
  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    // if (
    //   this.props.users !== newProps.users ||
    //   this.props.assignments !== newProps.assignments
    // ) {
    //   this.props.loadAsync();
    // }
  }

  static loadAsync = ({ users, assignments }, dispatch) => {
    assignments.map(assignment =>
      users.map(
        user =>
          assignment &&
          user &&
          dispatch(fetchBestSubmission(user.id, assignment.id))
      )
    );
  };

  render() {
    const { users, assignments, getPoints } = this.props;
    return (
      <ResultsTable
        users={users}
        assignments={assignments}
        getPoints={getPoints}
      />
    );
  }
}

ResultsTableContainer.propTypes = {
  users: PropTypes.array.isRequired,
  assignments: PropTypes.array.isRequired,
  getPoints: PropTypes.func,
  loadAsync: PropTypes.func
};

export default connect(
  state => ({}),
  (dispatch, { users, assignments }) => ({
    getPoints: (assignmentId, userId) =>
      dispatch(getBestSubmission(assignmentId, userId)),
    loadAsync: () =>
      ResultsTableContainer.loadAsync({ users, assignments }, dispatch)
  })
)(ResultsTableContainer);
