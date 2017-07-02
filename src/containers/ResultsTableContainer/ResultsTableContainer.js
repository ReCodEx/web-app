import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import ResultsTable from '../../components/Groups/ResultsTable';
import { fetchBestSubmission } from '../../redux/modules/groupResults';
import { getBestSubmission } from '../../redux/selectors/groupResults';
import { getJsData } from '../../redux/helpers/resourceManager';

class ResultsTableContainer extends Component {
  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (
      this.props.users !== newProps.users ||
      this.props.assignments !== newProps.assignments
    ) {
      this.props.loadAsync();
    }
  }

  static loadAsync = ({ users, assignments }, dispatch) => {
    assignments
      .toArray()
      .map(getJsData)
      .map(assignment =>
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
  assignments: ImmutablePropTypes.list.isRequired,
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
