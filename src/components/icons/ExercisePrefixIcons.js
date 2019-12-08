import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export const NeedFixingIcon = props => <Icon {...props} icon="medkit" />;
export const LockIcon = props => <Icon {...props} icon="lock" />;
export const CheckRequiredIcon = props => <Icon {...props} icon="spell-check" />;

export const ExercisePrefixIcons = ({ id, isLocked, isBroken, hasReferenceSolutions, ...props }) => (
  <span>
    {isLocked && (
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
          }>
          <LockIcon {...props} className="text-warning" gapRight />
        </OverlayTrigger>
      </span>
    )}

    {isBroken && (
      <span>
        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip id={id}>
              <FormattedMessage
                id="app.exercise.isBroken"
                defaultMessage="Exercise configuration is incorrect and needs fixing."
              />
            </Tooltip>
          }>
          <NeedFixingIcon {...props} className="text-danger" gapRight />
        </OverlayTrigger>
      </span>
    )}

    {!hasReferenceSolutions && (
      <span>
        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip id={id}>
              <FormattedMessage
                id="app.exercise.noRefSolutions"
                defaultMessage="Exercise has no proof of concept. Exercise must get at least one reference solution before it can be assigned."
              />
            </Tooltip>
          }>
          <CheckRequiredIcon {...props} className="text-warning" gapRight />
        </OverlayTrigger>
      </span>
    )}
  </span>
);

ExercisePrefixIcons.propTypes = {
  id: PropTypes.any.isRequired,
  isLocked: PropTypes.bool.isRequired,
  isBroken: PropTypes.bool.isRequired,
  hasReferenceSolutions: PropTypes.bool.isRequired,
};
