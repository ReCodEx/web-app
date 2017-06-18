import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { searchExercises } from '../../redux/modules/search';
import SearchContainer from '../SearchContainer';
import ExercisesSimpleList
  from '../../components/Exercises/ExercisesSimpleList';

const SelectExerciseContainer = ({ id, search, createActions }) => (
  <SearchContainer
    type="exercises"
    id={id}
    search={search}
    renderList={exercises => (
      <ExercisesSimpleList
        exercises={exercises}
        createActions={createActions}
      />
    )}
  />
);

SelectExerciseContainer.propTypes = {
  id: PropTypes.string.isRequired,
  search: PropTypes.func.isRequired,
  createActions: PropTypes.func
};

const mapDispatchToProps = (dispatch, { id }) => ({
  search: query => dispatch(searchExercises()(id, query))
});

export default connect(undefined, mapDispatchToProps)(SelectExerciseContainer);
