import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const BonusPoints = ({ bonus }) =>
  bonus &&
  <OverlayTrigger
    placement="bottom"
    overlay={
      <Tooltip id={Date.now()}>
        <FormattedMessage
          id="app.submission.evaluation.bonusPoints"
          defaultMessage="Bonus points:"
        />
      </Tooltip>
    }
  >
    {bonus > 0
      ? <b className="text-success">
          +{bonus}
        </b>
      : <b className="text-danger">
          {bonus}
        </b>}
  </OverlayTrigger>;

BonusPoints.propTypes = {
  bonus: PropTypes.number
};

export default BonusPoints;
