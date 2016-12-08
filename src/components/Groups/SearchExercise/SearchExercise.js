import React, { PropTypes } from 'react';
import SelectExerciseContainer from '../../../containers/SelectExerciseContainer';

const SearchExercise = ({ groupId }) => (
  <SelectExerciseContainer
    groupId={groupId}
    id={`add-assignment-${groupId}`} />
);

SearchExercise.propTypes = {
  groupId: PropTypes.string.isRequired
};

export default SearchExercise;
