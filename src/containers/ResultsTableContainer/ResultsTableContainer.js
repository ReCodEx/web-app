import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ResultsTable from '../../components/Groups/ResultsTable';
import { fetchBestSubmission } from '../../redux/modules/groupResults';
import { getBestSubmissionsAssoc } from '../../redux/selectors/groupResults';

class ResultsTableContainer extends Component {
  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (
      this.props.users.length !== newProps.users.length ||
      this.props.users.some((user, i) => user.id !== newProps.users[i].id)
    ) {
      this.props.loadAsync();
    }
  }

  static loadAsync = ({ users, assignments }, dispatch) => {
    assignments.map(assignment =>
      users.map(user => dispatch(fetchBestSubmission(user.id, assignment.id)))
    );
  };

  render() {
    const { users, assignments, submissions } = this.props;
    return (
      <ResultsTable
        users={users}
        assignments={assignments}
        submissions={submissions}
      />
    );
  }
}

ResultsTableContainer.propTypes = {
  users: PropTypes.array.isRequired,
  assignments: PropTypes.array.isRequired,
  submissions: PropTypes.object,
  loadAsync: PropTypes.func
};

export default connect(
  (state, { users, assignments }) => ({
    submissions: getBestSubmissionsAssoc(assignments, users)(state)
  }),
  (dispatch, { users, assignments }) => ({
    loadAsync: () =>
      ResultsTableContainer.loadAsync({ users, assignments }, dispatch)
  })
)(ResultsTableContainer);
