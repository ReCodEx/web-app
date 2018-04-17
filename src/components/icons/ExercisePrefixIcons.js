import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const ExercisePrefixIcons = ({ id, isLocked, isBroken, ...props }) =>
  <span>
    {isLocked &&
      <span>
        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip id={id}>
              <FormattedMessage
                id="app.ExercisePrefixIcons.isLocked"
                defaultMessage="Exercise is locked by the author and cannot be assigned."
              />
            </Tooltip>
          }
        >
          <Icon {...props} icon="lock" className="text-warning" />
        </OverlayTrigger>
        &nbsp;&nbsp;
      </span>}
    {isBroken &&
      <span>
        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip id={id}>
              <FormattedMessage
                id="app.exercise.isBroken"
                defaultMessage="Exercise configuration is incorrect and needs fixing"
              />
            </Tooltip>
          }
        >
          <Icon {...props} icon="medkit" className="text-danger" />
        </OverlayTrigger>
        &nbsp;&nbsp;
      </span>}
  </span>;

ExercisePrefixIcons.propTypes = {
  id: PropTypes.any.isRequired,
  isLocked: PropTypes.bool.isRequired,
  isBroken: PropTypes.bool.isRequired
};

export default ExercisePrefixIcons;
