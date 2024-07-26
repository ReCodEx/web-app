import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { BanIcon, LoadingIcon, ReviewRequestIcon } from '../../icons';
import Button from '../../widgets/TheButton';
import Confirm from '../../forms/Confirm';

const SolutionReviewRequestButton = ({ id, onClck, reviewRequest = false, pending = false, onBehalf = false }) => (
  <Confirm
    id={id}
    onConfirmed={onClck}
    question={
      reviewRequest ? (
        <FormattedMessage
          id="app.solutionReviewRequest.confirmCancel"
          defaultMessage="A review request for this solution will be canceled. Do you wish to proceed?"
        />
      ) : (
        <>
          <FormattedMessage
            id="app.solutionReviewRequest.confirmRequest"
            defaultMessage="A review request will be indicated at this solution and notification will be sent to group supervisors. Review requests for any other solution of the same assignment will be canceled at the same time. Do you wish to proceed?"
          />
          {onBehalf && (
            <>
              <br />
              <i className="text-muted">
                (
                <FormattedMessage
                  id="app.solutionReviewRequest.confirmRequestDifferentUser"
                  defaultMessage="You are making the request on behalf of the student."
                />
                )
              </i>
            </>
          )}
        </>
      )
    }>
    <Button variant={reviewRequest ? 'danger' : 'primary'} disabled={pending}>
      {pending ? <LoadingIcon gapRight /> : reviewRequest ? <BanIcon gapRight /> : <ReviewRequestIcon gapRight />}
      {reviewRequest ? (
        <FormattedMessage id="app.solutionReviewRequest.cancel" defaultMessage="Cancel Review Request" />
      ) : (
        <FormattedMessage id="app.solutionReviewRequest.request" defaultMessage="Request Review" />
      )}
    </Button>
  </Confirm>
);

SolutionReviewRequestButton.propTypes = {
  id: PropTypes.string.isRequired,
  onClck: PropTypes.func.isRequired,
  reviewRequest: PropTypes.bool,
  pending: PropTypes.bool,
  onBehalf: PropTypes.bool,
};

export default SolutionReviewRequestButton;
