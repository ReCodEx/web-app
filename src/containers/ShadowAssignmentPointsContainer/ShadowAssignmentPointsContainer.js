import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import ShadowAssignmentPointsTable from '../../components/Assignments/ShadowAssignmentPointsTable';

import { fetchStudents } from '../../redux/modules/users';
import {
  createShadowAssignmentPoints,
  updateShadowAssignmentPoints,
  removeShadowAssignmentPoints
} from '../../redux/modules/shadowAssignments';
import { groupSelector } from '../../redux/selectors/groups';
import { safeGet, EMPTY_ARRAY } from '../../helpers/common';

class ShadowAssignmentPointsContainer extends Component {
  static loadAsync = ({ groupId }, dispatch) =>
    dispatch(fetchStudents(groupId));

  componentWillMount = () => this.props.loadAsync();
  componentWillReceiveProps = newProps => {
    if (this.props.id !== newProps.id) {
      newProps.loadAsync();
    }
  };

  render() {
    const {
      group,
      points,
      maxPoints,
      permissionHints,
      createPoints,
      updatePoints,
      removePoints
    } = this.props;
    return (
      <ResourceRenderer resource={group}>
        {group =>
          <ShadowAssignmentPointsTable
            students={safeGet(group, ['privateData', 'students'], EMPTY_ARRAY)}
            points={points}
            maxPoints={maxPoints}
            permissionHints={permissionHints}
            createPoints={createPoints}
            updatePoints={updatePoints}
            removePoints={removePoints}
          />}
      </ResourceRenderer>
    );
  }
}

ShadowAssignmentPointsContainer.propTypes = {
  id: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  points: PropTypes.array.isRequired,
  maxPoints: PropTypes.number.isRequired,
  permissionHints: PropTypes.object.isRequired,
  group: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
  createPoints: PropTypes.func.isRequired,
  updatePoints: PropTypes.func.isRequired,
  removePoints: PropTypes.func.isRequired
};

export default connect(
  (state, { groupId }) => ({
    group: groupSelector(state, groupId)
  }),
  (dispatch, { groupId, id }) => ({
    loadAsync: () =>
      ShadowAssignmentPointsContainer.loadAsync({ groupId }, dispatch),
    createPoints: ({ awardeeId, points, note, awardedAt }) =>
      dispatch(
        createShadowAssignmentPoints(id, awardeeId, points, note, awardedAt)
      ),
    updatePoints: ({ pointsId, points, note, awardedAt }) =>
      dispatch(
        updateShadowAssignmentPoints(id, pointsId, points, note, awardedAt)
      ),
    removePoints: pointsId =>
      dispatch(removeShadowAssignmentPoints(id, pointsId))
  })
)(ShadowAssignmentPointsContainer);
