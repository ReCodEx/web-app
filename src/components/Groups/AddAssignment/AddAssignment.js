import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';

import { SendIcon } from '../../Icons';
import SelectExerciseContainer from '../../../containers/SelectExerciseContainer';

const AddAssignment = ({
  groupId
}) => (
  <SelectExerciseContainer
    groupId={groupId}
    id={`add-assignment-${groupId}`}
    createActions={exerciseId => (
      <Button>
        <SendIcon /> Assign this exercise
      </Button>
    )} />
);

AddAssignment.propTypes = {
  groupId: PropTypes.string.isRequired
};

export default AddAssignment;
