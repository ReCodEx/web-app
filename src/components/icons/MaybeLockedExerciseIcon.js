import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const MaybeLockedExerciseIcon = ({ id, isLocked, ...props }) =>
  isLocked && (
    <span>
      <OverlayTrigger
        placement="right"
        overlay={
          <Tooltip id={id}>
            <FormattedMessage
              id="app.maybeLockedExerciseIcon.isLocked"
              defaultMessage="Exercise is locked by author and cannot be assigned"
            />
          </Tooltip>
        }
      >
        <Icon {...props} name="lock" />
      </OverlayTrigger>
      {'  '}
    </span>
  );

MaybeLockedExerciseIcon.propTypes = {
  id: PropTypes.any.isRequired,
  isLocked: PropTypes.bool.isRequired
};

export default MaybeLockedExerciseIcon;
