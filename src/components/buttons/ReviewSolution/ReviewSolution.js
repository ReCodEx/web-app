import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import OptionalTooltipWrapper from '../../widgets/OptionalTooltipWrapper';
import Icon from '../../icons';

const ReviewSolution = ({
  reviewed,
  reviewPending,
  setReviewed,
  unsetReviewed,
  captionAsTooltip = false,
  size = undefined,
}) => {
  const label = reviewed ? (
    <FormattedMessage id="app.reviewedSolution.revoke" defaultMessage="Revoke Review" />
  ) : (
    <FormattedMessage id="app.reviewedSolution.set" defaultMessage="Review" />
  );
  return (
    <OptionalTooltipWrapper tooltip={label} hide={!captionAsTooltip}>
      <Button
        variant={reviewed ? 'info' : 'primary'}
        size={size}
        onClick={reviewed ? unsetReviewed : setReviewed}
        disabled={reviewPending}>
        <Icon icon={reviewed ? 'eraser' : 'stamp'} gapRight={!captionAsTooltip} />
        {!captionAsTooltip && label}
      </Button>
    </OptionalTooltipWrapper>
  );
};

ReviewSolution.propTypes = {
  reviewed: PropTypes.bool.isRequired,
  reviewPending: PropTypes.bool.isRequired,
  setReviewed: PropTypes.func.isRequired,
  unsetReviewed: PropTypes.func.isRequired,
  captionAsTooltip: PropTypes.bool,
  size: PropTypes.string,
};

export default ReviewSolution;
