import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import Icon, { ArchiveIcon } from './index';
import DateTime from '../widgets/DateTime';

export const PrivateIcon = props => <Icon {...props} icon={['far', 'eye-slash']} />;
export const NeedFixingIcon = props => <Icon {...props} icon="hammer" />;
export const LockIcon = props => <Icon {...props} icon="lock" />;
export const CheckRequiredIcon = props => <Icon {...props} icon="spell-check" />;

export const ExercisePrefixIcons = ({
  id,
  isPublic,
  isLocked,
  isBroken,
  archivedAt = null,
  hasReferenceSolutions,
  ...props
}) => (
  <span>
    {archivedAt && (
      <span>
        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip id={id}>
              <FormattedMessage
                id="app.ExercisePrefixIcons.archivedAt"
                defaultMessage="Archived at {archivedAt}."
                values={{ archivedAt: <DateTime unixts={archivedAt} /> }}
              />
            </Tooltip>
          }>
          <ArchiveIcon {...props} className="text-info" gapRight />
        </OverlayTrigger>
      </span>
    )}

    {!archivedAt && !isPublic && (
      <span>
        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip id={id}>
              <FormattedMessage
                id="app.ExercisePrefixIcons.isPrivate"
                defaultMessage="Exercise is private (visible only to author)."
              />
            </Tooltip>
          }>
          <PrivateIcon {...props} className="text-muted" gapRight />
        </OverlayTrigger>
      </span>
    )}

    {!archivedAt && isLocked && (
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

    {!archivedAt && isBroken && (
      <span>
        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip id={id}>
              <FormattedMessage
                id="app.exercise.isBroken"
                defaultMessage="Exercise configuration is incomplete and needs fixing."
              />
            </Tooltip>
          }>
          <NeedFixingIcon {...props} className="text-danger" gapRight />
        </OverlayTrigger>
      </span>
    )}

    {!archivedAt && !isBroken && !hasReferenceSolutions && (
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
  isPublic: PropTypes.bool.isRequired,
  isLocked: PropTypes.bool.isRequired,
  isBroken: PropTypes.bool.isRequired,
  archivedAt: PropTypes.number,
  hasReferenceSolutions: PropTypes.bool.isRequired,
};
