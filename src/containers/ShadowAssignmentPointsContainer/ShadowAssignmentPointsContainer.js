import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ShadowAssignmentPointsTable from '../../components/Assignments/ShadowAssignmentPointsTable';

import { fetchStudents } from '../../redux/modules/users';
import { setShadowAssignmentPoints, removeShadowAssignmentPoints } from '../../redux/modules/shadowAssignments';
import { studentsOfGroupSelector } from '../../redux/selectors/users';

class ShadowAssignmentPointsContainer extends Component {
  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.id !== prevProps.id) {
      this.props.loadAsync();
    }
  }

  render() {
    const { students, points, maxPoints, permissionHints, setPoints, removePoints } = this.props;
    return (
      <ShadowAssignmentPointsTable
        students={students}
        points={points}
        maxPoints={maxPoints}
        permissionHints={permissionHints}
        setPoints={setPoints}
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
  setPoints: PropTypes.func.isRequired,
  removePoints: PropTypes.func.isRequired,
};

export default connect(
  (state, { groupId }) => ({
    students: studentsOfGroupSelector(state, groupId),
  }),
  (dispatch, { groupId, id }) => ({
    loadAsync: () => dispatch(fetchStudents(groupId)),
    setPoints: ({ awardeeId, pointsId, points, note, awardedAt }) =>
      dispatch(setShadowAssignmentPoints(groupId, id, awardeeId, pointsId, points, note, awardedAt)),
    removePoints: (pointsId, awardeeId) => dispatch(removeShadowAssignmentPoints(groupId, id, awardeeId, pointsId)),
  })
)(ShadowAssignmentPointsContainer);
