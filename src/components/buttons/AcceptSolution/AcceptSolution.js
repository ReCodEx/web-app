import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/TheButton';
import OptionalTooltipWrapper from '../../widgets/OptionalTooltipWrapper';
import Icon from '../../icons';

const AcceptSolution = ({
  accepted,
  acceptPending,
  accept,
  unaccept,
  shortLabel = false,
  captionAsTooltip = false,
  size = undefined,
}) => {
  const label =
    accepted === true ? (
      shortLabel ? (
        <FormattedMessage id="app.acceptSolution.acceptedShort" defaultMessage="Revoke" />
      ) : (
        <FormattedMessage id="app.acceptSolution.accepted" defaultMessage="Revoke as Final" />
      )
    ) : shortLabel ? (
      <FormattedMessage id="app.acceptSolution.notAcceptedShort" defaultMessage="Accept" />
    ) : (
      <FormattedMessage id="app.acceptSolution.notAccepted" defaultMessage="Accept as Final" />
    );

  return (
    <OptionalTooltipWrapper tooltip={label} hide={!captionAsTooltip}>
      <Button
        variant={accepted ? 'warning' : 'success'}
        size={size}
        onClick={accepted ? unaccept : accept}
        disabled={acceptPending}>
        <Icon icon={accepted ? ['far', 'circle-xmark'] : ['far', 'check-circle']} gapRight={!captionAsTooltip} />
        {!captionAsTooltip && label}
      </Button>
    </OptionalTooltipWrapper>
  );
};

AcceptSolution.propTypes = {
  accepted: PropTypes.bool.isRequired,
  acceptPending: PropTypes.bool.isRequired,
  accept: PropTypes.func.isRequired,
  unaccept: PropTypes.func.isRequired,
  shortLabel: PropTypes.bool,
  captionAsTooltip: PropTypes.bool,
  size: PropTypes.string,
};

export default AcceptSolution;
