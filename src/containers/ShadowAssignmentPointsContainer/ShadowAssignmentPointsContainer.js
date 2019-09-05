import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ShadowAssignmentPointsTable from '../../components/Assignments/ShadowAssignmentPointsTable';

import { fetchStudents } from '../../redux/modules/users';
import {
  createShadowAssignmentPoints,
  updateShadowAssignmentPoints,
  removeShadowAssignmentPoints,
} from '../../redux/modules/shadowAssignments';
import { studentsOfGroupSelector } from '../../redux/selectors/users';

class ShadowAssignmentPointsContainer extends Component {
  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.id !== prevProps.id) {
      this.props.loadAsync();
    }
  }

  render() {
    const { students, points, maxPoints, permissionHints, createPoints, updatePoints, removePoints } = this.props;
    return (
      <ShadowAssignmentPointsTable
        students={students}
        points={points}
        maxPoints={maxPoints}
        permissionHints={permissionHints}
        createPoints={createPoints}
        updatePoints={updatePoints}
        removePoints={removePoints}
      />
    );
  }
}

ShadowAssignmentPointsContainer.propTypes = {
  id: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  points: PropTypes.array.isRequired,
  maxPoints: PropTypes.number.isRequired,
  permissionHints: PropTypes.object.isRequired,
  students: PropTypes.array,
  loadAsync: PropTypes.func.isRequired,
  createPoints: PropTypes.func.isRequired,
  updatePoints: PropTypes.func.isRequired,
  removePoints: PropTypes.func.isRequired,
};

export default connect(
  (state, { groupId }) => ({
    students: studentsOfGroupSelector(state, groupId),
  }),
  (dispatch, { groupId, id }) => ({
    loadAsync: () => dispatch(fetchStudents(groupId)),
    createPoints: ({ awardeeId, points, note, awardedAt }) =>
      dispatch(createShadowAssignmentPoints(id, awardeeId, points, note, awardedAt)),
    updatePoints: ({ pointsId, points, note, awardedAt }) =>
      dispatch(updateShadowAssignmentPoints(id, pointsId, points, note, awardedAt)),
    removePoints: pointsId => dispatch(removeShadowAssignmentPoints(id, pointsId)),
  })
)(ShadowAssignmentPointsContainer);
