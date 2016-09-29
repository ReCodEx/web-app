import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { searchExercises } from '../../redux/modules/search';
import LeaveJoinGroupButtonContainer from '../LeaveJoinGroupButtonContainer';
import SearchContainer from '../SearchContainer';
import ExercisesList from '../../components/Exercises/ExercisesList';

const SelectExerciseContainer = ({
  groupId: id,
  search,
  createActions
}) => (
  <SearchContainer
    type='exercises'
    id={id}
    search={search}
    renderList={
      (exercises) => <ExercisesList exercises={exercises} createActions={createActions} />
    } />
);

SelectExerciseContainer.propTypes = {
  groupId: PropTypes.string.isRequired,
  search: PropTypes.func.isRequired
};

const mapDispatchToProps = (dispatch) => ({
  search: (id, query) => dispatch(searchExercises()(id, query))
});

export default connect(undefined, mapDispatchToProps)(SelectExerciseContainer);
