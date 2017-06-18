import React from 'react';
import PropTypes from 'prop-types';
import SelectExerciseContainer
  from '../../../containers/SelectExerciseContainer';

const SearchExercise = ({ groupId }) => (
  <SelectExerciseContainer groupId={groupId} id={`add-assignment-${groupId}`} />
);

SearchExercise.propTypes = {
  groupId: PropTypes.string.isRequired
};

export default SearchExercise;
