import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import { SendIcon } from '../../Icons';
import SelectExerciseContainer from '../../../containers/SelectExerciseContainer';

const AddAssignment = ({
  groupId,
  assignFunc
}) => (
  <SelectExerciseContainer
    groupId={groupId}
    id={`add-assignment-${groupId}`}
    createActions={exerciseId => (
      <Button onClick={() => assignFunc(exerciseId)}>
        <SendIcon /> <FormattedMessage id='app.exercise.assign' defaultMessage='Assign this exercise' />
      </Button>
    )} />
);

AddAssignment.propTypes = {
  groupId: PropTypes.string.isRequired,
  assignFunc: PropTypes.func.isRequired
};

export default AddAssignment;
