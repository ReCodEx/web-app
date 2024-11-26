import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Icon, { ArchiveIcon } from './index.js';
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
      <ArchiveIcon
        {...props}
        className="text-info"
        gapRight={2}
        tooltipId={`ex-arch-${id}`}
        tooltip={
          <FormattedMessage
            id="app.ExercisePrefixIcons.archivedAt"
            defaultMessage="Archived at {archivedAt}."
            values={{ archivedAt: <DateTime unixts={archivedAt} /> }}
          />
        }
      />
    )}

    {!archivedAt && !isPublic && (
      <PrivateIcon
        {...props}
        className="text-body-secondary"
        gapRight={2}
        tooltipId={`ex-priv-${id}`}
        tooltip={
          <FormattedMessage
            id="app.ExercisePrefixIcons.isPrivate"
            defaultMessage="Exercise is private (visible only to author)."
          />
        }
      />
    )}

    {!archivedAt && isLocked && (
      <LockIcon
        {...props}
        className="text-warning"
        gapRight={2}
        tooltipId={`ex-lock-${id}`}
        tooltip={
          <FormattedMessage
            id="app.ExercisePrefixIcons.isLocked"
            defaultMessage="Exercise is locked by the author and cannot be assigned."
          />
        }
      />
    )}

    {!archivedAt && isBroken && (
      <NeedFixingIcon
        {...props}
        className="text-danger"
        gapRight={2}
        tooltipId={`ex-broke-${id}`}
        tooltip={
          <FormattedMessage
            id="app.exercise.isBroken"
            defaultMessage="Exercise configuration is incomplete and needs fixing."
          />
        }
      />
    )}

    {!archivedAt && !isBroken && !hasReferenceSolutions && (
      <CheckRequiredIcon
        {...props}
        className="text-warning"
        gapRight={2}
        tooltipId={`ex-noref-${id}`}
        tooltip={
          <FormattedMessage
            id="app.exercise.noRefSolutions"
            defaultMessage="Exercise has no proof of concept. Exercise must get at least one reference solution before it can be assigned."
          />
        }
      />
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
