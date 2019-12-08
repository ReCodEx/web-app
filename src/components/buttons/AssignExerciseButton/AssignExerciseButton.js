import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import { SendIcon, BanIcon } from '../../../components/icons';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const AssignExerciseButton = ({ id, isLocked, isBroken, hasReferenceSolutions, assignExercise }) => {
  if (isLocked || isBroken || !hasReferenceSolutions) {
    return (
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={id}>
            {isBroken ? (
              <FormattedMessage
                id="app.exercise.isBroken"
                defaultMessage="Exercise configuration is incorrect and needs fixing."
              />
            ) : isLocked ? (
              <FormattedMessage
                id="app.ExercisePrefixIcons.isLocked"
                defaultMessage="Exercise is locked by the author and cannot be assigned."
              />
            ) : (
              <FormattedMessage
                id="app.exercise.noRefSolutions"
                defaultMessage="Exercise has no proof of concept. Exercise must get at least one reference solution before it can be assigned."
              />
            )}
          </Tooltip>
        }>
        <Button bsSize="xs" disabled={true}>
          <BanIcon gapRight />
          {isBroken ? (
            <FormattedMessage id="app.assignExerciseButton.isBroken" defaultMessage="Broken" />
          ) : isLocked ? (
            <FormattedMessage id="app.assignExerciseButton.isLocked" defaultMessage="Locked" />
          ) : (
            <FormattedMessage id="app.assignExerciseButton.noRefSolutions" defaultMessage="Unproven" />
          )}
        </Button>
      </OverlayTrigger>
    );
  } else {
    return (
      <Button onClick={assignExercise} bsSize="xs" bsStyle="success">
        <SendIcon gapRight />
        <FormattedMessage id="app.exercise.assignButton" defaultMessage="Assign" />
      </Button>
    );
  }
};

AssignExerciseButton.propTypes = {
  id: PropTypes.string.isRequired,
  isLocked: PropTypes.bool.isRequired,
  isBroken: PropTypes.bool.isRequired,
  hasReferenceSolutions: PropTypes.bool.isRequired,
  assignExercise: PropTypes.func.isRequired,
};

export default AssignExerciseButton;
