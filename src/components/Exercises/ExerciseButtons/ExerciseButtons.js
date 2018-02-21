import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ButtonGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import Button from '../../widgets/FlatButton';
import { EditIcon } from '../../icons';
// import Confirm from '../../components/forms/Confirm';
// import ForkExerciseForm from '../../components/forms/ForkExerciseForm';

import withLinks from '../../../helpers/withLinks';

const ExerciseButtons = ({
  exerciseId,
  links: {
    EXERCISE_EDIT_URI_FACTORY,
    EXERCISE_EDIT_SIMPLE_CONFIG_URI_FACTORY,
    EXERCISE_EDIT_LIMITS_URI_FACTORY
  }
}) =>
  <div>
    <ButtonGroup>
      <LinkContainer to={EXERCISE_EDIT_URI_FACTORY(exerciseId)}>
        <Button bsStyle="warning" bsSize="sm">
          <EditIcon />
          &nbsp;
          <FormattedMessage
            id="app.exercise.editSettings"
            defaultMessage="Exercise Settings"
          />
        </Button>
      </LinkContainer>
      <LinkContainer to={EXERCISE_EDIT_SIMPLE_CONFIG_URI_FACTORY(exerciseId)}>
        <Button bsStyle="warning" bsSize="sm">
          <EditIcon />
          &nbsp;
          <FormattedMessage
            id="app.exercise.editConfig"
            defaultMessage="Tests Configuration"
          />
        </Button>
      </LinkContainer>
      <LinkContainer to={EXERCISE_EDIT_LIMITS_URI_FACTORY(exerciseId)}>
        <Button bsStyle="warning" bsSize="sm">
          <EditIcon />
          &nbsp;
          <FormattedMessage
            id="app.exercise.editLimits"
            defaultMessage="Tests Limits"
          />
        </Button>
      </LinkContainer>
      {/* <ForkExerciseForm
  exerciseId={exercise.id}
  groups={groups}
  forkId={forkId}
  onSubmit={formData => forkExercise(forkId, formData)}
/> */}
    </ButtonGroup>
    <p />
  </div>;

ExerciseButtons.propTypes = {
  exerciseId: PropTypes.string.isRequired,
  links: PropTypes.object
};

export default withLinks(ExerciseButtons);
