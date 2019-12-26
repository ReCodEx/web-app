import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import Icon from '../../icons';

const ReviewSolution = ({ reviewed, reviewPending, setReviewed, unsetReviewed, bsSize = undefined }) =>
  reviewed === true ? (
    <Button bsStyle="info" bsSize={bsSize} onClick={unsetReviewed} disabled={reviewPending}>
      <Icon icon="eraser" gapRight />
      <FormattedMessage id="app.reviewedSolution.revoke" defaultMessage="Revoke Review" />
    </Button>
  ) : (
    <Button bsStyle="primary" bsSize={bsSize} onClick={setReviewed} disabled={reviewPending}>
      <Icon icon="stamp" gapRight />
      <FormattedMessage id="app.reviewedSolution.set" defaultMessage="Review" />
    </Button>
  );

ReviewSolution.propTypes = {
  reviewed: PropTypes.bool.isRequired,
  reviewPending: PropTypes.bool.isRequired,
  setReviewed: PropTypes.func.isRequired,
  unsetReviewed: PropTypes.func.isRequired,
  bsSize: PropTypes.string,
};

export default ReviewSolution;
