import React from 'react';
import PropTypes from 'prop-types';
import BonusPoints from './BonusPoints.js';

const Points = ({ tooltipId, points, maxPoints, bonusPoints, wideFormat = false }) => (
  <span className="text-nowrap">
    {points}
    {bonusPoints !== 0 && <BonusPoints bonus={bonusPoints} tooltipId={tooltipId} />}
    {wideFormat ? ' / ' : '/'}
    {maxPoints}
  </span>
);

Points.propTypes = {
  tooltipId: PropTypes.string.isRequired,
  points: PropTypes.number.isRequired,
  bonusPoints: PropTypes.number.isRequired,
  maxPoints: PropTypes.number.isRequired,
  wideFormat: PropTypes.bool,
};

export default Points;
