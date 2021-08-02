import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import Icon from '../../../icons';

const AssignmentMaxPoints = ({
  allowSecondDeadline,
  maxPointsBeforeFirstDeadline,
  maxPointsBeforeSecondDeadline,
  maxPointsDeadlineInterpolation,
  currentPointsLimit = null,
}) => (
  <>
    {allowSecondDeadline ? (
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id="firstPointsIconTooltip">
            <FormattedMessage
              id="app.assignment.maxPointsFirstTooltip"
              defaultMessage="Points awarded before the first deadline"
            />
          </Tooltip>
        }>
        <span>{maxPointsBeforeFirstDeadline}</span>
      </OverlayTrigger>
    ) : (
      maxPointsBeforeFirstDeadline
    )}

    {allowSecondDeadline && (
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id="secondPointsIconTooltip">
            {maxPointsDeadlineInterpolation ? (
              <FormattedMessage
                id="app.assignment.maxPointsInterpolationTooltip"
                defaultMessage="Points between the deadlines are linearly changing towards the second limit"
              />
            ) : (
              <FormattedMessage
                id="app.assignment.maxPointsSecondTooltip"
                defaultMessage="Points awarded after the first and before the second deadline"
              />
            )}
          </Tooltip>
        }>
        <span>
          {maxPointsDeadlineInterpolation ? (
            <Icon icon="long-arrow-alt-right" gapLeft smallGapRight className="text-muted" transform={{ rotate: 33 }} />
          ) : (
            <Icon icon="level-down-alt" gapLeft smallGapRight className="text-muted" />
          )}
          {maxPointsBeforeSecondDeadline}
        </span>
      </OverlayTrigger>
    )}

    {currentPointsLimit !== null && (allowSecondDeadline || currentPointsLimit !== maxPointsBeforeFirstDeadline) && (
      <small className="text-muted ml-3">
        <FormattedMessage
          id="app.assignment.currentMaxPointsNote"
          defaultMessage="({currentPointsLimit} at the moment)"
          values={{ currentPointsLimit }}
        />
      </small>
    )}
  </>
);

AssignmentMaxPoints.propTypes = {
  allowSecondDeadline: PropTypes.bool.isRequired,
  maxPointsDeadlineInterpolation: PropTypes.bool,
  maxPointsBeforeFirstDeadline: PropTypes.number.isRequired,
  maxPointsBeforeSecondDeadline: PropTypes.number,
  currentPointsLimit: PropTypes.number,
};

export default AssignmentMaxPoints;
