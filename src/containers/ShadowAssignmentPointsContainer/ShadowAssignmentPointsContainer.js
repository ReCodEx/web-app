import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defaultMemoize } from 'reselect';
import moment from 'moment';

import ShadowAssignmentPointsTable from '../../components/Assignments/ShadowAssignmentPointsTable';

import { fetchGroupIfNeeded } from '../../redux/modules/groups';
import { fetchByIds } from '../../redux/modules/users';
import { setShadowAssignmentPoints, removeShadowAssignmentPoints } from '../../redux/modules/shadowAssignments';
import { studentsOfGroupSelector } from '../../redux/selectors/usersGroups';
import { safeGet, arrayToObject } from '../../helpers/common';

const prepareInitialValues = defaultMemoize((students, maxPoints) => ({
  points: maxPoints,
  note: '',
  students: Object.fromEntries(students.map(({ id }) => [id, false])),
}));

class ShadowAssignmentPointsContainer extends Component {
  multiAssignSubmit = data => {
    const pointsId = null;
    const awardedAt = moment().startOf('minute').unix();
    const studentPoints = arrayToObject(this.props.points, ({ awardeeId }) => awardeeId);
    const { note, points, students } = data;
    return Promise.all(
      this.props.students
        .filter(({ id }) => safeGet(studentPoints, [id, 'points'], null) === null && students[id])
        .map(({ id }) =>
          this.props.setPoints({
            awardeeId: id, // only the student ID changes among setPoint calls
            pointsId,
            points,
            note,
            awardedAt,
          })
        )
    );
  };

  componentDidMount() {
    this.props.loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (this.props.id !== prevProps.id) {
      this.props.loadAsync();
    }
  }

  render() {
    const { groupId, students, points, maxPoints, permissionHints, setPoints, removePoints } = this.props;
    return (
      <ShadowAssignmentPointsTable
        groupId={groupId}
        students={students}
        points={points}
        maxPoints={maxPoints}
        permissionHints={permissionHints}
        setPoints={setPoints}
        removePoints={removePoints}
        initialValues={prepareInitialValues(students, maxPoints)}
        onSubmit={this.multiAssignSubmit}
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
    loadAsync: () =>
      dispatch(fetchGroupIfNeeded(groupId)).then(({ value: group }) =>
        dispatch(fetchByIds(safeGet(group, ['privateData', 'students']) || []))
      ),
    setPoints: ({ awardeeId, pointsId, points, note, awardedAt }) =>
      dispatch(setShadowAssignmentPoints(groupId, id, awardeeId, pointsId, points, note, awardedAt)),
    removePoints: (pointsId, awardeeId) => dispatch(removeShadowAssignmentPoints(groupId, id, awardeeId, pointsId)),
  })
)(ShadowAssignmentPointsContainer);
